export const settingsSections = [
  "business",
  "branding",
  "billing",
  "notifications",
  "integrations",
] as const;
export type SettingsSection = (typeof settingsSections)[number];
export function settingsSection(value?: string): SettingsSection {
  return settingsSections.includes(value as SettingsSection)
    ? (value as SettingsSection)
    : "business";
}
