import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
vi.mock("@/app/(admin)/actions", () => ({ financialAction: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import { InvoiceWorkflow } from "../../src/components/invoice-workflow";
const base = {
  id: "invoice-id",
  state: "issued",
  company: "company-id",
  currency: "LKR",
  outstanding: 12000,
  files: [],
  sentOn: null,
  paused: false,
  dueDate: "2026-10-15",
  emailPending: false,
};
it("guides PDF preparation before making send actions available", () => {
  const html = renderToStaticMarkup(<InvoiceWorkflow {...base} />);
  expect(html).toContain("Generate PDF");
  expect(html).not.toContain("Send invoice by email");
  expect(html).toContain("Corrections and other actions");
});
it("shows company follow-up and payment recording after sending", () => {
  const html = renderToStaticMarkup(
    <InvoiceWorkflow {...base} sentOn="2026-10-15" />,
  );
  expect(html).toContain("Record payment received");
  expect(html).toContain("/payments/new?company=company-id");
  expect(html).toContain("/companies/company-id");
});
it("stops payment follow-up when settled or voided", () => {
  const paid = renderToStaticMarkup(
    <InvoiceWorkflow {...base} sentOn="2026-10-15" outstanding={0} />,
  );
  expect(paid).toContain("No outstanding balance remains");
  expect(paid).not.toContain("Record payment received");
  const voided = renderToStaticMarkup(
    <InvoiceWorkflow {...base} state="void" />,
  );
  expect(voided).not.toContain("Generate PDF");
  expect(voided).not.toContain("Send invoice by email");
});
