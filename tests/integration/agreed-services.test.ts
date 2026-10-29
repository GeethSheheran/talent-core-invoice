import { beforeEach, afterEach, describe, it, expect } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { database, OUTSIDER } from "../fixtures/database";
import {
  rpc,
  company,
  invoice,
  issue,
  payment,
  balance,
  brand,
} from "../fixtures/billing";
let db: PGlite;
beforeEach(async () => {
  db = await database();
});
afterEach(async () => {
  await db.close();
});
async function setup() {
  const c = await company(db);
  const service = await rpc(db, "save_record", [
    "service",
    null,
    {
      name: "Design",
      description: "",
      rate: 1000,
      currency: "LKR",
      billing_type: "monthly",
    },
  ]);
  const child = await rpc(db, "save_record", [
    "service",
    null,
    {
      name: "Setup",
      description: "",
      rate: 1000,
      currency: "LKR",
      billing_type: "one-time",
      parent_id: service,
    },
  ]);
  const data = {
    company_id: c,
    currency: "LKR",
    name: "Agreed services",
    scope: "",
    advance: 0,
    price: 1,
    discount: 300,
    items: [
      {
        service_id: service,
        name: "Design",
        quantity: "2",
        rate: 1000,
        discount: 200,
        billing_type: "monthly",
      },
      {
        service_id: child,
        name: "Setup",
        quantity: "1",
        rate: 1200,
        discount: 0,
        billing_type: "one-time",
      },
    ],
  };
  const project = await rpc<string>(db, "save_record", ["project", null, data]);
  const schedule = (
    await db.query<{ id: string }>(
      "select id from agreements where project_id=$1",
      [project],
    )
  ).rows[0].id;
  const period = (
    await db.query<{ period: string }>(
      "select to_char(starts_on,'YYYY-MM-DD') period from agreements where id=$1",
      [schedule],
    )
  ).rows[0].period;
  const next = (
    await db.query<{ period: string }>(
      "select to_char($1::date+interval '1 month','YYYY-MM-DD') period",
      [period],
    )
  ).rows[0].period;
  return { c, service, child, data, project, schedule, period, next };
}
async function total(id: string) {
  return Number(
    (
      await db.query<{ total: number }>(
        "select total from invoices where id=$1",
        [id],
      )
    ).rows[0].total,
  );
}
describe("company agreed services", () => {
  it("calculates discounts on whole lines, creates one monthly draft, and bills one-time services once", async () => {
    const x = await setup();
    const first = await invoice(db, x.c, 99999, {
      project_id: x.project,
      period: x.period,
    });
    expect(await total(first)).toBe(2700); // 2000 - 200 + 1200 - 300
    expect(
      await rpc(db, "generate_monthly_draft", [x.schedule, x.period]),
    ).toBe(first);
    const second = await rpc<string>(db, "generate_monthly_draft", [
      x.schedule,
      x.next,
    ]);
    expect(await total(second)).toBe(1620); // monthly discount share = 180
    expect(
      (
        await db.query("select * from invoice_items where invoice_id=$1", [
          second,
        ])
      ).rows,
    ).toHaveLength(1);
    await issue(db, first);
    await issue(db, second); // recurring services must not hit a lifetime project cap
    expect(await balance(db, first)).toBe(2700);
    expect(await balance(db, second)).toBe(1620);
  });
  it("keeps historic drafts and issued snapshots while applying service edits to future months", async () => {
    const x = await setup();
    const first = await rpc<string>(db, "generate_monthly_draft", [
      x.schedule,
      x.period,
    ]);
    const snapshot = (await issue(db, first)).snapshot;
    const items = (
      await db.query<{ items: typeof x.data.items }>(
        "select items from projects where id=$1",
        [x.project],
      )
    ).rows[0].items;
    await rpc(db, "save_record", [
      "project",
      x.project,
      {
        ...x.data,
        items: items.map((item) => ({ ...item, rate: item.rate + 100 })),
      },
    ]);
    expect((await issue(db, first)).snapshot).toEqual(snapshot);
    const second = await rpc<string>(db, "generate_monthly_draft", [
      x.schedule,
      x.next,
    ]);
    expect(await total(second)).toBe(1818);
  });
  it("rejects invalid discounts, foreign-company edits and nested/cyclic service trees", async () => {
    const x = await setup();
    await expect(
      rpc(db, "save_record", [
        "project",
        null,
        { ...x.data, discount: 999999 },
      ]),
    ).rejects.toThrow(/discount/i);
    await expect(
      rpc(db, "save_record", [
        "project",
        null,
        { ...x.data, items: [{ ...x.data.items[0], discount: 2001 }] },
      ]),
    ).rejects.toThrow(/discount/i);
    const other = await company(db);
    await expect(
      rpc(db, "save_record", [
        "project",
        x.project,
        { ...x.data, company_id: other },
      ]),
    ).rejects.toThrow(/mismatch/);
    await expect(
      rpc(db, "save_record", [
        "service",
        x.service,
        {
          name: "Design",
          description: "",
          rate: 1000,
          currency: "LKR",
          parent_id: x.child,
        },
      ]),
    ).rejects.toThrow(/children/);
    await expect(
      rpc(db, "save_record", [
        "service",
        null,
        { name: "Nested", rate: 1000, currency: "LKR", parent_id: x.child },
      ]),
    ).rejects.toThrow(/main service/);
  });
  it("creates one-time-only invoices without a schedule and releases services after voiding", async () => {
    const x = await setup();
    const project = await rpc(db, "save_record", [
      "project",
      null,
      { ...x.data, discount: 0, items: [x.data.items[1]] },
    ]);
    const first = await invoice(db, x.c, 0, { project_id: project });
    expect(await total(first)).toBe(1200);
    await expect(invoice(db, x.c, 0, { project_id: project })).rejects.toThrow(
      /invoice rows/,
    );
    await issue(db, first);
    await rpc(db, "void_invoice", [first, "Cancelled before delivery"]);
    const replacement = await invoice(db, x.c, 0, { project_id: project });
    expect(await total(replacement)).toBe(1200);
  });
  it("stops recurring drafts when agreed services are completed", async () => {
    const x = await setup();
    const items = (
      await db.query<{ items: unknown }>(
        "select items from projects where id=$1",
        [x.project],
      )
    ).rows[0].items;
    await rpc(db, "save_record", [
      "project",
      x.project,
      { ...x.data, items, state: "completed" },
    ]);
    await expect(
      rpc(db, "generate_monthly_draft", [x.schedule, x.next]),
    ).rejects.toThrow(/not billable/);
  });
});
it("can issue a fully discounted service invoice without creating debt", async () => {
  const x = await setup();
  const project = await rpc(db, "save_record", [
    "project",
    null,
    { ...x.data, discount: 1200, items: [x.data.items[1]] },
  ]);
  const id = await invoice(db, x.c, 0, { project_id: project });
  await issue(db, id);
  expect(await balance(db, id)).toBe(0);
});
describe("automatic payment credit", () => {
  it("uses credit once, preserves snapshots, and restores debt when a receipt is reversed", async () => {
    const c = await company(db);
    const p = await payment(db, c, 3000);
    await rpc(db, "confirm_payment", [p, [], brand]);
    const first = await invoice(db, c, 2000);
    const issued = await issue(db, first);
    expect(await balance(db, first)).toBe(0);
    expect(issued.snapshot).toMatchObject({
      invoice: { credit_applied: 2000, balance_at_issue: 0 },
    });
    expect(await rpc(db, "apply_available_credit", [first])).toBe(0);
    const second = await invoice(db, c, 2000);
    await issue(db, second);
    expect(await balance(db, second)).toBe(1000);
    await rpc(db, "reverse_payment", [p, "Wrong payment reference"]);
    expect(await balance(db, first)).toBe(2000);
    expect((await issue(db, first)).snapshot).toEqual(issued.snapshot);
  });
  it("does not use another currency's credit and blocks non-admin/anonymous RPCs", async () => {
    const c = await company(db);
    const p = await payment(db, c, 3000, { currency: "USD" });
    await rpc(db, "confirm_payment", [p, [], brand]);
    const i = await invoice(db, c, 2000);
    await issue(db, i);
    expect(await balance(db, i)).toBe(2000);
    await db.exec(
      `select set_config('request.jwt.claim.sub','${OUTSIDER}',false)`,
    );
    await expect(rpc(db, "apply_available_credit", [i])).rejects.toThrow(
      /Administrator/,
    );
    await expect(
      rpc(db, "save_record", ["service", null, { name: "No" }]),
    ).rejects.toThrow(/Administrator/);
    await db.exec("set role anon");
    await expect(rpc(db, "apply_available_credit", [i])).rejects.toThrow(
      /permission/,
    );
  });
});

