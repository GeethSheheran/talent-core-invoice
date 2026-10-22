-- One-time initial setup. Run the ENTIRE file as postgres in Supabase SQL Editor.
-- Existing application tables cause an error and rollback; do not drop them.
-- Generated from local migrations; no API keys or passwords are included.
begin;
-- 20261013140752_core.sql
create schema if not exists private;
revoke all on schema private from public;
create table public.admin_members(user_id uuid primary key references auth.users(id), active boolean not null default true, created_at timestamptz not null default now());
create sequence public.company_code_seq;
create function private.company_code() returns text language plpgsql set search_path='' as $$declare n text:=nextval('public.company_code_seq')::text;begin return 'CMP-'||lpad(n,greatest(4,length(n)),'0');end$$;
create table public.companies(id uuid primary key default gen_random_uuid(), code text not null unique default private.company_code(), name text not null check(length(name) between 1 and 160), email text not null default '', address text not null default '', contact text not null default '', currency text not null default 'LKR' check(currency in ('LKR','USD','EUR','GBP','AUD','INR')), terms_days integer not null default 14 check(terms_days between 0 and 365), archived boolean not null default false, created_at timestamptz not null default now(), created_by uuid references auth.users(id) default auth.uid());
create table public.settings(id text primary key default 'business' check(id='business'), data jsonb not null default '{"name":"Your business","currency":"LKR","timezone":"Asia/Colombo","terms_days":14,"intervals":[3,6]}', updated_at timestamptz not null default now());
insert into public.settings(id) values('business');
update public.settings set data=jsonb_set(data,'{proposal_prompt}',to_jsonb($prompt$Write a professional project proposal for the selected company using only the supplied brief and approved commercial data. Use simple readable English and explain value from the client's perspective. Present introduction, client needs, proposed solution, included scope and deliverables, benefits, delivery stages/timeline, investment/payment terms, maintenance, exclusions/assumptions and acceptance/next steps where relevant. Explain the solution before the investment. Distinguish included work from future options. Do not invent prices, dates, percentages, research findings, guarantees or commitments. Flag missing information for admin review. Financial fields are managed by the application and must not be overwritten by generated prose. Return structured editable sections matching the supplied JSON schema, not executable HTML/CSS/scripts. The application renders them through the approved A4 template and uploaded brand assets. Do not include internal development instructions in the client document.$prompt$::text)) where id='business';
create table public.service_catalogue(id uuid primary key default gen_random_uuid(), name text not null, description text not null default '', rate bigint not null check(rate between 0 and 1000000000000), currency text not null default 'LKR', archived boolean not null default false, created_at timestamptz not null default now());
create table public.projects(id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies, name text not null, scope text not null default '', currency text not null, price bigint not null check(price between 0 and 1000000000000), advance bigint not null default 0 check(advance>=0 and advance<=price), state text not null default 'active' check(state in ('active','completed','archived')), created_at timestamptz not null default now());
create table public.agreements(id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies, project_id uuid references public.projects, name text not null, currency text not null, billing_day integer not null default 1 check(billing_day between 1 and 28), starts_on date not null, ends_on date, active boolean not null default true, created_at timestamptz not null default now(),check(ends_on is null or ends_on>=starts_on));
create table public.agreement_services(id uuid primary key default gen_random_uuid(), agreement_id uuid not null references public.agreements, effective_from date not null, effective_until date, items jsonb not null check(jsonb_typeof(items)='array'), created_at timestamptz not null default now(), unique(agreement_id,effective_from),check(effective_until is null or effective_until>effective_from));
create table public.invoices(id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies, project_id uuid references public.projects, agreement_id uuid references public.agreements, currency text not null, kind text not null default 'one-off' check(kind in ('one-off','recurring','advance','balance')), period date, due_date date not null, state text not null default 'draft' check(state in ('draft','issued','void')), number text unique, issued_at timestamptz, subtotal bigint not null default 0, discount bigint not null default 0 check(discount>=0), tax_bps integer not null default 0 check(tax_bps between 0 and 10000), tax bigint not null default 0, total bigint not null default 0 check(total between 0 and 1000000000000), notes text not null default '', snapshot jsonb, first_sent_on date, reminders_paused boolean not null default false, created_at timestamptz not null default now(), created_by uuid references auth.users(id) default auth.uid(), unique(agreement_id,period), check((state='draft' and number is null) or (state<>'draft' and number is not null)));
create table public.invoice_items(id uuid primary key default gen_random_uuid(), invoice_id uuid not null references public.invoices on delete cascade, position integer not null, description text not null check(length(description) between 1 and 4000), quantity numeric(12,3) not null check(quantity>0 and quantity<=100000), rate bigint not null check(rate between 0 and 1000000000000), amount bigint not null check(amount>=0), unique(invoice_id,position));
create table public.invoice_balance_references(invoice_id uuid not null references public.invoices, earlier_invoice_id uuid not null references public.invoices, number text not null, amount bigint not null check(amount>0), primary key(invoice_id,earlier_invoice_id),check(invoice_id<>earlier_invoice_id));
create table public.payments(id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies, currency text not null, amount bigint not null check(amount between 1 and 1000000000000), received_on date not null, method text not null check(method in ('bank','cash','other')), reference text not null default '', state text not null default 'pending' check(state in ('pending','confirmed','reversed')), confirmed_at timestamptz, receipt_number text unique, snapshot jsonb, created_at timestamptz not null default now(), created_by uuid references auth.users(id) default auth.uid());
create table public.payment_allocations(id uuid primary key default gen_random_uuid(), payment_id uuid not null references public.payments, invoice_id uuid not null references public.invoices, amount bigint not null check(amount>0), created_at timestamptz not null default now(),unique(payment_id,invoice_id));
create table public.payment_reversals(id uuid primary key default gen_random_uuid(), payment_id uuid not null unique references public.payments, reason text not null check(length(reason)>=5), created_at timestamptz not null default now(), created_by uuid references auth.users(id) default auth.uid());
create table public.credit_notes(id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies, currency text not null, amount bigint not null check(amount>0), reason text not null check(length(reason)>=5), created_at timestamptz not null default now(), created_by uuid references auth.users(id) default auth.uid());
-- Origin allocations identify corrected charges; applications alone reduce debt.
create table public.credit_note_allocations(id uuid primary key default gen_random_uuid(), credit_note_id uuid not null references public.credit_notes, invoice_id uuid not null references public.invoices, amount bigint not null check(amount>0), unique(credit_note_id,invoice_id));
create table public.credit_applications(id uuid primary key default gen_random_uuid(), credit_note_id uuid not null references public.credit_notes, invoice_id uuid not null references public.invoices, amount bigint not null check(amount>0), created_at timestamptz not null default now(),unique(credit_note_id,invoice_id));
create table public.document_counters(company_id uuid not null references public.companies, year integer not null, kind text not null, value integer not null check(value>0), primary key(company_id,year,kind));
create table public.proposals(id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies, project_id uuid references public.projects, title text not null, currency text not null, price bigint not null check(price between 0 and 1000000000000), brief jsonb not null default '{}', sections jsonb not null default '[]', state text not null default 'draft' check(state in ('draft','issued','accepted')), version integer not null default 1, number text unique, snapshot jsonb, created_at timestamptz not null default now());
create table public.proposal_versions(id uuid primary key default gen_random_uuid(), proposal_id uuid not null references public.proposals, version integer not null, content jsonb not null, created_at timestamptz not null default now(), created_by uuid references auth.users(id) default auth.uid(),unique(proposal_id,version));
create table public.document_files(id uuid primary key default gen_random_uuid(), record_id uuid not null, kind text not null check(kind in ('invoice','proposal','receipt','statement')), version integer not null default 1, path text, checksum text, template_version text not null default 'v1', brand_version text not null, state text not null default 'pending' check(state in ('pending','ready','failed')), error text, created_at timestamptz not null default now(),unique(record_id,kind,version));
create table public.delivery_attempts(id uuid primary key default gen_random_uuid(), invoice_id uuid not null references public.invoices, recipient text not null, channel text not null, state text not null default 'queued' check(state in ('queued','accepted','delivered','failed','mock','external')), provider_id text unique, idempotency_key text not null unique, created_at timestamptz not null default now());
create table public.notification_rules(id uuid primary key default gen_random_uuid(), intervals integer[] not null default '{3,6}', basis text not null default 'sent' check(basis in ('sent','due')), effective_from date not null default current_date, repeat_days integer check(repeat_days>0), active boolean not null default true, created_at timestamptz not null default now());
insert into public.notification_rules default values;
create table public.notification_events(id uuid primary key default gen_random_uuid(), invoice_id uuid not null references public.invoices, rule_id uuid not null references public.notification_rules, scheduled_on date not null, channel text not null default 'in-app', message text not null, read_at timestamptz, created_at timestamptz not null default now(),unique(invoice_id,rule_id,scheduled_on,channel));
create table public.outbox_jobs(id uuid primary key default gen_random_uuid(), kind text not null, payload jsonb not null, key text not null unique, state text not null default 'pending' check(state in ('pending','running','done','failed')), attempts integer not null default 0, available_at timestamptz not null default now(), lease_until timestamptz, last_error text, created_at timestamptz not null default now());
create table public.job_runs(id uuid primary key default gen_random_uuid(), task text not null, state text not null, detail text, created_at timestamptz not null default now());
create table public.audit_logs(id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id) default auth.uid(), action text not null, record_id uuid, detail jsonb not null default '{}', created_at timestamptz not null default now());
create index on public.invoices(company_id,state,due_date);
create index on public.payments(company_id,state,received_on);
create index on public.payment_allocations(invoice_id);
create index on public.credit_applications(invoice_id);
create index on public.projects(company_id);
create index on public.agreements(company_id);
create index on public.proposals(company_id);
create index on public.outbox_jobs(state,available_at);
create index on public.invoice_items(invoice_id);
create index on public.notification_events(invoice_id);
create index on public.delivery_attempts(invoice_id);

create function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.admin_members where user_id=auth.uid() and active) $$;
create function private.assert_admin() returns void language plpgsql security definer set search_path='' as $$begin if not private.is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if; end$$;
create function private.balance(p_id uuid) returns bigint language sql stable set search_path='' as $$
select case when i.state='issued' then i.total-coalesce((select sum(a.amount) from public.payment_allocations a join public.payments p on p.id=a.payment_id where a.invoice_id=i.id and p.state='confirmed'),0)-coalesce((select sum(c.amount) from public.credit_applications c where c.invoice_id=i.id),0) else 0 end::bigint from public.invoices i where i.id=p_id $$;
create view public.invoice_balances with (security_invoker=true) as select i.*, private.balance(i.id) as outstanding from public.invoices i;
create function private.next_number(p_company uuid,p_kind text) returns text language plpgsql set search_path='' as $$declare n integer; fmt text; y integer:=extract(year from now() at time zone 'Asia/Colombo'); c text;begin
insert into public.document_counters(company_id,year,kind,value) values(p_company,y,p_kind,1) on conflict(company_id,year,kind) do update set value=public.document_counters.value+1 returning value into n;
select replace(code,'-','') into c from public.companies where id=p_company;
select coalesce(data->>'number_format','{type}-{company}-{year}-{sequence}') into fmt from public.settings where id='business';
if fmt not like '%{type}%' or fmt not like '%{company}%' or fmt not like '%{year}%' or fmt not like '%{sequence}%' then raise exception 'Number format must include type, company, year and sequence';end if;
return replace(replace(replace(replace(fmt,'{type}',p_kind),'{company}',c),'{year}',y::text),'{sequence}',lpad(n::text,greatest(5,length(n::text)),'0'));end$$;
create function private.set_items(p_id uuid,p_items jsonb) returns void language plpgsql set search_path='' as $$declare row jsonb; pos integer:=0;begin
if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 300 then raise exception 'Provide 1 to 300 invoice rows';end if;
delete from public.invoice_items where invoice_id=p_id;
for row in select value from jsonb_array_elements(p_items) loop
insert into public.invoice_items(invoice_id,position,description,quantity,rate,amount) values(p_id,pos,row->>'description',(row->>'quantity')::numeric,(row->>'rate')::bigint,round((row->>'quantity')::numeric*(row->>'rate')::bigint));pos:=pos+1;
end loop;
update public.invoices set subtotal=(select sum(amount) from public.invoice_items where invoice_id=p_id) where id=p_id;
if exists(select 1 from public.invoices where id=p_id and discount>subtotal) then raise exception 'Discount exceeds subtotal';end if;
update public.invoices set tax=round((subtotal-discount)::numeric*tax_bps/10000),total=subtotal-discount+round((subtotal-discount)::numeric*tax_bps/10000) where id=p_id;
end$$;


