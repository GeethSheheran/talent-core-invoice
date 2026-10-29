"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  schemas,
  type RecordKind,
  allocationsSchema,
} from "@/lib/validation/schemas";
import type { Json } from "@/lib/db/database.types";
import { brandSnapshot } from "@/lib/documents/brand";
import { z } from "zod";
const paths: Record<RecordKind, string> = {
  expense: "expenses",
  company: "companies",
  service: "services",
  project: "projects",
  agreement: "agreements",
  invoice: "invoices",
  payment: "payments",
  proposal: "proposals",
  settings: "settings",
};
async function persistRecord(form: FormData, companyId?: string) {
  const { db } = await requireAdmin();
  const kind = z
    .enum([
      "expense",
      "company",
      "service",
      "project",
      "agreement",
      "invoice",
      "payment",
      "proposal",
      "settings",
    ])
    .parse(form.get("kind"));
  let id: string | null = null;
  try {
    const raw = JSON.parse(String(form.get("payload")));
    const data = schemas[kind].parse(raw);
    if (companyId && (!("company_id" in data) || data.company_id !== companyId))
      return { error: "The record must belong to this company." };
    const supplied = form.get("id");
    id = supplied ? z.uuid().parse(supplied) : null;
    const result = await db.rpc("save_record", {
      p_kind: kind,
      p_id: id,
      p_data: data as Json,
    });
    if (result.error) return { error: result.error.message };
    id = result.data;
  } catch (error) {
    return {
      error:
        error instanceof z.ZodError
          ? error.issues
              .map((i) => i.path.join(".") + ": " + i.message)
              .join("; ")
          : "Invalid form data.",
    };
  }
  revalidatePath("/", "layout");
  return { id: id!, kind };
}
export async function saveCompanyRecord(companyId: string, form: FormData) {
  await requireAdmin();
  const company = z.uuid().parse(companyId);
  // Company dialogs only create records; editing cannot be redirected to another owner.
  if (form.get("id"))
    return { error: "Use the record editor to edit an existing record." };
  return persistRecord(form, company);
}
export async function saveRecord(_: string, form: FormData) {
  const result = await persistRecord(form);
  if ("error" in result) return result.error || "Unable to save.";
  const { kind, id } = result;
  redirect(
    "/" +
      paths[kind] +
      (kind === "settings" || kind === "service" ? "" : "/" + id),
  );
}
export async function financialAction(_: string, form: FormData) {
  const { db } = await requireAdmin();
  const action = z.string().parse(form.get("action"));
  const id = z.uuid().parse(form.get("id"));
  try {
    let error: { message: string } | null = null;
    if (action === "attach_pending_expenses") {
      const expenses = z
        .array(
          z.object({
            id: z.uuid(),
            amount: z.number().int().positive().max(1e12),
          }),
        )
        .min(1)
        .max(300)
        .parse(JSON.parse(String(form.get("expenses"))));
      ({ error } = await db.rpc("attach_pending_expenses", {
        p_invoice: id,
        p_expenses: expenses,
      }));
      if (error && "code" in error && error.code === "PGRST202")
        return "Expense attachment needs the latest database update. Your draft has not changed.";
    } else if (action === "issue_invoice")
      ({ error } = await db.rpc("issue_invoice", {
        p_id: id,
        p_brand: await brandSnapshot(),
      }));
    else if (action === "issue_proposal")
      ({ error } = await db.rpc("issue_proposal", {
        p_id: id,
        p_brand: await brandSnapshot(),
      }));
    else if (action === "accept_proposal")
      ({ error } = await db.rpc("accept_proposal", { p_id: id }));
    else if (action === "confirm_payment")
      ({ error } = await db.rpc("confirm_payment", {
        p_id: id,
        p_allocations: allocationsSchema.parse(
          JSON.parse(String(form.get("allocations"))),
        ),
        p_brand: await brandSnapshot(),
      }));
    else if (action === "allocate_credit")
      ({ error } = await db.rpc("allocate_credit", {
        p_id: id,
        p_allocations: allocationsSchema.parse(
          JSON.parse(String(form.get("allocations"))),
        ),
        p_key: z.uuid().parse(form.get("key")),
      }));
    else if (action === "reverse_payment")
      ({ error } = await db.rpc("reverse_payment", {
        p_id: id,
        p_reason: z.string().min(5).max(1000).parse(form.get("reason")),
      }));
    else if (action === "void_invoice")
      ({ error } = await db.rpc("void_invoice", {
        p_id: id,
        p_reason: z.string().min(5).max(1000).parse(form.get("reason")),
      }));
    else if (action === "apply_credit")
      ({ error } = await db.rpc("apply_credit", {
        p_invoice: id,
        p_amount: z.coerce
          .number()
          .int()
          .positive()
          .max(1e12)
          .parse(form.get("amount")),
        p_reason: z.string().min(5).max(1000).parse(form.get("reason")),
        p_key: z.uuid().parse(form.get("key")),
      }));
    else if (action === "mark_external")
      ({ error } = await db.rpc("mark_external", {
        p_id: id,
        p_channel: z
          .enum(["WhatsApp", "email", "other"])
          .parse(form.get("channel")),
      }));
    else if (action === "pause_reminders")
      ({ error } = await db.rpc("pause_reminders", {
        p_id: id,
        p_pause: form.get("pause") === "true",
      }));
    else if (action === "monthly_draft")
      ({ error } = await db.rpc("generate_monthly_draft", {
        p_agreement: id,
        p_period: z.iso.date().parse(form.get("period")),
      }));
    else if (action === "send_invoice")
      ({ error } = await db.rpc("queue_invoice_email", { p_id: id }));
    else if (action === "apply_available_credit")
      ({ error } = await db.rpc("apply_available_credit", { p_invoice: id }));
    else return "Unknown action";
    if (error) return error.message;
  } catch {
    return "Check the values and try again.";
  }
  revalidatePath("/", "layout");
  return "Saved successfully.";
}
export async function saveReminderRule(_: string, form: FormData) {
  const { db } = await requireAdmin();
  try {
    const intervals = z
      .array(z.number().int().min(1).max(365))
      .min(1)
      .max(12)
      .parse(String(form.get("intervals")).split(",").map(Number));
    const basis = z.enum(["sent", "due"]).parse(form.get("basis"));
    const repeat = String(form.get("repeat") || "");
    const { error } = await db.rpc("save_reminder_rule", {
      p_intervals: intervals,
      p_basis: basis,
      p_repeat: repeat
        ? z.coerce.number().int().min(1).max(365).parse(repeat)
        : null,
    });
    if (error) return error.message;
    revalidatePath("/settings");
    return "Rule saved. It applies to dates from tomorrow; no backlog burst.";
  } catch {
    return "Use comma-separated day intervals between 1 and 365.";
  }
}

export async function saveBrand(_: string, form: FormData) {
  const { db } = await requireAdmin();
  try {
    const { brandSchema } = await import("@root/config/brand.schema");
    const brand = brandSchema.parse(JSON.parse(String(form.get("brand"))));
    const { data } = await db
      .from("settings")
      .select("data")
      .eq("id", "business")
      .single();
    const current = data?.data;
    if (!current || typeof current !== "object" || Array.isArray(current))
      return "Business settings are missing";
    const { error } = await db.rpc("save_record", {
      p_kind: "settings",
      p_id: null,
      p_data: { ...current, brand },
    });
    if (error) return error.message;
    revalidatePath("/settings");
    return "Brand saved for new documents.";
  } catch {
    return "Check colors and local asset paths.";
  }
}
export async function runPendingJobs() {
  await requireAdmin();
  const { processOutbox } = await import("@/lib/notifications/outbox");
  await processOutbox();
  revalidatePath("/notifications");
}

export async function deleteService(id: string) {
  const { db } = await requireAdmin();
  const { error } = await db.rpc("delete_service", { p_id: z.uuid().parse(id) });
  if (error) return error.message;
  revalidatePath("/services");
  return "";
}
