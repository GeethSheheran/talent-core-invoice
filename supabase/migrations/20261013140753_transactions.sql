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
