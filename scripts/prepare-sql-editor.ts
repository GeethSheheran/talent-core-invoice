import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("Set BOOTSTRAP_ADMIN_EMAIL before preparing SQL.");
}
const literal = "'" + email.replaceAll("'", "''") + "'";
const activation = `do $$
declare admin_id uuid;
begin
  select id into strict admin_id from auth.users where lower(email) = ${literal};
  insert into public.admin_members(user_id, active) values (admin_id, true)
  on conflict (user_id) do update set active = true;
exception when no_data_found then
  raise exception 'The designated account must exist in Authentication > Users first.';
end $$;
`;
const verification = `select u.email, m.active
from public.admin_members m join auth.users u on u.id = m.user_id
where lower(u.email) = ${literal};
`;
const files = (await readdir("supabase/migrations"))
  .filter((name) => name.endsWith(".sql"))
  .sort();
const migrations = await Promise.all(
  files.map(
    async (name) =>
      `-- ${name}\n${await readFile("supabase/migrations/" + name, "utf8")}`,
  ),
);
await mkdir(".artifacts", { recursive: true });
await writeFile(
  ".artifacts/supabase-setup.sql",
  `-- One-time initial setup. Run the ENTIRE file as postgres in Supabase SQL Editor.
-- Existing application tables cause an error and rollback; do not drop them.
-- Generated from local migrations; no API keys or passwords are included.
begin;
${migrations.join("\n\n")}
${activation}
notify pgrst, 'reload schema';
commit;
${verification}`,
);
await writeFile(
  ".artifacts/activate-admin.sql",
  `-- For an already initialized application database. Safe to run again.
begin;
${activation}
commit;
${verification}`,
);
console.log(
  "Prepared .artifacts/supabase-setup.sql and .artifacts/activate-admin.sql",
);
