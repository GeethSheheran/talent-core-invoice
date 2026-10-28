import "server-only";
import { renderAdmin } from "@/lib/auth/render-admin";
import {
  buildActivityFeed,
  type ActivityTarget,
} from "@/lib/notifications/feed";
import type { Database, Tables } from "@/lib/db/database.types";
export async function loadNotificationPreview(
  client?: Awaited<ReturnType<typeof renderAdmin>>["db"],
) {
  const db = client ?? (await renderAdmin()).db;
  async function recent<T extends keyof Database["public"]["Tables"]>(
    table: T,
  ) {
    const { data, error } = await db
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(20);
    if (error) throw new Error("Notification query failed");
    return data as unknown as Tables<T>[];
  }
  try {
    const [audits, reminders, deliveries, jobs, documents, runs] =
      await Promise.all([
        recent("audit_logs"),
        recent("notification_events"),
        recent("delivery_attempts"),
        recent("outbox_jobs"),
        recent("document_files"),
        recent("job_runs"),
      ]);
    const source = { audits, reminders, deliveries, jobs, documents, runs };
    const ids = new Set<string>();
    for (const row of audits) {
      if (row.record_id) ids.add(row.record_id);
      const detail = row.detail;
      if (
        detail &&
        typeof detail === "object" &&
        !Array.isArray(detail) &&
        typeof detail.payment_id === "string"
      )
        ids.add(detail.payment_id);
    }
    for (const row of [...reminders, ...deliveries])
      if (row.invoice_id) ids.add(row.invoice_id);
    for (const row of documents) ids.add(row.record_id);
    for (const row of jobs) {
      const payload = row.payload;
      if (
        payload &&
        typeof payload === "object" &&
        !Array.isArray(payload) &&
        typeof payload.invoice_id === "string"
      )
        ids.add(payload.invoice_id);
    }
    type ContextTable =
      | "companies"
      | "invoices"
      | "payments"
      | "proposals"
      | "projects"
      | "agreements"
      | "service_catalogue"
      | "company_expenses";
    async function matching<T extends ContextTable>(table: T, keys: string[]) {
      if (!keys.length) return [] as Tables<T>[];
      const { data, error } = await db
        .from(table as ContextTable)
        .select("*")
        .in("id", keys);
      if (error) throw new Error("Notification context query failed");
      return data as unknown as Tables<T>[];
    }
    const collections = [
      ["invoices", "invoices"],
      ["payments", "payments"],
      ["proposals", "proposals"],
      ["projects", "projects"],
      ["agreements", "agreements"],
      ["services", "service_catalogue"],
      ["expenses", "company_expenses"],
    ] as const;
    const records = await Promise.all(
      collections.map(async ([collection, table]) => ({
        collection,
        rows: await matching(table, [...ids]),
      })),
    );
    const companyIds = new Set(ids);
    for (const { rows } of records)
      for (const row of rows)
        if ("company_id" in row) companyIds.add(row.company_id);
    const companies = await matching("companies", [...companyIds]);
    const names = Object.fromEntries(
      companies.map((row) => [row.id, row.name]),
    );
    const targets: Record<string, ActivityTarget> = {};
    for (const row of companies)
      targets[row.id] = {
        label: row.name,
        company: row.name,
        href: "/companies/" + row.id,
      };
    for (const { collection, rows } of records)
      for (const row of rows) {
        targets[row.id] = {
          label: String(
            ("number" in row && row.number) ||
              ("receipt_number" in row && row.receipt_number) ||
              ("title" in row && row.title) ||
              ("name" in row && row.name) ||
              ("description" in row && row.description) ||
              (collection === "payments"
                ? "Pending payment"
                : collection === "proposals"
                  ? "Draft proposal"
                  : "Draft invoice"),
          ),
          company:
            "company_id" in row
              ? names[row.company_id] || "Company unavailable"
              : "Workspace",
          href: "/" + collection + "/" + row.id,
        };
      }
    const items = buildActivityFeed(source, targets)
      .slice(0, 20)
      .map(
        ({
          id,
          title,
          message,
          status,
          date,
          category,
          company,
          record,
          href,
        }) => ({
          id,
          title,
          message,
          status,
          date,
          category,
          company,
          record,
          href,
        }),
      );
    return { items, error: "" };
  } catch {
    return {
      items: [],
      error: "Notifications could not be loaded. Please try again.",
    };
  }
}
