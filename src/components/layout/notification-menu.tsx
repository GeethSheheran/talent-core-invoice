"use client";
import Link from "@/components/navigation-link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { getNotificationPreview } from "@/lib/client/workspace-reads";
import {
  NotificationPreview,
  type NotificationPreviewItem,
} from "@/components/notification-preview";
export function NotificationMenu({
  userId = "workspace",
}: {
  userId?: string;
}) {
  const seenKey = `ledger:notification-seen:${userId}`;
  const seen = useRef(new Set<string>());
  const [hasNew, setHasNew] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<NotificationPreviewItem[]>([]);
  const request = useRef({ version: 0 });
  function close() {
    panel.current?.hidePopover();
    setOpen(false);
    trigger.current?.focus();
  }
  const refresh = useCallback(async () => {
    const current = ++request.current.version;
    setBusy(true);
    setError("");
    try {
      const result = await getNotificationPreview();
      if (current === request.current.version) {
        setItems(result.items);
        setError(result.error);
        if (!result.error) {
          const visible = panel.current?.matches(":popover-open");
          if (visible) {
            seen.current = new Set(
              [...result.items.map((item) => item.id), ...seen.current].slice(
                0,
                100,
              ),
            );
            try {
              localStorage.setItem(seenKey, JSON.stringify([...seen.current]));
            } catch {
              /* Storage may be disabled. */
            }
          }
          setHasNew(
            !visible && result.items.some((item) => !seen.current.has(item.id)),
          );
        }
      }
    } catch {
      if (current === request.current.version)
        setError("Notifications could not be loaded. Please try again.");
    } finally {
      if (current === request.current.version) setBusy(false);
    }
  }, [seenKey]);
  useEffect(() => {
    const pendingRequest = request.current;
    try {
      const stored = JSON.parse(localStorage.getItem(seenKey) || "[]");
      seen.current = new Set(
        Array.isArray(stored)
          ? stored.filter((id) => typeof id === "string")
          : [],
      );
    } catch {
      seen.current = new Set();
    }
    const poll = () => {
      if (document.visibilityState !== "hidden") void refresh();
    };
    poll();
    const timer = window.setInterval(poll, 60000);
    document.addEventListener("visibilitychange", poll);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", poll);
      pendingRequest.version++;
    };
  }, [refresh, seenKey]);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="settings-menu-button notification-trigger"
        aria-label="Preview notifications"
        aria-describedby={hasNew ? "notification-new-hint" : undefined}
        aria-expanded={open}
        aria-controls="notification-preview-panel"
        popoverTarget="notification-preview-panel"
        popoverTargetAction="toggle"
        onClick={() => {
          if (!panel.current || !trigger.current) return;
          const rect = trigger.current.getBoundingClientRect();
          const width = Math.min(400, window.innerWidth - 24);
          panel.current.style.left = `${Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12))}px`;
          panel.current.style.top = `${Math.max(12, rect.bottom + 8)}px`;
          panel.current.style.maxHeight = `${Math.max(120, window.innerHeight - rect.bottom - 20)}px`;
        }}
      >
        <Bell size={18} aria-hidden="true" />
        {hasNew && (
          <>
            <span className="notification-new-dot" aria-hidden="true" />
            <span id="notification-new-hint" className="sr-only">
              New notifications since you last opened this panel on this browser
            </span>
          </>
        )}
      </button>
      <div
        ref={panel}
        id="notification-preview-panel"
        popover="auto"
        className="notification-menu"
        aria-label="Notification preview"
        onToggle={(event) => {
          setOpen(event.newState === "open");
          if (event.newState === "open") void refresh();
        }}
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
            <NotificationPreview items={items} userId={userId} />
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
