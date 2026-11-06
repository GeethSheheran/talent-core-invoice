import { expect, it } from "vitest";
import {
  dashboardMoney,
  receivables,
  type OverviewInvoice,
} from "@/lib/dashboard/overview";
it("abbreviates only million-level major-unit values", () => {
  expect(dashboardMoney(100_000_000, "LKR")).toBe("LKR 1M");
  expect(dashboardMoney(125_000_000, "LKR")).toBe("LKR 1.25M");
  expect(dashboardMoney(99_999_999, "LKR")).not.toContain("M");
  expect(dashboardMoney(-250_000_000, "USD")).toBe("USD -2.5M");
});
it("buckets only live unpaid balances, keeps currencies separate and includes today in upcoming", () => {
  const row: OverviewInvoice = {
    id: "a",
    company_id: "c",
    number: "INV",
    state: "issued",
    currency: "LKR",
    total: 10000,
    outstanding: 5000,
    due_date: "2026-11-05",
  };
  const result = receivables(
    [
      row,
      { ...row, id: "b", due_date: "2026-10-06" },
      { ...row, id: "c", due_date: "2026-10-05" },
      { ...row, id: "d", due_date: "2026-09-05" },
      { ...row, id: "e", due_date: "2026-11-12" },
      { ...row, id: "f", due_date: "2026-11-13" },
      { ...row, state: "draft" },
      { ...row, state: "void" },
      { ...row, currency: "USD" },
      { ...row, outstanding: 0 },
    ],
    "2026-11-05",
    "LKR",
  );
  expect(result.bands.map((b) => b.amount)).toEqual([15000, 5000, 5000, 5000]);
  expect(result.dueSoon.map((i) => i.id)).toEqual(["a", "e"]);
  expect(result.overdue.map((i) => i.id)).toEqual(["d", "c", "b"]);
});
