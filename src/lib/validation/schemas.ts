import { z } from "zod";
import { brandSchema } from "@root/config/brand.schema";
import { currencies } from "@/lib/billing/money";
const text = z.string().trim().max(4000);
const name = text.min(1).max(160);
const money = z.number().int().min(0).max(1e12);
const date = z.iso.date();
const currency = z.enum(currencies);
const uuid = z.uuid();
export const lineSchema = z.object({
  description: text.min(1),
  quantity: z
    .string()
    .regex(/^\d+(\.\d{1,3})?$/)
    .refine((v) => Number(v) > 0 && Number(v) <= 100000),
  rate: money,
  expense_id: uuid.nullable().optional(),
  discount: money.default(0),
  service_item_id: uuid.nullable().optional(),
  billing_type: z.enum(["monthly", "one-time"]).nullable().optional(),
});
const companyRef = {
  company_id: uuid,
  project_id: z.union([uuid, z.literal("")]).optional(),
  currency,
};
export const companySchema = z.object({
  name,
  email: z.union([z.email(), z.literal("")]),
  address: text,
  contact: text,
  currency,
  terms_days: z.number().int().min(0).max(365),
  archived: z.boolean().optional(),
});
export const packageItemSchema = z
  .object({
    id: uuid.optional(),
    service_id: uuid,
    name,
    description: text.optional().default(""),
    billing_type: z.enum(["one-time", "monthly"]).default("monthly"),
    quantity: z
      .string()
      .regex(/^\d+(\.\d{1,3})?$/)
      .refine((v) => Number(v) > 0 && Number(v) <= 100000),
    rate: money,
    discount: money.default(0),
    discount_type: z.enum(["amount", "percentage"]).optional(),
    discount_value: money.optional(),
  })
  .refine(
    (v) => v.discount_type !== "percentage" || (v.discount_value ?? 0) <= 10000,
    { message: "Percentage cannot exceed 100%" },
  );
export const projectSchema = z
  .object({
    ...companyRef,
    name,
    scope: text,
    price: money,
    advance: money,
    discount: money.optional().default(0),
    discount_type: z.enum(["amount", "percentage"]).optional(),
    discount_value: money.optional(),
    items: z.array(packageItemSchema).max(300).optional().default([]),
    state: z.enum(["active", "completed", "archived"]).optional(),
  })
  .refine((v) => v.advance <= v.price, {
    message: "Advance exceeds project price",
  });
export const agreementSchema = z.object({
  ...companyRef,
  name,
  billing_day: z.number().int().min(1).max(28).nullable().default(null),
  repeat: z.enum(["monthly", "annually"]).default("monthly"),
  reminder_days: z.number().int().min(0).max(365).nullable().default(null),
  starts_on: date,
  ends_on: z.union([date, z.literal("")]).optional(),
  effective_from: date,
  active: z.boolean().optional(),
  items: z.array(lineSchema).min(1).max(300),
});
export const expenseSchema = z.object({
  company_id: uuid,
  description: text.min(1),
  amount: money.positive(),
  currency,
  incurred_on: date,
});
export const invoiceSchema = z
  .object({
    ...companyRef,
    kind: z.enum(["one-off", "recurring", "advance", "balance"]),
    period: z
      .union([
        date.refine((v) => v.endsWith("-01"), "Select a billing month"),
        z.literal(""),
      ])
      .optional(),
    repeat: z.enum(["none", "monthly", "annually"]).default("none"),
    due_date: date,
    discount: money,
    tax_bps: z.number().int().min(0).max(10000),
    notes: text,
    items: z.array(lineSchema).max(300),
  })
  .refine((v) => v.repeat === "none" || Boolean(v.period), {
    message: "Choose a billing month for a repeating invoice",
    path: ["period"],
  })
  .refine(
    (v) => v.repeat === "none" || v.items.some((item) => !item.expense_id),
    {
      message: "A repeating invoice needs at least one recurring service",
      path: ["items"],
    },
  );
export const paymentSchema = z.object({
  ...companyRef,
  amount: money.positive(),
  received_on: date,
  method: z.enum(["bank", "cash", "cheque", "other"]),
  reference: text,
});
export const sectionSchema = z.object({ title: name, body: text });
export const briefSchema = z.object({
  needs: text,
  goals: text,
  scope: text,
  deliverables: text,
  exclusions: text,
  timeline: text,
  payment_schedule: text,
  maintenance: text,
  future_options: text,
});
export const proposalSchema = z.object({
  ...companyRef,
  title: name,
  price: money,
  brief: briefSchema,
  sections: z.array(sectionSchema).min(1).max(30),
});
export const settingsSchema = z.object({
  billing_day: z.number().int().min(1).max(28).default(1),
  invoice_notice_days: z.number().int().min(0).max(365).default(7),
  name,
  address: text,
  email: z.union([z.email(), z.literal("")]),
  bank_details: text,
  notes: text,
  currency,
  terms_days: z.number().int().min(0).max(365),
  timezone: z.literal("Asia/Colombo"),
  proposal_prompt: text.max(4000),
  brand: brandSchema.optional(),
  number_format: z
    .string()
    .max(100)
    .regex(/^[A-Za-z0-9{}_-]+$/)
    .refine((v) =>
      ["{type}", "{company}", "{year}", "{sequence}"].every((t) =>
        v.includes(t),
      ),
    )
    .default("{type}-{company}-{year}-{sequence}"),
});
export const serviceSchema = z.object({
  name,
  description: text,
  rate: money,
  currency,
  billing_type: z.enum(["one-time", "monthly"]).default("monthly"),
  parent_id: z
    .union([uuid, z.literal("")])
    .nullable()
    .optional(),
  archived: z.boolean().optional(),
});
export const schemas = {
  expense: expenseSchema,
  company: companySchema,
  project: projectSchema,
  agreement: agreementSchema,
  invoice: invoiceSchema,
  payment: paymentSchema,
  proposal: proposalSchema,
  settings: settingsSchema,
  service: serviceSchema,
};
export type RecordKind = keyof typeof schemas;
export const allocationsSchema = z
  .array(z.object({ invoice_id: uuid, amount: money.positive() }))
  .max(300);
