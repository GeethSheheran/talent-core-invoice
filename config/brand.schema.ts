import { z } from "zod";
const asset = z
  .string()
  .regex(/^\/brand\/[a-zA-Z0-9_\-/]+\.(png|jpg|jpeg|woff2|ttf)$/)
  .refine((v) => !v.includes(".."));
export const brandSchema = z.object({
  version: z.string().min(1).max(80),
  name: z.string().min(1).max(80),
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  ink: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  logo: asset.nullable(),
  font: asset.nullable(),
  documentTitle: z.string().max(100),
});
export type Brand = z.infer<typeof brandSchema>;
