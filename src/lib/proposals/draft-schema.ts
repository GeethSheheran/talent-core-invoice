import { z } from "zod";
import { briefSchema, sectionSchema } from "@/lib/validation/schemas";
export const draftInput = z.object({
  source: z
    .string()
    .trim()
    .min(30, "Add at least 30 characters of project context.")
    .max(40000),
  company_id: z.uuid(),
  title: z.string().trim().min(1).max(160),
  currency: z.enum(["LKR", "USD", "EUR", "GBP", "AUD", "INR"]),
  price: z.number().int().min(0).max(1e12),
});
export const proposalDraft = z.object({
  brief: briefSchema,
  sections: z
    .array(sectionSchema.extend({ body: z.string().trim().min(1).max(4000) }))
    .min(1)
    .max(20),
  warnings: z.array(z.string().max(300)).max(20),
});
export type ProposalDraft = z.infer<typeof proposalDraft>;
