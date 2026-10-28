"use client";
import Link from "@/components/navigation-link";
import { Plus, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
export function NewMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  return (
    <div
      className="new-menu"
      ref={root}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (
          event.pointerType === "mouse" &&
          !root.current?.contains(document.activeElement)
        )
          setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        type="button"
        ref={trigger}
        aria-expanded={open}
        aria-controls="new-record-options"
        onClick={() => setOpen(!open)}
      >
        <Plus size={17} aria-hidden="true" />
        New{" "}
        <ChevronDown className="menu-chevron" size={16} aria-hidden="true" />
      </button>
      <nav
        hidden={!open}
        inert={!open}
        id="new-record-options"
        className="new-menu-options"
        aria-label="Create new"
      >
        {[
          ["Company", "/companies/new"],
          ["Proposal", "/proposals/new"],
          ["Invoice", "/invoices/new"],
          ["Expense", "/expenses/new"],
          ["Receipt", "/payments/new"],
        ].map(([label, href]) => (
          <Link key={label} href={href} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
