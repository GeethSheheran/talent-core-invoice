import { NotificationsPage } from "@/components/notifications-page";
import { PaymentsList } from "@/components/payments-list";
import { summarizePayments } from "@/lib/payments/summary";
import type { Tables } from "@/lib/db/database.types";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  allRows,
  recordLoadMessage,
  tableMap,
  type Collection,
} from "@/lib/db/repositories/records";
import { CollectionList } from "@/components/collection-list";
import type { Json } from "@/lib/db/database.types";
export default async function ListPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ q?: string; state?: string; page?: string }>;
}) {
  const { collection } = await params;
  if (!(collection in tableMap)) notFound();
  const key = collection as Collection;
  const query = await searchParams;
  if (collection === "notifications") return <NotificationsPage />;
  const [result, companies] = await Promise.all([
    allRows(tableMap[key])
      .then((data) => ({ data, error: "" }))
      .catch((error) => ({ data: [], error: recordLoadMessage(error) })),
    allRows("companies"),
  ]);
  if (result.error)
    return (
      <section className="card">
        <h1>{collection.charAt(0).toUpperCase() + collection.slice(1)}</h1>
        <p className="error" role="alert">
          {result.error}
        </p>
        <Link className="button secondary" href={`/${collection}`}>
          Retry
        </Link>
      </section>
    );
  const data = result.data;
  if (collection === "payments") {
    const payments = (data as Tables<"payments">[])
      .map(
        ({
          id,
          receipt_number,
          company_id,
          amount,
          currency,
          state,
          received_on,
          method,
          reference,
          created_at,
        }) => ({
          id,
          receipt_number,
          company_id,
          amount,
          currency,
          state,
          received_on,
          method,
          reference,
          created_at,
        }),
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return (
      <>
        <div className="heading">
          <h1>Payments</h1>
          <Link className="button" href="/payments/new">
            + Record payment
          </Link>
        </div>
        <PaymentsList
          rows={payments}
          companies={Object.fromEntries(
            companies.map((company) => [company.id, company.name]),
          )}
          summaries={summarizePayments(payments)}
          initialQuery={query.q}
          initialStatus={
            ["pending", "confirmed", "reversed"].includes(query.state || "")
              ? query.state
              : ""
          }
        />
      </>
    );
  }
  // Send only list fields to the interactive client component.
  const fields = [
    "id",
    "name",
    "title",
    "description",
    "incurred_on",
    "invoice_id",
    "number",
    "code",
    "email",
    "company_id",
    "total",
    "amount",
    "price",
    "rate",
    "currency",
    "state",
    "archived",
    "active",
    "due_date",
    "created_at",
  ];
  const rows = (data as unknown as Record<string, Json>[])
    .map((row) =>
      Object.fromEntries(
        fields
          .filter((field) => field in row)
          .map((field) => [field, row[field]]),
      ),
    )
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return (
    <CollectionList
      collection={collection}
      rows={rows}
      companies={Object.fromEntries(
        companies.map((company) => [company.id, company.name]),
      )}
      initialQuery={query.q}
      initialStatus={query.state}
      initialPage={Number(query.page)}
    />
  );
}
