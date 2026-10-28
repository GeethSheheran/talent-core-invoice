-- Explicitly attach reviewed expenses to an existing draft. Authenticated users
-- have SELECT-only grants; definer rights are constrained by assert_admin.
create function public.attach_pending_expenses(p_invoice uuid, p_expenses jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  inv public.invoices;
  expense public.company_expenses;
  requested jsonb;
  owner_id uuid;
  requested_ids uuid[];
  next_position integer;
  attached integer := 0;
begin
  perform private.assert_admin();
  if p_expenses is null or jsonb_typeof(p_expenses) <> 'array' then
    raise exception 'Select pending expenses to attach';
  end if;
  if jsonb_array_length(p_expenses) not between 1 and 300 then
    raise exception 'Select 1 to 300 pending expenses';
  end if;
  select array_agg((value->>'id')::uuid) into requested_ids from jsonb_array_elements(p_expenses);
  if exists(select 1 from unnest(requested_ids) id where id is null)
     or cardinality(requested_ids) <> (select count(distinct id) from unnest(requested_ids) id) then
    raise exception 'Expense IDs must be unique and non-null';
  end if;
  -- Same lock order as save_record and issue_invoice: company, then invoice.
  select company_id into strict owner_id from public.invoices where id = p_invoice;
  perform 1 from public.companies where id = owner_id for update;
  select * into strict inv from public.invoices where id = p_invoice for update;
  if inv.state <> 'draft' then raise exception 'Only draft invoices can receive expenses'; end if;
  if exists(select 1 from public.companies where id = owner_id and archived) then
    raise exception 'Company is archived';
  end if;
  if (select count(*) from public.company_expenses where id = any(requested_ids)) <> cardinality(requested_ids) then
    raise exception 'An expense no longer exists. Reload the invoice';
  end if;
  select coalesce(max(position), -1) + 1 into next_position from public.invoice_items where invoice_id = p_invoice;
  for expense in select * from public.company_expenses where id = any(requested_ids) order by id for update loop
    select value into requested from jsonb_array_elements(p_expenses) where (value->>'id')::uuid = expense.id;
    if expense.company_id <> inv.company_id or expense.currency <> inv.currency then
      raise exception 'Expense company/currency mismatch';
    end if;
    if expense.incurred_on > (now() at time zone 'Asia/Colombo')::date then
      raise exception 'Future expenses cannot be attached yet';
    end if;
    if (requested->>'amount')::bigint is distinct from expense.amount then
      raise exception 'An expense amount changed. Reload the invoice before attaching';
    end if;
    if expense.invoice_id = p_invoice then continue; end if;
    if expense.invoice_id is not null then
      raise exception 'An expense was attached to another invoice. Reload the invoice';
    end if;
    update public.company_expenses set invoice_id = p_invoice where id = expense.id;
    insert into public.invoice_items(invoice_id, position, description, quantity, rate, amount, expense_id)
      values(p_invoice, next_position, expense.description, 1, expense.amount, expense.amount, expense.id);
    next_position := next_position + 1;
    attached := attached + 1;
  end loop;
  if (select count(*) from public.invoice_items where invoice_id = p_invoice) > 300 then
    raise exception 'An invoice may contain at most 300 rows';
  end if;
  if attached > 0 then
    update public.invoices set subtotal = (select sum(amount) from public.invoice_items where invoice_id = p_invoice) where id = p_invoice;
    if exists(select 1 from public.invoices where id = p_invoice and discount > subtotal) then
      raise exception 'Discount exceeds subtotal';
    end if;
    update public.invoices set tax = round((subtotal - discount)::numeric * tax_bps / 10000),
      total = subtotal - discount + round((subtotal - discount)::numeric * tax_bps / 10000)
      where id = p_invoice;
    insert into public.audit_logs(action, record_id, detail)
      values('attach_pending_expenses', p_invoice, jsonb_build_object('expense_ids', requested_ids, 'attached', attached));
  end if;
  return attached;
end $$;
revoke all on function public.attach_pending_expenses(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.attach_pending_expenses(uuid, jsonb) to authenticated;
notify pgrst, 'reload schema';
