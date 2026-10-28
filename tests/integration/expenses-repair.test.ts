import { expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { database } from "../fixtures/database";
it("applies the expense repair to the old schema atomically and preserves existing companies", async () => {
  const db = await database(undefined, "20261013140754");
  try {
    await db.exec(
      "reset role; insert into public.companies(code,name,currency) values('KEEP','Preserved company','LKR');",
    );
    const repair = await readFile(".artifacts/repair-expenses.sql", "utf8");
    await db.exec(repair);
    expect(
      (await db.query("select name from public.companies where code='KEEP'"))
        .rows,
    ).toEqual([{ name: "Preserved company" }]);
    expect(
      (
        await db.query(
          "select relrowsecurity from pg_class where oid='public.company_expenses'::regclass",
        )
      ).rows,
    ).toEqual([{ relrowsecurity: true }]);
    expect(
      (
        await db.query(
          "select has_table_privilege('authenticated','public.company_expenses','select') as allowed",
        )
      ).rows,
    ).toEqual([{ allowed: true }]);
    await expect(db.exec(repair)).rejects.toThrow(
      "Expenses table already exists",
    );
    await db.exec("rollback");
    expect(
      (
        await db.query(
          "select count(*)::int as count from public.companies where code='KEEP'",
        )
      ).rows,
    ).toEqual([{ count: 1 }]);
  } finally {
    await db.close();
  }
});
