"use client";
import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  loadCompanyEditor,
  loadCompanyRecord,
} from "@/app/(admin)/company-actions";
import { saveCompanyRecord } from "@/app/(admin)/actions";
import { companyKinds, type CompanyCollection } from "@/lib/company-sections";
import { RecordEditor } from "@/components/record-editor";
import { PendingInvoiceExpenses } from "@/components/pending-invoice-expenses";
import { FinancialForm } from "@/components/financial-form";
import { DocumentButton } from "@/components/document-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/billing/money";
import type { Json } from "@/lib/db/database.types";
type EditorData = NonNullable<
  Awaited<ReturnType<typeof loadCompanyEditor>>["data"]
>;
type RecordData = NonNullable<
  Awaited<ReturnType<typeof loadCompanyRecord>>["data"]
>;
export function CompanyRecordDialog({
  companyId,
  collection,
  recordId,
  label,
}: {
  companyId: string;
  collection: CompanyCollection;
  recordId?: string;
  label?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [editor, setEditor] = useState<EditorData>();
  const [record, setRecord] = useState<RecordData>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [savedId, setSavedId] = useState(recordId);
  const [saved, setSaved] = useState(false);
  const kind = companyKinds[collection];
  const title = record
    ? collection === "payments"
      ? "Payment & receipt"
      : "Record details"
    : collection === "payments"
      ? "Record payment"
      : `New ${kind}`;
  async function readRecord(id: string) {
    const result = await loadCompanyRecord(companyId, collection, id);
    if (result.error) setError(result.error);
    else {
      setRecord(result.data);
      setEditor(undefined);
      setError("");
    }
  }
  async function open() {
    setError("");
    setEditor(undefined);
    setRecord(undefined);
    setSaved(false);
    setSavedId(recordId);
    dialog.current?.showModal();
    setBusy(true);
    try {
      if (recordId) await readRecord(recordId);
      else {
        const result = await loadCompanyEditor(companyId, collection);
        if (result.error) setError(result.error);
        else setEditor(result.data);
      }
    } catch {
      setError("Unable to load this form. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  async function refreshRecord() {
    if (savedId) await readRecord(savedId);
    router.refresh();
  }
  const row = record?.row as Record<string, Json | undefined> | undefined;
  const currency = String(row?.currency || "LKR");
  const state = String(
    row?.state || (row?.invoice_id ? "attached" : "pending"),
  );
  return (
    <>
      <button
        type="button"
        className={recordId ? "record-link" : "secondary"}
        onClick={open}
      >
        {!recordId && <Plus size={16} aria-hidden="true" />}
        {label ||
          (collection === "payments" ? "Record payment" : `New ${kind}`)}
      </button>
      <dialog
        ref={dialog}
        className="company-dialog"
        aria-labelledby={`dialog-${collection}-${recordId || "new"}`}
        onCancel={(e) => {
          if (busy) e.preventDefault();
        }}
        onClose={() => {
          router.refresh();
        }}
      >
        <header className="company-dialog-header">
          <div>
            <div className="eyebrow">Company workspace</div>
            <h2 id={`dialog-${collection}-${recordId || "new"}`}>{title}</h2>
          </div>
          <button
            type="button"
            className="secondary icon-button"
            aria-label="Close dialog"
            disabled={busy}
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </header>
        <div className="company-dialog-body">
          {busy && !editor && <p role="status">Loading…</p>}
          {error && (
            <div className="error" role="alert">
              <p>{error}</p>
              <button
                className="secondary"
                disabled={busy}
                onClick={() => (savedId ? refreshRecord() : open())}
              >
                Retry
              </button>
            </div>
          )}
          {saved && (
            <p className="notice" role="status">
              Saved. You’re still in this company’s workspace.
            </p>
          )}
          {editor && (
            <RecordEditor
              {...editor}
              kind={kind}
              lockCompany
              inlineReview
              onSave={async (form) => {
                setBusy(true);
                try {
                  const result = await saveCompanyRecord(companyId, form);
                  if ("error" in result)
                    return result.error || "Unable to save.";
                  setSavedId(result.id);
                  setSaved(true);
                  setEditor(undefined);
                  await readRecord(result.id);
                  router.refresh();
                  return "";
                } catch {
                  return "Unable to save. Check your connection and try again.";
                } finally {
                  setBusy(false);
                }
              }}
            />
          )}
          {row && record && (
            <>
              <h3>
                {String(
                  row.number ||
                    row.receipt_number ||
                    row.name ||
                    row.title ||
                    row.description ||
                    `Draft ${kind}`,
                )}
              </h3>
              {typeof row.state === "string" && <StatusBadge state={state} />}
              <dl className="detail-list">
                {Object.entries(row)
                  .filter(
                    ([key, value]) =>
                      [
                        "description",
                        "email",
                        "notes",
                        "due_date",
                        "received_on",
                        "method",
                        "reference",
                        "incurred_on",
                        "starts_on",
                        "ends_on",
                      ].includes(key) && value,
                  )
                  .map(([key, value]) => (
                    <div key={key} style={{ display: "contents" }}>
                      <dt>{key.replaceAll("_", " ")}</dt>
                      <dd>{String(value)}</dd>
                    </div>
                  ))}
                {["total", "amount", "price"]
                  .filter((key) => typeof row[key] === "number")
                  .map((key) => (
                    <div key={key} style={{ display: "contents" }}>
                      <dt>{key === "total" ? "New charges" : key}</dt>
                      <dd>{formatMoney(Number(row[key]), currency)}</dd>
                    </div>
                  ))}
              </dl>
              {record.items.length > 0 && (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.description}</td>
                          <td>{item.quantity}</td>
                          <td>{formatMoney(item.amount, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {collection === "payments" && state === "pending" && (
                <FinancialForm
                  action="confirm_payment"
                  id={String(row.id)}
                  label="Confirm payment"
                  company={companyId}
                  amount={Number(row.amount)}
                  currency={currency}
                  invoices={record.invoices}
                  onSuccess={refreshRecord}
                />
              )}
              {collection === "payments" && state === "confirmed" && (
                <DocumentButton
                  url={`/api/payments/${row.id}/receipt`}
                  label="Download receipt"
                />
              )}
              {collection === "invoices" && state === "draft" && (
                <PendingInvoiceExpenses
                  invoiceId={String(row.id)}
                  expenses={record.pendingExpenses}
                  onAttached={refreshRecord}
                />
              )}
              {collection === "invoices" && state === "draft" && (
                <FinancialForm
                  action="issue_invoice"
                  id={String(row.id)}
                  label="Issue invoice"
                  onSuccess={refreshRecord}
                />
              )}
              {collection === "invoices" && state === "issued" && (
                <DocumentButton
                  url={`/api/invoices/${row.id}/pdf`}
                  label="Download invoice"
                />
              )}
              {collection === "proposals" && state === "draft" && (
                <FinancialForm
                  action="issue_proposal"
                  id={String(row.id)}
                  label="Issue proposal"
                  onSuccess={refreshRecord}
                />
              )}
              {collection === "proposals" && state !== "draft" && (
                <DocumentButton
                  url={`/api/proposals/${row.id}/pdf`}
                  label="Download proposal"
                />
              )}
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
