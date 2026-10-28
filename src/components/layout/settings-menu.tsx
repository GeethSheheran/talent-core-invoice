"use client";
import { useRef, useState } from "react";
import { Settings } from "lucide-react";
import { SettingsNavigation } from "@/components/settings-navigation";
export function SettingsMenu() {
  const menu = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  function close() {
    menu.current?.hidePopover();
    setOpen(false);
  }
  return (
    <>
      <button
        ref={button}
        type="button"
        className="settings-menu-button"
        aria-label="Workspace settings"
        aria-controls="workspace-settings-menu"
        aria-expanded={open}
        onClick={() => {
          if (!menu.current || !button.current) return;
          if (menu.current.matches(":popover-open")) {
            close();
            return;
          }
          const rect = button.current.getBoundingClientRect();
          menu.current.style.left = `${Math.max(12, Math.min(rect.right - 260, window.innerWidth - 272))}px`;
          menu.current.style.top = `${Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - 290))}px`;
          menu.current.showPopover();
          setOpen(true);
        }}
      >
        <Settings size={18} aria-hidden="true" />
      </button>
      <div
        ref={menu}
        id="workspace-settings-menu"
        popover="auto"
        className="settings-menu"
        onToggle={(event) => setOpen(event.newState === "open")}
      >
        <div className="eyebrow">Workspace settings</div>
        <SettingsNavigation
          label="Settings quick navigation"
          onNavigate={close}
        />
      </div>
    </>
  );
}
