import { expect, it } from "vitest";
import { summarizePayments } from "../../src/lib/payments/summary";
it("keeps currencies and payment states separate", () => {
  const result = summarizePayments([
    { amount: 5000, currency: "LKR", state: "confirmed" },
    { amount: 10000, currency: "USD", state: "confirmed" },
    { amount: 2000, currency: "LKR", state: "pending" },
    { amount: 1000, currency: "LKR", state: "reversed" },
  ]);
  expect(result[0].count).toBe(4);
  expect(result[1].amounts).toEqual(["LKR 50.00", "USD 100.00"]);
  expect(result[2].amounts).toEqual(["LKR 20.00"]);
  expect(result[3].amounts).toEqual(["LKR 10.00"]);
});
it("aggregates exact minor units even beyond JavaScript safe totals", () => {
  const result = summarizePayments(
    Array.from({ length: 10000 }, () => ({
      amount: 1000000000000,
      currency: "LKR",
      state: "confirmed",
    })),
  );
  expect(result[1].amounts).toEqual(["LKR 100,000,000,000,000.00"]);
});
it("provides zero counts without inventing a currency for empty data", () => {
  expect(
    summarizePayments([]).every(
      (summary) => summary.count === 0 && summary.amounts.length === 0,
    ),
  ).toBe(true);
});
