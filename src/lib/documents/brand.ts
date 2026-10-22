import "server-only";
import { requireAdmin } from "@/lib/auth/require-admin";
import { readFile } from "node:fs/promises";
import path from "node:path";
import config from "@root/config/brand.json";
import { brandSchema } from "@root/config/brand.schema";
import type { Json } from "@/lib/db/database.types";
export async function brandSnapshot(): Promise<Json> {
  const { db } = await requireAdmin();
  const { data: settings } = await db
    .from("settings")
    .select("data")
    .eq("id", "business")
    .single();
  const data = settings?.data;
  const custom =
    data && typeof data === "object" && !Array.isArray(data)
      ? data.brand
      : undefined;
  const brand = brandSchema.parse(custom || config);
  async function asset(file: string | null) {
    if (!file) return null;
    try {
      const bytes = await readFile(path.join(process.cwd(), "public", file));
      if (bytes.length > 2_000_000) throw new Error("Brand asset exceeds 2 MB");
      const ext = path.extname(file);
      const mime =
        ext === ".png"
          ? "image/png"
          : ext === ".woff2"
            ? "font/woff2"
            : ext === ".ttf"
              ? "font/ttf"
              : "image/jpeg";
      return "data:" + mime + ";base64," + bytes.toString("base64");
    } catch {
      return null;
    }
  }
  return {
    ...brand,
    logoData: await asset(brand.logo),
    fontData: await asset(brand.font),
  };
}
