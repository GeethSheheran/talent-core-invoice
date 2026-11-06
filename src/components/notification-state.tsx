"use client";
import { useEffect, useState } from "react";
import {
  Bell,
  FileText,
  Mail,
  Settings,
  Layers,
  Trash2,
  Wallet,
  CheckCircle2,
  Building2,
  RefreshCw,
} from "lucide-react";
export function activityIcon(item: { title: string; category: string }) {
  const title = item.title.toLowerCase();
  if (title.includes("delete")) return Trash2;
  if (title.includes("confirmed")) return CheckCircle2;
  if (item.category === "documents" || title.includes("pdf")) return FileText;
  if (title.includes("payment")) return Wallet;
  if (title.includes("service")) return Layers;
  if (title.includes("company")) return Building2;
  if (item.category === "delivery") return Mail;
  if (item.category === "reminders") return Bell;
  if (item.category === "system") return Settings;
  return RefreshCw;
}
export function useNotificationRead(userId: string) {
  const key = `ledger:notification-read:${userId}`;
  const [read, setRead] = useState<Set<string>>(new Set());
  useEffect(() => {
    const update = () => {
      try {
        const ids = JSON.parse(localStorage.getItem(key) || "[]");
        setRead(new Set(Array.isArray(ids) ? ids : []));
      } catch {
        setRead(new Set());
      }
    };
    update();
    window.addEventListener("notification-read", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("notification-read", update);
      window.removeEventListener("storage", update);
    };
  }, [key]);
  function markRead(id: string) {
    let ids: string[] = [];
    try {
      ids = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      /* Storage unavailable */
    }
    const next = new Set([id, ...(Array.isArray(ids) ? ids : []), ...read]);
    setRead(next);
    try {
      localStorage.setItem(key, JSON.stringify([...next].slice(0, 2000)));
    } catch {
      /* Storage unavailable */
    }
    window.dispatchEvent(new Event("notification-read"));
  }
  return { read, markRead };
}
