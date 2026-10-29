"use client";
import { useActionState, useState } from "react";
import { financialAction } from "@/app/(admin)/actions";
import { allocationPreview, type Balance } from "@/lib/billing/allocations";
import { formatMoney, major, minor } from "@/lib/billing/money";
export function FinancialForm({
  action,
  id,
  label,
  currency = "LKR",
  amount = 0,
  company = "",
  invoices = [],
  compact = false,
  emailMode = "configured",
  onSuccess,
  hideDeliveryChannel = false,
}: {
  hideDeliveryChannel?: boolean;
  onSuccess?: () => Promise<void>;
  emailMode?: "mock" | "configured";
  compact?: boolean;
  action: string;
  id: string;
  label: string;
  currency?: string;
  amount?: number;
  company?: string;
  invoices?: (Balance & { number: string | null })[];
}) {
  const [message, submit, pending] = useActionState(
    async (previous: string, form: FormData) => {
      const result = await financialAction(previous, form);
      if (result === "Saved successfully.") await onSuccess?.();
      return result;
    },
    "",
  );
  const [review, setReview] = useState(false);
  const [key] = useState(() => crypto.randomUUID());
  const allocate = action === "confirm_payment" || action === "allocate_credit";
  const [allocations, setAllocations] = useState(
    allocationPreview(amount, invoices, company, currency),
  );
  const [fields, setFields] = useState<Record<string, string>>({
    channel: hideDeliveryChannel ? "other" : "WhatsApp",
    period: new Date().toISOString().slice(0, 7) + "-01",
    pause: "true",
  });
  const needsReason = [
    "reverse_payment",
    "void_invoice",
    "apply_credit",
  ].includes(action);
  return (
    <section className={compact ? "workflow-action" : "card"}>
      <h3>{label}</h3>
      {action === "send_invoice" && (
        <p className="muted">
          {emailMode === "mock"
            ? "Email is in test mode. This action will not deliver an email to the company."
            : "Check delivery history after processing to confirm the sending result."}
        </p>
      )}
      {allocate && (
        <>
          <p>
            Review allocation of{" "}
            <strong>{formatMoney(amount, currency)}</strong>. Oldest due
            invoices are selected first.
          </p>
          {invoices
            .filter(
              (i) =>
                i.company_id === company &&
                i.currency === currency &&
                i.outstanding > 0,
            )
            .map((i) => (
              <div className="grid" key={i.id}>
                <label htmlFor={"allocation-" + i.id}>
                  {i.number} · Outstanding{" "}
                  {formatMoney(i.outstanding, currency)}
                </label>
                <input
                  id={"allocation-" + i.id}
                  type="number"
                  min="0"
                  max={major(Math.min(amount, i.outstanding))}
                  step="0.01"
                  defaultValue={major(
                    allocations.find((a) => a.invoice_id === i.id)?.amount || 0,
                  )}
                  onChange={(e) => {
                    try {
                      const value = minor(e.target.value || "0");
                      setAllocations([
                        ...allocations.filter((a) => a.invoice_id !== i.id),
                        ...(value > 0
                          ? [{ invoice_id: i.id, amount: value }]
                          : []),
                      ]);
                    } catch {}
                  }}
                />
              </div>
            ))}
          <p>
            Unallocated company credit:{" "}
            <strong>
              {formatMoney(
                amount - allocations.reduce((s, a) => s + a.amount, 0),
                currency,
              )}
            </strong>
          </p>
        </>
      )}
      {needsReason && (
        <label>
          Reason
          <textarea
            required
            minLength={5}
            value={fields.reason || ""}
            onChange={(e) => setFields({ ...fields, reason: e.target.value })}
          />
        </label>
      )}
      {action === "apply_credit" && (
        <label>
          Credit correction amount
          <input
            type="number"
            min="0.01"
            max={major(amount)}
            step="0.01"
            onChange={(e) => {
              try {
                setFields({
                  ...fields,
                  amount: String(minor(e.target.value || "0")),
                });
              } catch {}
            }}
          />
        </label>
      )}
      {action === "mark_external" && !hideDeliveryChannel && (
        <label>
          Delivery channel
          <select
            value={fields.channel}
            onChange={(e) => setFields({ ...fields, channel: e.target.value })}
          >
            <option>WhatsApp</option>
            <option>email</option>
            <option>other</option>
          </select>
        </label>
      )}
      {action === "pause_reminders" && (
        <label>
          Reminder schedule
          <select
            value={fields.pause}
            onChange={(e) => setFields({ ...fields, pause: e.target.value })}
          >
            <option value="true">Pause reminders</option>
            <option value="false">Resume reminders</option>
          </select>
        </label>
      )}
      {action === "monthly_draft" && (
        <label>
          Billing month
          <input
            type="month"
            value={fields.period.slice(0, 7)}
            onChange={(e) =>
              setFields({
                ...fields,
                period: e.target.value ? e.target.value + "-01" : "",
              })
            }
          />
        </label>
      )}
      {!review ? (
        <button className="secondary" onClick={() => setReview(true)}>
          Review {label.toLowerCase()}
        </button>
      ) : (
        <form action={submit}>
          <div className="notice">
            <strong>Confirm this action</strong>
            <p>
              {allocate
                ? "Allocations will be checked against current balances in one transaction."
                : label + " will be recorded in the audit history."}
            </p>
          </div>
          <input type="hidden" name="action" value={action} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="key" value={key} />
          <input
            type="hidden"
            name="allocations"
            value={JSON.stringify(allocations)}
          />
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <div className="actions">
            <button
              disabled={
                pending ||
                Boolean(
                  needsReason && (!fields.reason || fields.reason.length < 5),
                )
              }
            >
              {pending ? "Saving…" : label}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setReview(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
    </section>
  );
}
