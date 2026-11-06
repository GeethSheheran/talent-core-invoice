import { expect, it } from "vitest";
import { database, ADMIN, OUTSIDER } from "../fixtures/database";
import { balance, company, invoice, issue, rpc } from "../fixtures/billing";
import {
  importWorkbookCatalogue,
  type WorkbookImportStore,
} from "../../src/lib/services/import-workbook";
import type { Tables } from "../../src/lib/db/database.types";

it("imports without the new RPC, resumes an interruption, preserves prices and invoice balances, and rejects outsiders", async () => {
  const db = await database(undefined, "20261029130001");
  try {
    const c = await company(db);
    const inv = await invoice(db, c, 10000);
    await issue(db, inv);
    const parent = await rpc(db, "save_record", [
      "service",
      null,
      { name: "Account service", currency: "LKR", rate: 0 },
    ]);
    const child = await rpc(db, "save_record", [
      "service",
      null,
      { name: "Basic package", currency: "LKR", rate: 777, parent_id: parent },
    ]);
    let saves = 0;
    let interrupt = true;
    const store: WorkbookImportStore = {
      atomic: async () => {
        expect(
          (
            await db.query(
              "select to_regprocedure('public.import_service_catalogue(jsonb)') f",
            )
          ).rows,
        ).toEqual([{ f: null }]);
        return { data: null, error: { code: "PGRST202" } };
      },
      list: async () =>
        (
          await db.query<Tables<"service_catalogue">>(
            "select * from public.service_catalogue order by created_at,id",
          )
        ).rows,
      save: async (id, data) => {
        if (interrupt && saves === 5) throw new Error("Network interruption");
        await rpc(db, "save_record", ["service", id, data]);
        saves++;
      },
    };
    expect((await importWorkbookCatalogue(store)).error).toContain(
      "5 services were saved",
    );
    interrupt = false;
    expect((await importWorkbookCatalogue(store)).result?.added).toBe(76);
    expect((await importWorkbookCatalogue(store)).result).toEqual({
      added: 0,
      existing: 83,
    });
    expect(
      (
        await db.query(
          "select rate from public.service_catalogue where id=$1",
          [child],
        )
      ).rows,
    ).toEqual([{ rate: 777 }]);
    expect(await balance(db, inv)).toBe(10000);
    expect(
      (await db.query("select count(*)::int n from public.service_catalogue"))
        .rows,
    ).toEqual([{ n: 83 }]);
    expect(
      (
        await db.query(
          "select count(*)::int n from public.service_catalogue where parent_id is null",
        )
      ).rows,
    ).toEqual([{ n: 9 }]);
    await db.exec(
      `select set_config('request.jwt.claim.sub','${OUTSIDER}',false)`,
    );
    expect((await importWorkbookCatalogue(store)).error).toContain(
      "0 services were saved",
    );
    await db.exec(
      `select set_config('request.jwt.claim.sub','${ADMIN}',false)`,
    );
    expect(
      (await db.query("select count(*)::int n from public.service_catalogue"))
        .rows,
    ).toEqual([{ n: 83 }]);
  } finally {
    await db.close();
  }
});

it("does not fall back on permission failures or when the atomic import succeeds", async () => {
  const never = async () => {
    throw new Error("Fallback must not be used");
  };
  const blocked = await importWorkbookCatalogue({
    atomic: async () => ({ data: null, error: { code: "42501" } }),
    list: never,
    save: never,
  });
  expect(blocked.error).toContain("access");
  const success = await importWorkbookCatalogue({
    atomic: async () => ({ data: { added: 83, existing: 0 }, error: null }),
    list: never,
    save: never,
  });
  expect(success.result).toEqual({ added: 83, existing: 0 });
});
