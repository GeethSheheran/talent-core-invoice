"use server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  loadCompanyEditor as readEditor,
  loadCompanyRecord as readRecord,
} from "@/lib/company-workspace";
export async function loadCompanyEditor(companyId: string, collection: string) {
  const { db } = await requireAdmin();
  return readEditor(db, companyId, collection);
}
export async function loadCompanyRecord(
  companyId: string,
  collection: string,
  recordId: string,
) {
  const { db } = await requireAdmin();
  return readRecord(db, companyId, collection, recordId);
}
