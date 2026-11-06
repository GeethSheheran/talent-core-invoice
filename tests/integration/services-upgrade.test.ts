import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import { database, OUTSIDER } from "../fixtures/database";
import {
  brand,
  balance,
  company,
  invoice,
  issue,
  payment,
  rpc,
} from "../fixtures/billing";

it("upgrades an existing ledger twice without changing balances and retains administrator-only hierarchy writes", async () => {
  const db = await database(undefined, "20261013140754");
  try {
    const owner = await company(db);
    const inv = await invoice(db, owner, 10000);
    await issue(db, inv);
    const paid = await payment(db, owner, 2500);
    await rpc(db, "confirm_payment", [
      paid,
      [{ invoice_id: inv, amount: 2500 }],
      brand,
    ]);
    const before = await balance(db, inv);
    const sql = await readFile("supabase/services-upgrade.sql", "utf8");
    await db.exec("reset role");
    await db.exec(sql);
    await db.exec(sql);
    await db.exec("set role authenticated");
    expect(await balance(db, inv)).toBe(before);
    expect(before).toBe(7500);
    const parent = await rpc(db, "save_record", [
      "service",
      null,
      { name: "HR Service", currency: "LKR", rate: 0 },
    ]);
    const child = await rpc(db, "save_record", [
      "service",
      null,
      {
        name: "Payroll",
        currency: "LKR",
        rate: 350000,
        parent_id: parent,
        billing_type: "monthly",
      },
    ]);
    expect(
      (
        await db.query(
          "select parent_id from public.service_catalogue where id=$1",
          [child],
        )
      ).rows,
    ).toEqual([{ parent_id: parent }]);
    await db.exec(
      `select set_config('request.jwt.claim.sub','${OUTSIDER}',false)`,
    );
    await expect(
      rpc(db, "save_record", [
        "service",
        null,
        { name: "Denied", currency: "LKR", rate: 0 },
      ]),
    ).rejects.toThrow();
    expect(
      (await db.query("select * from public.service_catalogue")).rows,
    ).toHaveLength(0);
  } finally {
    await db.close();
  }
});
