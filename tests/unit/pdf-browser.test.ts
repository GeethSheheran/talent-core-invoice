import { afterEach, expect, it, vi } from "vitest";
vi.mock("node:fs/promises", () => ({
  access: vi.fn(),
  constants: { X_OK: 1 },
}));
vi.mock("@sparticuz/chromium", () => ({
  default: {
    executablePath: vi.fn().mockResolvedValue("/tmp/chromium"),
    args: ["--headless"],
  },
}));
import { access } from "node:fs/promises";
import chromium from "@sparticuz/chromium";
import { browserOptions } from "../../src/lib/documents/browser";
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
it("uses installed Mac Chrome when no override is configured", async () => {
  vi.stubEnv("CHROME_EXECUTABLE_PATH", "");
  vi.spyOn(process, "platform", "get").mockReturnValue("darwin");
  vi.mocked(access).mockResolvedValue(undefined);
  expect((await browserOptions()).executablePath).toContain(
    "Google Chrome.app",
  );
  expect(chromium.executablePath).not.toHaveBeenCalled();
});
it("preserves packaged Chromium on Linux", async () => {
  vi.stubEnv("CHROME_EXECUTABLE_PATH", "");
  vi.spyOn(process, "platform", "get").mockReturnValue("linux");
  expect((await browserOptions()).executablePath).toBe("/tmp/chromium");
});
it("reports invalid explicit browser paths without silently falling back", async () => {
  vi.stubEnv("CHROME_EXECUTABLE_PATH", "/missing/chrome");
  vi.mocked(access).mockRejectedValue(new Error("ENOENT"));
  await expect(browserOptions()).rejects.toThrow("CHROME_EXECUTABLE_PATH");
});
