export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
export default async function Home() {
  let admin = false;
  try {
    await requireAdmin();
    admin = true;
  } catch {}
  redirect(admin ? "/dashboard" : "/login");
}
