import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
vi.mock("@/app/(admin)/actions", () => ({ saveRecord: vi.fn() }));
import { RecordEditor } from "../../src/components/record-editor";
import {
  invoiceSchema,
  expenseSchema,
  agreementSchema,
} from "../../src/lib/validation/schemas";
const company = "10000000-0000-4000-8000-000000000001";
it("previews only pending expenses for the selected company and currency", () => {
  const expense = {
    id: "10000000-0000-4000-8000-000000000002",
    company_id: company,
    description: "Domain purchase",
    amount: 2500,
    currency: "LKR",
    incurred_on: "2026-01-01",
    invoice_id: null,
    created_at: "2026-01-01T00:00:00Z",
    created_by: null,
  };
  const html = renderToStaticMarkup(
    <RecordEditor
      kind="invoice"
      initial={{
        company_id: company,
        items: [{ description: "Hosting", quantity: "1", rate: 10000 }],
      }}
      pendingExpenses={[
        expense,
        {
          ...expense,
          id: "other",
          currency: "USD",
          description: "Other currency",
        },
        {
          ...expense,
          id: "future",
          incurred_on: "2099-01-01",
          description: "Future purchase",
        },
      ]}
    />,
  );
  expect(html).toContain('type="month"');
  expect(html).toContain('value="Domain purchase"');
  expect(html).not.toContain('value="Other currency"');
  expect(html).not.toContain('value="Future purchase"');
  expect(html).toContain("annually");
  expect(html).toContain("125.00");
});
it("keeps attached expense rows read-only and directs schedule changes to the agreement", () => {
  const html = renderToStaticMarkup(
    <RecordEditor
      kind="invoice"
      id="invoice"
      initial={{
        company_id: company,
        agreement_id: "agreement",
        period: "2026-11-01",
        items: [
          {
            description: "Expense",
            quantity: "1",
            rate: 2500,
            expense_id: "expense",
          },
        ],
      }}
    />,
  );
  expect(html).toContain('readOnly=""');
  expect(html).toContain("/agreements/agreement/edit");
  expect(html).not.toContain('name="repeat"');
  expect(html).toContain('value="2026-11"');
});
it("validates recurrence, expense minor units, and nullable schedule overrides", () => {
  const invoice = {
    company_id: company,
    currency: "LKR",
    kind: "one-off",
    repeat: "annually",
    due_date: "2026-11-15",
    discount: 0,
    tax_bps: 0,
    notes: "",
    items: [{ description: "Hosting", quantity: "1", rate: 10000 }],
  };
  expect(invoiceSchema.safeParse(invoice).success).toBe(false);
  expect(
    invoiceSchema.safeParse({ ...invoice, period: "2026-11-02" }).success,
  ).toBe(false);
  expect(
    invoiceSchema.safeParse({ ...invoice, period: "2026-11-01" }).success,
  ).toBe(true);
  expect(
    expenseSchema.safeParse({
      company_id: company,
      description: "Domain",
      amount: 1.5,
      currency: "LKR",
      incurred_on: "2026-01-01",
    }).success,
  ).toBe(false);
  expect(
    agreementSchema.safeParse({
      company_id: company,
      currency: "LKR",
      name: "Hosting",
      starts_on: "2026-11-01",
      effective_from: "2026-11-01",
      billing_day: null,
      reminder_days: null,
      items: [{ description: "Hosting", quantity: "1", rate: 10000 }],
    }).success,
  ).toBe(true);
});
