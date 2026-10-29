import { InvoiceTracker } from "@/components/invoice-tracker";
import Link from "@/components/navigation-link";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/billing/money";
import type { Json } from "@/lib/db/database.types";
export function RecordsTable({
  rows,
  collection,
  companies = {},
  renderRecord,
  hideCompany = false,
}: {
  rows: Record<string, Json | undefined>[];
  renderRecord?: (id: string, label: string) => React.ReactNode;
  collection: string;
  hideCompany?: boolean;
  companies?: Record<string, string>;
}) {
  if (!rows.length)
    return (
      <EmptyState
        title={
          "No " +
          (collection === "projects" ? "agreed services" : collection) +
          " yet"
        }
        body="Saved records will appear here."
      />
    );
  return (
    <div className="table-wrap mobile-records">
      <table className="responsive-table">
        <thead>
          <tr>
            <th>{collection === "companies" ? "Company" : "Record"}</th>
            {collection !== "services" && !hideCompany && (
              <th>{collection === "companies" ? "Contact" : "Company"}</th>
            )}
            <th>Amount / currency</th>
            <th>Status</th>
            <th>Date</th>
            {collection === "invoices" && <th>Tracker</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = String(row.id);
            const label = String(
              row.number ||
                row.receipt_number ||
                row.title ||
                row.name ||
                row.message ||
                row.description ||
                "Draft",
            );
            const amount = row.total ?? row.amount ?? row.price ?? row.rate;
            return (
              <tr key={id}>
                <td
                  className="record-title"
                  data-label={collection === "companies" ? "Company" : "Record"}
                >
                  {collection === "notifications" ? (
                    label
                  ) : renderRecord ? (
                    renderRecord(id, label)
                  ) : (
                    <Link href={"/" + collection + "/" + id}>{label}</Link>
                  )}
                  {row.code && <div className="muted">{String(row.code)}</div>}
                </td>
                {collection !== "services" && !hideCompany && (
                  <td
                    data-label={
                      collection === "companies" ? "Contact" : "Company"
                    }
                  >
                    {String(
                      collection === "companies"
                        ? row.email || "—"
                        : companies[String(row.company_id)] || "—",
                    )}
                  </td>
                )}
                <td data-label="Amount / currency">
                  {typeof amount === "number"
                    ? formatMoney(amount, String(row.currency || "LKR"))
                    : String(row.currency || "—")}
                </td>
                <td data-label="Status">
                  <StatusBadge
                    state={String(
                      (collection === "expenses"
                        ? row.invoice_id
                          ? "attached"
                          : "pending"
                        : null) ||
                        row.state ||
                        (row.archived
                          ? "archived"
                          : row.active === false
                            ? "inactive"
                            : "active"),
                    )}
                  />
                </td>
                <td className="muted" data-label="Date">
                  {String(
                    row.due_date ||
                      row.received_on ||
                      row.incurred_on ||
                      row.created_at ||
                      "",
                  ).slice(0, 10)}
                </td>
                {collection === "invoices" && (
                  <td data-label="Tracker">
                    <InvoiceTracker row={row} />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
