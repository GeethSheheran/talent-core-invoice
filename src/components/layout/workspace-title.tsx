"use client";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  dashboard: "Overview",
  companies: "Companies",
  services: "Services",
  projects: "Agreed services",
  agreements: "Agreements",
  proposals: "Proposals",
  invoices: "Invoices",
  payments: "Payments",
  expenses: "Expenses",
  notifications: "Notifications",
  settings: "Settings",
};
export function WorkspaceTitle() {
  const [collection, record, action] = usePathname().split("/").filter(Boolean);
  const title = titles[collection] || "Workspace";
  const detail =
    record === "new"
      ? "New"
      : action === "edit"
        ? "Edit"
        : action === "preview"
          ? "Preview"
          : record
            ? "Details"
            : "";
  return (
    <span className="muted">
      / {title}
      {detail ? ` / ${detail}` : ""}
    </span>
  );
}
