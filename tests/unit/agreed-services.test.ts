import { expect, it } from "vitest";
import {
  agreedServiceLines,
  type AgreedService,
} from "@/lib/billing/agreed-services";
import { totals } from "@/lib/billing/totals";
const items: AgreedService[] = [
  {
    id: "monthly",
    name: "Monthly",
    billing_type: "monthly",
    quantity: "2",
    rate: 1000,
    discount: 200,
  },
  {
    id: "setup",
    name: "Setup",
    billing_type: "one-time",
    quantity: "1",
    rate: 1200,
    discount: 0,
  },
];
it("applies a line discount once and repeats only the monthly share of a full-service discount", () => {
  const first = agreedServiceLines(items, 300);
  expect(totals(first).total).toBe(2700);
  expect(first.map((item) => item.discount)).toEqual([380, 120]);
  expect(totals(agreedServiceLines(items, 300, ["setup"])).total).toBe(1620);
});
it("allocates rounding remainders exactly, including fractional quantities", () => {
  const rows = agreedServiceLines(
    [1, 2, 3].map((n) => ({
      ...items[0],
      id: String(n),
      quantity: "0.333",
      rate: 100,
      discount: 0,
    })),
    10,
  );
  expect(rows.reduce((sum, row) => sum + (row.discount || 0), 0)).toBe(10);
  expect(totals(rows).total).toBe(89);
});
it("rejects over-discounting and unsafe totals", () => {
  expect(() => agreedServiceLines(items, 3001)).toThrow();
  expect(() => agreedServiceLines([{ ...items[0], discount: 2001 }])).toThrow();
  expect(() => agreedServiceLines([{ ...items[0], rate: 1e12 }])).toThrow();
});

it("rounds percentage discounts on whole lines and recomputes them when rates change", () => {
  const item: AgreedService = {
    ...items[0],
    quantity: "3",
    rate: 101,
    discount_type: "percentage",
    discount_value: 1250,
  };
  expect(agreedServiceLines([item])[0].discount).toBe(38);
  expect(agreedServiceLines([{ ...item, quantity: "6" }])[0].discount).toBe(76);
  expect(() =>
    agreedServiceLines([{ ...item, discount_value: 10001 }]),
  ).toThrow();
});
