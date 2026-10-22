import "server-only";
import { requireAdmin } from "@/lib/auth/require-admin";
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
export async function allRows<T extends keyof Database["public"]["Tables"]>(
  table: T,
) {
  const { db } = await requireAdmin();
  const rows: Tables<T>[] = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await db
      .from(table)
      .select("*")
      .order("id", { ascending: true })
      .range(start, start + 999);
    if (error) throw new Error("Could not load " + table);
    const batch = data as unknown as Tables<T>[];
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}
export async function balances() {
  const { db } = await requireAdmin();
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
  const { db } = await requireAdmin();
  const { data, error } = await db
    .from(table)
    .select("*")
    .eq("id" as never, id)
    .maybeSingle();
  if (error) throw new Error("Could not load record");
  return data as unknown as Tables<T> | null;
}
