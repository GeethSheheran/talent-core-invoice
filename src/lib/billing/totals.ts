import Decimal from "decimal.js";
export type Line = {
  description: string;
  quantity: string;
  rate: number;
  expense_id?: string | null;
};
export function totals(items: Line[], discount = 0, taxBps = 0) {
  const subtotal = items.reduce(
    (sum, i) =>
      sum +
      new Decimal(i.quantity)
        .mul(i.rate)
        .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
        .toNumber(),
    0,
  );
  if (discount < 0 || discount > subtotal || taxBps < 0 || taxBps > 10000)
    throw new Error("Invalid discount or tax");
  const tax = new Decimal(subtotal - discount)
    .mul(taxBps)
    .div(10000)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber();
  const total = subtotal - discount + tax;
  if (!Number.isSafeInteger(total) || total > 1e12)
    throw new Error("Total exceeds limit");
  return { subtotal, discount, tax, total };
}
export function amountRequested(
  newCharge: number,
  earlier: { amount: number }[],
) {
  return newCharge + earlier.reduce((s, r) => s + r.amount, 0);
}
