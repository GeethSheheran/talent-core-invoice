import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  admin: vi.fn(),
  allRows: vi.fn(),
  oneRow: vi.fn(),
  balances: vi.fn(),
}));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.admin }));
vi.mock("@/lib/db/repositories/records", () => ({
  allRows: mocks.allRows,
  oneRow: mocks.oneRow,
  balances: mocks.balances,
  recordLoadMessage: () => "Database unavailable",
  tableMap: {
    invoices: "invoices",
    payments: "payments",
    projects: "projects",
    agreements: "agreements",
    proposals: "proposals",
    expenses: "company_expenses",
  },
}));
import {
  loadCompanyEditor,
  loadCompanyRecord,
} from "../../src/app/(admin)/company-actions";
import { companySection } from "../../src/lib/company-sections";
const company = "10000000-0000-4000-8000-000000000001";
const record = "10000000-0000-4000-8000-000000000002";
beforeEach(() => {
  vi.resetAllMocks();
  mocks.admin.mockResolvedValue({});
  mocks.oneRow.mockResolvedValue({
    id: company,
    name: "Example",
    currency: "LKR",
    archived: false,
  });
  mocks.allRows.mockResolvedValue([]);
  mocks.balances.mockResolvedValue([]);
});
it("defaults unknown company sections to overview", () => {
  expect(companySection("invalid")).toBe("overview");
  expect(companySection("agreements")).toBe("agreements");
});
it("loads only company projects for a payment without depending on expenses", async () => {
  const result = await loadCompanyEditor(company, "payments");
  expect(result.data?.initial.company_id).toBe(company);
  expect(mocks.allRows.mock.calls).toEqual([["projects", company]]);
  expect(mocks.admin).toHaveBeenCalledOnce();
});
it("reports missing invoice expenses instead of treating them as an empty balance", async () => {
  mocks.allRows.mockImplementation(async (table: string) => {
    if (table === "company_expenses") throw new Error("missing table");
    return [];
  });
  expect((await loadCompanyEditor(company, "invoices")).error).toBe(
    "Database unavailable",
  );
});
it("rejects records that belong to another company before loading financial details", async () => {
  mocks.oneRow.mockResolvedValue({ id: record, company_id: record });
  expect((await loadCompanyRecord(company, "payments", record)).error).toBe(
    "Record not found for this company.",
  );
  expect(mocks.balances).not.toHaveBeenCalled();
});
it("keeps payment allocation options within the current company", async () => {
  mocks.oneRow.mockResolvedValue({ id: record, company_id: company });
  mocks.balances.mockResolvedValue([
    {
      id: record,
      company_id: company,
      currency: "LKR",
      due_date: "2026-11-01",
      outstanding: 1000,
      number: "INV-1",
    },
    { id: company, company_id: record, outstanding: 9000 },
  ]);
  expect(
    (await loadCompanyRecord(company, "payments", record)).data?.invoices,
  ).toHaveLength(1);
});
it("requires administrator access for both dialog reads", async () => {
  mocks.admin.mockRejectedValue(new Error("Sign in required"));
  await expect(loadCompanyEditor(company, "payments")).rejects.toThrow(
    "Sign in required",
  );
  await expect(loadCompanyRecord(company, "payments", record)).rejects.toThrow(
    "Sign in required",
  );
  expect(mocks.oneRow).not.toHaveBeenCalled();
});

it("loads overview without touching unrelated tables", async () => {
  const { loadCompanySection } = await import("../../src/lib/company-data");
  const result = await loadCompanySection(company, "overview");
  expect(result.error).toBe("");
  expect(mocks.allRows).not.toHaveBeenCalled();
  expect(mocks.balances).not.toHaveBeenCalled();
});
it("isolates an expenses failure from the company overview and other sections", async () => {
  const { loadCompanySection } = await import("../../src/lib/company-data");
  mocks.allRows.mockRejectedValue(new Error("missing expenses"));
  expect((await loadCompanySection(company, "expenses")).error).toBe(
    "Database unavailable",
  );
  expect((await loadCompanySection(company, "overview")).error).toBe("");
  expect(mocks.allRows).toHaveBeenCalledWith("company_expenses", company);
});

it("shows only eligible pending expenses for a draft invoice", async () => {
  mocks.oneRow.mockResolvedValue({
    id: record,
    company_id: company,
    state: "draft",
    currency: "LKR",
  });
  const base = {
    id: "expense",
    description: "Domain",
    amount: 2500,
    currency: "LKR",
    incurred_on: "2026-01-01",
    invoice_id: null,
  };
  mocks.allRows.mockImplementation(async (table: string) =>
    table === "company_expenses"
      ? [
          base,
          { ...base, id: "usd", currency: "USD" },
          { ...base, id: "attached", invoice_id: record },
          { ...base, id: "future", incurred_on: "2099-01-01" },
        ]
      : [],
  );
  const result = await loadCompanyRecord(company, "invoices", record);
  expect(result.data?.pendingExpenses).toEqual([
    {
      id: "expense",
      description: "Domain",
      amount: 2500,
      currency: "LKR",
      incurred_on: "2026-01-01",
    },
  ]);
  expect(mocks.allRows).toHaveBeenCalledWith("company_expenses", company);
});
it("does not offer pending expense attachment on issued invoices", async () => {
  mocks.oneRow.mockResolvedValue({
    id: record,
    company_id: company,
    state: "issued",
    currency: "LKR",
  });
  const result = await loadCompanyRecord(company, "invoices", record);
  expect(result.data?.pendingExpenses).toEqual([]);
  expect(mocks.allRows).not.toHaveBeenCalledWith("company_expenses", company);
});
