import { expect, it } from "vitest";
import { database } from "../fixtures/database";

it("preserves unrelated public tables, sequences, and function permissions", async () => {
  const db = await database(`
    create table public.unrelated(id integer);
    grant insert on public.unrelated to authenticated;
    create sequence public.unrelated_seq;
    grant usage on sequence public.unrelated_seq to authenticated;
    create function public.unrelated_rpc() returns integer language sql as $$ select 1 $$;
  `);
  try {
    await db.exec("insert into public.unrelated values(1)");
    expect(
      (await db.query("select nextval('public.unrelated_seq')")).rows,
    ).toHaveLength(1);
    expect(
      (await db.query("select public.unrelated_rpc() as result")).rows,
    ).toEqual([{ result: 1 }]);
    const result = await db.query(
      "select relrowsecurity from pg_class where oid='public.unrelated'::regclass",
    );
    expect(result.rows).toEqual([{ relrowsecurity: false }]);
  } finally {
    await db.close();
  }
});
