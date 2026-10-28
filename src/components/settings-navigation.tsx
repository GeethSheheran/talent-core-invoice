import Link from "@/components/navigation-link";
import { Building2, Palette, Receipt, Bell, Plug } from "lucide-react";
import {
  settingsSections,
  type SettingsSection,
} from "@/lib/settings-sections";
const icons = {
  business: Building2,
  branding: Palette,
  billing: Receipt,
  notifications: Bell,
  integrations: Plug,
};
export function SettingsNavigation({
  selected,
  onNavigate,
  label = "Settings sections",
}: {
  selected?: SettingsSection;
  onNavigate?: () => void;
  label?: string;
}) {
  return (
    <nav className="settings-section-nav" aria-label={label}>
      {settingsSections.map((section) => {
        const Icon = icons[section];
        return (
          <Link
            key={section}
            href={`/settings?section=${section}`}
            aria-current={selected === section ? "page" : undefined}
            onClick={onNavigate}
            scroll={false}
          >
            <Icon size={18} aria-hidden="true" />
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </Link>
        );
      })}
    </nav>
  );
}
