"use client";
import { useState } from "react";
import Link from "@/components/navigation-link";
import { InvoiceTracker } from "@/components/invoice-tracker";
import { formatMoney } from "@/lib/billing/money";
import type { Json } from "@/lib/db/database.types";
export function CompanyTracking({
  rows,
}: {
  rows: Record<string, Json | undefined>[];
}) {
  const [filter, setFilter] = useState("all");
  const stage = (r: Record<string, Json | undefined>) =>
    r.state === "void"
      ? "void"
      : r.state === "draft"
        ? "draft"
        : r.outstanding === 0
          ? "settled"
          : !r.first_sent_on
            ? "unsent"
            : "collect";
  const labels = {
    all: "All invoices",
    draft: "To issue",
    unsent: "To send",
    collect: "To collect",
    settled: "Settled",
    void: "Voided",
  };
  return (
    <section className="card company-tracking">
      <div className="list-heading">
        <h2>Invoice tracking</h2>
        <select
          aria-label="Tracking stage"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {Object.entries(labels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="tracking-summary">
        {(["draft", "unsent", "collect", "settled"] as const).map((key) => (
          <button
            className="secondary"
            key={key}
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
          >
            <strong>{rows.filter((r) => stage(r) === key).length}</strong>
            {labels[key]}
          </button>
        ))}
      </div>
      <div className="tracking-records">
        {rows
          .filter((r) => filter === "all" || stage(r) === filter)
          .map((r) => (
            <div className="tracking-record" key={String(r.id)}>
              <div>
                <Link href={`/invoices/${r.id}`}>
                  {String(r.number || "Draft invoice")}
                </Link>
                <p className="muted">
                  {labels[stage(r)]} · Due {String(r.due_date)}
                </p>
              </div>
              <div>
                <strong>
                  {formatMoney(
                    Number(
                      r.state === "draft"
                        ? r.total
                        : (r.outstanding ?? r.total),
                    ),
                    String(r.currency),
                  )}
                </strong>
                <InvoiceTracker row={r} />
              </div>
            </div>
          ))}
        {!rows.some((r) => filter === "all" || stage(r) === filter) && (
          <p className="empty">No invoices in this stage.</p>
        )}
      </div>
    </section>
  );
}
