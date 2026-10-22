export type Balance = {
  id: string;
  company_id: string;
  currency: string;
  outstanding: number;
  due_date: string;
};
export function allocationPreview(
  amount: number,
  invoices: Balance[],
  company: string,
  currency: string,
) {
  let remaining = amount;
  return [...invoices]
    .filter(
      (i) =>
        i.company_id === company &&
        i.currency === currency &&
        i.outstanding > 0,
    )
    .sort(
      (a, b) =>
        a.due_date.localeCompare(b.due_date) || a.id.localeCompare(b.id),
    )
    .flatMap((i) => {
      const used = Math.min(remaining, i.outstanding);
      remaining -= used;
      return used > 0 ? [{ invoice_id: i.id, amount: used }] : [];
    });
}
