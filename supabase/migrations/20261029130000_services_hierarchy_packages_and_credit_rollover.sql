-- Services hierarchy, company service packages, and automatic overpayment/underpayment adjustment on invoices.

-- 1. Service catalogue: parent service (for sub-services) and billing frequency (one-time vs monthly)
alter table public.service_catalogue add column if not exists parent_id uuid references public.service_catalogue(id) on delete cascade;
alter table public.service_catalogue add column if not exists billing_type text not null default 'monthly' check(billing_type in ('one-time','monthly'));
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_service_not_self_parent') then
    alter table public.service_catalogue add constraint chk_service_not_self_parent check(parent_id is null or parent_id <> id);
  end if;
end $$;
create index if not exists idx_service_catalogue_parent on public.service_catalogue(parent_id);

-- 2. Projects (Company Packages): items (services & sub-services) and package discount
alter table public.projects add column if not exists discount bigint not null default 0 check(discount between 0 and 1000000000000);
alter table public.projects add column if not exists items jsonb not null default '[]'::jsonb check(jsonb_typeof(items)='array');

alter table public.agreements add column managed_services boolean not null default false;
create unique index agreements_managed_services on public.agreements(project_id) where managed_services;
alter table public.invoice_items add column discount bigint not null default 0 check(discount between 0 and 1000000000000);
alter table public.invoice_items add column service_item_id uuid;
alter table public.invoice_items add column billing_type text check(billing_type in ('one-time','monthly'));
create index invoice_items_service_item on public.invoice_items(service_item_id) where service_item_id is not null;

