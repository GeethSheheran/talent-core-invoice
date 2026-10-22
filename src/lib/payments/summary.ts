import type { Tables } from "@/lib/db/database.types";
export type PaymentSummary = {
  state: string;
  label: string;
  count: number;
  amounts: string[];
};
export function summarizePayments(
  rows: Pick<Tables<"payments">, "state" | "amount" | "currency">[],
): PaymentSummary[] {
  return [
    ["all", "All payments"],
    ["confirmed", "Confirmed"],
    ["pending", "Awaiting confirmation"],
    ["reversed", "Reversed"],
  ].map(([state, label]) => {
    const selected = rows.filter(
      (row) => state === "all" || row.state === state,
    );
    const sums = new Map<string, bigint>();
    for (const row of selected)
      sums.set(
        row.currency,
        (sums.get(row.currency) || 0n) + BigInt(row.amount),
      );
    return {
      state,
      label,
      count: selected.length,
      amounts: [...sums]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(
          ([currency, amount]) =>
            `${currency} ${(amount / 100n).toLocaleString("en-LK")}.${(amount % 100n).toString().padStart(2, "0")}`,
        ),
    };
  });
}
