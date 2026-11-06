import { createHash } from "node:crypto";
import groups from "./workbook-catalogue.json";
import type { Json, Tables } from "@/lib/db/database.types";

type Service = Pick<
  Tables<"service_catalogue">,
  "id" | "name" | "parent_id" | "currency" | "archived"
>;
type Counts = { added: number; existing: number };
export type WorkbookImportStore = {
  atomic: () => Promise<{ data: Json | null; error: { code?: string } | null }>;
  list: () => Promise<Service[]>;
  save: (id: string, data: Record<string, Json>) => Promise<void>;
};

// A fixed UUIDv5 namespace makes interrupted/repeated imports target the same
// records. Existing rows are always read first and never intentionally rewritten.
function workbookId(name: string) {
  const namespace = Buffer.from("3dd3e82348b54e64ad4c9a8e565df72e", "hex");
  const bytes = createHash("sha1")
    .update(namespace)
    .update(name)
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
const key = (name: string) => name.trim().toLowerCase();

export async function importWorkbookCatalogue(
  store: WorkbookImportStore,
): Promise<
  { result: Counts; error?: undefined } | { error: string; result?: undefined }
> {
  let fallback = false;
  const counts: Counts = { added: 0, existing: 0 };
  try {
    const result = await store.atomic();
    if (!result.error) return { result: result.data as Counts };
    // Only an explicitly missing RPC permits the older-schema path. Never
    // downgrade authorization, validation or other database failures.
    if (result.error.code !== "PGRST202") {
      return {
        error:
          "The workbook could not be imported. Check your access and database connection, then retry.",
      };
    }
    fallback = true;
    let rows = await store.list();
    // Do not silently flatten a catalogue whose hierarchy migration is missing.
    if (rows.some((row) => !("parent_id" in row))) {
      return {
        error:
          "The service hierarchy update is still missing. Apply supabase/services-upgrade.sql before importing.",
      };
    }
    const ensure = async (
      name: string,
      parent: string | null,
      description: string,
      rate: number | null,
      billing: string,
    ) => {
      const id = workbookId(`LKR/${parent || "main"}/${key(name)}`);
      const find = () =>
        rows.find((row) => row.id === id) ||
        rows.find(
          (row) =>
            row.currency === "LKR" &&
            row.parent_id === parent &&
            key(row.name) === key(name) &&
            (parent !== null || !row.archived),
        );
      let existing = find();
      if (!existing) {
        // Refresh before each creation to respect edits and other imports.
        rows = await store.list();
        existing = find();
      }
      if (existing) {
        if (
          !parent &&
          (existing.archived ||
            existing.parent_id ||
            existing.currency !== "LKR")
        ) {
          throw new Error(
            "Imported main service was changed; review it before retrying.",
          );
        }
        counts.existing++;
        return existing.id;
      }
      await store.save(id, {
        name,
        description,
        rate: rate ?? 0,
        currency: "LKR",
        parent_id: parent,
        billing_type: billing,
        archived: parent !== null && rate === null,
      });
      rows.push({
        id,
        name,
        parent_id: parent,
        currency: "LKR",
        archived: parent !== null && rate === null,
      });
      counts.added++;
      return id;
    };
    for (const group of groups) {
      const parent = await ensure(
        group.name,
        null,
        group.description,
        0,
        "monthly",
      );
      for (const child of group.children) {
        await ensure(
          child.name,
          parent,
          child.description,
          child.rate,
          child.billing_type,
        );
      }
    }
    return { result: counts };
  } catch {
    return {
      error: fallback
        ? `Import stopped after ${counts.added} services were saved. Existing services were kept. Retry to continue; already imported services will be skipped.`
        : "Import could not be confirmed. Check your connection and retry; existing services will be kept.",
    };
  }
}
