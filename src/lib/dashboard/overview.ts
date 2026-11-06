import { formatMoney } from "@/lib/billing/money";

// Values remain integer minor units; abbreviation is presentation only.
export function dashboardMoney(amount: number, currency: string) {
  if (Math.abs(amount) < 100_000_000) return formatMoney(amount, currency);
  return `${currency} ${new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(amount / 100_000_000)}M`;
}
export type OverviewInvoice = {
  id: string;
  company_id: string;
  number: string | null;
  state: string;
  currency: string;
  total: number;
  outstanding: number;
  due_date: string;
};
export function receivables(
  invoices: OverviewInvoice[],
  today: string,
  currency: string,
) {
  const open = invoices.filter(
    (i) => i.currency === currency && i.state === "issued" && i.outstanding > 0,
  );
  const days = (date: string) =>
    Math.floor(
      (Date.parse(today + "T00:00:00Z") - Date.parse(date + "T00:00:00Z")) /
        86400000,
    );
  const bands = [
    { label: "Not yet due", min: -Infinity, max: 0 },
    { label: "1–30 days overdue", min: 1, max: 30 },
    { label: "31–60 days overdue", min: 31, max: 60 },
    { label: "61+ days overdue", min: 61, max: Infinity },
  ].map((b) => ({
    ...b,
    amount: open
      .filter((i) => days(i.due_date) >= b.min && days(i.due_date) <= b.max)
      .reduce((s, i) => s + i.outstanding, 0),
  }));
  return {
    bands,
    overdue: open
      .filter((i) => days(i.due_date) > 0)
      .sort(
        (a, b) =>
          a.due_date.localeCompare(b.due_date) || b.outstanding - a.outstanding,
      ),
    dueSoon: open.filter(
      (i) => days(i.due_date) >= -7 && days(i.due_date) <= 0,
    ),
  };
}
