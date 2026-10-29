import Link from "@/components/navigation-link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import {
  allRows,
  oneRow,
  recordLoadMessage,
} from "@/lib/db/repositories/records";
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
    parent?: string;
  }>;
}) {
  const { collection } = await params;
  const kind = kinds[collection];
  if (!kind) notFound();
  const query = await searchParams;
  if (kind === "project" && !query.company) redirect("/companies");
  const [companies, projects, services] = await Promise.all([
    ["company", "service"].includes(kind)
      ? Promise.resolve([])
      : allRows("companies"),
    ["agreement", "proposal", "invoice", "payment"].includes(kind)
      ? allRows("projects")
      : Promise.resolve([]),
    ["agreement", "invoice", "project", "service"].includes(kind)
      ? allRows("service_catalogue")
      : Promise.resolve([]),
  ]);
  const [serviceInvoiceItems, serviceInvoices] =
    kind === "invoice"
      ? await Promise.all([allRows("invoice_items"), allRows("invoices")])
      : [[], []];
  const reservedInvoices = new Set(
    serviceInvoices
      .filter((invoice) => invoice.state !== "void")
      .map((invoice) => invoice.id),
  );
  const billedServiceIds = serviceInvoiceItems
    .filter(
      (item) => item.service_item_id && reservedInvoices.has(item.invoice_id),
    )
    .map((item) => item.service_item_id!);
  const initial: Record<string, Json> = {};
  if (query.company) {
    initial.company_id = query.company;
    initial.currency =
      companies.find((c) => c.id === query.company)?.currency || "LKR";
  }
  if (query.parent && kind === "service") {
    initial.parent_id = query.parent;
    initial.currency =
      services.find((service) => service.id === query.parent)?.currency ||
      "LKR";
  }
  if (query.project) {
    const p = projects.find((p) => p.id === query.project);
    if (p) {
      initial.project_id = p.id;
      initial.company_id = p.company_id;
      initial.currency = p.currency;
      if (kind === "invoice") {
        const invoices = await allRows("invoices", undefined, {
          project_id: p.id,
          state: "issued",
        });
        if (Array.isArray(p.items) && p.items.length) {
          initial.kind = "recurring";
          initial.period =
            new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" })
              .format(new Date())
              .slice(0, 7) + "-01";
          initial.items = [];
        } else {
          const billed = invoices
            .filter((i) => i.project_id === p.id && i.state === "issued")
            .reduce((s, i) => s + i.total, 0);
          initial.kind = query.kind === "advance" ? "advance" : "balance";
          initial.items = [
            {
              description:
                query.kind === "advance"
                  ? "Service advance: " + p.name
                  : "Service balance: " + p.name,
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
  let pendingExpenses: Awaited<ReturnType<typeof allRows<"company_expenses">>> =
    [];
  let setupError = "";
  if (kind === "invoice" || kind === "expense") {
    try {
      pendingExpenses = (
        await allRows(
          "company_expenses",
          undefined,
          { invoice_id: null },
          kind === "expense" ? 1 : undefined,
        )
      ).filter((e) => !e.invoice_id);
    } catch (error) {
      setupError = recordLoadMessage(error);
    }
  }

  let availableCredit = 0;
  let previousBalance = 0;
  const companyTarget =
    (initial.company_id ? String(initial.company_id) : undefined) ||
    query.company;
  if (kind === "invoice" && companyTarget) {
    try {
      const { balances: loadBalances } =
        await import("@/lib/db/repositories/records");
      const [pmts, allocs, bals] = await Promise.all([
        allRows("payments", companyTarget, { state: "confirmed" }),
        allRows("payment_allocations"),
        loadBalances(companyTarget),
      ]);
      const currency = String(
        initial.currency ||
          companies.find((c) => c.id === companyTarget)?.currency ||
          "LKR",
      );
      availableCredit = pmts.reduce((sum, p) => {
        if (p.currency !== currency) return sum;
        const used = allocs
          .filter((a) => a.payment_id === p.id)
          .reduce((acc, a) => acc + a.amount, 0);
        return sum + Math.max(0, p.amount - used);
      }, 0);
      previousBalance = bals
        .filter(
          (b) =>
            b.company_id === companyTarget &&
            b.currency === currency &&
            (b.outstanding || 0) > 0,
        )
        .reduce((sum, b) => sum + (b.outstanding || 0), 0);
    } catch (error) {
      setupError = recordLoadMessage(error);
    }
  }

  return (
    <>
      <div className="heading">
        <div>
          {kind === "service" ? (
            <Link className="text-link" href="/services">
              <ArrowLeft size={16} aria-hidden="true" />{" "}
              {query.parent ? "Sub-service" : "Service"}
            </Link>
          ) : (
            <div className="eyebrow">{collection} / New</div>
          )}
          <h1>
            {kind === "payment"
              ? "Record payment"
              : "New " +
                (kind === "project"
                  ? "agreed services"
                  : kind === "service" && query.parent
                    ? "sub-service"
                    : kind)}
          </h1>
          {kind !== "service" && (
            <p>
              {kind === "payment"
                ? "Recording keeps the payment pending until you confirm it."
                : "Complete the details and review before saving."}
            </p>
          )}
        </div>
      </div>
      {setupError ? (
        <section className="card">
          <h2>Form unavailable</h2>
          <p className="error" role="alert">
            {setupError}
          </p>
        </section>
      ) : (
        <RecordEditor
          pendingExpenses={pendingExpenses}
          kind={kind}
          initial={initial}
          companies={companies.filter((c) => kind === "payment" || !c.archived)}
          projects={projects}
          services={services.filter((s) => !s.archived)}
          availableCredit={availableCredit}
          billedServiceIds={billedServiceIds}
          previousBalance={previousBalance}
        />
      )}
    </>
  );
}
