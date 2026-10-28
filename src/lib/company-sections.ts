export const companyCollections = [
  "projects",
  "agreements",
  "proposals",
  "invoices",
  "payments",
  "expenses",
] as const;
export type CompanyCollection = (typeof companyCollections)[number];
export const companySections = [
  "overview",
  ...companyCollections,
  "statement",
] as const;
export type CompanySection = (typeof companySections)[number];
export function companySection(value?: string): CompanySection {
  return companySections.includes(value as CompanySection)
    ? (value as CompanySection)
    : "overview";
}
export const companyKinds = {
  projects: "project",
  agreements: "agreement",
  proposals: "proposal",
  invoices: "invoice",
  payments: "payment",
  expenses: "expense",
} as const;
export const sectionLabels: Record<CompanySection, string> = {
  overview: "Overview",
  projects: "Projects",
  agreements: "Agreements",
  proposals: "Proposals",
  invoices: "Invoices",
  payments: "Payments & receipts",
  expenses: "Expenses",
  statement: "Statement",
};
