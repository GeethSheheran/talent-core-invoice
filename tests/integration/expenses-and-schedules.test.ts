import { afterEach, beforeEach, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { database, OUTSIDER } from "../fixtures/database";
import { balance, company, invoice, issue, rpc } from "../fixtures/billing";
let db: PGlite;
beforeEach(async () => {
  db = await database();
});
afterEach(async () => {
  await db.close();
});
const line = { description: "Hosting", quantity: "1", rate: 10000 };
async function expense(c: string, extra: Record<string, unknown> = {}) {
  return rpc(db, "save_record", [
    "expense",
    null,
    {
      company_id: c,
      description: "Domain renewal",
      amount: 2500,
      currency: "LKR",
      incurred_on: "2026-01-01",
      ...extra,
    },
  ]);
}
async function scan(day: string) {
  await db.exec("set role service_role");
  await rpc(db, "scan_daily", [day]);
  await db.exec("set role authenticated");
}
async function settings(extra: Record<string, unknown>) {
  await rpc(db, "save_record", [
    "settings",
    null,
    { billing_day: 10, invoice_notice_days: 5, ...extra },
  ]);
}
async function schedule(c: string, extra: Record<string, unknown> = {}) {
  return rpc(db, "save_record", [
    "agreement",
    null,
    {
      company_id: c,
      name: "Support",
      currency: "LKR",
      starts_on: "2026-11-01",
      effective_from: "2026-11-01",
      items: [line],
      repeat: "monthly",
      ...extra,
    },
  ]);
}
it("adds matching expenses once, preserves them on edits, and snapshots the correct issued total", async () => {
  const c = await company(db),
    other = await company(db);
  const e = await expense(c);
  await expense(other);
  await expense(c, { currency: "USD" });
  await expense(c, { incurred_on: "2099-01-01" });
  const id = await invoice(db, c, 10000, {
    period: "2026-10-01",
    tax_bps: 1000,
  });
  expect(
    (
      await db.query<{ total: number }>(
        "select total from invoices where id=$1",
        [id],
      )
    ).rows[0].total,
  ).toBe(13750);
  expect(
    (
      await db.query("select id from company_expenses where invoice_id=$1", [
        id,
      ])
    ).rows,
  ).toEqual([{ id: e }]);
  // Forged expense data is ignored and reconstructed from the original expense.
  await rpc(db, "save_record", [
    "invoice",
    id,
    {
      company_id: c,
      currency: "LKR",
      kind: "one-off",
      period: "2026-10-01",
      due_date: "2026-10-20",
      items: [
        line,
        { expense_id: e, description: "Forged", quantity: "1", rate: 1 },
      ],
    },
  ]);
  expect(
    (
      await db.query<{ total: number }>(
        "select total from invoices where id=$1",
        [id],
      )
    ).rows[0].total,
  ).toBe(12500);
  const next = await invoice(db, c, 10000);
  expect(
    (
      await db.query<{ total: number }>(
        "select total from invoices where id=$1",
        [next],
      )
    ).rows[0].total,
  ).toBe(10000);
  await issue(db, id);
  expect(await balance(db, id)).toBe(12500);
  const snapshot = (
    await db.query<{
      snapshot: { items: { expense_id: string | null; amount: number }[] };
    }>("select snapshot from invoices where id=$1", [id])
  ).rows[0].snapshot;
  expect(snapshot.items.find((x) => x.expense_id === e)?.amount).toBe(2500);
  await expect(
    rpc(db, "save_record", [
      "expense",
      e,
      {
        company_id: c,
        description: "Change",
        amount: 1,
        currency: "LKR",
        incurred_on: "2026-01-01",
      },
    ]),
  ).rejects.toThrow(/pending/);
});
it("rolls back expense reservations on invalid invoice totals and supports expense-only drafts", async () => {
  const c = await company(db),
    e = await expense(c);
  await expect(invoice(db, c, 1e12)).rejects.toThrow();
  expect(
    (
      await db.query<{ invoice_id: string | null }>(
        "select invoice_id from company_expenses where id=$1",
        [e],
      )
    ).rows[0].invoice_id,
  ).toBeNull();
  const id = await invoice(db, c, 0, { items: [] });
  expect(
    (
      await db.query<{ total: number }>(
        "select total from invoices where id=$1",
        [id],
      )
    ).rows[0].total,
  ).toBe(2500);
  await expect(invoice(db, c, 0, { items: [] })).rejects.toThrow(
    /invoice rows/,
  );
});
it("returns voided expenses to pending while retaining the old snapshot", async () => {
  const c = await company(db),
    e = await expense(c),
    id = await invoice(db, c);
  await issue(db, id);
  await rpc(db, "void_invoice", [id, "Incorrect invoice"]);
  const next = await invoice(db, c);
  expect(
    (
      await db.query<{ invoice_id: string }>(
        "select invoice_id from company_expenses where id=$1",
        [e],
      )
    ).rows[0].invoice_id,
  ).toBe(next);
  expect(await balance(db, id)).toBe(0);
  expect(
    (
      await db.query(
        "select id from invoice_items where invoice_id=$1 and expense_id=$2",
        [id, e],
      )
    ).rows,
  ).toHaveLength(1);
});
it("restricts expense writes and reads to approved administrators and prevents currency changes after attachment", async () => {
  const c = await company(db);
  await expense(c);
  const id = await invoice(db, c);
  await expect(
    rpc(db, "save_record", [
      "invoice",
      id,
      {
        company_id: c,
        currency: "USD",
        kind: "one-off",
        due_date: "2026-10-20",
        items: [line],
      },
    ]),
  ).rejects.toThrow(/currency/);
  await expect(
    db.query("update company_expenses set amount=1"),
  ).rejects.toThrow(/permission/);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    OUTSIDER,
  ]);
  expect((await db.query("select * from company_expenses")).rows).toHaveLength(
    0,
  );
  await expect(expense(c)).rejects.toThrow(/Administrator/);
  await db.exec("set role anon");
  await expect(db.query("select * from company_expenses")).rejects.toThrow(
    /permission/,
  );
});
it("creates monthly drafts at the configured lead date across month boundaries, once per period", async () => {
  const c = await company(db);
  await settings({ billing_day: 1, invoice_notice_days: 7 });
  const a = await schedule(c);
  await scan("2026-10-24");
  expect((await db.query("select * from invoices")).rows).toHaveLength(0);
  await scan("2026-10-25");
  await scan("2026-10-25");
  expect(
    (
      await db.query(
        "select agreement_id,period::text,due_date::text,state from invoices",
      )
    ).rows,
  ).toEqual([
    {
      agreement_id: a,
      period: "2026-11-01",
      due_date: "2026-11-15",
      state: "draft",
    },
  ]);
  expect(
    (
      await db.query(
        "select scheduled_on::text,channel from notification_events",
      )
    ).rows,
  ).toEqual([{ scheduled_on: "2026-10-25", channel: "billing" }]);
  expect((await db.query("select * from delivery_attempts")).rows).toHaveLength(
    0,
  );
  expect((await db.query("select * from outbox_jobs")).rows).toHaveLength(0);
});
it("repeats annually in the anchor month, preserving service prices and excluding one-time expenses", async () => {
  const c = await company(db);
  await expense(c);
  await settings({});
  const first = await invoice(db, c, 10000, {
    period: "2026-11-01",
    repeat: "annually",
    discount: 500,
    tax_bps: 1000,
    notes: "Annual hosting",
  });
  await scan("2027-11-05");
  await scan("2027-11-05");
  const invoices = (
    await db.query<{
      id: string;
      period: string;
      total: number;
      notes: string;
    }>("select id,period::text,total,notes from invoices order by period")
  ).rows;
  expect(invoices.map((i) => i.period)).toEqual(["2026-11-01", "2027-11-01"]);
  expect(invoices[0].id).toBe(first);
  expect(invoices[1].total).toBe(10450);
  expect(invoices[1].notes).toBe("Annual hosting");
  const a = (await db.query<{ id: string }>("select id from agreements"))
    .rows[0].id;
  await expect(
    rpc(db, "generate_monthly_draft", [a, "2027-12-01"]),
  ).rejects.toThrow(/Annual/);
});
it("uses updated settings for future drafts, honors agreement overrides, and skips ended or archived agreements", async () => {
  const c = await company(db);
  await settings({});
  const a = await schedule(c);
  await scan("2026-11-04");
  expect((await db.query("select * from invoices")).rows).toHaveLength(0);
  await settings({ billing_day: 20, invoice_notice_days: 2 });
  await scan("2026-11-17");
  expect((await db.query("select * from invoices")).rows).toHaveLength(0);
  await scan("2026-11-18");
  expect((await db.query("select due_date::text from invoices")).rows).toEqual([
    { due_date: "2026-12-04" },
  ]);
  const override = await schedule(c, { billing_day: 5, reminder_days: 0 });
  await scan("2026-11-05");
  expect(
    (
      await db.query(
        "select due_date::text from invoices where agreement_id=$1",
        [override],
      )
    ).rows,
  ).toEqual([{ due_date: "2026-11-19" }]);
  await db.exec("reset role");
  await db.query("update agreements set ends_on='2026-11-01' where id=$1", [a]);
  await db.query("update companies set archived=true where id=$1", [c]);
  await scan("2026-12-30");
  expect((await db.query("select * from invoices")).rows).toHaveLength(2);
});
it("rejects invalid periods and repeat intervals without leaving an invoice or expense reservation", async () => {
  const c = await company(db);
  await expense(c);
  await expect(invoice(db, c, 10000, { repeat: "annually" })).rejects.toThrow(
    /billing month/,
  );
  await expect(invoice(db, c, 10000, { period: "2026-10-02" })).rejects.toThrow(
    /first day/,
  );
  await expect(invoice(db, c, 10000, { repeat: "weekly" })).rejects.toThrow(
    /repeat/,
  );
  await expect(settings({ billing_day: 31 })).rejects.toThrow(/settings/);
  expect((await db.query("select * from invoices")).rows).toHaveLength(0);
});

