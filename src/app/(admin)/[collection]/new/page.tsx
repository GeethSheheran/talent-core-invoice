import { notFound } from "next/navigation";
import { allRows, oneRow } from "@/lib/db/repositories/records";
import { RecordEditor } from "@/components/record-editor";
import type { RecordKind } from "@/lib/validation/schemas";
import type { Json } from "@/lib/db/database.types";
const kinds: Record<string, RecordKind> = {
  expenses: "expense",
  companies: "company",
  services: "service",
  projects: "project",
  agreements: "agreement",
  proposals: "proposal",
  invoices: "invoice",
  payments: "payment",
};
export default async function NewPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{
    company?: string;
    project?: string;
    kind?: string;
    proposal?: string;
  }>;
}) {
  const { collection } = await params;
  const kind = kinds[collection];
  if (!kind) notFound();
  const query = await searchParams;
  const [companies, projects, services] = await Promise.all([
    allRows("companies"),
    allRows("projects"),
    allRows("service_catalogue"),
  ]);
  const initial: Record<string, Json> = {};
  if (query.company) {
    initial.company_id = query.company;
    initial.currency =
      companies.find((c) => c.id === query.company)?.currency || "LKR";
  }
  if (query.project) {
    const p = projects.find((p) => p.id === query.project);
    if (p) {
      initial.project_id = p.id;
      initial.company_id = p.company_id;
      initial.currency = p.currency;
      if (kind === "invoice") {
        const invoices = await allRows("invoices");
        const billed = invoices
          .filter((i) => i.project_id === p.id && i.state === "issued")
          .reduce((s, i) => s + i.total, 0);
        initial.kind = query.kind === "advance" ? "advance" : "balance";
        initial.items = [
          {
            description:
              query.kind === "advance"
                ? "Project advance: " + p.name
                : "Project balance: " + p.name,
            quantity: "1",
            rate:
              query.kind === "advance"
                ? p.advance
                : Math.max(0, p.price - billed),
          },
        ];
      }
    }
  }
  if (query.proposal && kind === "agreement") {
    const p = await oneRow("proposals", query.proposal);
    if (p?.state === "accepted") {
      initial.company_id = p.company_id;
      initial.project_id = p.project_id;
      initial.name = p.title;
      initial.currency = p.currency;
      initial.items = [{ description: p.title, quantity: "1", rate: p.price }];
    }
  }
  return (
    <>
      <div className="heading">
        <div>
          <div className="eyebrow">{collection} / New</div>
          <h1>{kind === "payment" ? "Record payment" : "New " + kind}</h1>
          <p>
            {kind === "payment"
              ? "Recording keeps the payment pending until you confirm it."
              : "Complete the details and review before saving."}
          </p>
        </div>
      </div>
      <RecordEditor
        pendingExpenses={
          kind === "invoice"
            ? (await allRows("company_expenses")).filter((e) => !e.invoice_id)
            : []
        }
        kind={kind}
        initial={initial}
        companies={companies.filter((c) => kind === "payment" || !c.archived)}
        projects={projects}
        services={services.filter((s) => !s.archived)}
      />
    </>
  );
}
