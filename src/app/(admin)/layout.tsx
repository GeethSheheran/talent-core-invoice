import Link from "next/link";
import { PanelLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { NotificationMenu } from "@/components/layout/notification-menu";
import { SettingsMenu } from "@/components/layout/settings-menu";
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
      <a className="skip-link button" href="#main-content">
        Skip to content
      </a>
      <Sidebar />
      <div>
        <header className="workspace-bar">
          <Link href="/dashboard" className="workspace-identity">
            <PanelLeft size={18} aria-hidden="true" />
            Ledger <span className="muted">/ Workspace</span>
          </Link>
          <div className="workspace-tools">
            <span>Administrator</span>
            <NotificationMenu />
            <SettingsMenu />
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="content">
          {children}
        </main>
      </div>
    </div>
  );
}
