import Decimal from "decimal.js";
import type { Line } from "./totals";
export type AgreedService = {
  id?: string;
  ui_key?: string;
  service_id?: string;
  name: string;
  description?: string;
  billing_type: "one-time" | "monthly";
  quantity: string;
  rate: number;
  discount?: number;
  discount_type?: "amount" | "percentage";
  discount_value?: number;
};
export function discountAmount(
  base: number,
  type: "amount" | "percentage",
  value: number,
) {
  if (
    !Number.isSafeInteger(value) ||
    value < 0 ||
    value > 1e12 ||
    (type === "percentage" && value > 10000)
  )
    throw new Error(
      "Percentage must be between 0 and 100, with at most two decimals.",
    );
  const amount =
    type === "percentage"
      ? new Decimal(base)
          .mul(value)
          .div(10000)
          .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
          .toNumber()
      : value;
  if (amount > base) throw new Error("Discount exceeds service amount");
  return amount;
}
export function serviceDiscount(item: AgreedService) {
  const gross = new Decimal(item.quantity)
    .mul(item.rate)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber();
  return discountAmount(
    gross,
    item.discount_type || "amount",
    item.discount_value ?? item.discount ?? 0,
  );
}
export function agreedServiceLines(
  items: AgreedService[],
  discount = 0,
  billed: string[] = [],
): Line[] {
  const nets = items.map((item) => {
    const gross = new Decimal(item.quantity)
      .mul(item.rate)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
    const net = gross.minus(serviceDiscount(item));
    if (net.isNegative() || serviceDiscount(item) < 0 || gross.gt(1e12))
      throw new Error("Service discount exceeds its amount");
    return net;
  });
  const total = nets.reduce((sum, n) => sum.plus(n), new Decimal(0));
  if (discount < 0 || total.lt(discount) || total.gt(1e12))
    throw new Error("Invalid full-service discount or total");
  let running = new Decimal(0);
  let previousShare = 0;
  return items.flatMap((item, i) => {
    running = running.plus(nets[i]);
    const cumulative = total.isZero()
      ? 0
      : running
          .mul(discount)
          .div(total)
          .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
          .toNumber();
    const share = cumulative - previousShare;
    previousShare = cumulative;
    if (item.billing_type === "one-time" && item.id && billed.includes(item.id))
      return [];
    return [
      {
        description:
          item.name + (item.description ? " - " + item.description : ""),
        quantity: item.quantity,
        rate: item.rate,
        discount: serviceDiscount(item) + share,
        service_item_id: item.id,
        billing_type: item.billing_type,
      },
    ];
  });
}