it("attaches reviewed late expenses to a draft once and recomputes tax without changing service rows", async () => {
  const c = await company(db);
  const id = await invoice(db, c, 10000, { discount: 500, tax_bps: 1000 });
  const e = await expense(c);
  const attach = [{ id: e, amount: 2500 }];
  expect(await rpc(db, "attach_pending_expenses", [id, attach])).toBe(1);
  expect(await rpc(db, "attach_pending_expenses", [id, attach])).toBe(0);
  expect(
    (
      await db.query(
        "select subtotal,discount,tax,total from invoices where id=$1",
        [id],
      )
    ).rows,
  ).toEqual([{ subtotal: 12500, discount: 500, tax: 1200, total: 13200 }]);
  expect(
    (
      await db.query(
        "select count(*)::int as count from invoice_items where invoice_id=$1",
        [id],
      )
    ).rows,
  ).toEqual([{ count: 2 }]);
  await issue(db, id);
  expect(await balance(db, id)).toBe(13200);
  await expect(
    rpc(db, "attach_pending_expenses", [id, attach]),
  ).rejects.toThrow(/Only draft/);
});
it("rejects other companies, currencies, future costs, changed amounts, and duplicate selections", async () => {
  const c = await company(db),
    other = await company(db);
  const id = await invoice(db, c);
  for (const [owner, extra, reason] of [
    [other, {}, /company\/currency/],
    [c, { currency: "USD" }, /company\/currency/],
    [c, { incurred_on: "2099-01-01" }, /Future/],
  ] as const) {
    const e = await expense(owner, extra);
    await expect(
      rpc(db, "attach_pending_expenses", [id, [{ id: e, amount: 2500 }]]),
    ).rejects.toThrow(reason);
  }
  const e = await expense(c);
  await expect(
    rpc(db, "attach_pending_expenses", [id, [{ id: e, amount: 1 }]]),
  ).rejects.toThrow(/amount changed/);
  await expect(
    rpc(db, "attach_pending_expenses", [
      id,
      [
        { id: e, amount: 2500 },
        { id: e, amount: 2500 },
      ],
    ]),
  ).rejects.toThrow(/unique/);
  const next = await invoice(db, c);
  await expect(
    rpc(db, "attach_pending_expenses", [id, [{ id: e, amount: 2500 }]]),
  ).rejects.toThrow(/another invoice/);
  expect(
    (await db.query("select invoice_id from company_expenses where id=$1", [e]))
      .rows,
  ).toEqual([{ invoice_id: next }]);
});
it("rolls back expense attachment when the invoice exceeds the monetary limit", async () => {
  const c = await company(db),
    id = await invoice(db, c, 1e12);
  const e = await expense(c);
  await expect(
    rpc(db, "attach_pending_expenses", [id, [{ id: e, amount: 2500 }]]),
  ).rejects.toThrow();
  expect(
    (await db.query("select invoice_id from company_expenses where id=$1", [e]))
      .rows,
  ).toEqual([{ invoice_id: null }]);
  expect(
    (await db.query("select total from invoices where id=$1", [id])).rows,
  ).toEqual([{ total: 1e12 }]);
});
it("requires administrator authorization and denies anonymous expense attachment", async () => {
  const c = await company(db),
    id = await invoice(db, c),
    e = await expense(c);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    OUTSIDER,
  ]);
  await expect(
    rpc(db, "attach_pending_expenses", [id, [{ id: e, amount: 2500 }]]),
  ).rejects.toThrow(/Administrator/);
  await db.exec("set role anon");
  await expect(
    rpc(db, "attach_pending_expenses", [id, [{ id: e, amount: 2500 }]]),
  ).rejects.toThrow(/permission/);
});
