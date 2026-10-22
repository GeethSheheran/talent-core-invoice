"use client";
import { useState } from "react";
import { RecordsTable } from "@/components/records-table";
import { ListControls } from "@/components/list-controls";
import type { PaymentSummary } from "@/lib/payments/summary";
import type { Tables } from "@/lib/db/database.types";
export type PaymentListRow = Pick<
  Tables<"payments">,
  | "id"
  | "receipt_number"
  | "company_id"
  | "amount"
  | "currency"
  | "state"
  | "received_on"
  | "method"
  | "reference"
  | "created_at"
>;
export function PaymentsList({
  rows,
  companies,
  summaries,
  initialQuery = "",
  initialStatus = "",
}: {
  rows: PaymentListRow[];
  companies: Record<string, string>;
  summaries: PaymentSummary[];
  initialQuery?: string;
  initialStatus?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const changeStatus = (value: string) => {
    setStatus(value);
    setPage(1);
  };
  const filtered = rows.filter(
    (row) =>
      (!status || row.state === status) &&
      [
        row.receipt_number,
        companies[row.company_id],
        row.method,
        row.reference,
        row.currency,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  return (
    <>
      <div className="payment-stats" aria-label="All payment statistics">
        {summaries.map((summary) => (
          <button
            type="button"
            className={
              "payment-stat " +
              (status === (summary.state === "all" ? "" : summary.state)
                ? "selected"
                : "")
            }
            key={summary.state}
            aria-pressed={
              status === (summary.state === "all" ? "" : summary.state)
            }
            onClick={() =>
              changeStatus(summary.state === "all" ? "" : summary.state)
            }
          >
            <span className="muted">{summary.label}</span>
            <strong className="payment-count">{summary.count}</strong>
            <span className="payment-stat-amounts">
              {summary.amounts.length
                ? summary.amounts.map((amount) => (
                    <span key={amount}>{amount}</span>
                  ))
                : "No payments"}
            </span>
            {summary.state === "all" && (
              <small>Includes pending and reversed records</small>
            )}
          </button>
        ))}
      </div>
      <section className="card list-card">
        <div className="list-heading">
          <h2>All payments</h2>
          <div className="list-heading-tools">
            <ListControls
              label="payments"
              query={query}
              onQuery={(value) => {
                setQuery(value);
                setPage(1);
              }}
              status={status}
              onStatus={changeStatus}
              options={[
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
                { value: "reversed", label: "Reversed" },
              ]}
            />
            <span className="badge" role="status">
              {filtered.length} {filtered.length === 1 ? "record" : "records"}
            </span>
          </div>
        </div>
        {filtered.length ? (
          <RecordsTable
            rows={filtered.slice((page - 1) * 20, page * 20)}
            collection="payments"
            companies={companies}
          />
        ) : (
          <div className="empty">
            <h3>{rows.length ? "No matching payments" : "No payments yet"}</h3>
            <p>
              {rows.length
                ? "Try another search or clear the status filter."
                : "Record a payment to start tracking funds received."}
            </p>
            {(query || status) && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setQuery("");
                  changeStatus("");
                }}
              >
                Clear search and filters
              </button>
            )}
          </div>
        )}
        {pages > 1 && (
          <nav className="list-pagination" aria-label="Payment pages">
            <button
              className="secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button
              className="secondary"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </>
  );
}
