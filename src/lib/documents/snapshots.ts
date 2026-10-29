import { z } from "zod";
import { brandSchema } from "@root/config/brand.schema";
const amount = z.number().int();
const business = z.object({
  name: z.string().default("Your business"),
  address: z.string().default(""),
  email: z.string().default(""),
  bank_details: z.string().default(""),
  notes: z.string().default(""),
});
const company = z.object({
  name: z.string(),
  code: z.string(),
  address: z.string(),
  email: z.string(),
  currency: z.string(),
});
const brand = brandSchema.extend({
  logoData: z
    .string()
    .regex(/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/)
    .nullable()
    .optional(),
  fontData: z
    .string()
    .regex(/^data:font\/(woff2|ttf);base64,[A-Za-z0-9+/=]+$/)
    .nullable()
    .optional(),
});
export const snapshotSchema = z.object({
  kind: z.enum(["invoice", "proposal", "receipt", "statement"]),
  business,
  company,
  brand,
  invoice: z
    .object({
      number: z.string().nullable(),
      currency: z.string(),
      issued_at: z.string().nullable(),
      due_date: z.string(),
      period: z.string().nullable(),
      subtotal: amount,
      discount: amount,
      tax: amount,
      total: amount,
      credit_applied: amount.optional(),
      balance_at_issue: amount.optional(),
      notes: z.string(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.union([z.string(), z.number()]),
        rate: amount,
        amount: amount,
        discount: amount.default(0),
      }),
    )
    .optional(),
  references: z
    .array(z.object({ number: z.string(), amount: amount }))
    .optional(),
  payment: z
    .object({
      receipt_number: z.string().nullable(),
      currency: z.string(),
      amount: amount,
      received_on: z.string(),
      method: z.string(),
      reference: z.string(),
    })
    .optional(),
  allocations: z
    .array(
      z.object({ number: z.string(), amount: amount, outstanding: amount }),
    )
    .optional(),
  unallocated: amount.optional(),
  proposal: z
    .object({
      number: z.string().nullable(),
      title: z.string(),
      currency: z.string(),
      price: amount,
      sections: z.array(z.object({ title: z.string(), body: z.string() })),
      brief: z.record(z.string(), z.string()),
    })
    .optional(),
  statement: z
    .object({
      as_of: z.string(),
      currency: z.string(),
      invoices: z.array(
        z.object({
          number: z.string(),
          total: amount,
          outstanding: amount,
          due_date: z.string(),
        }),
      ),
      credit: amount,
    })
    .optional(),
});
export type Snapshot = z.infer<typeof snapshotSchema>;
