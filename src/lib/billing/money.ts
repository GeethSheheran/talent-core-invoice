import Decimal from "decimal.js";
export const currencies = ["LKR", "USD", "EUR", "GBP", "AUD", "INR"] as const;
export function minor(value: string): number {
  const d = new Decimal(value).mul(100);
  if (!d.isInteger() || d.abs().gt(1_000_000_000_000))
    throw new Error(
      "Use at most two decimal places and an amount below 10 billion.",
    );
  return d.toNumber();
}
export function formatMoney(amount: number, currency = "LKR") {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency }).format(
    amount / 100,
  );
}
export function major(amount: number) {
  return new Decimal(amount).div(100).toFixed(2);
}
