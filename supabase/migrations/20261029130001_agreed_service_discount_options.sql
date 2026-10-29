-- Percentage values use integer basis points: 1000 = 10.00%.
alter table public.projects add column discount_type text not null default 'amount' check(discount_type in ('amount','percentage'));
alter table public.projects add column discount_value bigint not null default 0 check(discount_value between 0 and 1000000000000);
alter table public.projects add constraint project_discount_percentage_bound check(discount_type<>'percentage' or discount_value<=10000);
update public.projects set discount_value=discount;

create function private.service_discount_amount(p_base numeric,p_type text,p_value numeric) returns bigint language plpgsql set search_path='' as $$
declare result bigint;
begin
 if p_type is null or p_type not in ('amount','percentage') or p_value is null or p_value<>trunc(p_value) or p_value<0 or p_value>1000000000000 or (p_type='percentage' and p_value>10000) then raise exception 'Invalid discount option';end if;
 result:=case when p_type='percentage' then round(p_base*p_value/10000)::bigint else p_value end;
 if result>p_base then raise exception 'Discount exceeds service amount';end if;
 return result;
end$$;
revoke all on function private.service_discount_amount(numeric,text,numeric) from public,anon,authenticated;

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
 item:=item || jsonb_build_object('discount_type',coalesce(item->>'discount_type','amount'),'discount_value',coalesce((item->>'discount_value')::numeric,(item->>'discount')::numeric,0));
 item:=item || jsonb_build_object('discount',private.service_discount_amount(gross, item->>'discount_type',(item->>'discount_value')::numeric));
 net:=gross-(item->>'discount')::bigint;
 if net<0 or gross>1000000000000 or coalesce((item->>'discount')::numeric,0)<0 or coalesce((item->>'discount')::numeric,0)<>trunc(coalesce((item->>'discount')::numeric,0)) then raise exception 'Invalid service discount';end if;
 if nullif(item->>'id','') is not null and not exists(select 1 from public.projects q,jsonb_array_elements(q.items) x where q.id=result and x->>'id'=item->>'id' and x->>'service_id'=item->>'service_id') then raise exception 'Unknown agreed service item';end if;
 item:=item || jsonb_build_object('id',coalesce(nullif(item->>'id','')::uuid,gen_random_uuid()),'discount',coalesce((item->>'discount')::bigint,0));
 if exists(select 1 from jsonb_array_elements(normalized) x where x->>'id'=item->>'id') then raise exception 'Duplicate agreed service item';end if;
 normalized:=normalized || jsonb_build_array(item); total_net:=total_net+net;
end loop;
if jsonb_array_length(normalized)>0 then
 p_data:=p_data || jsonb_build_object('discount_type',coalesce(p_data->>'discount_type','amount'),'discount_value',coalesce((p_data->>'discount_value')::numeric,(p_data->>'discount')::numeric,0));
 p_data:=p_data || jsonb_build_object('discount',private.service_discount_amount(total_net,p_data->>'discount_type',(p_data->>'discount_value')::numeric),'name',(select left(string_agg(x->>'name',', ' order by n),160) from jsonb_array_elements(normalized) with ordinality as t(x,n)));
 total_net:=total_net-(p_data->>'discount')::bigint;
 if total_net not between 0 and 1000000000000 then raise exception 'Invalid total service discount';end if;
 p_data:=p_data || jsonb_build_object('items',normalized,'price',total_net);
end if;
insert into public.projects(id,company_id,name,scope,currency,price,advance,state,discount,items,discount_type,discount_value)
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
  coalesce(p_data->'items','[]'::jsonb),
  coalesce(p_data->>'discount_type','amount'),
  coalesce((p_data->>'discount_value')::numeric,(p_data->>'discount')::numeric,0)
)
on conflict(id) do update set
  name=excluded.name,
  scope=excluded.scope,
  state=excluded.state,
  price=excluded.price,
  advance=excluded.advance,
  discount=excluded.discount,
  items=excluded.items,
  discount_type=excluded.discount_type,
  discount_value=excluded.discount_value;
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



notify pgrst, 'reload schema';
