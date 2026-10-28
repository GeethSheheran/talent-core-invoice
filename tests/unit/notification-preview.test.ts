import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  admin: vi.fn(),
  from: vi.fn(),
  limit: vi.fn(),
  rows: {} as Record<string, unknown[]>,
}));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.admin }));
import { loadNotificationPreview } from "../../src/lib/notifications/preview";
beforeEach(() => {
  vi.resetAllMocks();
  mocks.rows = {};
  mocks.limit.mockImplementation(async (table: string) => ({
    data: mocks.rows[table] || [],
    error: null,
  }));
  mocks.from.mockImplementation((table: string) => {
    const query = {
      select: vi.fn(),
      in: vi.fn(async () => ({ data: mocks.rows[table] || [], error: null })),
      order: vi.fn(),
      limit: (count: number) => mocks.limit(table, count),
    };
    query.select.mockReturnValue(query);
    query.order.mockReturnValue(query);
    return query;
  });
  mocks.admin.mockResolvedValue({ db: { from: mocks.from } });
});
it("bounds notification queries and returns newest-first sanitized previews", async () => {
  mocks.rows.audit_logs = [
    {
      id: "older",
      action: "save_invoice",
      record_id: null,
      detail: { private: "not in preview" },
      created_at: "2026-10-01T00:00:00Z",
    },
  ];
  mocks.rows.notification_events = [
    {
      id: "newer",
      invoice_id: "invoice",
      channel: "billing",
      message: "Review draft",
      read_at: null,
      scheduled_on: "2026-10-27",
      created_at: "2026-10-27T00:00:00Z",
    },
  ];
  mocks.rows.invoices = [
    { id: "invoice", number: "INV-001", company_id: "company" },
  ];
  mocks.rows.companies = [{ id: "company", name: "Test Company" }];
  const result = await loadNotificationPreview();
  expect(result.error).toBe("");
  expect(result.items[0]).toMatchObject({
    company: "Test Company",
    record: "INV-001",
    href: "/invoices/invoice",
  });
  expect(result.items.map((item) => item.id)).toEqual([
    "reminder:newer",
    "change:older",
  ]);
  expect(JSON.stringify(result.items)).not.toContain("not in preview");
  expect(mocks.limit.mock.calls.every(([, limit]) => limit === 20)).toBe(true);
});
it("reports database failures instead of claiming there are no notifications", async () => {
  mocks.limit.mockResolvedValue({ data: null, error: { code: "failed" } });
  expect((await loadNotificationPreview()).error).toContain(
    "could not be loaded",
  );
});
it("verifies administrator access before reading activity", async () => {
  mocks.admin.mockRejectedValue(new Error("Administrator access required"));
  await expect(loadNotificationPreview()).rejects.toThrow(
    "Administrator access required",
  );
  expect(mocks.from).not.toHaveBeenCalled();
});
