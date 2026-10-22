-- Company expenses and review-only recurring invoices. No automatic issue/send.
alter table public.agreements alter column billing_day drop not null;
alter table public.agreements alter column billing_day drop default;
alter table public.agreements add column repeat text not null default 'monthly' check(repeat in ('monthly','annually'));
alter table public.agreements add column reminder_days integer check(reminder_days between 0 and 365);
alter table public.agreements add column discount bigint not null default 0 check(discount between 0 and 1000000000000);
alter table public.agreements add column tax_bps integer not null default 0 check(tax_bps between 0 and 10000);
alter table public.agreements add column notes text not null default '';
update public.settings set data=data || '{"billing_day":1,"invoice_notice_days":7}'::jsonb;
create table public.company_expenses (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.companies,
 description text not null check(length(trim(description)) between 1 and 4000),
 amount bigint not null check(amount between 1 and 1000000000000),
 currency text not null check(currency in ('LKR','USD','EUR','GBP','AUD','INR')),
 incurred_on date not null,
 invoice_id uuid references public.invoices,
 created_at timestamptz not null default now(),
 created_by uuid references auth.users(id) default auth.uid()
);
create index on public.company_expenses(company_id,currency) where invoice_id is null;
create index on public.company_expenses(invoice_id) where invoice_id is not null;
alter table public.invoice_items add column expense_id uuid references public.company_expenses;
create unique index on public.invoice_items(invoice_id,expense_id) where expense_id is not null;
alter table public.company_expenses enable row level security;
revoke all on public.company_expenses from public,anon,authenticated;
grant select on public.company_expenses to authenticated;
grant all on public.company_expenses to service_role;
create policy admin_read on public.company_expenses for select to authenticated using((select private.is_admin()));
alter table public.notification_events alter column rule_id drop not null;
create unique index upcoming_invoice_once on public.notification_events(invoice_id) where rule_id is null;

create or replace function private.set_items(p_id uuid,p_items jsonb) returns void language plpgsql set search_path='' as $$declare row jsonb; pos integer:=0; inv public.invoices; expense public.company_expenses; fresh boolean;begin
select * into strict inv from public.invoices where id=p_id;
perform 1 from public.companies where id=inv.company_id for update;
if inv.state<>'draft' then raise exception 'Only draft items can be changed';end if;
fresh:=not exists(select 1 from public.invoice_items where invoice_id=p_id);
if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 0 and 300 then raise exception 'Provide 1 to 300 invoice rows';end if;
delete from public.invoice_items where invoice_id=p_id;
for row in select value from jsonb_array_elements(p_items) where nullif(value->>'expense_id','') is null loop
insert into public.invoice_items(invoice_id,position,description,quantity,rate,amount) values(p_id,pos,row->>'description',(row->>'quantity')::numeric,(row->>'rate')::bigint,round((row->>'quantity')::numeric*(row->>'rate')::bigint));pos:=pos+1;
end loop;
if fresh then
update public.company_expenses set invoice_id=p_id where company_id=inv.company_id and currency=inv.currency and invoice_id is null and incurred_on<=(now() at time zone 'Asia/Colombo')::date;
end if;
for expense in select * from public.company_expenses where invoice_id=p_id order by incurred_on,created_at,id loop
if expense.currency<>inv.currency or expense.company_id<>inv.company_id then raise exception 'Expense company/currency mismatch';end if;
insert into public.invoice_items(invoice_id,position,description,quantity,rate,amount,expense_id)
values(p_id,pos,expense.description,1,expense.amount,expense.amount,expense.id);pos:=pos+1;
end loop;
if pos not between 1 and 300 then raise exception 'Provide 1 to 300 invoice rows including expenses';end if;
update public.invoices set subtotal=(select sum(amount) from public.invoice_items where invoice_id=p_id) where id=p_id;
if exists(select 1 from public.invoices where id=p_id and discount>subtotal) then raise exception 'Discount exceeds subtotal';end if;
update public.invoices set tax=round((subtotal-discount)::numeric*tax_bps/10000),total=subtotal-discount+round((subtotal-discount)::numeric*tax_bps/10000) where id=p_id;
end$$;

