import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import { database } from "../fixtures/database";
import { company, invoice, issue, balance, rpc } from "../fixtures/billing";

it("activates every service and clears saved descriptions without changing prices, hierarchy or invoice balances", async () => {
  const db = await database();
  try {
    const c = await company(db);
    const inv = await invoice(db, c, 125000);
    await issue(db, inv);
    const parent = await rpc(db, "save_record", [
      "service",
      null,
      {
        name: "HR Service",
        rate: 0,
        currency: "LKR",
        description: "Workbook category",
      },
    ]);
    await rpc(db, "save_record", [
      "service",
      null,
      {
        name: "Payroll",
        rate: 77700,
        currency: "LKR",
        parent_id: parent,
        description: "Saved description",
        archived: true,
        billing_type: "monthly",
      },
    ]);
    const before = (
      await db.query(
        "select id,name,rate,currency,parent_id,billing_type from public.service_catalogue order by id",
      )
    ).rows;
    const sql = await readFile(
      "supabase/maintenance/activate-services-and-clear-descriptions.sql",
      "utf8",
    );
    await db.exec("reset role");
    await db.exec(sql);
    await db.exec(sql);
    expect(
      (
        await db.query(
          "select id,name,rate,currency,parent_id,billing_type from public.service_catalogue order by id",
        )
      ).rows,
    ).toEqual(before);
    expect(
      (
        await db.query(
          "select archived,description from public.service_catalogue",
        )
      ).rows,
    ).toEqual([
      { archived: false, description: "" },
      { archived: false, description: "" },
    ]);
    expect(await balance(db, inv)).toBe(125000);
  } finally {
    await db.close();
  }
});
