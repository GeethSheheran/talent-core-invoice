"use client";
import { NotificationRecord } from "@/components/notification-record";
import Link from "@/components/navigation-link";
import { useEffect, useRef, useState } from "react";
import { Search, X, ArrowUpRight } from "lucide-react";
import {
  activityIcon,
  useNotificationRead,
} from "@/components/notification-state";
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
export function NotificationFeed({
  items,
  userId = "workspace",
}: {
  items: ActivityItem[];
  userId?: string;
}) {
  const { read, markRead } = useNotificationRead(userId);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
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
      [item.title, item.message, item.company, item.record]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  return (
    <>
      <div className="heading">
        <h1>Notifications</h1>
        <label className="notification-search">
          <Search size={18} />
          <input
            aria-label="Search notifications"
            placeholder="Search notifications…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      <div className="notifications-workspace">
        <nav
          className="notification-categories"
          aria-label="Activity categories"
        >
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
        <section className="card list-card">
          <ul className="activity-list">
            {filtered.slice((page - 1) * 20, page * 20).map((item) => {
              const Icon = activityIcon(item);
              return (
                <li key={item.id}>
                  <button
                    className={`activity-row ${read.has(item.id) ? "" : "notification-unread"}`}
                    type="button"
                    onClick={() => {
                      markRead(item.id);
                      setSelected(item);
                      dialog.current?.showModal();
                    }}
                    aria-label={`Open ${item.title}${item.record ? ": " + item.record : ""}`}
                  >
                    <span className="activity-icon">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <span className="activity-copy">
                      <strong>
                        {!read.has(item.id) && (
                          <span className="unread-dot" aria-label="Unread" />
                        )}
                        {item.title}
                      </strong>
                      <span>{item.message}</span>
                      <small>
                        {[item.company, item.record]
                          .filter(Boolean)
                          .join(" · ")}
                      </small>
                    </span>
                    <span className="activity-meta">
                      <StatusBadge state={item.status} />
                      <time dateTime={item.date}>{dateLabel(item.date)}</time>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {!filtered.length && (
            <div className="empty">
              <h3>
                {items.length ? "No matching updates" : "No activity yet"}
              </h3>
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
      </div>
      <dialog
        className="activity-dialog notification-slide"
        ref={dialog}
        aria-labelledby="activity-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const box = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < box.left ||
              event.clientX > box.right ||
              event.clientY < box.top ||
              event.clientY > box.bottom
            )
              dialog.current?.close();
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
                onClick={() => dialog.current?.close()}
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
            <NotificationRecord key={selected.id} href={selected.href} />
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
