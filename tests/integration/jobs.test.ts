import { beforeEach, afterEach, it, expect } from "vitest";
import { database } from "../fixtures/database";
import type { PGlite } from "@electric-sql/pglite";
let db: PGlite;
beforeEach(async () => {
  db = await database();
  await db.exec("reset role");
});
afterEach(async () => {
  await db.close();
});
it("claims bounded batches exclusively and reclaims expired leases", async () => {
  await db.exec(
    "insert into outbox_jobs(kind,payload,key)values('admin_reminder','{}','a'),('admin_reminder','{}','b');set role service_role",
  );
  const first = await db.query<{ id: string }>("select * from claim_jobs(1)");
  const second = await db.query<{ id: string }>("select * from claim_jobs(1)");
  expect(first.rows).toHaveLength(1);
  expect(second.rows).toHaveLength(1);
  expect(first.rows[0].id).not.toBe(second.rows[0].id);
  expect((await db.query("select * from claim_jobs(20)")).rows).toHaveLength(0);
  await db.query(
    "update outbox_jobs set lease_until=now()-interval '1 minute' where id=$1",
    [first.rows[0].id],
  );
  const retry = await db.query<{ attempts: number }>(
    "select * from claim_jobs(20)",
  );
  expect(retry.rows).toHaveLength(1);
  expect(retry.rows[0].attempts).toBe(2);
});
it("records terminal failure after the final worker lease expires", async () => {
  await db.exec(
    "insert into outbox_jobs(kind,payload,key,state,attempts,lease_until)values('admin_reminder','{}','terminal','running',5,now()-interval '1 minute');set role service_role",
  );
  expect((await db.query("select * from claim_jobs(20)")).rows).toHaveLength(0);
  expect(
    (
      await db.query<{ state: string }>(
        "select state from outbox_jobs where key='terminal'",
      )
    ).rows[0].state,
  ).toBe("failed");
});
it("does not expose scheduler RPCs to authenticated administrators", async () => {
  await db.exec("set role authenticated");
  await expect(db.query("select * from claim_jobs(10)")).rejects.toThrow(
    /permission/,
  );
  await expect(db.query("select scan_daily('2026-10-13')")).rejects.toThrow(
    /permission/,
  );
});

it("records delivery acceptance and reminder timing atomically; mocks do not start reminders", async () => {
  const { company, invoice, issue, rpc } = await import("../fixtures/billing");
  await db.exec("set role authenticated");
  const c = await company(db);
  const i = await invoice(db, c);
  await issue(db, i);
  await expect(rpc(db, "queue_invoice_email", [i])).rejects.toThrow(/Render/);
  await db.exec("reset role");
  await db.query(
    "update document_files set state='ready',path='test.pdf' where record_id=$1",
    [i],
  );
  await db.exec("set role authenticated");
  const a = await rpc(db, "queue_invoice_email", [i]);
  await db.exec("set role service_role");
  await rpc(db, "record_delivery", [a, "mock", null]);
  expect(
    (
      await db.query<{ first_sent_on: string | null }>(
        "select first_sent_on from invoices where id=$1",
        [i],
      )
    ).rows[0].first_sent_on,
  ).toBeNull();
  await rpc(db, "record_delivery", [a, "accepted", "provider-test"]);
  const first = (
    await db.query<{ first_sent_on: string }>(
      "select first_sent_on from invoices where id=$1",
      [i],
    )
  ).rows[0].first_sent_on;
  expect(first).toBeTruthy();
  await rpc(db, "record_delivery", [a, "accepted", "provider-test"]);
  expect(
    (
      await db.query<{ first_sent_on: string }>(
        "select first_sent_on from invoices where id=$1",
        [i],
      )
    ).rows[0].first_sent_on,
  ).toEqual(first);
});
