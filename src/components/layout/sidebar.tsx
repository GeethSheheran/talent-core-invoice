"use client";
import Link from "@/components/navigation-link";
import { signOut } from "@/app/(auth)/login/actions";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Layers,
  FolderOpen,
  Repeat,
  FileText,
  Receipt,
  Wallet,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
const links = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/companies", "Companies", Building2],
  ["/services", "Services", Layers],
  ["/projects", "Projects", FolderOpen],
  ["/agreements", "Agreements", Repeat],
  ["/proposals", "Proposals", FileText],
  ["/invoices", "Invoices", Receipt],
  ["/payments", "Payments", Wallet],
  ["/expenses", "Expenses", Wallet],
  ["/notifications", "Notifications", Bell],
  ["/settings", "Settings", Settings],
] as const;
export function Sidebar({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const path = usePathname();
  return (
    <aside
      className={mobile ? "sidebar mobile-sidebar" : "sidebar desktop-sidebar"}
    >
      <Link className="wordmark" href="/dashboard" onClick={onNavigate}>
        <span className="mark">L</span>ledger
        <span className="muted">.</span>
      </Link>
      <div className="eyebrow" style={{ padding: "0 13px 12px" }}>
        Workspace
      </div>
      <nav aria-label="Main navigation">
        {links.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={path.startsWith(href) ? "page" : undefined}
            className={"nav-link " + (path.startsWith(href) ? "active" : "")}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-foot">
          <strong>Private workspace</strong>
          <br />
          Administrator access only
          <br />
          <span className="muted">Asia / Colombo</span>
        </div>
        <form action={signOut} onSubmit={onNavigate}>
          <button className="sidebar-signout" type="submit">
            <LogOut size={18} aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
