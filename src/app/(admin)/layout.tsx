import { LiveBillingRefresh } from "@/components/live-billing-refresh";
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
  let userId: string;
  try {
    userId = (await renderAdmin()).user.id;
  } catch {
    redirect("/login");
  }
  return (
    <div className="shell">
      <LiveBillingRefresh />
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
            <NotificationMenu userId={userId} />
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
