import "server-only";
import { renderAdmin } from "@/lib/auth/render-admin";
import type { Database, Tables } from "@/lib/db/database.types";
export const tableMap = {
  expenses: "company_expenses",
  companies: "companies",
  services: "service_catalogue",
  projects: "projects",
  agreements: "agreements",
  proposals: "proposals",
  invoices: "invoices",
  payments: "payments",
  notifications: "notification_events",
} as const;
export type Collection = keyof typeof tableMap;
export class RecordLoadError extends Error {
  constructor(
    public table: string,
    public code: string,
  ) {
    super(`Could not load ${table}`);
  }
}
export function recordLoadMessage(error: unknown) {
  if (
    error instanceof RecordLoadError &&
    ["PGRST205", "42P01", "42703"].includes(error.code)
  ) {
    return "This section needs a database update. Apply the pending expenses and recurring schedules migration to the configured Supabase project, then retry. Existing records are preserved.";
  }
  return "This section could not be loaded. Check the database connection and access permissions, then retry. Existing records are preserved.";
}
export async function allRows<T extends keyof Database["public"]["Tables"]>(
  table: T,
  companyId?: string,
) {
  const { db } = await renderAdmin();
  const rows: Tables<T>[] = [];
  for (let start = 0; ; start += 1000) {
    let query = db.from(table).select("*");
    if (companyId) query = query.eq("company_id" as never, companyId);
    const { data, error } = await query
      .order("id", { ascending: true })
      .range(start, start + 999);
    if (error) {
      // Callers show a typed, recoverable section error. Logging it as a console
      // error also opens the development overlay on otherwise usable pages.
      throw new RecordLoadError(table, error.code);
    }
    const batch = data as unknown as Tables<T>[];
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}
export async function balances() {
  const { db } = await renderAdmin();
  const rows: Database["public"]["Views"]["invoice_balances"]["Row"][] = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await db
      .from("invoice_balances")
      .select("*")
      .order("id", { ascending: true })
      .range(start, start + 999);
    if (error) throw new Error("Could not load balances");
    rows.push(...data);
    if (data.length < 1000) break;
  }
  return rows;
}
export async function oneRow<T extends keyof Database["public"]["Tables"]>(
  table: T,
  id: string,
) {
  const { db } = await renderAdmin();
  const { data, error } = await db
    .from(table)
    .select("*")
    .eq("id" as never, id)
    .maybeSingle();
  if (error) throw new Error("Could not load record");
  return data as unknown as Tables<T> | null;
}
