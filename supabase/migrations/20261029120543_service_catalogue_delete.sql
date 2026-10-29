-- Restrict deletion to unused leaf services; preserve company and invoice history.
create function public.delete_service(p_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform private.assert_admin();
  -- Serialize with catalogue/package edits, including JSON service references.
  lock table public.service_catalogue, public.projects in share row exclusive mode;
  if not exists(select 1 from public.service_catalogue where id=p_id) then
    raise exception 'Service not found';
  end if;
  if exists(select 1 from public.service_catalogue s where to_jsonb(s)->>'parent_id'=p_id::text) then
    raise exception 'Delete or move the sub-services first';
  end if;
  if exists(select 1 from public.projects p, jsonb_array_elements(coalesce(to_jsonb(p)->'items','[]'::jsonb)) item where item->>'service_id'=p_id::text) then
    raise exception 'This service is used by company agreed services and cannot be deleted';
  end if;
  delete from public.service_catalogue where id=p_id;
  insert into public.audit_logs(action,record_id) values('delete_service',p_id);
end $$;
revoke all on function public.delete_service(uuid) from public,anon;
grant execute on function public.delete_service(uuid) to authenticated;
