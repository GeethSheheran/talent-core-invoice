import "server-only";
import { Resend } from "resend";
import { productionJobs } from "@/lib/env";
export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  key: string;
  attachment?: { filename: string; content: Buffer };
};
export interface EmailProvider {
  send(
    message: EmailMessage,
  ): Promise<{ state: "mock" | "accepted"; id: string | null }>;
}
export class MockEmailProvider implements EmailProvider {
  async send(_message: EmailMessage): Promise<{ state: "mock"; id: null }> {
    void _message;
    return { state: "mock", id: null };
  }
}
export class ResendEmailProvider implements EmailProvider {
  async send(
    message: EmailMessage,
  ): Promise<{ state: "accepted"; id: string }> {
    const key = process.env.EMAIL_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!key || !from)
      throw new Error("Email provider configuration is incomplete");
    const to = productionJobs() ? message.to : process.env.DEV_EMAIL_RECIPIENT;
    if (!to)
      throw new Error("Nonproduction email needs a development recipient");
    const client = new Resend(key);
    const result = await client.emails.send(
      {
        from,
        to,
        subject: (productionJobs() ? "" : "[DEVELOPMENT] ") + message.subject,
        text: message.text,
        attachments: message.attachment ? [message.attachment] : undefined,
      },
      { idempotencyKey: message.key },
    );
    if (result.error || !result.data)
      throw new Error("Email provider request failed");
    return { state: "accepted", id: result.data.id };
  }
}
export function emailProvider(): EmailProvider {
  return process.env.EMAIL_PROVIDER === "resend"
    ? new ResendEmailProvider()
    : new MockEmailProvider();
}
