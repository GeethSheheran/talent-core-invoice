import { NextResponse } from "next/server";
import { Resend } from "resend";
import { privileged } from "@/lib/supabase/privileged";
import { productionJobs } from "@/lib/env";
export async function POST(request: Request) {
  const secret = process.env.EMAIL_WEBHOOK_SECRET;
  if (!secret || !productionJobs())
    return NextResponse.json({ error: "Webhook disabled" }, { status: 503 });
  try {
    const payload = await request.text();
    if (payload.length > 100000)
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    const client = new Resend(process.env.EMAIL_API_KEY);
    const event = client.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get("svix-id") || "",
        timestamp: request.headers.get("svix-timestamp") || "",
        signature: request.headers.get("svix-signature") || "",
      },
      webhookSecret: secret,
    });
    if (
      event.type === "email.delivered" ||
      event.type === "email.bounced" ||
      event.type === "email.failed"
    ) {
      const db = privileged();
      const result = await db
        .from("delivery_attempts")
        .update({
          state: event.type === "email.delivered" ? "delivered" : "failed",
        })
        .eq("provider_id", event.data.email_id)
        .neq("state", "delivered");
      if (result.error)
        return NextResponse.json(
          { error: "Could not record event" },
          { status: 500 },
        );
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature or payload" },
      { status: 400 },
    );
  }
}
