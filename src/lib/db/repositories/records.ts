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
    return "This section needs a database update. Apply the pending database migrations (expenses, recurring schedules, and agreed services) to the configured Supabase project, then retry. Existing records are preserved.";
  }
  return "This section could not be loaded. Check the database connection and access permissions, then retry. Existing records are preserved.";
}
type Table = keyof Database["public"]["Tables"];
type Filters<T extends Table> = Partial<Record<keyof Tables<T>, string | null>>;
type AuthorizedDb = Awaited<ReturnType<typeof renderAdmin>>["db"];

// Only server code can construct a reader. Actions obtain this client from their
// own requireAdmin call; pages use request-scoped renderAdmin below. No data is
// cached across requests, users, or financial mutations.
export function createRecordReader(db: AuthorizedDb) {
  async function allRows<T extends Table>(
    table: T,
    companyId?: string,
    filters: Filters<T> = {},
    limit?: number,
  ) {
    const rows: Tables<T>[] = [];
    for (let start = 0; ; start += 1000) {
      let query = db.from(table).select("*");
      if (companyId) query = query.eq("company_id" as never, companyId);
      for (const [column, value] of Object.entries(filters)) {
        query =
          value === null
            ? query.is(column as never, null)
            : query.eq(column as never, value as never);
      }
      const end = limit ? Math.min(start + 999, limit - 1) : start + 999;
      const { data, error } = await query
        .order("id", { ascending: true })
        .range(start, end);
      if (error) throw new RecordLoadError(table, error.code);
      const batch = data as unknown as Tables<T>[];
      rows.push(...batch);
      if (batch.length < 1000 || (limit && rows.length >= limit)) break;
    }
    return rows;
  }
  async function balances(companyId?: string) {
    const rows: Database["public"]["Views"]["invoice_balances"]["Row"][] = [];
    for (let start = 0; ; start += 1000) {
      let query = db.from("invoice_balances").select("*");
      if (companyId) query = query.eq("company_id", companyId);
      const { data, error } = await query
        .order("id", { ascending: true })
        .range(start, start + 999);
      if (error) throw new Error("Could not load balances");
      rows.push(...data);
      if (data.length < 1000) break;
    }
    return rows;
  }
  async function oneRow<T extends Table>(table: T, id: string) {
    const { data, error } = await db
      .from(table)
      .select("*")
      .eq("id" as never, id)
      .maybeSingle();
    if (error) throw new Error("Could not load record");
    return data as unknown as Tables<T> | null;
  }
  return { allRows, balances, oneRow };
}
export async function allRows<T extends Table>(
  table: T,
  companyId?: string,
  filters?: Filters<T>,
  limit?: number,
) {
  return createRecordReader((await renderAdmin()).db).allRows(
    table,
    companyId,
    filters,
    limit,
  );
}
export async function balances(companyId?: string) {
  return createRecordReader((await renderAdmin()).db).balances(companyId);
}
export async function oneRow<T extends Table>(table: T, id: string) {
  return createRecordReader((await renderAdmin()).db).oneRow(table, id);
}

// List screens never need archived document snapshots, proposal bodies, or
// invoice notes. Keep search/pagination semantics while transferring list fields.
const listFields = {
  companies: [
    "id",
    "name",
    "code",
    "email",
    "currency",
    "archived",
    "created_at",
  ],
  services: [
    "parent_id",
    "billing_type",
    "id",
    "name",
    "description",
    "rate",
    "currency",
    "archived",
    "created_at",
  ],
  projects: [
    "id",
    "name",
    "company_id",
    "price",
    "currency",
    "state",
    "created_at",
  ],
  agreements: ["id", "name", "company_id", "currency", "active", "created_at"],
  proposals: [
    "id",
    "title",
    "number",
    "company_id",
    "price",
    "currency",
    "state",
    "created_at",
  ],
  invoices: [
    "first_sent_on",
    "id",
    "number",
    "company_id",
    "total",
    "currency",
    "state",
    "due_date",
    "created_at",
  ],
  payments: [
    "id",
    "receipt_number",
    "company_id",
    "amount",
    "currency",
    "state",
    "received_on",
    "method",
    "reference",
    "created_at",
  ],
  expenses: [
    "id",
    "description",
    "company_id",
    "invoice_id",
    "amount",
    "currency",
    "incurred_on",
    "created_at",
  ],
  notifications: ["id", "message", "created_at"],
} as const satisfies {
  [K in Collection]: readonly (keyof Tables<(typeof tableMap)[K]>)[];
};
export async function listRecords(collection: Collection) {
  const { db } = await renderAdmin();
  const rows: Record<string, import("@/lib/db/database.types").Json>[] = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await db
      .from(tableMap[collection])
      .select(listFields[collection].join(","))
      .order("id", { ascending: true })
      .range(start, start + 999);
    if (error) throw new RecordLoadError(tableMap[collection], error.code);
    const batch = data as unknown as typeof rows;
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}
