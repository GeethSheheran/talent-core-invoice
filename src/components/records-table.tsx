import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/billing/money";
import type { Json } from "@/lib/db/database.types";
export function RecordsTable({
  rows,
  collection,
  companies = {},
  renderRecord,
}: {
  rows: Record<string, Json | undefined>[];
  renderRecord?: (id: string, label: string) => React.ReactNode;
  collection: string;
  companies?: Record<string, string>;
}) {
  if (!rows.length)
    return (
      <EmptyState
        title={"No " + collection + " yet"}
        body="Saved records will appear here."
      />
    );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{collection === "companies" ? "Company" : "Record"}</th>
            <th>{collection === "companies" ? "Contact" : "Company"}</th>
            <th>Amount / currency</th>
            <th>Status</th>
            <th>Date</th>
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
                <td>
                  {collection === "notifications" ? (
                    label
                  ) : renderRecord ? (
                    renderRecord(id, label)
                  ) : (
                    <Link href={"/" + collection + "/" + id}>{label}</Link>
                  )}
                  {row.code && <div className="muted">{String(row.code)}</div>}
                </td>
                <td>
                  {String(
                    collection === "companies"
                      ? row.email || "—"
                      : companies[String(row.company_id)] || "—",
                  )}
                </td>
                <td>
                  {typeof amount === "number"
                    ? formatMoney(amount, String(row.currency || "LKR"))
                    : String(row.currency || "—")}
                </td>
                <td>
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
                <td className="muted">
                  {String(
                    row.due_date ||
                      row.received_on ||
                      row.incurred_on ||
                      row.created_at ||
                      "",
                  ).slice(0, 10)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
