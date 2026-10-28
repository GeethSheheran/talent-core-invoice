import { allRows } from "@/lib/db/repositories/records";
import { RecordEditor } from "@/components/record-editor";
import { ReminderSettings } from "@/components/reminder-settings";
import { BrandSettings } from "@/components/brand-settings";
import { brandSchema } from "@root/config/brand.schema";
import brand from "@root/config/brand.json";
import type { Json } from "@/lib/db/database.types";
import { SettingsNavigation } from "@/components/settings-navigation";
import { settingsSection } from "@/lib/settings-sections";
export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const section = settingsSection((await searchParams).section);
  const [settings, rules] = await Promise.all([
    allRows("settings"),
    allRows("notification_rules"),
  ]);
  const rule = rules.find((r) => r.active);
  return (
    <>
      <div className="heading">
        <div>
          <div className="eyebrow">Workspace configuration</div>
          <h1>Settings</h1>
          <p>Business identity and defaults for new documents.</p>
        </div>
      </div>
      <div className="company-workspace">
        <aside className="company-sidebar">
          <div className="eyebrow">Settings sections</div>
          <SettingsNavigation selected={section} />
        </aside>
        <div className="company-section" key={section}>
          {section === "business" && (
            <section id="business">
              <h2>Business & billing defaults</h2>
              <RecordEditor
                kind="settings"
                initial={settings[0]?.data as Record<string, Json>}
              />
            </section>
          )}
          {section === "branding" && (
            <section id="branding">
              <BrandSettings
                initial={brandSchema.parse(
                  (settings[0]?.data as Record<string, Json>)?.brand || brand,
                )}
              />
            </section>
          )}
          {section === "billing" && (
            <section className="card" id="billing">
              <h2>Billing policy</h2>
              <p>
                Default currency LKR. Each agreement may use another supported
                two-decimal currency. Invoice numbers are allocated at issue,
                using a company / year sequence. Recurring billing days range
                from 1–28; no automatic proration.
              </p>
            </section>
          )}
          {section === "notifications" && (
            <section id="notifications">
              <ReminderSettings
                intervals={rule?.intervals || [3, 6]}
                basis={rule?.basis || "sent"}
                repeat={rule?.repeat_days || null}
              />
            </section>
          )}
          {section === "integrations" && (
            <section className="card" id="integrations">
              <h2>Integrations</h2>
              <dl className="detail-list">
                <dt>Email provider</dt>
                <dd>
                  {process.env.EMAIL_PROVIDER === "resend"
                    ? "Resend (domain verification required)"
                    : "Mock — no real delivery"}
                </dd>
                <dt>Proposal drafting</dt>
                <dd>
                  Templates and manual editing available.{" "}
                  {process.env.AI_PROVIDER === "openai"
                    ? "OpenAI drafting configured."
                    : "AI drafting disabled."}
                </dd>
                <dt>Daily scheduler</dt>
                <dd>Vercel Cron · 03:30 UTC / 09:00 Asia/Colombo</dd>
              </dl>
              <p className="muted">
                Credentials and the administrator notification address are
                configured through environment variables, never in
                browser-visible settings.
              </p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
