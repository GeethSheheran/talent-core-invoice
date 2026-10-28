"use client";
import Link from "@/components/navigation-link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ListControls } from "@/components/list-controls";
import { RecordsTable } from "@/components/records-table";
import type { Json } from "@/lib/db/database.types";

type Row = Record<string, Json | undefined>;
function recordState(row: Row) {
  return String(
    ("incurred_on" in row ? (row.invoice_id ? "attached" : "pending") : null) ||
      row.state ||
      (row.archived
        ? "archived"
        : row.active === false
          ? "inactive"
          : "active"),
  );
}
export function CollectionList({
  collection,
  rows,
  companies,
  initialQuery = "",
  initialStatus = "",
  initialPage = 1,
}: {
  collection: string;
  rows: Row[];
  companies: Record<string, string>;
  initialQuery?: string;
  initialStatus?: string;
  initialPage?: number;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(
    Number.isSafeInteger(initialPage) && initialPage > 0 ? initialPage : 1,
  );
  const states = [
    ...new Set([...rows.map(recordState), ...(status ? [status] : [])]),
  ].sort();
  const filtered = rows.filter(
    (row) =>
      (!status || recordState(row) === status) &&
      [
        row.name,
        row.title,
        row.description,
        row.number,
        row.code,
        row.email,
        row.currency,
        companies[String(row.company_id)],
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const currentPage = Math.min(page, pages);
  const title = collection.charAt(0).toUpperCase() + collection.slice(1);
  return (
    <>
      <div className="heading collection-heading">
        <h1>{title}</h1>
        <div className="collection-heading-tools">
          <ListControls
            label={collection}
            query={query}
            onQuery={(value) => {
              setQuery(value);
              setPage(1);
            }}
            status={status}
            onStatus={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={states.map((value) => ({
              value,
              label: value
                .replaceAll("_", " ")
                .replace(/^./, (letter) => letter.toUpperCase()),
            }))}
          />
          <Link
            className="button collection-create"
            aria-label={
              collection === "companies"
                ? "Add company"
                : "New " + collection.replace(/s$/, "")
            }
            href={`/${collection}/new`}
          >
            <Plus size={17} aria-hidden="true" />{" "}
            <span className="create-full-label">
              {collection === "companies"
                ? "Add company"
                : "New " + collection.replace(/s$/, "")}
            </span>
            <span className="create-short-label">New</span>
          </Link>
        </div>
      </div>
      <section className="card list-card">
        <div className="list-heading">
          <h2>All {collection}</h2>
          <span className="badge" role="status">
            {filtered.length} {filtered.length === 1 ? "record" : "records"}
          </span>
        </div>
        {rows.length > 0 && !filtered.length ? (
          <div className="empty">
            <h3>No matching {collection}</h3>
            <p>Try another search or clear the status filter.</p>
            <button
              className="secondary"
              onClick={() => {
                setQuery("");
                setStatus("");
                setPage(1);
              }}
            >
              Clear search and filters
            </button>
          </div>
        ) : (
          <RecordsTable
            collection={collection}
            rows={filtered.slice((currentPage - 1) * 20, currentPage * 20)}
            companies={companies}
          />
        )}
        {pages > 1 && (
          <nav className="list-pagination" aria-label={`${title} pages`}>
            <button
              className="secondary"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {pages}
            </span>
            <button
              className="secondary"
              disabled={currentPage >= pages}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </>
  );
}
