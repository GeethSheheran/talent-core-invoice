"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NotificationRecord } from "@/components/notification-record";
import Link from "@/components/navigation-link";
import { ChevronRight, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ActivityItem } from "@/lib/notifications/feed";
import {
  activityIcon,
  useNotificationRead,
} from "@/components/notification-state";
export type NotificationPreviewItem = Pick<
  ActivityItem,
  | "id"
  | "title"
  | "message"
  | "status"
  | "date"
  | "category"
  | "company"
  | "record"
  | "href"
>;
function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
export function NotificationPreview({
  items,
  userId = "workspace",
}: {
  items: NotificationPreviewItem[];
  userId?: string;
}) {
  const { read, markRead } = useNotificationRead(userId);
  const [selected, setSelected] = useState<NotificationPreviewItem | null>(
    null,
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (selected) dialog.current?.showModal();
  }, [selected]);
  if (!items.length)
    return (
      <div className="notification-preview-empty">
        <h3>You’re all caught up</h3>
        <p className="muted">New workspace activity will appear here.</p>
      </div>
    );
  return (
    <>
      <ul className="notification-preview-list">
        {items.map((item) => {
          const Icon = activityIcon(item);
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`notification-row ${read.has(item.id) ? "" : "notification-unread"}`}
                onClick={() => {
                  markRead(item.id);
                  setSelected(item);
                  dialog.current?.showModal();
                }}
                aria-haspopup="dialog"
              >
                <span className="notification-row-icon">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <span className="notification-row-copy">
                  <span className="notification-row-company">
                    {item.company ||
                      (item.category === "system"
                        ? "Workspace"
                        : "Company unavailable")}
                  </span>
                  <span className="notification-row-title">
                    {!read.has(item.id) && (
                      <span className="unread-dot" aria-label="Unread" />
                    )}
                    {item.title}
                  </span>
                  <span className="notification-row-record">
                    {item.record || "Workspace activity"}
                  </span>
                </span>
                <span className="notification-row-meta">
                  <StatusBadge state={item.status} />
                  <time dateTime={item.date}>{dateLabel(item.date)}</time>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {selected &&
        createPortal(
          <dialog
            ref={dialog}
            className="company-dialog notification-detail-dialog notification-slide"
            aria-labelledby={titleId}
            onClick={(event) => {
              if (event.target === event.currentTarget) dialog.current?.close();
            }}
          >
            <header className="company-dialog-header">
              <div>
                <div className="eyebrow">Notification</div>
                <h2 id={titleId}>{selected.title}</h2>
              </div>
              <button
                type="button"
                className="secondary icon-button"
                aria-label="Close notification details"
                onClick={() => dialog.current?.close()}
              >
                <X size={18} />
              </button>
            </header>
            <div className="company-dialog-body">
              <div className="notification-detail-context">
                <strong>{selected.company || "Workspace"}</strong>
                <StatusBadge state={selected.status} />
              </div>
              {selected.record && (
                <p className="notification-detail-record">{selected.record}</p>
              )}
              <time className="muted" dateTime={selected.date}>
                {dateLabel(selected.date)}
              </time>
              <p className="notification-detail-message">{selected.message}</p>
              <NotificationRecord key={selected.id} href={selected.href} />
              {selected.href && (
                <Link className="view-all-link" href={selected.href}>
                  Open record <ChevronRight size={14} aria-hidden="true" />
                </Link>
              )}
            </div>
          </dialog>,
          document.body,
        )}
    </>
  );
}
