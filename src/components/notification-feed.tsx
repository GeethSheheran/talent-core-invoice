"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, FileText, Mail, Activity, X, ArrowUpRight } from "lucide-react";
import { ListControls } from "@/components/list-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ActivityItem } from "@/lib/notifications/feed";
function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Colombo",
  }).format(new Date(date));
}
const categories = [
  ["all", "All activity"],
  ["changes", "Changes"],
  ["reminders", "Reminders"],
  ["delivery", "Delivery"],
  ["documents", "Documents"],
  ["system", "System"],
] as const;
export function NotificationFeed({ items }: { items: ActivityItem[] }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ActivityItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  const filtered = items.filter(
    (item) =>
      (category === "all" || item.category === category) &&
      (!status || item.status === status) &&
      [item.title, item.message, item.company, item.record]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const states = [...new Set(items.map((item) => item.status))].sort();
  return (
    <>
      <section className="card list-card">
        <div className="list-heading">
          <h2>Workspace activity</h2>
          <div className="list-heading-tools">
            <ListControls
              label="notifications"
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
                label: value.replaceAll("_", " "),
              }))}
            />
            <span className="badge" role="status">
              {filtered.length} {filtered.length === 1 ? "update" : "updates"}
            </span>
          </div>
        </div>
        <nav className="activity-tabs" aria-label="Activity categories">
          {categories.map(([key, label]) => (
            <button
              key={key}
              className="secondary"
              type="button"
              aria-pressed={category === key}
              onClick={() => {
                setCategory(key);
                setPage(1);
              }}
            >
              {label}
              <span>
                {key === "all"
                  ? items.length
                  : items.filter((item) => item.category === key).length}
              </span>
            </button>
          ))}
        </nav>
        <ul className="activity-list">
          {filtered.slice((page - 1) * 20, page * 20).map((item) => {
            const Icon =
              item.category === "reminders"
                ? Bell
                : item.category === "delivery"
                  ? Mail
                  : item.category === "documents"
                    ? FileText
                    : Activity;
            return (
              <li key={item.id}>
                <button
                  className="activity-row"
                  type="button"
                  onClick={() => setSelected(item)}
                  aria-label={`Open ${item.title}${item.record ? ": " + item.record : ""}`}
                >
                  <span className="activity-icon">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <span className="activity-copy">
                    <strong>{item.title}</strong>
                    <span>{item.message}</span>
                    <small>
                      {[item.company, item.record].filter(Boolean).join(" · ")}
                    </small>
                  </span>
                  <span className="activity-meta">
                    <StatusBadge state={item.status} />
                    <time dateTime={item.date}>{dateLabel(item.date)}</time>
                  </span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
        {!filtered.length && (
          <div className="empty">
            <h3>{items.length ? "No matching updates" : "No activity yet"}</h3>
            <p>
              {items.length
                ? "Try another category, search, or status."
                : "Saved changes, document updates, deliveries and reminders will appear here."}
            </p>
            {items.length > 0 && (
              <button
                className="secondary"
                onClick={() => {
                  setCategory("all");
                  setQuery("");
                  setStatus("");
                  setPage(1);
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
        {pages > 1 && (
          <nav className="list-pagination" aria-label="Notification pages">
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
      <dialog
        className="activity-dialog"
        ref={dialog}
        aria-labelledby="activity-title"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const box = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < box.left ||
              event.clientX > box.right ||
              event.clientY < box.top ||
              event.clientY > box.bottom
            )
              setSelected(null);
          }
        }}
      >
        {selected && (
          <>
            <div className="list-heading">
              <div>
                <span className="eyebrow">{selected.category}</span>
                <h2 id="activity-title">{selected.title}</h2>
              </div>
              <button
                type="button"
                className="secondary icon-button"
                aria-label="Close notification"
                onClick={() => setSelected(null)}
              >
                <X size={18} />
              </button>
            </div>
            <StatusBadge state={selected.status} />
            <p className="activity-full-message">{selected.message}</p>
            <dl className="detail-list">
              <dt>Recorded</dt>
              <dd>{dateLabel(selected.date)} · Asia/Colombo</dd>
              {selected.company && (
                <>
                  <dt>Company</dt>
                  <dd>{selected.company}</dd>
                </>
              )}
              {selected.record && (
                <>
                  <dt>Record</dt>
                  <dd>{selected.record}</dd>
                </>
              )}
              {selected.details.map((detail, index) => (
                <div key={index} style={{ display: "contents" }}>
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
            {selected.href && (
              <Link className="button" href={selected.href}>
                Open related record <ArrowUpRight size={16} />
              </Link>
            )}
          </>
        )}
      </dialog>
    </>
  );
}
