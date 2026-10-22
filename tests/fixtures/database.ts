import { PGlite } from "@electric-sql/pglite";
import { readdir, readFile } from "node:fs/promises";
export const ADMIN = "10000000-0000-4000-8000-000000000001";
export const OUTSIDER = "10000000-0000-4000-8000-000000000002";
export async function database(beforeMigrations?: string) {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key,email text);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to anon,authenticated,service_role; grant execute on function auth.uid() to anon,authenticated,service_role;
 create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to authenticated,service_role;grant select on storage.objects to authenticated;
 insert into auth.users values('${ADMIN}','admin@example.test'),('${OUTSIDER}','outsider@example.test');`);
  if (beforeMigrations) await db.exec(beforeMigrations);
  for (const file of (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await db.exec(await readFile("supabase/migrations/" + file, "utf8"));
  await db.exec(
    `insert into public.admin_members(user_id)values('${ADMIN}');set role authenticated;select set_config('request.jwt.claim.sub','${ADMIN}',false);`,
  );
  return db;
}
