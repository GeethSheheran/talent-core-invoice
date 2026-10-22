-- For an already initialized application database. Safe to run again.
begin;
do $$
declare admin_id uuid;
begin
  select id into strict admin_id from auth.users where lower(email) = 'replace-with-your-admin@example.com';
  insert into public.admin_members(user_id, active) values (admin_id, true)
  on conflict (user_id) do update set active = true;
exception when no_data_found then
  raise exception 'The designated account must exist in Authentication > Users first.';
end $$;

commit;
select u.email, m.active
from public.admin_members m join auth.users u on u.id = m.user_id
where lower(u.email) = 'replace-with-your-admin@example.com';
