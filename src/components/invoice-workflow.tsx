import Link from "next/link";
import { FinancialForm } from "@/components/financial-form";
import { DocumentButton } from "@/components/document-button";
import { formatMoney } from "@/lib/billing/money";
import type { Database } from "@/lib/db/database.types";
type File = Database["public"]["Tables"]["document_files"]["Row"];
export function InvoiceWorkflow({
  id,
  state,
  company,
  currency,
  outstanding,
  files,
  sentOn,
  paused,
  dueDate,
  emailPending,
}: {
  id: string;
  state: string;
  company: string;
  currency: string;
  outstanding: number;
  files: File[];
  sentOn: string | null;
  paused: boolean;
  dueDate: string;
  emailPending: boolean;
}) {
  const latest = [...files].sort((a, b) => b.version - a.version)[0];
  const ready = latest?.state === "ready";
  const settled = state === "issued" && outstanding === 0;
  const active =
    state === "draft" ? 0 : !ready ? 1 : !sentOn ? 2 : settled ? 4 : 3;
  if (state === "void")
    return (
      <section className="card">
        <h2>Invoice voided</h2>
        <p>This invoice no longer requires payment or follow-up.</p>
      </section>
    );
  return (
    <section className="card invoice-workflow" aria-label="Invoice next steps">
      <div className="eyebrow">Next steps</div>
      <h2>
        {settled
          ? "This invoice is settled"
          : "Follow this invoice through to payment"}
      </h2>
      <ol className="workflow-steps">
        <li aria-current={active === 0 ? "step" : undefined}>
          <span className="step-number">1</span>
          <div>
            <h3>Review and issue</h3>
            {state === "draft" ? (
              <>
                <p>
                  Check the preview, then issue the invoice to reserve its
                  number.
                </p>
                <FinancialForm
                  action="issue_invoice"
                  id={id}
                  label="Issue invoice"
                  compact
                />
              </>
            ) : (
              <p className="muted">
                Issued. The invoice number and original details are preserved.
              </p>
            )}
          </div>
        </li>
        <li aria-current={active === 1 ? "step" : undefined}>
          <span className="step-number">2</span>
          <div>
            <h3>Prepare the PDF</h3>
            {state === "draft" ? (
              <p className="muted">Available after issuing.</p>
            ) : ready ? (
              <>
                <p>Your invoice is ready to share.</p>
                <a
                  className="button secondary"
                  href={"/api/documents/" + latest.id + "/download"}
                >
                  Download invoice PDF
                </a>
              </>
            ) : (
              <>
                <p>Generate the original invoice as a downloadable PDF.</p>
                <DocumentButton
                  url={"/api/invoices/" + id + "/pdf"}
                  label={
                    latest?.state === "failed" ? "Retry PDF" : "Generate PDF"
                  }
                />
                {latest?.error && <p className="error">{latest.error}</p>}
              </>
            )}
          </div>
        </li>
        <li aria-current={active === 2 ? "step" : undefined}>
          <span className="step-number">3</span>
          <div>
            <h3>Send to the company</h3>
            {sentOn ? (
              <p>Sending recorded on {sentOn}. You can follow up below.</p>
            ) : !ready ? (
              <p className="muted">
                Prepare the PDF first, then send it by email or share it
                yourself.
              </p>
            ) : (
              <>
                <p>
                  Send by email, or download the PDF above and share it with
                  your contact.
                </p>
                {emailPending ? (
                  <p className="notice">
                    Email is queued. Delivery history below will show the result
                    after jobs are processed.
                  </p>
                ) : (
                  <FinancialForm
                    action="send_invoice"
                    id={id}
                    label="Send invoice by email"
                    emailMode={
                      process.env.EMAIL_PROVIDER === "resend"
                        ? "configured"
                        : "mock"
                    }
                    compact
                  />
                )}
                <details>
                  <summary>I shared the PDF myself</summary>
                  <p>
                    After sending it by WhatsApp, email, or another channel,
                    record that here.
                  </p>
                  <FinancialForm
                    action="mark_external"
                    id={id}
                    label="Record external send"
                    compact
                  />
                </details>
              </>
            )}
          </div>
        </li>
        <li aria-current={active === 3 ? "step" : undefined}>
          <span className="step-number">4</span>
          <div>
            <h3>Follow up and record payment</h3>
            {settled ? (
              <p>No outstanding balance remains.</p>
            ) : !sentOn ? (
              <p className="muted">
                After sending is recorded, review reminders and track the
                company’s payment.
              </p>
            ) : (
              <>
                <p>
                  {formatMoney(outstanding, currency)} outstanding · Due{" "}
                  {dueDate}. Reminders are{" "}
                  {paused ? "paused" : "enabled under your reminder rules"}.
                </p>
                <p className="muted">
                  Reminder rules create follow-up notifications when the daily
                  job runs. Check Notifications for items to follow up.
                </p>
                <div className="actions">
                  <Link
                    className="button"
                    href={"/payments/new?company=" + company}
                  >
                    Record payment received
                  </Link>
                  <Link className="button secondary" href="/notifications">
                    View follow-ups
                  </Link>
                </div>
                <details>
                  <summary>Manage reminders</summary>
                  <FinancialForm
                    action="pause_reminders"
                    id={id}
                    label="Update reminders"
                    compact
                  />
                </details>
              </>
            )}
            <p>
              <Link className="text-link" href={"/companies/" + company}>
                View company history and balances →
              </Link>
            </p>
          </div>
        </li>
      </ol>
      {state === "issued" && (
        <details className="invoice-corrections">
          <summary>Corrections and other actions</summary>
          <p>Use these only when the issued invoice needs a correction.</p>
          {!sentOn && (
            <Link
              className="button secondary"
              href={"/payments/new?company=" + company}
            >
              Record payment already received
            </Link>
          )}
          <FinancialForm
            action="apply_credit"
            id={id}
            label="Apply credit correction"
            amount={outstanding}
            currency={currency}
            compact
          />
          <FinancialForm
            action="void_invoice"
            id={id}
            label="Void invoice"
            compact
          />
        </details>
      )}
    </section>
  );
}
