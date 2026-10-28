import Link from "@/components/navigation-link";
import { PanelLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { renderAdmin } from "@/lib/auth/render-admin";
import { WorkspaceTitle } from "@/components/layout/workspace-title";
import { NotificationMenu } from "@/components/layout/notification-menu";
import { SettingsMenu } from "@/components/layout/settings-menu";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await renderAdmin();
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
          <MobileNavigation />
          <Link href="/dashboard" className="workspace-identity">
            <PanelLeft size={18} aria-hidden="true" />
            Ledger <WorkspaceTitle />
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
