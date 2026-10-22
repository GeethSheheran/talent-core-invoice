import type { Tables, Json } from "@/lib/db/database.types";
export type ActivityItem = {
  id: string;
  category: "changes" | "reminders" | "delivery" | "documents" | "system";
  title: string;
  message: string;
  status: string;
  date: string;
  company: string;
  href?: string;
  record?: string;
  details: { label: string; value: string }[];
};
export type ActivityTarget = { label: string; href: string; company: string };
export type FeedSources = {
  audits: Tables<"audit_logs">[];
  reminders: Tables<"notification_events">[];
  deliveries: Tables<"delivery_attempts">[];
  jobs: Tables<"outbox_jobs">[];
  documents: Tables<"document_files">[];
  runs: Tables<"job_runs">[];
};
function object(value: Json): Record<string, Json | undefined> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}
function words(value: string) {
  const text = value.replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
const actions: Record<string, string> = {
  issue_invoice: "Invoice issued",
  confirm_payment: "Payment confirmed",
  allocate_credit: "Payment credit allocated",
  reverse_payment: "Payment reversed",
  apply_credit: "Credit correction applied",
  void_invoice: "Invoice voided",
  issue_proposal: "Proposal issued",
  accept_proposal: "Proposal accepted",
  mark_external: "Invoice sent externally",
};
export function buildActivityFeed(
  source: FeedSources,
  targets: Record<string, ActivityTarget>,
): ActivityItem[] {
  const target = (id: string | null | undefined) =>
    id ? targets[id] : undefined;
  const related = (item: ActivityTarget | undefined) => ({
    company: item?.company || "",
    href: item?.href,
    record: item?.label,
  });
  const deliveries = Object.fromEntries(
    source.deliveries.map((row) => [row.id, row]),
  );
  const items: ActivityItem[] = [
    ...source.audits.map((row) => {
      const detail = object(row.detail);
      const ref = target(
        typeof detail.payment_id === "string"
          ? detail.payment_id
          : row.record_id,
      );
      const title =
        actions[row.action] ||
        (row.action.startsWith("save_")
          ? words(row.action.slice(5)) + " saved"
          : words(row.action));
      return {
        id: "change:" + row.id,
        category: "changes" as const,
        title,
        message: ref ? `${title}: ${ref.label}.` : `${title}.`,
        status: "recorded",
        date: row.created_at,
        ...related(ref),
        details: Object.entries(detail).map(([label, value]) => ({
          label: words(label),
          value:
            typeof value === "string" ? value : JSON.stringify(value) || "—",
        })),
      };
    }),
    ...source.reminders.map((row) => ({
      id: "reminder:" + row.id,
      category: "reminders" as const,
      title:
        row.channel === "billing"
          ? "New invoice ready for review"
          : "Invoice reminder",
      message: row.message,
      status: row.read_at ? "read" : "unread",
      date: row.created_at,
      ...related(target(row.invoice_id)),
      details: [
        { label: "Scheduled for", value: row.scheduled_on },
        { label: "Channel", value: row.channel },
        ...(row.read_at ? [{ label: "Read at", value: row.read_at }] : []),
      ],
    })),
    ...source.deliveries.map((row) => ({
      id: "delivery:" + row.id,
      category: "delivery" as const,
      title:
        row.state === "external"
          ? "External delivery recorded"
          : "Invoice email update",
      message:
        row.state === "mock"
          ? "Test delivery recorded. No live email was delivered to the company."
          : row.state === "accepted"
            ? "The email provider accepted the message. This does not confirm the recipient has read it."
            : row.state === "external"
              ? `Invoice shared via ${row.channel}.`
              : `Email delivery status: ${row.state}.`,
      status: row.state,
      date: row.created_at,
      ...related(target(row.invoice_id)),
      details: [
        { label: "Recipient", value: row.recipient || "—" },
        { label: "Channel", value: row.channel },
      ],
    })),
    ...source.documents.map((row) => ({
      id: "document:" + row.id,
      category: "documents" as const,
      title: words(row.kind) + " PDF update",
      message:
        row.state === "ready"
          ? "The archived PDF is ready to download."
          : row.state === "failed"
            ? "The PDF could not be prepared. Open the record to retry."
            : "The PDF is waiting to be generated.",
      status: row.state,
      date: row.created_at,
      ...related(target(row.record_id)),
      details: [
        { label: "Version", value: String(row.version) },
        ...(row.error ? [{ label: "Error", value: row.error }] : []),
      ],
    })),
    ...source.jobs.map((row) => {
      const payload = object(row.payload);
      const delivery =
        typeof payload.attempt_id === "string"
          ? deliveries[payload.attempt_id]
          : undefined;
      const ref = target(
        delivery?.invoice_id ||
          (typeof payload.invoice_id === "string"
            ? payload.invoice_id
            : undefined),
      );
      return {
        id: "job:" + row.id,
        category: "system" as const,
        title:
          row.kind === "invoice_email"
            ? "Invoice email processing"
            : row.kind === "admin_reminder"
              ? "Reminder processing"
              : words(row.kind),
        message:
          row.state === "done"
            ? "Processing completed. Check the delivery update for the actual sending result."
            : row.state === "failed"
              ? "Processing failed and needs review."
              : `Processing is ${row.state}.`,
        status: row.state,
        date: row.created_at,
        ...related(ref),
        details: [
          { label: "Attempts", value: String(row.attempts) },
          { label: "Scheduled attempt", value: row.available_at },
          ...(row.last_error
            ? [{ label: "Last error", value: row.last_error }]
            : []),
        ],
      };
    }),
    ...source.runs.map((row) => ({
      id: "run:" + row.id,
      category: "system" as const,
      title: words(row.task),
      message: row.detail || "Scheduled workspace processing update.",
      status: row.state,
      date: row.created_at,
      company: "",
      details: [],
    })),
  ];
  return items.sort(
    (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id),
  );
}
