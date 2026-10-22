import "server-only";
import { privileged } from "@/lib/supabase/privileged";
import { emailProvider } from "@/lib/email/provider";
import { productionJobs } from "@/lib/env";
import { z } from "zod";
export async function processOutbox() {
  const db = privileged();
  const { data: jobs, error } = await db.rpc("claim_jobs", { p_limit: 10 });
  if (error) throw new Error("Could not claim jobs");
  let completed = 0;
  for (const job of jobs || []) {
    try {
      if (
        job.attempts > 1 &&
        Date.now() - new Date(job.created_at).getTime() > 23 * 60 * 60 * 1000
      )
        throw new Error(
          "Provider idempotency window expired; reconcile before retry",
        );
      if (job.kind === "invoice_email") {
        const payload = z.object({ attempt_id: z.uuid() }).parse(job.payload);
        const { data: attempt } = await db
          .from("delivery_attempts")
          .select("*")
          .eq("id", payload.attempt_id)
          .single();
        if (!attempt) throw new Error("Delivery attempt missing");
        if (!["accepted", "delivered", "external"].includes(attempt.state)) {
          // Resend deduplicates for 24h; never blindly retry an ambiguous acceptance later.
          if (
            job.attempts > 1 &&
            Date.now() - new Date(job.created_at).getTime() >
              23 * 60 * 60 * 1000
          )
            throw new Error(
              "Acceptance ambiguous: reconcile with provider before retry",
            );
          const { data: invoice } = await db
            .from("invoices")
            .select("state,number")
            .eq("id", attempt.invoice_id)
            .single();
          if (invoice?.state !== "issued")
            throw new Error("Invoice is no longer issued");
          const { data: file } = await db
            .from("document_files")
            .select("path")
            .eq("record_id", attempt.invoice_id)
            .eq("kind", "invoice")
            .eq("state", "ready")
            .single();
          if (!file?.path) throw new Error("Archived PDF is missing");
          const { data: blob, error: downloadError } = await db.storage
            .from("documents")
            .download(file.path);
          if (downloadError || !blob)
            throw new Error("Private PDF download failed");
          const sent = await emailProvider().send({
            to: attempt.recipient,
            subject: "Invoice " + invoice.number,
            text: "Please find your invoice attached. Contact us if you have any questions.",
            key: attempt.idempotency_key,
            attachment: {
              filename: invoice.number + ".pdf",
              content: Buffer.from(await blob.arrayBuffer()),
            },
          });
          const result = await db.rpc("record_delivery", {
            p_attempt: attempt.id,
            p_state:
              sent.state === "accepted" && !productionJobs()
                ? "mock"
                : sent.state,
            p_provider: sent.id,
          });
          if (result.error)
            throw new Error("Delivery result could not be committed");
        }
      } else if (job.kind === "admin_reminder") {
        const payload = z.object({ invoice_id: z.uuid() }).parse(job.payload);
        const { data: i } = await db
          .from("invoice_balances")
          .select("*")
          .eq("id", payload.invoice_id)
          .single();
        if (
          i?.state === "issued" &&
          !i.reminders_paused &&
          Number(i.outstanding) > 0
        ) {
          const to = process.env.ADMIN_NOTIFICATION_EMAIL;
          if (!to) throw new Error("Administrator notification email missing");
          await emailProvider().send({
            to,
            subject: "Follow up: " + i.number,
            text: "An invoice still has an outstanding balance. Review it in the billing workspace.",
            key: job.key,
          });
        }
      } else throw new Error("Unknown job type");
      const done = await db
        .from("outbox_jobs")
        .update({ state: "done", lease_until: null, last_error: null })
        .eq("id", job.id)
        .eq("attempts", job.attempts);
      if (done.error) throw new Error("Job completion could not be saved");
      completed++;
    } catch {
      if (job.kind === "invoice_email") {
        const parsed = z
          .object({ attempt_id: z.uuid() })
          .safeParse(job.payload);
        if (parsed.success)
          await db
            .from("delivery_attempts")
            .update({ state: "failed" })
            .eq("id", parsed.data.attempt_id)
            .not("state", "in", "(accepted,delivered,external)");
      }
      await db
        .from("outbox_jobs")
        .update({
          state: job.attempts >= 5 ? "failed" : "pending",
          lease_until: null,
          last_error:
            "Job failed; inspect configuration or provider acceptance before retry.",
          available_at: new Date(
            Date.now() + Math.min(60, 2 ** job.attempts) * 60000,
          ).toISOString(),
        })
        .eq("id", job.id)
        .eq("attempts", job.attempts);
    }
  }
  return { claimed: jobs?.length || 0, completed };
}
