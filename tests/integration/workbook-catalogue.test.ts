import { expect, it } from "vitest";
import groups from "../../src/lib/services/workbook-catalogue.json";
import { database, OUTSIDER } from "../fixtures/database";
import { balance, company, invoice, issue, rpc } from "../fixtures/billing";
it("imports the real workbook hierarchy atomically, preserves prices and balances, and rejects outsiders", async () => {
  const db = await database();
  try {
    const c = await company(db);
    const inv = await invoice(db, c, 10000);
    await issue(db, inv);
    const result = await rpc<{ added: number; existing: number }>(
      db,
      "import_service_catalogue",
      [groups],
    );
    expect(result.added).toBe(83);
    expect(await balance(db, inv)).toBe(10000);
    const rows = await db.query<{
      name: string;
      parent: string;
      rate: number;
      archived: boolean;
    }>(
      "select c.name,p.name parent,c.rate,c.archived from public.service_catalogue c join public.service_catalogue p on c.parent_id=p.id",
    );
    expect(rows.rows).toContainEqual({
      name: "Payroll",
      parent: "HR Service",
      rate: 0,
      archived: true,
    });
    expect(rows.rows).toContainEqual({
      name: "Basic package",
      parent: "Account service",
      rate: 3000000,
      archived: false,
    });
    await db.exec(
      "reset role; update public.service_catalogue set rate=777 where name='Basic package'; set role authenticated",
    );
    expect(
      (await rpc<{ added: number }>(db, "import_service_catalogue", [groups]))
        .added,
    ).toBe(0);
    expect(
      (
        await db.query(
          "select rate from public.service_catalogue where name='Basic package'",
        )
      ).rows,
    ).toEqual([{ rate: 777 }]);
    const before = (
      await db.query("select count(*)::int n from public.service_catalogue")
    ).rows;
    await expect(
      rpc(db, "import_service_catalogue", [
        [
          {
            name: "Rollback",
            children: [{ name: "Invalid", rate: -1, billing_type: "monthly" }],
          },
        ],
      ]),
    ).rejects.toThrow();
    expect(
      (await db.query("select count(*)::int n from public.service_catalogue"))
        .rows,
    ).toEqual(before);
    await db.exec(
      `select set_config('request.jwt.claim.sub','${OUTSIDER}',false)`,
    );
    await expect(
      rpc(db, "import_service_catalogue", [groups]),
    ).rejects.toThrow();
    await db.exec("reset role; set role anon");
    await expect(
      rpc(db, "import_service_catalogue", [groups]),
    ).rejects.toThrow();
  } finally {
    await db.close();
  }
});
