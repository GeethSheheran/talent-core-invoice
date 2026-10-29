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
export function calculateCompanyCredit(
  payments: {
    id: string;
    amount: number;
    company_id: string;
    currency: string;
    state: string;
  }[],
  allocations: { payment_id: string; amount: number }[],
  companyId: string,
  currency?: string,
) {
  return payments
    .filter(
      (p) =>
        p.company_id === companyId &&
        p.state === "confirmed" &&
        (!currency || p.currency === currency),
    )
    .reduce((total, p) => {
      const allocated = allocations
        .filter((a) => a.payment_id === p.id)
        .reduce((sum, a) => sum + a.amount, 0);
      return total + Math.max(0, p.amount - allocated);
    }, 0);
}