-- 3. Update save_record to handle sub-services, billing_type, and package items with discounts
create or replace function public.save_record(p_kind text,p_id uuid,p_data jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid:=coalesce(p_id,gen_random_uuid()); c public.companies; i public.invoices; owner_id uuid; schedule_id uuid; billing_period date; item jsonb; normalized jsonb; gross numeric; net numeric; total_net numeric; agreed public.projects;begin
perform private.assert_admin();
if p_kind='company' then
if p_id is null then insert into public.companies(id,name,email,address,contact,currency,terms_days) values(result,p_data->>'name',coalesce(p_data->>'email',''),coalesce(p_data->>'address',''),coalesce(p_data->>'contact',''),p_data->>'currency',(p_data->>'terms_days')::int);
else update public.companies set name=p_data->>'name',email=coalesce(p_data->>'email',''),address=coalesce(p_data->>'address',''),contact=coalesce(p_data->>'contact',''),terms_days=(p_data->>'terms_days')::int,archived=coalesce((p_data->>'archived')::boolean,false) where id=result;end if;
elsif p_kind='settings' then
if coalesce(nullif(p_data->>'billing_day','')::int,1) not between 1 and 28 or coalesce((p_data->>'invoice_notice_days')::int,7) not between 0 and 365 then raise exception 'Invalid billing schedule settings';end if;
update public.settings set data=p_data,updated_at=now() where id='business';
elsif p_kind='service' then
perform pg_advisory_xact_lock(20261029);
if exists(select 1 from public.service_catalogue where parent_id=result) and nullif(p_data->>'parent_id','') is not null then raise exception 'A main service with children cannot become a sub-service';end if;
if p_data ? 'parent_id' and nullif(p_data->>'parent_id','') is not null then
  if not exists(select 1 from public.service_catalogue where id=(p_data->>'parent_id')::uuid and parent_id is null and id<>result and not archived and currency=p_data->>'currency') then
    raise exception 'Parent service must be an existing main service';
  end if;
end if;
insert into public.service_catalogue(id,name,description,rate,currency,archived,parent_id,billing_type)
values(
  result,
  p_data->>'name',
  coalesce(p_data->>'description',''),
  (p_data->>'rate')::bigint,
  p_data->>'currency',
  coalesce((p_data->>'archived')::boolean,false),
  nullif(p_data->>'parent_id','')::uuid,
  coalesce(p_data->>'billing_type','monthly')
)
on conflict(id) do update set
  name=excluded.name,
  description=excluded.description,
  rate=excluded.rate,
  archived=excluded.archived,
  parent_id=excluded.parent_id,
  billing_type=excluded.billing_type;
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
if p_id is not null and not exists(select 1 from public.projects where id=p_id and company_id=c.id and currency=p_data->>'currency') then raise exception 'Agreed services company/currency mismatch';end if;
normalized:='[]'; total_net:=0;
if jsonb_typeof(coalesce(p_data->'items','[]'))<>'array' or jsonb_array_length(coalesce(p_data->'items','[]'))>300 then raise exception 'Invalid agreed services';end if;
for item in select value from jsonb_array_elements(coalesce(p_data->'items','[]')) loop
 if nullif(item->>'service_id','') is null or not exists(select 1 from public.service_catalogue where id=(item->>'service_id')::uuid and currency=p_data->>'currency' and not archived) then raise exception 'Choose an active catalogue service in the same currency';end if;
 if item->>'billing_type' not in ('monthly','one-time') or item->>'billing_type' is null or coalesce(length(trim(item->>'name')),0)=0 or (item->>'quantity') !~ '^\d+(\.\d{1,3})?$' or (item->>'quantity')::numeric not between 0.001 and 100000 or (item->>'rate')::numeric not between 0 and 1000000000000 or (item->>'rate')::numeric<>trunc((item->>'rate')::numeric) then raise exception 'Invalid agreed service values';end if;
 gross:=round((item->>'quantity')::numeric*(item->>'rate')::numeric);
 net:=gross-coalesce((item->>'discount')::numeric,0);
 if net<0 or gross>1000000000000 or coalesce((item->>'discount')::numeric,0)<0 or coalesce((item->>'discount')::numeric,0)<>trunc(coalesce((item->>'discount')::numeric,0)) then raise exception 'Invalid service discount';end if;
 if nullif(item->>'id','') is not null and not exists(select 1 from public.projects q,jsonb_array_elements(q.items) x where q.id=result and x->>'id'=item->>'id' and x->>'service_id'=item->>'service_id') then raise exception 'Unknown agreed service item';end if;
 item:=item || jsonb_build_object('id',coalesce(nullif(item->>'id','')::uuid,gen_random_uuid()),'discount',coalesce((item->>'discount')::bigint,0));
 if exists(select 1 from jsonb_array_elements(normalized) x where x->>'id'=item->>'id') then raise exception 'Duplicate agreed service item';end if;
 normalized:=normalized || jsonb_build_array(item); total_net:=total_net+net;
end loop;
if jsonb_array_length(normalized)>0 then
 total_net:=total_net-coalesce((p_data->>'discount')::bigint,0);
 if total_net not between 0 and 1000000000000 then raise exception 'Invalid total service discount';end if;
 p_data:=p_data || jsonb_build_object('items',normalized,'price',total_net);
end if;
insert into public.projects(id,company_id,name,scope,currency,price,advance,state,discount,items)
values(
  result,
  c.id,
  p_data->>'name',
  coalesce(p_data->>'scope',''),
  p_data->>'currency',
  (p_data->>'price')::bigint,
  coalesce((p_data->>'advance')::bigint,0),
  coalesce(p_data->>'state','active'),
  coalesce((p_data->>'discount')::bigint,0),
  coalesce(p_data->'items','[]'::jsonb)
)
on conflict(id) do update set
  name=excluded.name,
  scope=excluded.scope,
  state=excluded.state,
  price=excluded.price,
  advance=excluded.advance,
  discount=excluded.discount,
  items=excluded.items;
-- One schedule per company service selection; existing drafts remain untouched.
if exists(select 1 from jsonb_array_elements(normalized) x where x->>'billing_type'='monthly') then
 insert into public.agreements(company_id,project_id,name,currency,starts_on,active,managed_services)
 values(c.id,result,p_data->>'name',p_data->>'currency',date_trunc('month',now() at time zone 'Asia/Colombo')::date,coalesce(p_data->>'state','active')='active',true)
 on conflict(project_id) where managed_services do update set name=excluded.name,active=excluded.active;
else
 update public.agreements set active=false where project_id=result and managed_services;
end if;
elsif p_kind='agreement' then
if p_id is not null and exists(select 1 from public.agreements where id=p_id and managed_services) then raise exception 'Edit these services from the company Agreed services tab';end if;
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
if p_id is null and nullif(p_data->>'project_id','') is not null then
 select * into strict agreed from public.projects where id=(p_data->>'project_id')::uuid;
 if jsonb_array_length(agreed.items)>0 then
  if agreed.state<>'active' then raise exception 'Agreed services are inactive';end if;
  billing_period:=coalesce(billing_period,date_trunc('month',now() at time zone 'Asia/Colombo')::date);
  select id into schedule_id from public.agreements where project_id=agreed.id and managed_services and active;
  if schedule_id is not null then return private.monthly_draft(schedule_id,billing_period);end if;
  p_data:=p_data || jsonb_build_object('items',private.agreed_service_rows(agreed.id,null),'discount',0,'repeat','none','period',billing_period);
 end if;
end if;
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


create or replace function private.agreed_service_rows(p_project uuid,p_invoice uuid) returns jsonb language plpgsql set search_path='' as $$
declare p public.projects; x jsonb; net numeric; total_net numeric; running numeric:=0; prior_share bigint:=0; share bigint; rows jsonb:='[]';
begin
 select * into strict p from public.projects where id=p_project;
 select sum(round((v->>'quantity')::numeric*(v->>'rate')::numeric)-coalesce((v->>'discount')::bigint,0)) into total_net from jsonb_array_elements(p.items) v;
 for x in select value from jsonb_array_elements(p.items) loop
  net:=round((x->>'quantity')::numeric*(x->>'rate')::numeric)-coalesce((x->>'discount')::bigint,0);
  running:=running+net;
  share:=case when total_net>0 then round(p.discount*running/total_net)-prior_share else 0 end;
  prior_share:=prior_share+share;
  if x->>'billing_type'='one-time' and exists(select 1 from public.invoice_items it join public.invoices i on i.id=it.invoice_id where it.service_item_id=(x->>'id')::uuid and i.state<>'void' and i.id is distinct from p_invoice) then continue;end if;
  rows:=rows || jsonb_build_array(jsonb_build_object('description',x->>'name'||case when coalesce(x->>'description','')<>'' then ' - '||(x->>'description') else '' end,'quantity',x->>'quantity','rate',(x->>'rate')::bigint,'discount',coalesce((x->>'discount')::bigint,0)+share,'service_item_id',x->>'id','billing_type',x->>'billing_type'));
 end loop;
 return rows;
end$$;
create or replace function private.set_items(p_id uuid,p_items jsonb) returns void language plpgsql set search_path='' as $$declare row jsonb; pos integer:=0; inv public.invoices; expense public.company_expenses; fresh boolean; original_items jsonb;begin
select * into strict inv from public.invoices where id=p_id;
perform 1 from public.companies where id=inv.company_id for update;
if inv.state<>'draft' then raise exception 'Only draft items can be changed';end if;
fresh:=not exists(select 1 from public.invoice_items where invoice_id=p_id);
if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 0 and 300 then raise exception 'Provide 1 to 300 invoice rows';end if;
select coalesce(jsonb_agg(to_jsonb(it)),'[]') into original_items from public.invoice_items it where invoice_id=p_id;
delete from public.invoice_items where invoice_id=p_id;
for row in select value from jsonb_array_elements(p_items) where nullif(value->>'expense_id','') is null loop
if coalesce((row->>'discount')::bigint,0)>round((row->>'quantity')::numeric*(row->>'rate')::bigint) then raise exception 'Service discount exceeds line amount';end if;
if nullif(row->>'service_item_id','') is not null then
 if not exists(select 1 from public.projects p,jsonb_array_elements(p.items) x where p.id=inv.project_id and x->>'id'=row->>'service_item_id' and x->>'billing_type'=row->>'billing_type') and not exists(select 1 from jsonb_array_elements(original_items) x where x->>'service_item_id'=row->>'service_item_id' and x->>'billing_type'=row->>'billing_type') then raise exception 'Agreed service mismatch';end if;
 if row->>'billing_type'='one-time' and exists(select 1 from public.invoice_items it join public.invoices i on i.id=it.invoice_id where it.service_item_id=(row->>'service_item_id')::uuid and i.state<>'void') then raise exception 'One-time service already included in an invoice';end if;
end if;
insert into public.invoice_items(invoice_id,position,description,quantity,rate,amount,discount,service_item_id,billing_type) values(p_id,pos,row->>'description',(row->>'quantity')::numeric,(row->>'rate')::bigint,round((row->>'quantity')::numeric*(row->>'rate')::bigint)-coalesce((row->>'discount')::bigint,0),coalesce((row->>'discount')::bigint,0),nullif(row->>'service_item_id','')::uuid,nullif(row->>'billing_type',''));pos:=pos+1;
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

create or replace function private.monthly_draft(p_agreement uuid,p_period date) returns uuid language plpgsql set search_path='' as $$declare a public.agreements; c public.companies; result uuid;rows jsonb; settings jsonb; bill_on date;begin
select * into strict a from public.agreements where id=p_agreement;select * into strict c from public.companies where id=a.company_id for update;
select * into strict a from public.agreements where id=p_agreement;
if c.archived or not a.active or p_period<>date_trunc('month',p_period)::date or p_period<date_trunc('month',a.starts_on)::date or (a.ends_on is not null and p_period> a.ends_on) then raise exception 'Agreement is not billable for this period';end if;
if a.repeat='annually' and extract(month from p_period)<>extract(month from a.starts_on) then raise exception 'Annual agreement is not billable in this month';end if;
select data into settings from public.settings where id='business';
bill_on:=greatest(p_period+(coalesce(a.billing_day,(settings->>'billing_day')::int,1)-1),a.starts_on);
if a.ends_on is not null and bill_on>a.ends_on then raise exception 'Billing date is after agreement end';end if;
select id into result from public.invoices where agreement_id=a.id and period=p_period;if result is not null then return result;end if;
if a.managed_services then
 if not exists(select 1 from public.projects where id=a.project_id and state='active') then raise exception 'Agreed services are inactive';end if;
 rows:=private.agreed_service_rows(a.project_id,null);
else
select items into rows from public.agreement_services where agreement_id=a.id and effective_from<=p_period and (effective_until is null or effective_until>p_period) order by effective_from desc limit 1;if rows is null then raise exception 'No effective service version';end if;
end if;
insert into public.invoices(company_id,project_id,agreement_id,currency,kind,period,due_date,discount,tax_bps,notes) values(c.id,a.project_id,a.id,a.currency,'recurring',p_period,bill_on+c.terms_days,a.discount,a.tax_bps,a.notes) returning id into result;
perform private.set_items(result,rows);return result;end$$;


create or replace function public.apply_available_credit(p_invoice uuid) returns bigint language plpgsql security definer set search_path='' as $$
declare inv public.invoices; p public.payments; available bigint; used bigint; applied bigint:=0;
begin
 perform private.assert_admin();
 select * into strict inv from public.invoices where id=p_invoice;
 perform 1 from public.companies where id=inv.company_id for update;
 select * into strict inv from public.invoices where id=p_invoice for update;
 if inv.state<>'issued' then raise exception 'Only issued invoices can receive credit';end if;
 for p in select * from public.payments where company_id=inv.company_id and currency=inv.currency and state='confirmed' order by received_on,created_at,id for update loop
  available:=p.amount-coalesce((select sum(amount) from public.payment_allocations where payment_id=p.id),0);
  used:=least(available,private.balance(inv.id));
  if used>0 then
   perform private.allocate(p.id,jsonb_build_array(jsonb_build_object('invoice_id',inv.id,'amount',used)));
   applied:=applied+used;
  end if;
 end loop;
 if applied>0 then insert into public.audit_logs(action,record_id,detail) values('apply_available_credit',inv.id,jsonb_build_object('amount',applied));end if;
 return applied;
end$$;
create or replace function public.issue_invoice(p_id uuid,p_brand jsonb) returns jsonb language plpgsql security definer set search_path='' as $$declare i public.invoices;c public.companies;s jsonb; refs jsonb; credit bigint;begin
perform private.assert_admin();select company_id into strict i.company_id from public.invoices where id=p_id;select * into strict c from public.companies where id=i.company_id for update;
select * into strict i from public.invoices where id=p_id for update;if i.state<>'draft' then return to_jsonb(i);end if;
if c.archived or not exists(select 1 from public.invoice_items where invoice_id=i.id) then raise exception 'Cannot issue an empty invoice or archived company';end if;
if i.project_id is not null and not exists(select 1 from public.projects where id=i.project_id and company_id=i.company_id and currency=i.currency) then raise exception 'Project currency mismatch';end if;
if i.project_id is not null and not exists(select 1 from public.projects where id=i.project_id and jsonb_array_length(items)>0) and (select coalesce(sum(total),0) from public.invoices where project_id=i.project_id and state='issued')+i.total > (select price from public.projects where id=i.project_id) then raise exception 'Project charges exceed agreed price';end if;
insert into public.invoice_balance_references(invoice_id,earlier_invoice_id,number,amount) select i.id,x.id,x.number,private.balance(x.id) from public.invoices x where x.company_id=i.company_id and x.currency=i.currency and x.state='issued' and private.balance(x.id)>0;
select coalesce(jsonb_agg(to_jsonb(r)),'[]') into refs from public.invoice_balance_references r where invoice_id=i.id;
select data into s from public.settings where id='business';
update public.invoices set state='issued',number=private.next_number(i.company_id,'INV'),issued_at=now() where id=i.id returning * into i;
credit:=public.apply_available_credit(i.id);
update public.invoices set snapshot=jsonb_build_object('kind','invoice','invoice',(to_jsonb(i)-'snapshot') || jsonb_build_object('credit_applied',credit,'balance_at_issue',private.balance(i.id)),'company',to_jsonb(c),'business',s,'brand',p_brand,'items',(select jsonb_agg(to_jsonb(x) order by position) from public.invoice_items x where invoice_id=i.id),'references',refs,'template_version','v1') where id=i.id returning * into i;
insert into public.document_files(record_id,kind,brand_version) values(i.id,'invoice',p_brand->>'version');
insert into public.audit_logs(action,record_id) values('issue_invoice',i.id);return to_jsonb(i);end$$;


revoke all on function private.agreed_service_rows(uuid,uuid) from public,anon,authenticated;
revoke all on function public.apply_available_credit(uuid) from public,anon,authenticated;
grant execute on function public.apply_available_credit(uuid) to authenticated;
notify pgrst, 'reload schema';
