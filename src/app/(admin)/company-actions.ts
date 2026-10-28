"use server";
import { z } from "zod";
import { colomboDate } from "@/lib/utils/dates";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  allRows,
  balances,
  oneRow,
  recordLoadMessage,
  tableMap,
} from "@/lib/db/repositories/records";
import { companyCollections } from "@/lib/company-sections";

export async function loadCompanyEditor(companyId: string, collection: string) {
  await requireAdmin();
  const id = z.uuid().parse(companyId);
  const key = z.enum(companyCollections).parse(collection);
  try {
    const company = await oneRow("companies", id);
    if (!company) return { error: "Company not found." };
    if (company.archived && key !== "payments")
      return { error: "Restore this company before adding records." };
    const [projects, services, pendingExpenses] = await Promise.all([
      ["agreements", "proposals", "invoices", "payments"].includes(key)
        ? allRows("projects", id)
        : [],
      ["agreements", "invoices"].includes(key)
        ? allRows("service_catalogue")
        : [],
      key === "invoices" ? allRows("company_expenses", id) : [],
    ]);
    // Check the feature before presenting a form that cannot be saved.
    if (key === "expenses" || key === "agreements")
      await allRows(tableMap[key], id);
    return {
      data: {
        initial: { company_id: id, currency: company.currency },
        companies: [{ id, name: company.name, currency: company.currency }],
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          currency: p.currency,
        })),
        services: services
          .filter((s) => !s.archived)
          .map((s) => ({
            name: s.name,
            description: s.description,
            rate: s.rate,
            currency: s.currency,
          })),
        pendingExpenses: pendingExpenses.filter((e) => !e.invoice_id),
      },
    };
  } catch (error) {
    return { error: recordLoadMessage(error) };
  }
}

export async function loadCompanyRecord(
  companyId: string,
  collection: string,
  recordId: string,
) {
  await requireAdmin();
  const company = z.uuid().parse(companyId);
  const key = z.enum(companyCollections).parse(collection);
  const id = z.uuid().parse(recordId);
  try {
    const row = await oneRow(tableMap[key], id);
    if (!row || row.company_id !== company)
      return { error: "Record not found for this company." };
    const invoices =
      key === "payments"
        ? (await balances())
            .filter((i) => i.company_id === company)
            .map((i) => {
              if (
                !i.id ||
                !i.company_id ||
                !i.currency ||
                !i.due_date ||
                i.outstanding == null
              )
                throw new Error("Incomplete balance");
              return {
                id: i.id,
                company_id: i.company_id,
                currency: i.currency,
                due_date: i.due_date,
                outstanding: i.outstanding,
                number: i.number,
              };
            })
        : [];
    const items =
      key === "invoices"
        ? (await allRows("invoice_items"))
            .filter((i) => i.invoice_id === id)
            .sort((a, b) => a.position - b.position)
        : [];
    const pendingExpenses =
      key === "invoices" && "state" in row && row.state === "draft"
        ? (await allRows("company_expenses", company))
            .filter(
              (expense) =>
                !expense.invoice_id &&
                expense.currency === row.currency &&
                expense.incurred_on <= colomboDate(),
            )
            .map(({ id, description, amount, currency, incurred_on }) => ({
              id,
              description,
              amount,
              currency,
              incurred_on,
            }))
        : [];
    return { data: { row, invoices, items, pendingExpenses } };
  } catch (error) {
    return { error: recordLoadMessage(error) };
  }
}
