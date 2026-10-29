import Decimal from "decimal.js";
export type Line = {
  description: string;
  quantity: string;
  rate: number;
  discount?: number;
  service_item_id?: string;
  billing_type?: "monthly" | "one-time";
  expense_id?: string | null;
};
export function totals(items: Line[], discount = 0, taxBps = 0) {
  const subtotal = items.reduce((sum, i) => {
    const gross = new Decimal(i.quantity)
      .mul(i.rate)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber();
    if ((i.discount || 0) < 0 || (i.discount || 0) > gross)
      throw new Error("Invalid service discount");
    return sum + gross - (i.discount || 0);
  }, 0);
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
