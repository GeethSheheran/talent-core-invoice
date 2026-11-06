-- Atomic, repeatable catalogue import. Existing records and prices are preserved.
-- No data is inserted merely by installing this RPC.
create or replace function public.import_service_catalogue(p_groups jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  grp jsonb; child jsonb; parent uuid; existing uuid; added integer := 0;
  reused integer := 0; item_data jsonb; item_name text; amount bigint;
begin
  perform private.assert_admin();
  if jsonb_typeof(p_groups) is distinct from 'array' or jsonb_array_length(p_groups) > 30 then
    raise exception 'Invalid catalogue groups';
  end if;
  -- Share catalogue lock ordering with save_record and delete_service.
  perform pg_advisory_xact_lock(20261029);
  lock table public.service_catalogue, public.projects in share row exclusive mode;
  for grp in select value from jsonb_array_elements(p_groups) loop
    if length(trim(coalesce(grp->>'name',''))) not between 1 and 200
       or jsonb_typeof(grp->'children') is distinct from 'array'
       or jsonb_array_length(grp->'children') > 200 then raise exception 'Invalid service group'; end if;
    select id into parent from public.service_catalogue
      where parent_id is null and currency='LKR' and not archived and lower(trim(name))=lower(trim(grp->>'name'))
      order by created_at,id limit 1;
    if parent is null then
      parent := public.save_record('service',null,jsonb_build_object('name',trim(grp->>'name'),'description',grp->>'description','currency','LKR','rate',0,'billing_type','monthly'));
      added := added + 1;
    else reused := reused + 1; end if;
    for child in select value from jsonb_array_elements(grp->'children') loop
      item_name := trim(child->>'name');
      if coalesce(length(item_name),0) not between 1 and 200
        or coalesce(child->>'billing_type','') not in ('monthly','one-time') then raise exception 'Invalid sub-service'; end if;
      if child->>'rate' is not null and (child->>'rate')::numeric <> trunc((child->>'rate')::numeric) then raise exception 'Rates must be integer minor units'; end if;
      amount := coalesce((child->>'rate')::bigint,0);
      if amount not between 0 and 1000000000000 then raise exception 'Invalid service rate'; end if;
      select id into existing from public.service_catalogue
        where parent_id=parent and currency='LKR' and lower(trim(name))=lower(item_name)
        order by created_at,id limit 1;
      if existing is not null then reused := reused + 1; continue; end if;
      item_data := jsonb_build_object('name',item_name,'description',coalesce(child->>'description',''),
        'currency','LKR','rate',amount,'parent_id',parent,'billing_type',child->>'billing_type',
        'archived',child->>'rate' is null);
      perform public.save_record('service',null,item_data);
      added := added + 1;
    end loop;
  end loop;
  return jsonb_build_object('added',added,'existing',reused);
end $$;
revoke all on function public.import_service_catalogue(jsonb) from public,anon;
grant execute on function public.import_service_catalogue(jsonb) to authenticated;
notify pgrst, 'reload schema';
