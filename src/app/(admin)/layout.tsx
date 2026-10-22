import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Sidebar } from "@/components/layout/sidebar";
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/login");
  }
  return (
    <div className="shell">
      <Sidebar />
      <div>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
