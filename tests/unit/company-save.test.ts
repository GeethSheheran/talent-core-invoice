import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  admin: vi.fn(),
  rpc: vi.fn(),
  redirect: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.admin }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/documents/brand", () => ({ brandSnapshot: vi.fn() }));
import { saveCompanyRecord, saveRecord } from "../../src/app/(admin)/actions";
const company = "10000000-0000-4000-8000-000000000001";
const id = "10000000-0000-4000-8000-000000000002";
function form(owner = company) {
  const data = new FormData();
  data.set("kind", "expense");
  data.set(
    "payload",
    JSON.stringify({
      company_id: owner,
      description: "Hosting",
      amount: 1000,
      currency: "LKR",
      incurred_on: "2026-10-01",
    }),
  );
  return data;
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.admin.mockResolvedValue({ db: { rpc: mocks.rpc } });
  mocks.rpc.mockResolvedValue({ data: id, error: null });
});
it("saves in a transaction and returns the new ID without navigating", async () => {
  expect(await saveCompanyRecord(company, form())).toEqual({
    id,
    kind: "expense",
  });
  expect(mocks.rpc).toHaveBeenCalledWith(
    "save_record",
    expect.objectContaining({ p_kind: "expense", p_id: null }),
  );
  expect(mocks.redirect).not.toHaveBeenCalled();
  expect(mocks.revalidate).toHaveBeenCalled();
});
it("rejects company tampering before calling the RPC", async () => {
  expect(await saveCompanyRecord(company, form(id))).toEqual({
    error: "The record must belong to this company.",
  });
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("rejects existing record IDs in the creation popup", async () => {
  const data = form();
  data.set("id", id);
  expect(await saveCompanyRecord(company, data)).toHaveProperty("error");
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("keeps standalone save redirects", async () => {
  await saveRecord("", form());
  expect(mocks.redirect).toHaveBeenCalledWith(`/expenses/${id}`);
});
it("returns RPC failures without a redirect or success refresh", async () => {
  mocks.rpc.mockResolvedValue({ error: { message: "Not allowed" } });
  expect(await saveCompanyRecord(company, form())).toEqual({
    error: "Not allowed",
  });
  expect(mocks.revalidate).not.toHaveBeenCalled();
});
it("independently authorizes popup saves", async () => {
  mocks.admin.mockRejectedValue(new Error("Administrator access required"));
  await expect(saveCompanyRecord(company, form())).rejects.toThrow(
    "Administrator access required",
  );
  expect(mocks.rpc).not.toHaveBeenCalled();
});
