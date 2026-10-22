import { describe, it, expect } from "vitest";
import { minor, major } from "../../src/lib/billing/money";
import { totals, amountRequested } from "../../src/lib/billing/totals";
import { remainingProjectCharge } from "../../src/lib/billing/advances";
import { allocationPreview } from "../../src/lib/billing/allocations";
import { dueReminders, reminderDates } from "../../src/lib/notifications/rules";
import { metrics } from "../../src/lib/dashboard/metrics";
import { proposalSchema } from "../../src/lib/validation/schemas";
describe("precise domain behavior", () => {
  it("converts decimals without floating point rounding drift", () => {
    expect(minor("0.29")).toBe(29);
    expect(major(29)).toBe("0.29");
    expect(() => minor("1.001")).toThrow();
    expect(
      totals([{ description: "Hourly", quantity: "1.125", rate: 999 }]),
    ).toEqual({ subtotal: 1124, discount: 0, tax: 0, total: 1124 });
  });
  it("rounds tax after discount and keeps references outside the receivable", () => {
    expect(
      totals(
        [{ description: "Service", quantity: "1", rate: 2000000 }],
        100000,
        1800,
      ).total,
    ).toBe(2242000);
    expect(amountRequested(2000000, [{ amount: 1000000 }])).toBe(3000000);
  });
  it("subtracts previously billed advances rather than payments from project total", () => {
    expect(remainingProjectCharge(12000000, 4800000)).toBe(7200000);
  });
  it("previews oldest eligible invoices only", () => {
    const rows = [
      {
        id: "b",
        company_id: "a",
        currency: "LKR",
        outstanding: 200,
        due_date: "2026-11-01",
      },
      {
        id: "a",
        company_id: "a",
        currency: "LKR",
        outstanding: 100,
        due_date: "2026-10-01",
      },
      {
        id: "c",
        company_id: "x",
        currency: "LKR",
        outstanding: 100,
        due_date: "2026-09-01",
      },
    ];
    expect(allocationPreview(250, rows, "a", "LKR")).toEqual([
      { invoice_id: "a", amount: 100 },
      { invoice_id: "b", amount: 150 },
    ]);
  });
  it("uses calendar days and catches up without resending existing events", () => {
    expect(reminderDates("2026-10-01", "2026-10-20", [3, 6])).toEqual([
      "2026-10-04",
      "2026-10-07",
    ]);
    const input = {
      sent: "2026-10-01",
      due: "2026-10-20",
      intervals: [3, 6],
      today: "2026-10-10",
      effectiveFrom: "2026-01-01",
      state: "issued",
      outstanding: 10,
      paused: false,
      existing: ["2026-10-04"],
    };
    expect(dueReminders(input)).toEqual(["2026-10-07"]);
    expect(dueReminders({ ...input, sent: null })).toEqual([]);
    expect(dueReminders({ ...input, outstanding: 0 })).toEqual([]);
  });
  it("separates currencies and excludes drafts from balances", () => {
    const result = metrics(
      [
        {
          currency: "LKR",
          state: "issued",
          total: 2000000,
          outstanding: 1000000,
          issued_at: "2026-10-01",
          due_date: "2026-10-10",
        },
        {
          currency: "USD",
          state: "issued",
          total: 500,
          outstanding: 500,
          issued_at: "2026-10-01",
          due_date: "2026-10-10",
        },
        {
          currency: "LKR",
          state: "draft",
          total: 100000,
          outstanding: 100000,
          issued_at: null,
          due_date: "2026-10-10",
        },
      ],
      [
        {
          currency: "LKR",
          state: "confirmed",
          amount: 1000000,
          received_on: "2026-10-05",
        },
      ],
      "2026-10",
      "2026-10-13",
      "LKR",
    );
    expect(result).toEqual({
      issued: 2000000,
      collected: 1000000,
      outstanding: 1000000,
      overdue: 1000000,
      partial: 1,
    });
  });
  it("rejects malformed proposal content before persistence", () => {
    expect(
      proposalSchema.safeParse({ sections: "<script>alert(1)</script>" })
        .success,
    ).toBe(false);
  });
});