create or replace function public.save_record(p_kind text,p_id uuid,p_data jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid:=coalesce(p_id,gen_random_uuid()); c public.companies; i public.invoices; owner_id uuid; schedule_id uuid; billing_period date;begin
perform private.assert_admin();
if p_kind='company' then
if p_id is null then insert into public.companies(id,name,email,address,contact,currency,terms_days) values(result,p_data->>'name',coalesce(p_data->>'email',''),coalesce(p_data->>'address',''),coalesce(p_data->>'contact',''),p_data->>'currency',(p_data->>'terms_days')::int);
else update public.companies set name=p_data->>'name',email=coalesce(p_data->>'email',''),address=coalesce(p_data->>'address',''),contact=coalesce(p_data->>'contact',''),terms_days=(p_data->>'terms_days')::int,archived=coalesce((p_data->>'archived')::boolean,false) where id=result;end if;
elsif p_kind='settings' then
if coalesce(nullif(p_data->>'billing_day','')::int,1) not between 1 and 28 or coalesce((p_data->>'invoice_notice_days')::int,7) not between 0 and 365 then raise exception 'Invalid billing schedule settings';end if;
update public.settings set data=p_data,updated_at=now() where id='business';
elsif p_kind='service' then
insert into public.service_catalogue(id,name,description,rate,currency,archived) values(result,p_data->>'name',coalesce(p_data->>'description',''),(p_data->>'rate')::bigint,p_data->>'currency',coalesce((p_data->>'archived')::boolean,false)) on conflict(id) do update set name=excluded.name,description=excluded.description,rate=excluded.rate,archived=excluded.archived;
else
owner_id:=(p_data->>'company_id')::uuid;
select * into strict c from public.companies where id=owner_id for update;
if c.archived and p_kind<>'payment' then raise exception 'Company is archived';end if;
if p_data->>'currency' not in ('LKR','USD','EUR','GBP','AUD','INR') then raise exception 'Unsupported currency';end if;
if nullif(p_data->>'project_id','') is not null and not exists(select 1 from public.projects where id=(p_data->>'project_id')::uuid and company_id=c.id and currency=p_data->>'currency') then raise exception 'Project does not match company/currency';end if;
if p_kind='expense' then
if p_id is not null and not exists(select 1 from public.company_expenses where id=p_id and company_id=c.id and invoice_id is null) then raise exception 'Only pending expenses for this company can be edited';end if;
insert into public.company_expenses(id,company_id,description,amount,currency,incurred_on)
values(result,c.id,p_data->>'description',(p_data->>'amount')::bigint,p_data->>'currency',(p_data->>'incurred_on')::date)
on conflict(id) do update set description=excluded.description,amount=excluded.amount,currency=excluded.currency,incurred_on=excluded.incurred_on;
elsif p_kind='project' then
insert into public.projects(id,company_id,name,scope,currency,price,advance,state) values(result,c.id,p_data->>'name',coalesce(p_data->>'scope',''),p_data->>'currency',(p_data->>'price')::bigint,(p_data->>'advance')::bigint,coalesce(p_data->>'state','active')) on conflict(id) do update set name=excluded.name,scope=excluded.scope,state=excluded.state;
elsif p_kind='agreement' then
if p_id is not null and not exists(select 1 from public.agreements where id=p_id and company_id=c.id) then raise exception 'Agreement mismatch';end if;
insert into public.agreements(id,company_id,project_id,name,currency,billing_day,starts_on,ends_on,active) values(result,c.id,nullif(p_data->>'project_id','')::uuid,p_data->>'name',p_data->>'currency',nullif(p_data->>'billing_day','')::int,(p_data->>'starts_on')::date,nullif(p_data->>'ends_on','')::date,coalesce((p_data->>'active')::boolean,true)) on conflict(id) do update set name=excluded.name,billing_day=excluded.billing_day,ends_on=excluded.ends_on,active=excluded.active;
update public.agreements set repeat=coalesce(p_data->>'repeat','monthly'),reminder_days=(p_data->>'reminder_days')::int where id=result;
if p_data ? 'items' then
if (p_data->>'effective_from')::date < date_trunc('month',current_date)::date and p_id is not null then raise exception 'Future service edits cannot alter historic periods';end if;
if exists(select 1 from public.agreement_services where agreement_id=result and effective_from>(p_data->>'effective_from')::date) then raise exception 'Edit the latest service version or choose a later period';end if;
update public.agreement_services set effective_until=(p_data->>'effective_from')::date where agreement_id=result and effective_from<(p_data->>'effective_from')::date and effective_until is null;
insert into public.agreement_services(agreement_id,effective_from,items) values(result,(p_data->>'effective_from')::date,p_data->'items') on conflict(agreement_id,effective_from) do update set items=excluded.items;
end if;
elsif p_kind='invoice' then
billing_period:=nullif(p_data->>'period','')::date;
if billing_period is not null and billing_period<>date_trunc('month',billing_period)::date then raise exception 'Billing period must be the first day of the month';end if;
if coalesce(p_data->>'repeat','none') not in ('none','monthly','annually') then raise exception 'Invalid repeat interval';end if;
if exists(select 1 from public.company_expenses where invoice_id=p_id and currency<>p_data->>'currency') then raise exception 'An invoice with expenses cannot change currency';end if;
if p_id is not null then select * into strict i from public.invoices where id=p_id for update;if i.state<>'draft' or i.company_id<>c.id then raise exception 'Only matching drafts can be edited';end if;end if;
insert into public.invoices(id,company_id,project_id,currency,kind,period,due_date,discount,tax_bps,notes) values(result,c.id,nullif(p_data->>'project_id','')::uuid,p_data->>'currency',p_data->>'kind',nullif(p_data->>'period','')::date,(p_data->>'due_date')::date,coalesce((p_data->>'discount')::bigint,0),coalesce((p_data->>'tax_bps')::int,0),coalesce(p_data->>'notes','')) on conflict(id) do update set due_date=excluded.due_date,discount=excluded.discount,tax_bps=excluded.tax_bps,notes=excluded.notes,currency=case when public.invoices.agreement_id is null then excluded.currency else public.invoices.currency end,kind=case when public.invoices.agreement_id is null then excluded.kind else public.invoices.kind end,project_id=excluded.project_id,period=case when public.invoices.agreement_id is null then excluded.period else public.invoices.period end;
perform private.set_items(result,p_data->'items');
if p_id is null and coalesce(p_data->>'repeat','none')<>'none' then
if billing_period is null then raise exception 'Choose a billing month for a repeating invoice';end if;
if not exists(select 1 from jsonb_array_elements(p_data->'items') x where nullif(x->>'expense_id','') is null) then raise exception 'A repeating invoice needs at least one recurring service';end if;
insert into public.agreements(company_id,project_id,name,currency,starts_on,repeat,discount,tax_bps,notes)
values(c.id,nullif(p_data->>'project_id','')::uuid,'Recurring invoice from '||billing_period,p_data->>'currency',billing_period,p_data->>'repeat',coalesce((p_data->>'discount')::bigint,0),coalesce((p_data->>'tax_bps')::int,0),coalesce(p_data->>'notes','')) returning id into schedule_id;
insert into public.agreement_services(agreement_id,effective_from,items) values(schedule_id,billing_period,(select jsonb_agg(x) from jsonb_array_elements(p_data->'items') x where nullif(x->>'expense_id','') is null));
update public.invoices set agreement_id=schedule_id,kind='recurring' where id=result;
end if;
elsif p_kind='payment' then
if p_id is not null then raise exception 'Payments cannot be overwritten';end if;
insert into public.payments(id,company_id,currency,amount,received_on,method,reference) values(result,c.id,p_data->>'currency',(p_data->>'amount')::bigint,(p_data->>'received_on')::date,p_data->>'method',coalesce(p_data->>'reference',''));
elsif p_kind='proposal' then
if p_id is not null and not exists(select 1 from public.proposals where id=p_id and state='draft' and company_id=c.id) then raise exception 'Only matching draft proposals can be edited';end if;
insert into public.proposals(id,company_id,project_id,title,currency,price,brief,sections) values(result,c.id,nullif(p_data->>'project_id','')::uuid,p_data->>'title',p_data->>'currency',(p_data->>'price')::bigint,p_data->'brief',p_data->'sections') on conflict(id) do update set title=excluded.title,price=excluded.price,brief=excluded.brief,sections=excluded.sections,version=public.proposals.version+1;
insert into public.proposal_versions(proposal_id,version,content) select id,version,to_jsonb(p) from public.proposals p where id=result;
else raise exception 'Unsupported record type';end if;
end if;
insert into public.audit_logs(action,record_id) values('save_'||p_kind,result);return result;end$$;

create or replace function private.monthly_draft(p_agreement uuid,p_period date) returns uuid language plpgsql set search_path='' as $$declare a public.agreements; c public.companies; result uuid;rows jsonb; settings jsonb; bill_on date;begin
select * into strict a from public.agreements where id=p_agreement;select * into strict c from public.companies where id=a.company_id for update;
select * into strict a from public.agreements where id=p_agreement;
if c.archived or not a.active or p_period<>date_trunc('month',p_period)::date or p_period<date_trunc('month',a.starts_on)::date or (a.ends_on is not null and p_period> a.ends_on) then raise exception 'Agreement is not billable for this period';end if;
if a.repeat='annually' and extract(month from p_period)<>extract(month from a.starts_on) then raise exception 'Annual agreement is not billable in this month';end if;
select data into settings from public.settings where id='business';
bill_on:=greatest(p_period+(coalesce(a.billing_day,(settings->>'billing_day')::int,1)-1),a.starts_on);
if a.ends_on is not null and bill_on>a.ends_on then raise exception 'Billing date is after agreement end';end if;
select id into result from public.invoices where agreement_id=a.id and period=p_period;if result is not null then return result;end if;
select items into rows from public.agreement_services where agreement_id=a.id and effective_from<=p_period and (effective_until is null or effective_until>p_period) order by effective_from desc limit 1;if rows is null then raise exception 'No effective service version';end if;
insert into public.invoices(company_id,project_id,agreement_id,currency,kind,period,due_date,discount,tax_bps,notes) values(c.id,a.project_id,a.id,a.currency,'recurring',p_period,bill_on+c.terms_days,a.discount,a.tax_bps,a.notes) returning id into result;
perform private.set_items(result,rows);return result;end$$;

create or replace function public.void_invoice(p_id uuid,p_reason text) returns void language plpgsql security definer set search_path='' as $$declare i public.invoices;begin
perform private.assert_admin();select * into strict i from public.invoices where id=p_id;perform 1 from public.companies where id=i.company_id for update;
if length(p_reason)<5 then raise exception 'A reason is required';end if;
if exists(select 1 from public.payment_allocations where invoice_id=p_id) or exists(select 1 from public.credit_applications where invoice_id=p_id) then raise exception 'Allocated invoices require a credit correction';end if;
if i.state<>'issued' then raise exception 'Only issued invoices can be voided';end if;
update public.company_expenses set invoice_id=null where invoice_id=p_id;
update public.invoices set state='void' where id=p_id;insert into public.audit_logs(action,record_id,detail) values('void_invoice',p_id,jsonb_build_object('reason',p_reason));end$$;

create or replace function public.scan_daily(p_today date) returns integer language plpgsql security definer set search_path='' as $$declare a public.agreements; period date;i public.invoices;r public.notification_rules;d integer;target date;n integer:=0;settings jsonb; lead_days integer; bill_on date; draft_id uuid;begin
select data into settings from public.settings where id='business';
for a in select g.* from public.agreements g join public.companies c on c.id=g.company_id where g.active and not c.archived loop
begin
-- Include upcoming periods at the configured notice date; retain the 24-month catch-up window.
lead_days:=coalesce(a.reminder_days,(settings->>'invoice_notice_days')::int,7);
for period in select generate_series(greatest(date_trunc('month',a.starts_on),date_trunc('month',p_today)-interval '24 months'),date_trunc('month',least(p_today+lead_days,coalesce(a.ends_on,p_today+lead_days))),interval '1 month')::date loop
begin
bill_on:=greatest(period+(coalesce(a.billing_day,(settings->>'billing_day')::int,1)-1),a.starts_on);
if bill_on-lead_days<=p_today and (a.ends_on is null or bill_on<=a.ends_on) and (a.repeat='monthly' or extract(month from period)=extract(month from a.starts_on)) then
 draft_id:=private.monthly_draft(a.id,period);
 if exists(select 1 from public.invoices where id=draft_id and state='draft') then
 insert into public.notification_events(invoice_id,rule_id,scheduled_on,channel,message)
 values(draft_id,null,bill_on-lead_days,'billing','Review and send the invoice for '||to_char(period,'FMMonth YYYY')||' by '||bill_on||'.')
 on conflict(invoice_id) where rule_id is null do update set scheduled_on=excluded.scheduled_on,message=excluded.message;
 end if;
end if;
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