-- 20261013140753_transactions.sql
-- Public RPCs are the only write surface. Definer privilege is needed because
-- authenticated users intentionally have SELECT-only table grants.
create function public.save_record(p_kind text,p_id uuid,p_data jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid:=coalesce(p_id,gen_random_uuid()); c public.companies; i public.invoices; owner_id uuid;begin
perform private.assert_admin();
if p_kind='company' then
if p_id is null then insert into public.companies(id,name,email,address,contact,currency,terms_days) values(result,p_data->>'name',coalesce(p_data->>'email',''),coalesce(p_data->>'address',''),coalesce(p_data->>'contact',''),p_data->>'currency',(p_data->>'terms_days')::int);
else update public.companies set name=p_data->>'name',email=coalesce(p_data->>'email',''),address=coalesce(p_data->>'address',''),contact=coalesce(p_data->>'contact',''),terms_days=(p_data->>'terms_days')::int,archived=coalesce((p_data->>'archived')::boolean,false) where id=result;end if;
elsif p_kind='settings' then update public.settings set data=p_data,updated_at=now() where id='business';
elsif p_kind='service' then
insert into public.service_catalogue(id,name,description,rate,currency,archived) values(result,p_data->>'name',coalesce(p_data->>'description',''),(p_data->>'rate')::bigint,p_data->>'currency',coalesce((p_data->>'archived')::boolean,false)) on conflict(id) do update set name=excluded.name,description=excluded.description,rate=excluded.rate,archived=excluded.archived;
else
owner_id:=(p_data->>'company_id')::uuid;
select * into strict c from public.companies where id=owner_id for update;
if c.archived and p_kind<>'payment' then raise exception 'Company is archived';end if;
if p_data->>'currency' not in ('LKR','USD','EUR','GBP','AUD','INR') then raise exception 'Unsupported currency';end if;
if nullif(p_data->>'project_id','') is not null and not exists(select 1 from public.projects where id=(p_data->>'project_id')::uuid and company_id=c.id and currency=p_data->>'currency') then raise exception 'Project does not match company/currency';end if;
if p_kind='project' then
insert into public.projects(id,company_id,name,scope,currency,price,advance,state) values(result,c.id,p_data->>'name',coalesce(p_data->>'scope',''),p_data->>'currency',(p_data->>'price')::bigint,(p_data->>'advance')::bigint,coalesce(p_data->>'state','active')) on conflict(id) do update set name=excluded.name,scope=excluded.scope,state=excluded.state;
elsif p_kind='agreement' then
if p_id is not null and not exists(select 1 from public.agreements where id=p_id and company_id=c.id) then raise exception 'Agreement mismatch';end if;
insert into public.agreements(id,company_id,project_id,name,currency,billing_day,starts_on,ends_on,active) values(result,c.id,nullif(p_data->>'project_id','')::uuid,p_data->>'name',p_data->>'currency',(p_data->>'billing_day')::int,(p_data->>'starts_on')::date,nullif(p_data->>'ends_on','')::date,coalesce((p_data->>'active')::boolean,true)) on conflict(id) do update set name=excluded.name,billing_day=excluded.billing_day,ends_on=excluded.ends_on,active=excluded.active;
if p_data ? 'items' then
if (p_data->>'effective_from')::date < date_trunc('month',current_date)::date and p_id is not null then raise exception 'Future service edits cannot alter historic periods';end if;
if exists(select 1 from public.agreement_services where agreement_id=result and effective_from>(p_data->>'effective_from')::date) then raise exception 'Edit the latest service version or choose a later period';end if;
update public.agreement_services set effective_until=(p_data->>'effective_from')::date where agreement_id=result and effective_from<(p_data->>'effective_from')::date and effective_until is null;
insert into public.agreement_services(agreement_id,effective_from,items) values(result,(p_data->>'effective_from')::date,p_data->'items') on conflict(agreement_id,effective_from) do update set items=excluded.items;
end if;
elsif p_kind='invoice' then
if p_id is not null then select * into strict i from public.invoices where id=p_id for update;if i.state<>'draft' or i.company_id<>c.id then raise exception 'Only matching drafts can be edited';end if;end if;
insert into public.invoices(id,company_id,project_id,currency,kind,period,due_date,discount,tax_bps,notes) values(result,c.id,nullif(p_data->>'project_id','')::uuid,p_data->>'currency',p_data->>'kind',nullif(p_data->>'period','')::date,(p_data->>'due_date')::date,coalesce((p_data->>'discount')::bigint,0),coalesce((p_data->>'tax_bps')::int,0),coalesce(p_data->>'notes','')) on conflict(id) do update set due_date=excluded.due_date,discount=excluded.discount,tax_bps=excluded.tax_bps,notes=excluded.notes,currency=case when public.invoices.agreement_id is null then excluded.currency else public.invoices.currency end,kind=case when public.invoices.agreement_id is null then excluded.kind else public.invoices.kind end,project_id=excluded.project_id,period=case when public.invoices.agreement_id is null then excluded.period else public.invoices.period end;
perform private.set_items(result,p_data->'items');
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

create function public.issue_invoice(p_id uuid,p_brand jsonb) returns jsonb language plpgsql security definer set search_path='' as $$declare i public.invoices;c public.companies;s jsonb; refs jsonb;begin
perform private.assert_admin();select company_id into strict i.company_id from public.invoices where id=p_id;select * into strict c from public.companies where id=i.company_id for update;
select * into strict i from public.invoices where id=p_id for update;if i.state<>'draft' then return to_jsonb(i);end if;
if c.archived or i.total<=0 then raise exception 'Cannot issue an empty invoice or archived company';end if;
if i.project_id is not null and not exists(select 1 from public.projects where id=i.project_id and company_id=i.company_id and currency=i.currency) then raise exception 'Project currency mismatch';end if;
if i.project_id is not null and (select coalesce(sum(total),0) from public.invoices where project_id=i.project_id and state='issued')+i.total > (select price from public.projects where id=i.project_id) then raise exception 'Project charges exceed agreed price';end if;
insert into public.invoice_balance_references(invoice_id,earlier_invoice_id,number,amount) select i.id,x.id,x.number,private.balance(x.id) from public.invoices x where x.company_id=i.company_id and x.currency=i.currency and x.state='issued' and private.balance(x.id)>0;
select coalesce(jsonb_agg(to_jsonb(r)),'[]') into refs from public.invoice_balance_references r where invoice_id=i.id;
select data into s from public.settings where id='business';
update public.invoices set state='issued',number=private.next_number(i.company_id,'INV'),issued_at=now() where id=i.id returning * into i;
update public.invoices set snapshot=jsonb_build_object('kind','invoice','invoice',to_jsonb(i)-'snapshot','company',to_jsonb(c),'business',s,'brand',p_brand,'items',(select jsonb_agg(to_jsonb(x) order by position) from public.invoice_items x where invoice_id=i.id),'references',refs,'template_version','v1') where id=i.id returning * into i;
insert into public.document_files(record_id,kind,brand_version) values(i.id,'invoice',p_brand->>'version');
insert into public.audit_logs(action,record_id) values('issue_invoice',i.id);return to_jsonb(i);end$$;

create function private.allocate(p_payment uuid,p_allocations jsonb) returns void language plpgsql set search_path='' as $$declare p public.payments; x jsonb; i public.invoices; a bigint; remaining bigint;begin
select * into strict p from public.payments where id=p_payment for update;
if p.state<>'confirmed' then raise exception 'Payment must be confirmed';end if;
select p.amount-coalesce(sum(amount),0) into remaining from public.payment_allocations where payment_id=p.id;
for x in select value from jsonb_array_elements(p_allocations) loop
a:=(x->>'amount')::bigint;if a<=0 then raise exception 'Allocation must be positive';end if;
select * into strict i from public.invoices where id=(x->>'invoice_id')::uuid for update;
if i.company_id<>p.company_id or i.currency<>p.currency or i.state<>'issued' then raise exception 'Company, currency or invoice state mismatch';end if;
if a>remaining or a>private.balance(i.id) then raise exception 'Allocation exceeds available payment or outstanding balance';end if;
insert into public.payment_allocations(payment_id,invoice_id,amount) values(p.id,i.id,a) on conflict(payment_id,invoice_id) do update set amount=public.payment_allocations.amount+excluded.amount;remaining:=remaining-a;
end loop;end$$;
create function public.confirm_payment(p_id uuid,p_allocations jsonb,p_brand jsonb) returns jsonb language plpgsql security definer set search_path='' as $$declare p public.payments;c public.companies;begin
perform private.assert_admin();select company_id into strict p.company_id from public.payments where id=p_id;select * into strict c from public.companies where id=p.company_id for update;
select * into strict p from public.payments where id=p_id for update;
if p.state='confirmed' then return to_jsonb(p);end if;if p.state<>'pending' then raise exception 'Reversed payment cannot be confirmed';end if;
update public.payments set state='confirmed',confirmed_at=now(),receipt_number=private.next_number(company_id,'REC') where id=p_id returning * into p;
perform private.allocate(p.id,p_allocations);
update public.payments set snapshot=jsonb_build_object('kind','receipt','payment',to_jsonb(p)-'snapshot','company',to_jsonb(c),'business',(select data from public.settings where id='business'),'brand',p_brand,'allocations',coalesce((select jsonb_agg(jsonb_build_object('number',i.number,'amount',a.amount,'outstanding',private.balance(i.id))) from public.payment_allocations a join public.invoices i on i.id=a.invoice_id where a.payment_id=p.id),'[]'),'unallocated',p.amount-coalesce((select sum(amount) from public.payment_allocations where payment_id=p.id),0)) where id=p_id returning * into p;
insert into public.document_files(record_id,kind,brand_version) values(p.id,'receipt',p_brand->>'version');insert into public.audit_logs(action,record_id) values('confirm_payment',p.id);return to_jsonb(p);end$$;
create function public.allocate_credit(p_id uuid,p_allocations jsonb,p_key uuid) returns void language plpgsql security definer set search_path='' as $$declare c uuid;begin
perform private.assert_admin();select company_id into strict c from public.payments where id=p_id;perform 1 from public.companies where id=c for update;
if exists(select 1 from public.audit_logs where action='allocate_credit' and record_id=p_key) then return;end if;
perform private.allocate(p_id,p_allocations);insert into public.audit_logs(action,record_id,detail) values('allocate_credit',p_key,jsonb_build_object('payment_id',p_id));end$$;
create function public.reverse_payment(p_id uuid,p_reason text) returns void language plpgsql security definer set search_path='' as $$declare c uuid;begin
perform private.assert_admin();select company_id into strict c from public.payments where id=p_id;perform 1 from public.companies where id=c for update;
if exists(select 1 from public.payment_reversals where payment_id=p_id) then return;end if;
if not exists(select 1 from public.payments where id=p_id and state='confirmed') then raise exception 'Only confirmed payments can be reversed';end if;
insert into public.payment_reversals(payment_id,reason) values(p_id,p_reason);update public.payments set state='reversed' where id=p_id;
insert into public.audit_logs(action,record_id,detail) values('reverse_payment',p_id,jsonb_build_object('reason',p_reason));end$$;
create function public.apply_credit(p_invoice uuid,p_amount bigint,p_reason text,p_key uuid) returns uuid language plpgsql security definer set search_path='' as $$declare i public.invoices;begin
perform private.assert_admin();select * into strict i from public.invoices where id=p_invoice;perform 1 from public.companies where id=i.company_id for update;
if exists(select 1 from public.credit_notes where id=p_key) then return p_key;end if;
if i.state<>'issued' or p_amount<=0 or p_amount>private.balance(i.id) then raise exception 'Invalid correction amount';end if;
insert into public.credit_notes(id,company_id,currency,amount,reason) values(p_key,i.company_id,i.currency,p_amount,p_reason);
insert into public.credit_note_allocations(credit_note_id,invoice_id,amount) values(p_key,i.id,p_amount);
insert into public.credit_applications(credit_note_id,invoice_id,amount) values(p_key,i.id,p_amount);
insert into public.audit_logs(action,record_id) values('apply_credit',p_key);return p_key;end$$;
create function public.void_invoice(p_id uuid,p_reason text) returns void language plpgsql security definer set search_path='' as $$declare i public.invoices;begin
perform private.assert_admin();select * into strict i from public.invoices where id=p_id;perform 1 from public.companies where id=i.company_id for update;
if length(p_reason)<5 then raise exception 'A reason is required';end if;
if exists(select 1 from public.payment_allocations where invoice_id=p_id) or exists(select 1 from public.credit_applications where invoice_id=p_id) then raise exception 'Allocated invoices require a credit correction';end if;
if i.state<>'issued' then raise exception 'Only issued invoices can be voided';end if;
update public.invoices set state='void' where id=p_id;insert into public.audit_logs(action,record_id,detail) values('void_invoice',p_id,jsonb_build_object('reason',p_reason));end$$;

create function private.monthly_draft(p_agreement uuid,p_period date) returns uuid language plpgsql set search_path='' as $$declare a public.agreements; c public.companies; result uuid;rows jsonb;begin
select * into strict a from public.agreements where id=p_agreement;select * into strict c from public.companies where id=a.company_id for update;
if c.archived or not a.active or p_period<>date_trunc('month',p_period)::date or p_period<date_trunc('month',a.starts_on)::date or (a.ends_on is not null and p_period> a.ends_on) then raise exception 'Agreement is not billable for this period';end if;
select id into result from public.invoices where agreement_id=a.id and period=p_period;if result is not null then return result;end if;
select items into rows from public.agreement_services where agreement_id=a.id and effective_from<=p_period and (effective_until is null or effective_until>p_period) order by effective_from desc limit 1;if rows is null then raise exception 'No effective service version';end if;
insert into public.invoices(company_id,project_id,agreement_id,currency,kind,period,due_date) values(c.id,a.project_id,a.id,a.currency,'recurring',p_period,p_period+(a.billing_day-1)+c.terms_days) returning id into result;
perform private.set_items(result,rows);return result;end$$;
create function public.generate_monthly_draft(p_agreement uuid,p_period date) returns uuid language plpgsql security definer set search_path='' as $$begin perform private.assert_admin();return private.monthly_draft(p_agreement,p_period);end$$;
create function public.issue_proposal(p_id uuid,p_brand jsonb) returns jsonb language plpgsql security definer set search_path='' as $$declare p public.proposals;c public.companies;begin
perform private.assert_admin();select company_id into strict p.company_id from public.proposals where id=p_id;select * into strict c from public.companies where id=p.company_id for update;select * into strict p from public.proposals where id=p_id for update;
if p.state<>'draft' then return to_jsonb(p);end if;
update public.proposals set state='issued',number=private.next_number(company_id,'PRO') where id=p_id returning * into p;
update public.proposals set snapshot=jsonb_build_object('kind','proposal','proposal',to_jsonb(p)-'snapshot','company',to_jsonb(c),'business',(select data from public.settings where id='business'),'brand',p_brand) where id=p_id returning * into p;
insert into public.document_files(record_id,kind,version,brand_version) values(p.id,'proposal',p.version,p_brand->>'version');insert into public.audit_logs(action,record_id) values('issue_proposal',p.id);return to_jsonb(p);end$$;
create function public.accept_proposal(p_id uuid) returns void language plpgsql security definer set search_path='' as $$begin perform private.assert_admin();update public.proposals set state='accepted' where id=p_id and state='issued';insert into public.audit_logs(action,record_id) values('accept_proposal',p_id);end$$;
create function public.mark_external(p_id uuid,p_channel text) returns void language plpgsql security definer set search_path='' as $$begin
perform private.assert_admin();if p_channel not in ('WhatsApp','email','other') then raise exception 'Invalid channel';end if;
if not exists(select 1 from public.invoices where id=p_id and state='issued') then raise exception 'Issue invoice first';end if;
insert into public.delivery_attempts(invoice_id,recipient,channel,state,idempotency_key) select p_id,c.email,p_channel,'external','external:'||p_id from public.invoices i join public.companies c on c.id=i.company_id where i.id=p_id on conflict(idempotency_key) do nothing;
update public.invoices set first_sent_on=coalesce(first_sent_on,(now() at time zone 'Asia/Colombo')::date) where id=p_id;
insert into public.audit_logs(action,record_id) values('mark_external',p_id);end$$;
create function public.pause_reminders(p_id uuid,p_pause boolean) returns void language plpgsql security definer set search_path='' as $$begin perform private.assert_admin();update public.invoices set reminders_paused=p_pause where id=p_id;end$$;


-- 20261013140754_jobs_and_security.sql
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


-- 20261022112205_expenses_and_recurring_schedules.sql
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

do $$
declare admin_id uuid;
begin
  select id into strict admin_id from auth.users where lower(email) = 'replace-with-your-admin@example.com';
  insert into public.admin_members(user_id, active) values (admin_id, true)
  on conflict (user_id) do update set active = true;
exception when no_data_found then
  raise exception 'The designated account must exist in Authentication > Users first.';
end $$;

notify pgrst, 'reload schema';
commit;
select u.email, m.active
from public.admin_members m join auth.users u on u.id = m.user_id
where lower(u.email) = 'replace-with-your-admin@example.com';
