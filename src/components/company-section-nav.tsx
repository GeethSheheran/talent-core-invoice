"use client";
import Link from "@/components/navigation-link";
import { useLayoutEffect, useRef } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Repeat,
  FileText,
  Receipt,
  Wallet,
  ScrollText,
} from "lucide-react";
import {
  companySections,
  sectionLabels,
  type CompanySection,
} from "@/lib/company-sections";
const icons = {
  overview: LayoutDashboard,
  projects: FolderOpen,
  agreements: Repeat,
  proposals: FileText,
  invoices: Receipt,
  payments: Wallet,
  expenses: ScrollText,
  statement: FileText,
};
export function CompanySectionNav({
  companyId,
  selected,
  label = "Company sections",
  onNavigate,
}: {
  companyId: string;
  selected: CompanySection;
  label?: string;
  onNavigate?: () => void;
}) {
  const nav = useRef<HTMLElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const root = nav.current;
    if (!root) return;
    const update = () => {
      const active = root.querySelector<HTMLElement>('[aria-current="page"]');
      const indicator = marker.current;
      if (!active || !indicator) return;
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.height = `${active.offsetHeight}px`;
      indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, [selected]);
  return (
    <nav ref={nav} className="company-section-nav" aria-label={label}>
      <span ref={marker} className="company-nav-indicator" aria-hidden="true" />
      {companySections.map((section) => {
        const Icon = icons[section];
        return (
          <Link
            key={section}
            href={`/companies/${companyId}?section=${section}`}
            aria-current={selected === section ? "page" : undefined}
            scroll={false}
            onClick={onNavigate}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{sectionLabels[section]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
