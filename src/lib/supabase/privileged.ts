import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/db/database.types";
export function privileged() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("Server Supabase key is not configured");
  return createClient<Database>(publicEnv().url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
