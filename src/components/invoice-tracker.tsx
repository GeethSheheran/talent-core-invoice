"use client";
import { useId, useRef, useState } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import Link from "@/components/navigation-link";
import { formatMoney } from "@/lib/billing/money";
import { FinancialForm } from "@/components/financial-form";
import { CompanyRecordDialog } from "@/components/company-record-dialog";
import type { Json } from "@/lib/db/database.types";
export function InvoiceTracker({
  row,
}: {
  row: Record<string, Json | undefined>;
}) {
  const menuId = useId();
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [stageMessage, setStageMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const [option, setOption] = useState("");
  const [markedSent, setSent] = useState(false);
  const sent = markedSent || Boolean(row.first_sent_on);
  const stage =
    row.state === "draft"
      ? "draft"
      : row.outstanding === 0
        ? "settled"
        : sent
          ? "collect"
          : "unsent";
  const stages = [
    { key: "draft", label: "To issue" },
    { key: "unsent", label: "To send" },
    { key: "collect", label: "To collect" },
    { key: "settled", label: "Settled" },
  ];
  if (row.state === "void") return <span className="muted">Voided</span>;
  return (
    <>
      <button
        type="button"
        className={`secondary tracker-trigger tracker-${stage}`}
        aria-label={`Track ${row.number || "invoice"}`}
        aria-expanded={open}
        popoverTarget={menuId}
        onClick={(event) => {
          if (!menu.current) return;
          const box = event.currentTarget.getBoundingClientRect();
          menu.current.style.left = `${Math.max(12, Math.min(box.right - 220, window.innerWidth - 232))}px`;
          menu.current.style.top = `${Math.min(box.bottom + 6, window.innerHeight - 240)}px`;
        }}
      >
        <span className="tracker-dot" />
        {stages.find((s) => s.key === stage)?.label}
        <ChevronDown size={16} />
      </button>
      <div
        ref={menu}
        id={menuId}
        popover="auto"
        className="tracker-menu"
        onToggle={(e) => setOpen(e.newState === "open")}
      >
        {stages.map((item) => (
          <button
            type="button"
            key={item.key}
            className={`tracker-option tracker-${item.key}`}
            aria-pressed={stage === item.key}
            onClick={() => {
              menu.current?.hidePopover();
              setStageMessage("");
              setOption("");
              if (row.state === "draft")
                setStageMessage(
                  "Review and issue this draft to move it to To send.",
                );
              else if (item.key === "collect" && !sent && row.outstanding !== 0)
                setOption("sent");
              else if (item.key === "settled" && row.outstanding !== 0)
                setOption("payment");
              else if (item.key !== stage)
                setStageMessage(
                  "This stage reflects the invoice’s issue, delivery and payment history. Review the invoice to manage those records.",
                );
              dialog.current?.showModal();
            }}
          >
            <span className="tracker-dot" />
            {item.label}
            {stage === item.key && <Check size={15} />}
          </button>
        ))}
      </div>
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
          {stageMessage && <p className="notice">{stageMessage}</p>}
          <Link className="view-all-link" href={`/invoices/${row.id}`}>
            Open invoice
          </Link>
          {row.state === "issued" && (
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
          )}
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
