import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  admin: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  is: vi.fn(),
  order: vi.fn(),
  range: vi.fn(),
  single: vi.fn(),
}));
vi.mock("@/lib/auth/render-admin", () => ({ renderAdmin: mocks.admin }));
import {
  createRecordReader,
  listRecords,
} from "../../src/lib/db/repositories/records";
const db = { from: mocks.from } as unknown as Parameters<
  typeof createRecordReader
>[0];
beforeEach(() => {
  vi.resetAllMocks();
  const query = {
    select: mocks.select,
    eq: mocks.eq,
    is: mocks.is,
    order: mocks.order,
    range: mocks.range,
    maybeSingle: mocks.single,
  };
  for (const fn of [mocks.from, mocks.select, mocks.eq, mocks.is, mocks.order])
    fn.mockReturnValue(query);
  mocks.range.mockResolvedValue({ data: [], error: null });
  mocks.admin.mockResolvedValue({ db });
});
it("scopes invoice children in SQL without repeating the caller's authorization", async () => {
  await createRecordReader(db).allRows("invoice_items", undefined, {
    invoice_id: "invoice",
  });
  expect(mocks.eq).toHaveBeenCalledWith("invoice_id", "invoice");
  expect(mocks.admin).not.toHaveBeenCalled();
  expect(mocks.range).toHaveBeenCalledOnce();
});
it("scopes balances by company and pending expenses by company, currency, and null attachment", async () => {
  const reader = createRecordReader(db);
  await reader.balances("company");
  await reader.allRows("company_expenses", "company", {
    invoice_id: null,
    currency: "LKR",
  });
  expect(mocks.eq).toHaveBeenCalledWith("company_id", "company");
  expect(mocks.eq).toHaveBeenCalledWith("currency", "LKR");
  expect(mocks.is).toHaveBeenCalledWith("invoice_id", null);
});
it("paginates complete scoped results without truncating records at 1000", async () => {
  mocks.range
    .mockResolvedValueOnce({
      data: Array.from({ length: 1000 }, (_, i) => ({ id: String(i) })),
      error: null,
    })
    .mockResolvedValueOnce({ data: [{ id: "last" }], error: null });
  const rows = await createRecordReader(db).allRows(
    "invoice_items",
    undefined,
    { invoice_id: "invoice" },
  );
  expect(rows).toHaveLength(1001);
  expect(mocks.range.mock.calls).toEqual([
    [0, 999],
    [1000, 1999],
  ]);
  expect(mocks.eq.mock.calls).toEqual([
    ["invoice_id", "invoice"],
    ["invoice_id", "invoice"],
  ]);
});
it("checks schema readiness with one row instead of loading the company history", async () => {
  await createRecordReader(db).allRows("company_expenses", "company", {}, 1);
  expect(mocks.range).toHaveBeenCalledWith(0, 0);
});
it("list reads omit snapshots and proposal bodies but retain fields used by search and payment totals", async () => {
  await listRecords("proposals");
  for (const excluded of ["snapshot", "brief", "sections"])
    expect(mocks.select.mock.calls[0][0].split(",")).not.toContain(excluded);
  await listRecords("payments");
  expect(mocks.select.mock.calls[1][0].split(",")).toEqual(
    expect.arrayContaining([
      "amount",
      "currency",
      "state",
      "method",
      "reference",
      "receipt_number",
    ]),
  );
  expect(mocks.select.mock.calls[1][0]).not.toContain("snapshot");
});
it("still denies a list request before querying when authorization fails", async () => {
  mocks.admin.mockRejectedValue(new Error("Sign in required"));
  await expect(listRecords("invoices")).rejects.toThrow("Sign in required");
  expect(mocks.from).not.toHaveBeenCalled();
});
