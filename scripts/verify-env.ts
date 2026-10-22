import { z } from "zod";
const env = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(10),
    SUPABASE_SECRET_KEY: z.string().min(10),
    APP_URL: z.url(),
    EMAIL_PROVIDER: z.enum(["mock", "resend"]).default("mock"),
    AI_PROVIDER: z.enum(["disabled", "openai"]).default("disabled"),
  })
  .safeParse(process.env);
if (!env.success) {
  console.error(
    "Configuration needs attention:",
    env.error.issues.map((i) => i.path.join(".")).join(", "),
  );
  process.exit(1);
}
if (
  env.data.EMAIL_PROVIDER === "resend" &&
  (!process.env.EMAIL_API_KEY || !process.env.EMAIL_FROM)
) {
  console.error("Resend requires EMAIL_API_KEY and EMAIL_FROM");
  process.exit(1);
}
if (
  process.env.ENABLE_PRODUCTION_JOBS === "true" &&
  (!process.env.CRON_SECRET || !process.env.ADMIN_NOTIFICATION_EMAIL)
) {
  console.error(
    "Production jobs require CRON_SECRET and ADMIN_NOTIFICATION_EMAIL",
  );
  process.exit(1);
}
console.log(
  "Required environment variables are valid. Secrets were not printed.",
);
