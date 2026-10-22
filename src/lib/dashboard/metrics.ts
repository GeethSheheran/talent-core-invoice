import { colomboDate } from "@/lib/utils/dates";
import { isOverdue } from "@/lib/billing/status";
export type MetricInvoice = {
  currency: string;
  state: string;
  total: number;
  outstanding: number;
  issued_at: string | null;
  due_date: string;
};
export type MetricPayment = {
  currency: string;
  state: string;
  amount: number;
  received_on: string;
};
export function metrics(
  invoices: MetricInvoice[],
  payments: MetricPayment[],
  month: string,
  today: string,
  currency: string,
) {
  const rows = invoices.filter(
    (i) => i.currency === currency && i.state === "issued",
  );
  return {
    issued: rows
      .filter(
        (i) =>
          i.issued_at &&
          colomboDate(new Date(i.issued_at)).slice(0, 7) === month,
      )
      .reduce((s, i) => s + i.total, 0),
    collected: payments
      .filter(
        (p) =>
          p.currency === currency &&
          p.state === "confirmed" &&
          p.received_on.slice(0, 7) === month,
      )
      .reduce((s, p) => s + p.amount, 0),
    outstanding: rows.reduce((s, i) => s + i.outstanding, 0),
    overdue: rows
      .filter((i) => isOverdue(i.state, i.outstanding, i.due_date, today))
      .reduce((s, i) => s + i.outstanding, 0),
    partial: rows.filter((i) => i.outstanding > 0 && i.outstanding < i.total)
      .length,
  };
}
