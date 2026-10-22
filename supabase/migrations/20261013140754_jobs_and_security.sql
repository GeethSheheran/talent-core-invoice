create function public.queue_invoice_email(p_id uuid) returns uuid language plpgsql security definer set search_path='' as $$declare result uuid; recipient text;begin
perform private.assert_admin();if not exists(select 1 from public.document_files where record_id=p_id and kind='invoice' and state='ready') then raise exception 'Render the archived PDF first';end if;
select c.email into strict recipient from public.invoices i join public.companies c on c.id=i.company_id where i.id=p_id and i.state='issued';
if recipient='' then raise exception 'Company email is missing';end if;
insert into public.delivery_attempts(invoice_id,recipient,channel,idempotency_key) values(p_id,recipient,'email','invoice:'||p_id) on conflict(idempotency_key) do update set state=case when public.delivery_attempts.state in ('failed','mock') then 'queued' else public.delivery_attempts.state end returning id into result;
insert into public.outbox_jobs(kind,payload,key) values('invoice_email',jsonb_build_object('attempt_id',result),'invoice:'||p_id) on conflict(key) do update set state=case when public.outbox_jobs.state in ('failed','done') and exists(select 1 from public.delivery_attempts where id=result and state='queued') then 'pending' else public.outbox_jobs.state end,available_at=now();
return result;end$$;
-- Scheduler is service-role-only. Never exposed to authenticated callers.
create function public.scan_daily(p_today date) returns integer language plpgsql security definer set search_path='' as $$declare a public.agreements; period date;i public.invoices;r public.notification_rules;d integer;target date;n integer:=0;begin
for a in select g.* from public.agreements g join public.companies c on c.id=g.company_id where g.active and not c.archived loop
begin
-- Catch up every missing eligible month; cap history to 24 months per agreement.
for period in select generate_series(greatest(date_trunc('month',a.starts_on),date_trunc('month',p_today)-interval '24 months'),date_trunc('month',least(p_today,coalesce(a.ends_on,p_today))),interval '1 month')::date loop
begin
if greatest(period+(a.billing_day-1),a.starts_on)<=p_today then perform private.monthly_draft(a.id,period);end if;
exception when others then insert into public.job_runs(task,state,detail) values('monthly:'||a.id||':'||period,'failed',SQLERRM);end;end loop;
exception when others then insert into public.job_runs(task,state,detail) values('monthly:'||a.id,'failed',SQLERRM);end;end loop;
for i in select * from public.invoices where state='issued' and first_sent_on is not null and not reminders_paused and private.balance(id)>0 loop
for r in select * from public.notification_rules where active loop
for d in select unnest(r.intervals) loop
target:=(case when r.basis='sent' then i.first_sent_on else i.due_date end)+d;
if target between r.effective_from and p_today then
insert into public.notification_events(invoice_id,rule_id,scheduled_on,message) values(i.id,r.id,target,'Follow up on '||i.number) on conflict do nothing;
insert into public.outbox_jobs(kind,payload,key) values('admin_reminder',jsonb_build_object('invoice_id',i.id,'scheduled_on',target),'reminder:'||i.id||':'||r.id||':'||target) on conflict do nothing;n:=n+1;
end if;end loop;
if r.repeat_days is not null then
for target in select generate_series((case when r.basis='sent' then i.first_sent_on else i.due_date end)+(select max(x) from unnest(r.intervals) x)+r.repeat_days,p_today,make_interval(days=>r.repeat_days))::date loop
if target>=r.effective_from then insert into public.notification_events(invoice_id,rule_id,scheduled_on,message) values(i.id,r.id,target,'Follow up on '||i.number) on conflict do nothing;insert into public.outbox_jobs(kind,payload,key) values('admin_reminder',jsonb_build_object('invoice_id',i.id),'reminder:'||i.id||':'||r.id||':'||target) on conflict do nothing;end if;end loop;
end if;end loop;end loop;
insert into public.job_runs(task,state,detail) values('daily_scan','done',n::text);return n;end$$;
create function public.claim_jobs(p_limit integer) returns setof public.outbox_jobs language plpgsql security definer set search_path='' as $$begin
update public.outbox_jobs set state='failed',last_error='Worker lease expired after final attempt',lease_until=null where state='running' and lease_until<now() and attempts>=5;
return query update public.outbox_jobs set state='running',attempts=attempts+1,lease_until=now()+interval '5 minutes' where id in(select id from public.outbox_jobs where ((state='pending' and available_at<=now()) or (state='running' and lease_until<now())) and attempts<5 order by created_at for update skip locked limit least(p_limit,20)) returning *;end$$;
create function public.save_reminder_rule(p_intervals integer[],p_basis text,p_repeat integer) returns void language plpgsql security definer set search_path='' as $$begin
perform private.assert_admin();if cardinality(p_intervals) not between 1 and 12 or exists(select 1 from unnest(p_intervals) x where x<1 or x>365) then raise exception 'Invalid intervals';end if;
update public.notification_rules set active=false;insert into public.notification_rules(intervals,basis,repeat_days,effective_from) values(p_intervals,p_basis,p_repeat,(now() at time zone 'Asia/Colombo')::date+1);end$$;
-- Acceptance and the first-send date must be committed together.
create function public.record_delivery(p_attempt uuid,p_state text,p_provider text) returns void language plpgsql security definer set search_path='' as $$declare a public.delivery_attempts;begin
if p_state not in ('mock','accepted') then raise exception 'Invalid delivery result';end if;
select * into strict a from public.delivery_attempts where id=p_attempt for update;
if a.state='delivered' then return;end if;
update public.delivery_attempts set state=p_state,provider_id=p_provider where id=p_attempt;
if p_state='accepted' then update public.invoices set first_sent_on=coalesce(first_sent_on,(now() at time zone 'Asia/Colombo')::date) where id=a.invoice_id;end if;
end$$;
-- RLS and table grants: all browser-accessible tables are read-only to admins.
do $$declare t text;begin
foreach t in array array['admin_members','companies','settings','service_catalogue','projects','agreements','agreement_services','invoices','invoice_items','invoice_balance_references','payments','payment_allocations','payment_reversals','credit_notes','credit_note_allocations','credit_applications','document_counters','proposals','proposal_versions','document_files','delivery_attempts','notification_rules','notification_events','outbox_jobs','job_runs','audit_logs'] loop
execute format('alter table public.%I enable row level security',t);
execute format('revoke all on public.%I from anon, authenticated',t);
execute format('grant select on public.%I to authenticated',t);
execute format('grant all on public.%I to service_role',t);
if t='admin_members' then execute 'create policy admin_self_read on public.admin_members for select to authenticated using(user_id=auth.uid())';
else execute format('create policy admin_read on public.%I for select to authenticated using((select private.is_admin()))',t);end if;
end loop;end$$;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.balance(uuid) to authenticated;
grant select on public.invoice_balances to authenticated;
revoke all on sequence public.company_code_seq from anon,authenticated;
grant all on sequence public.company_code_seq to service_role;
revoke all on function private.company_code(),
private.is_admin(),
private.assert_admin(),
private.balance(uuid),
private.next_number(uuid,text),
private.set_items(uuid,jsonb),
public.save_record(text,uuid,jsonb),
public.issue_invoice(uuid,jsonb),
private.allocate(uuid,jsonb),
public.confirm_payment(uuid,jsonb,jsonb),
public.allocate_credit(uuid,jsonb,uuid),
public.reverse_payment(uuid,text),
public.apply_credit(uuid,bigint,text,uuid),
public.void_invoice(uuid,text),
private.monthly_draft(uuid,date),
public.generate_monthly_draft(uuid,date),
public.issue_proposal(uuid,jsonb),
public.accept_proposal(uuid),
public.mark_external(uuid,text),
public.pause_reminders(uuid,boolean),
public.queue_invoice_email(uuid),
public.scan_daily(date),
public.claim_jobs(integer),
public.save_reminder_rule(integer[],text,integer),
public.record_delivery(uuid,text,text) from public,anon,authenticated;
grant execute on function private.is_admin(),private.balance(uuid) to authenticated;
grant execute on function public.save_record(text,uuid,jsonb),public.issue_invoice(uuid,jsonb),public.confirm_payment(uuid,jsonb,jsonb),public.allocate_credit(uuid,jsonb,uuid),public.reverse_payment(uuid,text),public.apply_credit(uuid,bigint,text,uuid),public.void_invoice(uuid,text),public.generate_monthly_draft(uuid,date),public.issue_proposal(uuid,jsonb),public.accept_proposal(uuid),public.mark_external(uuid,text),public.pause_reminders(uuid,boolean),public.queue_invoice_email(uuid),public.save_reminder_rule(integer[],text,integer) to authenticated;
grant execute on function public.scan_daily(date),public.claim_jobs(integer),public.record_delivery(uuid,text,text) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('documents','documents',false,20971520,array['application/pdf']) on conflict(id) do nothing;
create policy documents_admin_read on storage.objects for select to authenticated using(bucket_id='documents' and (select private.is_admin()));
-- Only server storage adapter with service_role can create immutable files.