it("persists percentage options, derives the name and calculates discounts in the RPC", async () => {
  const x = await setup();
  const project = await rpc<string>(db, "save_record", [
    "project",
    null,
    {
      ...x.data,
      name: "Ignored manual name",
      discount: 999999,
      discount_type: "percentage",
      discount_value: 1000,
      items: [
        {
          ...x.data.items[0],
          discount: 999999,
          discount_type: "percentage",
          discount_value: 2500,
        },
        x.data.items[1],
      ],
    },
  ]);
  const saved = (
    await db.query<{
      name: string;
      price: number;
      discount: number;
      discount_type: string;
      discount_value: number;
      items: {
        discount_type: string;
        discount_value: number;
        discount: number;
      }[];
    }>("select * from projects where id=$1", [project])
  ).rows[0];
  expect(saved.name).toBe("Design, Setup");
  expect(Number(saved.price)).toBe(2430);
  expect(Number(saved.discount)).toBe(270);
  expect(saved.discount_type).toBe("percentage");
  expect(Number(saved.discount_value)).toBe(1000);
  expect(saved.items[0]).toMatchObject({
    discount_type: "percentage",
    discount_value: 2500,
    discount: 500,
  });
  const first = await invoice(db, x.c, 0, {
    project_id: project,
    period: x.period,
  });
  expect(await total(first)).toBe(2430);
  const second = await invoice(db, x.c, 0, {
    project_id: project,
    period: x.next,
  });
  expect(await total(second)).toBe(1350);
  await expect(
    rpc(db, "save_record", [
      "project",
      null,
      { ...x.data, discount_type: "percentage", discount_value: 10001 },
    ]),
  ).rejects.toThrow(/discount/i);
  await expect(
    db.query("select private.service_discount_amount(1000,'percentage',1000)"),
  ).rejects.toThrow(/permission/);
});

