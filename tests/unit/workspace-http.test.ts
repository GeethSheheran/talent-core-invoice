import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  admin: vi.fn(),
  editor: vi.fn(),
  record: vi.fn(),
  preview: vi.fn(),
}));
vi.mock("@/lib/auth/require-admin", async (original) => ({
  ...(await original<typeof import("@/lib/auth/require-admin")>()),
  requireAdmin: mocks.admin,
}));
vi.mock("@/lib/company-workspace", () => ({
  loadCompanyEditor: mocks.editor,
  loadCompanyRecord: mocks.record,
}));
vi.mock("@/lib/notifications/preview", () => ({
  loadNotificationPreview: mocks.preview,
}));
import { AccessError } from "../../src/lib/auth/require-admin";
import { GET as workspace } from "../../src/app/api/companies/[id]/workspace/route";
import { GET as preview } from "../../src/app/api/notifications/preview/route";
const company = "10000000-0000-4000-8000-000000000001";
const db = {};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.admin.mockResolvedValue({ db });
  mocks.editor.mockResolvedValue({
    data: { initial: { company_id: company } },
  });
  mocks.record.mockResolvedValue({ data: { row: { id: "record" } } });
  mocks.preview.mockResolvedValue({ items: [], error: "" });
});
it.each([401, 403])(
  "denies both read endpoints with %i before accessing data",
  async (status) => {
    mocks.admin.mockRejectedValue(new AccessError(status));
    const response = await workspace(
      new Request(
        `http://localhost/api/companies/${company}/workspace?collection=invoices`,
      ),
      { params: Promise.resolve({ id: company }) },
    );
    expect(response.status).toBe(status);
    expect((await preview()).status).toBe(status);
    expect(mocks.editor).not.toHaveBeenCalled();
    expect(mocks.record).not.toHaveBeenCalled();
    expect(mocks.preview).not.toHaveBeenCalled();
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  },
);
it("authorizes a record read once and passes only that request's client to the service", async () => {
  const response = await workspace(
    new Request(
      `http://localhost/api/companies/${company}/workspace?collection=invoices&record=record`,
    ),
    { params: Promise.resolve({ id: company }) },
  );
  expect(response.status).toBe(200);
  expect(mocks.admin).toHaveBeenCalledOnce();
  expect(mocks.record).toHaveBeenCalledWith(db, company, "invoices", "record");
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
});
it("keeps recoverable editor errors explicit and notification reads private", async () => {
  mocks.editor.mockResolvedValue({ error: "Company not found." });
  const response = await workspace(
    new Request(
      `http://localhost/api/companies/${company}/workspace?collection=invoices`,
    ),
    { params: Promise.resolve({ id: company }) },
  );
  expect(response.status).toBe(422);
  expect(await response.json()).toEqual({ error: "Company not found." });
  const notification = await preview();
  expect(notification.status).toBe(200);
  expect(mocks.preview).toHaveBeenCalledWith(db);
  expect(notification.headers.get("Cache-Control")).toBe("private, no-store");
});
