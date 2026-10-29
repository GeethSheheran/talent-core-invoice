-- Keep existing payment methods and allow cheques through the same audited RPCs.
alter table public.payments drop constraint payments_method_check;
alter table public.payments add constraint payments_method_check
  check (method in ('bank', 'cash', 'cheque', 'other'));
