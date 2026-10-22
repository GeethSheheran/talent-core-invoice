import { expect, it } from "vitest";
import {
  buildActivityFeed,
  type FeedSources,
} from "../../src/lib/notifications/feed";
const empty: FeedSources = {
  audits: [],
  reminders: [],
  deliveries: [],
  jobs: [],
  documents: [],
  runs: [],
};
it("combines changes and reminders in chronological order with full details", () => {
  const items = buildActivityFeed(
    {
      ...empty,
      audits: [
        {
          id: "a",
          actor_id: null,
          action: "reverse_payment",
          record_id: "payment",
          detail: { reason: "Incorrect reference" },
          created_at: "2026-10-15T10:00:00Z",
        },
      ],
      reminders: [
        {
          id: "r",
          invoice_id: "invoice",
          rule_id: "rule",
          scheduled_on: "2026-10-15",
          channel: "in-app",
          message: "Please follow up on this invoice.",
          read_at: null,
          created_at: "2026-10-15T11:00:00Z",
        },
      ],
    },
    {
      payment: {
        label: "REC-1",
        href: "/payments/payment",
        company: "Example",
      },
      invoice: {
        label: "INV-1",
        href: "/invoices/invoice",
        company: "Example",
      },
    },
  );
  expect(items.map((item) => item.category)).toEqual(["reminders", "changes"]);
  expect(items[0].status).toBe("unread");
  expect(items[1].href).toBe("/payments/payment");
  expect(items[1].details).toEqual([
    { label: "Reason", value: "Incorrect reference" },
  ]);
});
it("does not confuse a completed job with a delivered email", () => {
  const items = buildActivityFeed(
    {
      ...empty,
      deliveries: [
        {
          id: "d",
          invoice_id: "invoice",
          recipient: "test@example.test",
          channel: "email",
          state: "mock",
          provider_id: null,
          idempotency_key: "key",
          created_at: "2026-10-15T10:00:00Z",
        },
      ],
      jobs: [
        {
          id: "j",
          kind: "invoice_email",
          payload: { attempt_id: "d" },
          key: "key",
          state: "done",
          attempts: 1,
          available_at: "2026-10-15T10:00:00Z",
          lease_until: null,
          last_error: null,
          created_at: "2026-10-15T10:00:00Z",
        },
      ],
    },
    {
      invoice: {
        label: "INV-1",
        href: "/invoices/invoice",
        company: "Example",
      },
    },
  );
  expect(items.find((item) => item.category === "delivery")?.message).toContain(
    "No live email",
  );
  const job = items.find((item) => item.category === "system");
  expect(job?.status).toBe("done");
  expect(job?.message).toContain("actual sending result");
  expect(job?.href).toBe("/invoices/invoice");
});
it("resolves payment allocations by payment_id, not their idempotency key", () => {
  const [item] = buildActivityFeed(
    {
      ...empty,
      audits: [
        {
          id: "a",
          actor_id: null,
          action: "allocate_credit",
          record_id: "key",
          detail: { payment_id: "payment" },
          created_at: "2026-10-15T10:00:00Z",
        },
      ],
    },
    {
      payment: {
        label: "REC-1",
        href: "/payments/payment",
        company: "Example",
      },
    },
  );
  expect(item.href).toBe("/payments/payment");
});
