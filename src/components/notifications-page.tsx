import { allRows } from "@/lib/db/repositories/records";
import { runPendingJobs } from "@/app/(admin)/actions";
import {
  buildActivityFeed,
  type ActivityTarget,
} from "@/lib/notifications/feed";
import { NotificationFeed } from "@/components/notification-feed";
export async function NotificationsPage() {
  const [
    audits,
    reminders,
    deliveries,
    jobs,
    documents,
    runs,
    companies,
    invoices,
    payments,
    proposals,
    projects,
    agreements,
    services,
    expenses,
  ] = await Promise.all([
    allRows("audit_logs"),
    allRows("notification_events"),
    allRows("delivery_attempts"),
    allRows("outbox_jobs"),
    allRows("document_files"),
    allRows("job_runs"),
    allRows("companies"),
    allRows("invoices"),
    allRows("payments"),
    allRows("proposals"),
    allRows("projects"),
    allRows("agreements"),
    allRows("service_catalogue"),
    allRows("company_expenses"),
  ]);
  const names = Object.fromEntries(companies.map((row) => [row.id, row.name]));
  const targets: Record<string, ActivityTarget> = {};
  for (const row of companies)
    targets[row.id] = {
      label: row.name,
      href: "/companies/" + row.id,
      company: row.name,
    };
  for (const [collection, rows] of [
    ["invoices", invoices],
    ["payments", payments],
    ["proposals", proposals],
    ["projects", projects],
    ["agreements", agreements],
    ["services", services],
    ["expenses", expenses],
  ] as const) {
    for (const row of rows)
      targets[row.id] = {
        label: String(
          ("number" in row && row.number) ||
            ("receipt_number" in row && row.receipt_number) ||
            ("title" in row && row.title) ||
            ("name" in row && row.name) ||
            ("description" in row && row.description) ||
            (collection === "payments" ? "Pending payment" : "Draft invoice"),
        ),
        href: "/" + collection + "/" + row.id,
        company: "company_id" in row ? names[row.company_id] || "" : "",
      };
  }
  return (
    <>
      <div className="heading">
        <h1>Notifications</h1>
      </div>
      <NotificationFeed
        items={buildActivityFeed(
          { audits, reminders, deliveries, jobs, documents, runs },
          targets,
        )}
      />
      <details className="activity-operations">
        <summary>Email processing</summary>
        <p className="muted">
          Process queued email and reminder jobs.{" "}
          {process.env.EMAIL_PROVIDER !== "resend"
            ? "Email is in test mode; no live delivery is recorded."
            : "The configured email provider and environment settings control delivery."}
        </p>
        <form action={runPendingJobs}>
          <button className="secondary">Process pending jobs</button>
        </form>
      </details>
    </>
  );
}
