"use client";
import Link from "@/components/navigation-link";
import { useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { getNotificationPreview } from "@/lib/client/workspace-reads";
import {
  NotificationPreview,
  type NotificationPreviewItem,
} from "@/components/notification-preview";
export function NotificationMenu() {
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<NotificationPreviewItem[]>([]);
  const request = useRef(0);
  function close() {
    panel.current?.hidePopover();
    setOpen(false);
    trigger.current?.focus();
  }
  async function refresh() {
    const current = ++request.current;
    setBusy(true);
    setError("");
    try {
      const result = await getNotificationPreview();
      if (current === request.current) {
        setItems(result.items);
        setError(result.error);
      }
    } catch {
      if (current === request.current)
        setError("Notifications could not be loaded. Please try again.");
    } finally {
      if (current === request.current) setBusy(false);
    }
  }
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="settings-menu-button"
        aria-label="Preview notifications"
        aria-expanded={open}
        aria-controls="notification-preview-panel"
        onClick={() => {
          if (!panel.current || !trigger.current) return;
          if (panel.current.matches(":popover-open")) {
            close();
            return;
          }
          const rect = trigger.current.getBoundingClientRect();
          const width = Math.min(400, window.innerWidth - 24);
          panel.current.style.left = `${Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12))}px`;
          panel.current.style.top = `${Math.max(12, rect.bottom + 8)}px`;
          panel.current.style.maxHeight = `${Math.max(120, window.innerHeight - rect.bottom - 20)}px`;
          panel.current.showPopover();
          setOpen(true);
          void refresh();
        }}
      >
        <Bell size={18} aria-hidden="true" />
      </button>
      <div
        ref={panel}
        id="notification-preview-panel"
        popover="auto"
        className="notification-menu"
        aria-label="Notification preview"
        onToggle={(event) => setOpen(event.newState === "open")}
      >
        <header>
          <h2>Notifications</h2>
          <button
            type="button"
            className="secondary icon-button"
            aria-label="Close notification preview"
            onClick={close}
          >
            <X size={18} />
          </button>
        </header>
        <div
          className="notification-menu-scroll"
          tabIndex={0}
          role="region"
          aria-label="Recent notifications"
          aria-busy={busy}
        >
          {busy && !items.length ? (
            <p role="status">Loading notifications…</p>
          ) : error ? (
            <div role="alert">
              <p>{error}</p>
              <button className="secondary" onClick={refresh}>
                Retry
              </button>
            </div>
          ) : (
            <NotificationPreview items={items} />
          )}
        </div>
        <footer>
          <Link className="view-all-link" href="/notifications" onClick={close}>
            View all →
          </Link>
        </footer>
      </div>
    </>
  );
}