describe("catalogue deletion", () => {
  it("deletes an unused service and audits the deletion", async () => {
    const id = await rpc(db, "save_record", [
      "service",
      null,
      { name: "Unused", rate: 100, currency: "LKR" },
    ]);
    await rpc(db, "delete_service", [id]);
    expect(
      (
        await db.query("select id from public.service_catalogue where id=$1", [
          id,
        ])
      ).rows,
    ).toHaveLength(0);
    expect(
      (
        await db.query(
          "select record_id from public.audit_logs where action='delete_service' and record_id=$1",
          [id],
        )
      ).rows,
    ).toHaveLength(1);
  });
  it("blocks outsiders and preserves a parent with sub-services", async () => {
    const parent = await rpc(db, "save_record", [
      "service",
      null,
      { name: "Parent", rate: 100, currency: "LKR" },
    ]);
    await rpc(db, "save_record", [
      "service",
      null,
      { name: "Child", rate: 100, currency: "LKR", parent_id: parent },
    ]);
    await expect(rpc(db, "delete_service", [parent])).rejects.toThrow(
      /sub-services/,
    );
    await db.exec(
      `select set_config('request.jwt.claim.sub','${OUTSIDER}',false)`,
    );
    await expect(rpc(db, "delete_service", [parent])).rejects.toThrow();
  });
  it("preserves services referenced by a company's agreed items", async () => {
    const c = await company(db);
    const service = await rpc(db, "save_record", [
      "service",
      null,
      { name: "Used", rate: 100, currency: "LKR" },
    ]);
    await rpc(db, "save_record", [
      "project",
      null,
      {
        company_id: c,
        name: "Package",
        currency: "LKR",
        price: 100,
        advance: 0,
        state: "active",
        items: [
          {
            service_id: service,
            name: "Used",
            quantity: "1",
            rate: 100,
            billing_type: "monthly",
          },
        ],
      },
    ]);
    await expect(rpc(db, "delete_service", [service])).rejects.toThrow(
      /agreed services/,
    );
  });
});
