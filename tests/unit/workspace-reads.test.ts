import { afterEach, expect, it, vi } from "vitest";
import {
  loadCompanyEditor,
  getNotificationPreview,
} from "../../src/lib/client/workspace-reads";
afterEach(() => vi.unstubAllGlobals());
it("dispatches independent popup reads immediately without a shared action queue or cache", async () => {
  const resolvers: ((r: Response) => void)[] = [];
  const fetch = vi.fn(
    () => new Promise<Response>((resolve) => resolvers.push(resolve)),
  );
  vi.stubGlobal("fetch", fetch);
  const editor = loadCompanyEditor("company", "invoices");
  const notifications = getNotificationPreview();
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch.mock.calls[0]).toEqual([
    "/api/companies/company/workspace?collection=invoices",
    { cache: "no-store", credentials: "same-origin" },
  ]);
  resolvers[1](Response.json({ items: [], error: "" }));
  expect(await notifications).toEqual({ items: [], error: "" });
  resolvers[0](Response.json({ data: { initial: {} } }));
  await editor;
});
it("rejects unauthorized reads instead of presenting empty billing data", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ error: "Sign in required" }, { status: 401 }),
      ),
  );
  await expect(getNotificationPreview()).rejects.toThrow("Sign in required");
});
