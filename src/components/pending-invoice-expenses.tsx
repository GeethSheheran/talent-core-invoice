"use client";
import { useActionState } from "react";
import { financialAction } from "@/app/(admin)/actions";
import { formatMoney } from "@/lib/billing/money";
export type PendingInvoiceExpense = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  incurred_on: string;
};
export function PendingInvoiceExpenses({
  invoiceId,
  expenses,
  onAttached,
}: {
  invoiceId: string;
  expenses: PendingInvoiceExpense[];
  onAttached: () => Promise<void>;
}) {
  const [message, submit, pending] = useActionState(
    async (previous: string, form: FormData) => {
      const result = await financialAction(previous, form);
      if (result === "Saved successfully.") await onAttached();
      return result;
    },
    "",
  );
  if (!expenses.length) return null;
  return (
    <section
      className="notice pending-expenses"
      aria-label="Pending invoice expenses"
    >
      <h3>
        {expenses.length} pending{" "}
        {expenses.length === 1 ? "expense" : "expenses"} available
      </h3>
      <p>
        These expenses match this company and currency and are not included in
        this draft yet.
      </p>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            {expense.description} ·{" "}
            <strong>{formatMoney(expense.amount, expense.currency)}</strong>
          </li>
        ))}
      </ul>
      <form action={submit}>
        <input type="hidden" name="action" value="attach_pending_expenses" />
        <input type="hidden" name="id" value={invoiceId} />
        <input
          type="hidden"
          name="expenses"
          value={JSON.stringify(
            expenses.map(({ id, amount }) => ({ id, amount })),
          )}
        />
        <button disabled={pending}>
          {pending ? "Adding expenses…" : "Add these expenses to invoice"}
        </button>
      </form>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
