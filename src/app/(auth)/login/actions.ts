"use server";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { configured, appUrl } from "@/lib/env";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";
export async function login(_: string, form: FormData) {
  if (!configured()) return "Complete Supabase setup first.";
  const input = z
    .object({ email: z.email(), password: z.string().min(8) })
    .safeParse(Object.fromEntries(form));
  if (!input.success) return "Enter a valid email and password.";
  const db = await serverClient();
  const { error } = await db.auth.signInWithPassword(input.data);
  if (error) return "Sign-in failed. Check your email and password.";
  try {
    await requireAdmin();
  } catch {
    await db.auth.signOut();
    return "This account is not an approved administrator.";
  }
  redirect("/dashboard");
}
export async function signOut() {
  const db = await serverClient();
  await db.auth.signOut();
  redirect("/login");
}
export async function recover(_: string, form: FormData) {
  const email = z.email().safeParse(form.get("email"));
  if (!email.success) return "Enter a valid email address.";
  if (!configured()) return "Complete Supabase setup first.";
  const db = await serverClient();
  await db.auth.resetPasswordForEmail(email.data, {
    redirectTo: appUrl() + "/auth/callback?next=/reset-password",
  });
  return "If the account is eligible, a recovery email will arrive shortly.";
}
export async function resetPassword(_: string, form: FormData) {
  const password = z.string().min(12).max(200).safeParse(form.get("password"));
  if (!password.success) return "Use at least 12 characters.";
  const db = await serverClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return "Open the recovery link from your email first.";
  const { error } = await db.auth.updateUser({ password: password.data });
  if (error)
    return "Password could not be updated. Request a new recovery link.";
  await db.auth.signOut();
  redirect("/login");
}
