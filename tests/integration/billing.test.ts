import { beforeEach, afterEach, describe, it, expect } from "vitest";
import { database, OUTSIDER, ADMIN } from "../fixtures/database";
import {
  rpc,
  company,
  invoice,
  payment,
  issue,
  balance,
  brand,
} from "../fixtures/billing";
import type { PGlite } from "@electric-sql/pglite";
let db: PGlite;
beforeEach(async () => {
  db = await database();
});
afterEach(async () => {
  await db.close();
});
describe("actual billing migrations", () => {
  it("counts carried debt once and keeps issued snapshots unchanged after late settlement", async () => {
    const c = await company(db);
    const october = await invoice(db, c);
    await issue(db, october);
    const p = await payment(db, c, 1000000);
    await rpc(db, "confirm_payment", [
      p,
      [{ invoice_id: october, amount: 1000000 }],
      brand,
    ]);
    expect(await balance(db, october)).toBe(1000000);
    const november = await invoice(db, c);
    const issued = await issue(db, november);
    expect(await balance(db, november)).toBe(2000000);
    const snapshot = issued.snapshot;
    const refs = await db.query<{ amount: number }>(
      "select amount from invoice_balance_references where invoice_id=$1",
      [november],
    );
    expect(Number(refs.rows[0].amount)).toBe(1000000);
    const sum = await db.query<{ n: number }>(
      "select sum(total) n from invoices where state='issued'",
    );
    expect(Number(sum.rows[0].n)).toBe(4000000);
    const settlement = await payment(db, c, 3000000);
    await rpc(db, "confirm_payment", [
      settlement,
      [
        { invoice_id: october, amount: 1000000 },
        { invoice_id: november, amount: 2000000 },
      ],
      brand,
    ]);
    expect(await balance(db, october)).toBe(0);
    expect(await balance(db, november)).toBe(0);
    expect((await issue(db, november)).snapshot).toEqual(snapshot);
  });
  it("bills advances once and preserves unpaid advance debt", async () => {
    const c = await company(db);
    const project = await rpc(db, "save_record", [
      "project",
      null,
      {
        company_id: c,
        currency: "LKR",
        name: "Test project",
        scope: "Test",
        price: 12000000,
        advance: 4800000,
      },
    ]);
    const advance = await invoice(db, c, 4800000, {
      project_id: project,
      kind: "advance",
    });
    await issue(db, advance);
    const p = await payment(db, c, 2000000);
    await rpc(db, "confirm_payment", [
      p,
      [{ invoice_id: advance, amount: 2000000 }],
      brand,
    ]);
    const final = await invoice(db, c, 7200000, {
      project_id: project,
      kind: "balance",
    });
    await issue(db, final);
    expect(await balance(db, advance)).toBe(2800000);
    expect(await balance(db, final)).toBe(7200000);
    const extra = await invoice(db, c, 1, { project_id: project });
    await expect(issue(db, extra)).rejects.toThrow(/exceed/);
  });
  it("allocates unique numbers and reuses issue result on retry", async () => {
    const c = await company(db);
    const a = await invoice(db, c);
    const b = await invoice(db, c);
    const [x, y] = await Promise.all([issue(db, a), issue(db, b)]);
    expect(x.number).not.toEqual(y.number);
    expect((await issue(db, a)).number).toBe(x.number);
    expect(
      (await db.query("select * from document_counters")).rows,
    ).toHaveLength(1);
  });
  it("confirms once, rejects excess allocation and consumes overpayment credit once", async () => {
    const c = await company(db);
    const i = await invoice(db, c);
    await issue(db, i);
    const p = await payment(db, c, 3000000);
    await Promise.all([
      rpc(db, "confirm_payment", [
        p,
        [{ invoice_id: i, amount: 2000000 }],
        brand,
      ]),
      rpc(db, "confirm_payment", [
        p,
        [{ invoice_id: i, amount: 2000000 }],
        brand,
      ]),
    ]);
    expect(
      (await db.query("select * from payment_allocations")).rows,
    ).toHaveLength(1);
    const j = await invoice(db, c);
    await issue(db, j);
    // Issuing the next invoice consumes the remaining credit atomically.
    expect(await rpc(db, "apply_available_credit", [j])).toBe(0);
    expect((await issue(db, j)).snapshot).toMatchObject({
      invoice: { credit_applied: 1000000 },
    });
    expect(await balance(db, j)).toBe(1000000);
    await expect(
      rpc(db, "allocate_credit", [
        p,
        [{ invoice_id: j, amount: 1 }],
        crypto.randomUUID(),
      ]),
    ).rejects.toThrow(/exceeds/);
  });
  it("rolls back cross-company and cross-currency confirmation", async () => {
    const a = await company(db);
    const b = await company(db);
    const i = await invoice(db, a);
    await issue(db, i);
    for (const extra of [
      { company_id: b, currency: "LKR" },
      { company_id: a, currency: "USD" },
    ]) {
      const p = await payment(db, extra.company_id, 1000000, extra);
      await expect(
        rpc(db, "confirm_payment", [
          p,
          [{ invoice_id: i, amount: 1000000 }],
          brand,
        ]),
      ).rejects.toThrow(/mismatch/);
      expect(
        (
          await db.query<{ state: string }>(
            "select state from payments where id=$1",
            [p],
          )
        ).rows[0].state,
      ).toBe("pending");
    }
    expect(await balance(db, i)).toBe(2000000);
  });
  it("reverses without deleting receipt history and applies bounded corrections once", async () => {
    const c = await company(db);
    const i = await invoice(db, c);
    await issue(db, i);
    const p = await payment(db, c, 500000);
    await rpc(db, "confirm_payment", [
      p,
      [{ invoice_id: i, amount: 500000 }],
      brand,
    ]);
    const before = (
      await db.query("select snapshot from payments where id=$1", [p])
    ).rows[0];
    await rpc(db, "reverse_payment", [p, "Incorrect bank reference"]);
    await rpc(db, "reverse_payment", [p, "Retry reversal"]);
    expect(await balance(db, i)).toBe(2000000);
    expect(
      (await db.query("select snapshot from payments where id=$1", [p]))
        .rows[0],
    ).toEqual(before);
    expect(
      (await db.query("select * from payment_reversals")).rows,
    ).toHaveLength(1);
    const key = crypto.randomUUID();
    await rpc(db, "apply_credit", [i, 200000, "Service correction", key]);
    await rpc(db, "apply_credit", [i, 200000, "Service correction", key]);
    expect(await balance(db, i)).toBe(1800000);
    await expect(
      rpc(db, "void_invoice", [i, "Cancel invoice"]),
    ).rejects.toThrow(/Allocated/);
  });
  it("generates one monthly draft and respects service versions without overwriting edits", async () => {
    const c = await company(db);
    const data = {
      company_id: c,
      currency: "LKR",
      name: "Retainer",
      starts_on: "2026-10-01",
      billing_day: 1,
      effective_from: "2026-10-01",
      items: [{ description: "Retainer", quantity: "1", rate: 2000000 }],
    };
    const a = await rpc(db, "save_record", ["agreement", null, data]);
    const [one, two] = await Promise.all([
      rpc(db, "generate_monthly_draft", [a, "2026-10-01"]),
      rpc(db, "generate_monthly_draft", [a, "2026-10-01"]),
    ]);
    expect(one).toBe(two);
    await rpc(db, "save_record", [
      "invoice",
      one,
      {
        ...data,
        kind: "recurring",
        due_date: "2026-10-20",
        items: [
          { description: "This month only", quantity: "1", rate: 2100000 },
        ],
      },
    ]);
    await rpc(db, "save_record", [
      "agreement",
      a,
      {
        ...data,
        effective_from: "2026-11-01",
        items: [{ description: "New retainer", quantity: "1", rate: 2500000 }],
      },
    ]);
    await rpc(db, "generate_monthly_draft", [a, "2026-10-01"]);
    const next = await rpc(db, "generate_monthly_draft", [a, "2026-11-01"]);
    expect(
      Number(
        (
          await db.query<{ total: number }>(
            "select total from invoices where id=$1",
            [one],
          )
        ).rows[0].total,
      ),
    ).toBe(2100000);
    expect(
      Number(
        (
          await db.query<{ total: number }>(
            "select total from invoices where id=$1",
            [next],
          )
        ).rows[0].total,
      ),
    ).toBe(2500000);
  });
  it("blocks anonymous and non-admin reads, financial writes, membership changes and storage access", async () => {
    const c = await company(db);
    await db.exec(
      `select set_config('request.jwt.claim.sub','${OUTSIDER}',false)`,
    );
    expect((await db.query("select * from companies")).rows).toHaveLength(0);
    expect(
      (await db.query("select * from invoice_balances")).rows,
    ).toHaveLength(0);
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(
      0,
    );
    await expect(invoice(db, c)).rejects.toThrow(/Administrator/);
    await expect(
      db.query("insert into admin_members(user_id)values($1)", [OUTSIDER]),
    ).rejects.toThrow(/permission/);
    await db.exec(
      `select set_config('request.jwt.claim.sub','${ADMIN}',false)`,
    );
    await expect(
      db.query("update companies set code='HACK' where id=$1", [c]),
    ).rejects.toThrow(/permission/);
    await db.exec("set role anon");
    await expect(db.query("select * from companies")).rejects.toThrow(
      /permission/,
    );
    await expect(invoice(db, c)).rejects.toThrow(/permission/);
  });
  it("starts reminders only after delivery, catches up once and stops after payment", async () => {
    const c = await company(db);
    const i = await invoice(db, c);
    await issue(db, i);
    await db.exec(
      "reset role;update notification_rules set effective_from='2026-01-01';set role service_role",
    );
    await rpc(db, "scan_daily", ["2026-10-30"]);
    expect(
      (await db.query("select * from notification_events")).rows,
    ).toHaveLength(0);
    await db.exec(
      `set role authenticated;select set_config('request.jwt.claim.sub','${ADMIN}',false)`,
    );
    await rpc(db, "mark_external", [i, "WhatsApp"]);
    await db.exec(
      "reset role;update invoices set first_sent_on='2026-10-01';set role service_role",
    );
    await rpc(db, "scan_daily", ["2026-10-30"]);
    await rpc(db, "scan_daily", ["2026-10-30"]);
    expect(
      (await db.query("select * from notification_events")).rows,
    ).toHaveLength(2);
    const jobs = await rpc<unknown[]>(db, "claim_jobs", [10]);
    expect(jobs).toBeDefined();
    await db.exec(
      `set role authenticated;select set_config('request.jwt.claim.sub','${ADMIN}',false)`,
    );
    const p = await payment(db, c, 2000000);
    await rpc(db, "confirm_payment", [
      p,
      [{ invoice_id: i, amount: 2000000 }],
      brand,
    ]);
    await db.exec("set role service_role");
    await rpc(db, "scan_daily", ["2026-11-30"]);
    expect(
      (await db.query("select * from notification_events")).rows,
    ).toHaveLength(2);
  });
});

it("records and confirms a cheque payment with an invoice reference", async () => {
  const c = await company(db);
  const i = await invoice(db, c);
  await issue(db, i);
  const p = await rpc(db, "save_record", [
    "payment",
    null,
    {
      company_id: c,
      currency: "LKR",
      amount: 1000,
      received_on: "2026-10-29",
      method: "cheque",
      reference: "INV-CHEQUE",
    },
  ]);
  await rpc(db, "confirm_payment", [
    p,
    [{ invoice_id: i, amount: 1000 }],
    brand,
  ]);
  const result = await db.query<{
    method: string;
    reference: string;
    state: string;
    receipt_number: string;
  }>(
    "select method,reference,state,receipt_number from public.payments where id=$1",
    [p],
  );
  expect(result.rows[0]).toMatchObject({
    method: "cheque",
    reference: "INV-CHEQUE",
    state: "confirmed",
  });
  expect(result.rows[0].receipt_number).toBeTruthy();
});
