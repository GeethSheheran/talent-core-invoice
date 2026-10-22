"use client";
import Link from "next/link";
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
export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <Link className="wordmark" href="/dashboard">
        <span className="mark">L</span>ledger
        <span style={{ color: "#78945a" }}>.</span>
      </Link>
      <div className="eyebrow" style={{ padding: "0 13px 12px" }}>
        Workspace
      </div>
      <nav aria-label="Main navigation">
        {links.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={"nav-link " + (path.startsWith(href) ? "active" : "")}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <form action={signOut}>
          <button className="sidebar-signout" type="submit">
            <LogOut size={18} aria-hidden="true" />
            Sign out
          </button>
        </form>
        <div className="sidebar-foot">
          <strong>Private workspace</strong>
          <br />
          Administrator access only
          <br />
          <span className="muted">Asia / Colombo</span>
        </div>
      </div>
    </aside>
  );
}
