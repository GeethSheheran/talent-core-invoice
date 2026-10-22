import "server-only";
import { z } from "zod";
export function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
export function publicEnv() {
  return z.object({ url: z.url(), key: z.string().min(10) }).parse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
export function productionJobs() {
  return (
    process.env.VERCEL_ENV === "production" &&
    process.env.ENABLE_PRODUCTION_JOBS === "true"
  );
}
export function appUrl() {
  return z.url().parse(process.env.APP_URL || "http://localhost:3000");
}

export function validateRuntimeEnvironment() {
  // An entirely unconfigured checkout serves the setup page. Partial
  // configurations fail explicitly without including values in the error.
  const hasConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!hasConfig) return;
  const result = z
    .object({
      NEXT_PUBLIC_SUPABASE_URL: z.url(),
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(10),
      SUPABASE_SECRET_KEY: z.string().min(10),
      EMAIL_PROVIDER: z.enum(["mock", "resend"]).default("mock"),
      AI_PROVIDER: z.enum(["disabled", "openai"]).default("disabled"),
    })
    .safeParse(process.env);
  if (!result.success) {
    throw new Error(
      "Invalid configuration: " +
        result.error.issues.map((i) => i.path.join(".")).join(", "),
    );
  }
  appUrl();
  if (
    result.data.EMAIL_PROVIDER === "resend" &&
    (!process.env.EMAIL_API_KEY || !process.env.EMAIL_FROM)
  ) {
    throw new Error("Resend requires EMAIL_API_KEY and EMAIL_FROM");
  }
  if (
    productionJobs() &&
    (!process.env.CRON_SECRET || !process.env.ADMIN_NOTIFICATION_EMAIL)
  ) {
    throw new Error(
      "Production jobs require CRON_SECRET and ADMIN_NOTIFICATION_EMAIL",
    );
  }
}
