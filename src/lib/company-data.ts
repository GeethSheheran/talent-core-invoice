import "server-only";
import {
  allRows,
  balances,
  recordLoadMessage,
  tableMap,
} from "@/lib/db/repositories/records";
import type { CompanySection } from "@/lib/company-sections";
import type { Json } from "@/lib/db/database.types";
export async function loadCompanySection(id: string, section: CompanySection) {
  const result: {
    rows: Record<string, Json | undefined>[];
    balances: Awaited<ReturnType<typeof balances>>;
    error: string;
  } = { rows: [], balances: [], error: "" };
  try {
    if (section === "statement")
      result.balances = (await balances(id)).filter(
        (row) => row.company_id === id,
      );
    else if (section !== "overview")
      result.rows = (await allRows(tableMap[section], id)).sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
  } catch (error) {
    result.error = recordLoadMessage(error);
  }
  return result;
}
