import "server-only";
import { serverClient } from "@/lib/supabase/server";
import { configured } from "@/lib/env";
export class AccessError extends Error {
  constructor(public status: number) {
    super(
      status === 401 ? "Sign in required" : "Administrator access required",
    );
  }
}
export async function requireAdmin() {
  if (!configured()) throw new AccessError(401);
  const db = await serverClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) throw new AccessError(401);
  const { data: member } = await db
    .from("admin_members")
    .select("active")
    .eq("user_id", user.id)
    .single();
  if (!member?.active) throw new AccessError(403);
  return { db, user };
}
