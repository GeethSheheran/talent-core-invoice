-- Requested catalogue cleanup. Run the entire file as postgres in SQL Editor.
-- Activates ALL saved services and clears their descriptions.
-- Prices, currency, hierarchy, names, billing frequency and financial records stay unchanged.
begin;
select pg_advisory_xact_lock(20261029);
lock table public.service_catalogue in share row exclusive mode;
update public.service_catalogue
set archived = false, description = ''
where archived or coalesce(description, '') <> '';
select count(*) as total_services,
       count(*) filter (where not archived) as active_services,
       count(*) filter (where coalesce(description, '') <> '') as remaining_descriptions
from public.service_catalogue;
commit;
