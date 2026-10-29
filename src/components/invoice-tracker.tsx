"use client";
import { useRef, useState } from "react";
import { X } from "lucide-react";
import { formatMoney } from "@/lib/billing/money";
import { FinancialForm } from "@/components/financial-form";
import { CompanyRecordDialog } from "@/components/company-record-dialog";
import type { Json } from "@/lib/db/database.types";
export function InvoiceTracker({
  row,
}: {
  row: Record<string, Json | undefined>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [option, setOption] = useState("");
  const [sent, setSent] = useState(Boolean(row.first_sent_on));
  if (row.state !== "issued")
    return (
      <span className="muted">
        {row.state === "void" ? "Voided" : "Awaiting issue"}
      </span>
    );
  return (
    <>
      <button
        className="record-link"
        type="button"
        onClick={() => {
          setOption("");
          dialog.current?.showModal();
        }}
      >
        {row.outstanding === 0 ? "Settled" : "Track invoice"}
      </button>
      <dialog
        ref={dialog}
        className="company-dialog invoice-tracker-dialog"
        aria-labelledby={`tracker-${row.id}`}
      >
        <header className="company-dialog-header">
          <div>
            <div className="eyebrow">{String(row.number || "Invoice")}</div>
            <h2 id={`tracker-${row.id}`}>Invoice tracker</h2>
          </div>
          <button
            type="button"
            className="secondary icon-button"
            aria-label="Close invoice tracker"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </header>
        <div className="company-dialog-body">
          {typeof row.outstanding === "number" && (
            <p>
              Outstanding: {formatMoney(row.outstanding, String(row.currency))}
            </p>
          )}
          {sent && (
            <p>
              {row.first_sent_on
                ? `Sent: ${row.first_sent_on}`
                : "Invoice marked as sent."}
            </p>
          )}
          <div className="field">
            <label htmlFor={`tracker-option-${row.id}`}>Update invoice</label>
            <select
              id={`tracker-option-${row.id}`}
              value={option}
              onChange={(e) => setOption(e.target.value)}
            >
              <option value="">Select an option</option>
              {!sent && <option value="sent">Sent</option>}
              {row.outstanding !== 0 && (
                <option value="payment">Payment received</option>
              )}
            </select>
          </div>
          {option === "sent" && (
            <FinancialForm
              action="mark_external"
              id={String(row.id)}
              label="Mark as sent"
              compact
              hideDeliveryChannel
              onSuccess={async () => {
                setSent(true);
                setOption("");
              }}
            />
          )}
          {option === "payment" && (
            <CompanyRecordDialog
              companyId={String(row.company_id)}
              collection="payments"
              label="Record payment"
              redirectToPayments
              initialValues={{
                currency: String(row.currency),
                reference: String(row.number || ""),
                invoice_total: Number(row.total || 0),
                amount: Number(row.outstanding ?? row.total ?? 0),
              }}
            />
          )}
        </div>
      </dialog>
    </>
  );
}
