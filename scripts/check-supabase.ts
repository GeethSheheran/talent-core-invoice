import { z } from "zod";

const url = z.url().parse(process.env.NEXT_PUBLIC_SUPABASE_URL);
const publishable = z
  .string()
  .min(10)
  .parse(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const secret = z.string().min(10).parse(process.env.SUPABASE_SECRET_KEY);

// Read-only checks. Never print keys, response bodies, or user/client records.
async function probe(label: string, path: string, key?: string) {
  try {
    const response = await fetch(new URL(path, url), {
      headers: key ? { apikey: key } : {},
      signal: AbortSignal.timeout(15000),
    });
    const body: unknown = await response.json().catch(() => null);
    const code = z.object({ code: z.string().max(30) }).safeParse(body);
    console.log(
      JSON.stringify({
        check: label,
        status: response.status,
        ...(code.success ? { code: code.data.code } : {}),
      }),
    );
    return response.ok;
  } catch {
    console.log(JSON.stringify({ check: label, status: "network_error" }));
    return false;
  }
}
const results = await Promise.all([
  probe("Auth / publishable key", "/auth/v1/settings", publishable),
  probe("Signing keys", "/auth/v1/.well-known/jwks.json"),
  probe(
    "Billing schema / server key",
    "/rest/v1/companies?select=id&limit=0",
    secret,
  ),
  probe(
    "Expenses API / publishable key",
    "/rest/v1/company_expenses?select=id&limit=0",
    publishable,
  ),
  probe(
    "Expenses schema / server key",
    "/rest/v1/company_expenses?select=id&limit=0",
    secret,
  ),
  probe(
    "Recurring schedule schema / server key",
    "/rest/v1/agreements?select=repeat,reminder_days,discount,tax_bps,notes&limit=0",
    secret,
  ),
]);
if (results.some((ok) => !ok)) {
  console.error(
    "Supabase setup is incomplete. If a schema check reports PGRST205 or 42703, apply the pending migrations to the configured project before using the application. See docs/supabase-setup.md.",
  );
  process.exitCode = 1;
}
