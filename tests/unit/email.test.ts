import { beforeEach, afterEach, it, expect, vi } from "vitest";
const send = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));
import {
  MockEmailProvider,
  ResendEmailProvider,
} from "../../src/lib/email/provider";
beforeEach(() => {
  vi.stubEnv("EMAIL_API_KEY", "test-placeholder");
  vi.stubEnv("EMAIL_FROM", "studio@example.test");
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("ENABLE_PRODUCTION_JOBS", "true");
  send.mockResolvedValue({ data: { id: "test-email" }, error: null });
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
it("mock delivery never claims provider acceptance", async () => {
  expect(
    await new MockEmailProvider().send({
      to: "client@example.test",
      subject: "Test",
      text: "Test",
      key: "test",
    }),
  ).toEqual({ state: "mock", id: null });
  expect(send).not.toHaveBeenCalled();
});
it("preview delivery uses only the explicit development recipient", async () => {
  vi.stubEnv("DEV_EMAIL_RECIPIENT", "developer@example.test");
  await new ResendEmailProvider().send({
    to: "real-client@example.test",
    subject: "Invoice",
    text: "Test",
    key: "test",
  });
  expect(send.mock.calls[0][0].to).toBe("developer@example.test");
  expect(send.mock.calls[0][0].subject).toBe("[DEVELOPMENT] Invoice");
});
it("nonproduction delivery fails closed without a development recipient", async () => {
  vi.stubEnv("DEV_EMAIL_RECIPIENT", "");
  await expect(
    new ResendEmailProvider().send({
      to: "real-client@example.test",
      subject: "Invoice",
      text: "Test",
      key: "test",
    }),
  ).rejects.toThrow(/development recipient/);
  expect(send).not.toHaveBeenCalled();
});
