"use client";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";

export function MobileNavigation() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => dialog.current?.close();
  useEffect(() => {
    const desktop = matchMedia("(min-width: 721px)");
    const resize = () => {
      if (desktop.matches) dialog.current?.close();
    };
    desktop.addEventListener("change", resize);
    return () => desktop.removeEventListener("change", resize);
  }, []);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="mobile-menu-toggle secondary icon-button"
        aria-label="Open navigation"
        aria-controls="mobile-navigation"
        aria-expanded={open}
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
      >
        <Menu size={22} aria-hidden="true" />
      </button>
      <dialog
        ref={dialog}
        id="mobile-navigation"
        className="mobile-navigation"
        aria-label="Workspace navigation"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
      >
        <div className="mobile-navigation-content">
          <button
            type="button"
            className="secondary icon-button mobile-menu-close"
            aria-label="Close navigation"
            onClick={close}
          >
            <X size={22} aria-hidden="true" />
          </button>
          <Sidebar mobile onNavigate={close} />
        </div>
      </dialog>
    </>
  );
}
