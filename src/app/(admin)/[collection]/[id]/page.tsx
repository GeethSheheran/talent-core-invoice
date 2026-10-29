import Link from "@/components/navigation-link";
import { CompanyDetail } from "@/components/company-detail";
import type { Tables } from "@/lib/db/database.types";
import { InvoiceWorkflow } from "@/components/invoice-workflow";
import { notFound } from "next/navigation";
import {
  allRows,
  balances,
  oneRow,
  tableMap,
  type Collection,
} from "@/lib/db/repositories/records";
import { StatusBadge } from "@/components/ui/status-badge";
import { FinancialForm } from "@/components/financial-form";
import { DocumentButton } from "@/components/document-button";
import { AgreedServicesSummary } from "@/components/agreed-services-summary";
import { formatMoney } from "@/lib/billing/money";
import type { Json } from "@/lib/db/database.types";
import type { Balance } from "@/lib/billing/allocations";
export default async function DetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string; id: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { collection, id } = await params;
  if (!(collection in tableMap)) notFound();
  const record = await oneRow(tableMap[collection as Collection], id);
  if (!record) notFound();
  if (collection === "companies")
    return (
      <CompanyDetail
        company={record as Tables<"companies">}
        selected={(await searchParams).section}
      />
    );
  const r = record as unknown as Record<string, Json>;
  const title = String(
    r.number ||
      r.receipt_number ||
      r.name ||
      r.title ||
      r.description ||
      "Draft " + collection.replace(/s$/, ""),
  );
  const state = String(
    collection === "expenses"
      ? r.invoice_id
        ? "attached"
        : "pending"
      : r.state ||
          (r.archived
            ? "archived"
            : r.active === false
              ? "inactive"
              : "active"),
  );
  const currency = String(r.currency || "LKR");
  // Independent reads run together after the record has been authorized.
  const [companies, balanceRows, allocations, deliveries, files] =
    await Promise.all([
      collection === "services" ? Promise.resolve([]) : allRows("companies"),
      ["invoices", "payments"].includes(collection)
        ? (balances(String(r.company_id)) as Promise<
            (Balance & { number: string | null })[]
          >)
        : Promise.resolve([] as (Balance & { number: string | null })[]),
      collection === "payments"
        ? allRows("payment_allocations", undefined, { payment_id: id }).then(
            (rows) => rows.filter((row) => row.payment_id === id),
          )
        : Promise.resolve([]),
      collection === "invoices"
        ? allRows("delivery_attempts", undefined, { invoice_id: id }).then(
            (rows) => rows.filter((row) => row.invoice_id === id),
          )
        : Promise.resolve([]),
      ["invoices", "payments", "proposals"].includes(collection)
        ? allRows("document_files", undefined, { record_id: id }).then((rows) =>
            rows.filter((row) => row.record_id === id),
          )
        : Promise.resolve([]),
    ]);
  const names = Object.fromEntries(companies.map((c) => [c.id, c.name]));
  const current = balanceRows.find((i) => i.id === id);
  return (
    <>
      <div className="heading">
        <div>
          <div className="eyebrow">
            <Link
              href={
                collection === "projects"
                  ? "/companies/" + r.company_id + "?section=projects"
                  : "/" + collection
              }
            >
              {collection === "projects" ? "Agreed services" : collection}
            </Link>{" "}
            / Details
          </div>
          <h1>{title}</h1>
          <div className="actions">
            <StatusBadge state={state} />
            {r.company_id && (
              <Link href={"/companies/" + r.company_id}>
                {names[String(r.company_id)]}
              </Link>
            )}
          </div>
        </div>
        <div className="actions">
          {["companies", "projects", "agreements", "services"].includes(
            collection,
          ) ||
          state === "draft" ||
          (collection === "expenses" && !r.invoice_id) ? (
            <Link
              className="button secondary"
              href={"/" + collection + "/" + id + "/edit"}
            >
              Edit {state === "draft" ? "draft" : "details"}
            </Link>
          ) : null}
          {["invoices", "proposals"].includes(collection) && (
            <Link
              className="button"
              href={"/" + collection + "/" + id + "/preview"}
            >
              Preview document
            </Link>
          )}
        </div>
      </div>
      <section className="card" id="overview">
        <h2>Overview</h2>
        <dl className="detail-list">
          {Object.entries(r)
            .filter(
              ([key, value]) =>
                [
                  "code",
                  "email",
                  "address",
                  "contact",
                  "currency",
                  "terms_days",
                  "scope",
                  "due_date",
                  "period",
                  "kind",
                  "received_on",
                  "method",
                  "reference",
                  "billing_day",
                  "repeat",
                  "reminder_days",
                  "incurred_on",
                  "description",
                  "starts_on",
                  "ends_on",
                  "notes",
                ].includes(key) && value != null,
            )
            .map(([key, value]) => (
              <div key={key} style={{ display: "contents" }}>
                <dt>{key.replaceAll("_", " ")}</dt>
                <dd>{String(value) || "—"}</dd>
              </div>
            ))}
          {["total", "amount", "price", "advance"]
            .filter((k) => typeof r[k] === "number")
            .map((k) => (
              <div key={k} style={{ display: "contents" }}>
                <dt>{k === "total" ? "New charges" : k}</dt>
                <dd>
                  <strong>{formatMoney(Number(r[k]), currency)}</strong>
                </dd>
              </div>
            ))}
          {current && (
            <>
              <dt>Live outstanding</dt>
              <dd>
                <strong>{formatMoney(current.outstanding, currency)}</strong>
              </dd>
            </>
          )}
        </dl>
      </section>
      {collection === "expenses" && Boolean(r.invoice_id) && (
        <p className="notice">
          Included on{" "}
          <Link href={"/invoices/" + r.invoice_id}>this invoice</Link>. Attached
          expenses are preserved with the invoice.
        </p>
      )}
      {collection === "invoices" && Boolean(r.agreement_id) && (
        <p>
          <Link
            className="button secondary"
            href={"/agreements/" + r.agreement_id}
          >
            Manage recurring schedule
          </Link>
        </p>
      )}
      {collection !== "invoices" && files.length > 0 && (
        <section className="card">
          <h2>Archived documents</h2>
          {files.map((f) => (
            <div key={f.id} className="actions">
              <StatusBadge state={f.state} />
              <span>
                {f.kind} · version {f.version}
              </span>
              {f.state === "ready" ? (
                <a
                  className="button secondary"
                  href={"/api/documents/" + f.id + "/download"}
                >
                  Download {f.kind}
                </a>
              ) : (
                <DocumentButton
                  url={
                    "/api/" +
                    collection +
                    "/" +
                    id +
                    (collection === "payments" ? "/receipt" : "/pdf")
                  }
                  label={f.state === "failed" ? "Retry PDF" : "Generate PDF"}
                />
              )}
            </div>
          ))}
        </section>
      )}
      {collection === "invoices" && (
        <InvoiceWorkflow
          id={id}
          state={state}
          company={String(r.company_id)}
          currency={currency}
          outstanding={current?.outstanding ?? Number(r.total ?? 0)}
          files={files}
          sentOn={r.first_sent_on ? String(r.first_sent_on) : null}
          paused={Boolean(r.reminders_paused)}
          dueDate={String(r.due_date)}
          emailPending={deliveries.some((d) => d.state === "queued")}
        />
      )}
      {deliveries.length > 0 && (
        <section className="card">
          <h2>Delivery history</h2>
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id}>
                  <td data-label="Channel">{d.channel}</td>
                  <td data-label="Recipient">{d.recipient}</td>
                  <td data-label="Status">
                    <StatusBadge state={d.state} />
                  </td>
                  <td data-label="Date">{d.created_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted">Provider acceptance is not proof of reading.</p>
        </section>
      )}
      {collection === "payments" && (
        <>
          {state === "pending" && (
            <FinancialForm
              action="confirm_payment"
              id={id}
              label="Confirm payment"
              amount={Number(r.amount)}
              currency={currency}
              company={String(r.company_id)}
              invoices={balanceRows}
            />
          )}
          {state === "confirmed" && (
            <>
              <FinancialForm
                action="allocate_credit"
                id={id}
                label="Apply available payment credit"
                amount={
                  Number(r.amount) -
                  allocations.reduce((s, a) => s + a.amount, 0)
                }
                currency={currency}
                company={String(r.company_id)}
                invoices={balanceRows}
              />
              <FinancialForm
                action="reverse_payment"
                id={id}
                label="Reverse payment"
              />
            </>
          )}
        </>
      )}
      {collection === "proposals" && (
        <>
          {state === "draft" && (
            <FinancialForm
              action="issue_proposal"
              id={id}
              label="Issue proposal"
            />
          )}
          {state === "issued" && (
            <FinancialForm
              action="accept_proposal"
              id={id}
              label="Mark accepted"
            />
          )}
          {state === "accepted" && (
            <Link className="button" href={"/agreements/new?proposal=" + id}>
              Create agreement draft from proposal
            </Link>
          )}
        </>
      )}
      {collection === "agreements" && (
        <FinancialForm
          action="monthly_draft"
          id={id}
          label="Generate recurring draft"
        />
      )}
      {collection === "projects" && (
        <AgreedServicesSummary
          items={r.items}
          discount={Number(r.discount || 0)}
          currency={currency}
        />
      )}
      {collection === "projects" &&
        Array.isArray(r.items) &&
        r.items.length > 0 && (
          <div className="actions">
            <Link className="button" href={"/invoices/new?project=" + id}>
              Create service invoice
            </Link>
            <Link
              className="button secondary"
              href={"/companies/" + r.company_id + "?section=projects"}
            >
              Company agreed services
            </Link>
          </div>
        )}
      {collection === "projects" &&
        (!Array.isArray(r.items) || !r.items.length) && (
          <div className="actions">
            <Link
              className="button"
              href={"/invoices/new?project=" + id + "&kind=advance"}
            >
              Create advance draft
            </Link>
            <Link
              className="button secondary"
              href={"/invoices/new?project=" + id + "&kind=balance"}
            >
              Create balance draft
            </Link>
          </div>
        )}
    </>
  );
}
