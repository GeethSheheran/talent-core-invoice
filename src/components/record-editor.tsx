"use client";
import { useActionState, useState } from "react";
import { ProposalSource } from "@/components/proposal-source";
import { saveRecord } from "@/app/(admin)/actions";
import { major, minor, currencies, formatMoney } from "@/lib/billing/money";
import { totals, type Line } from "@/lib/billing/totals";
import type { RecordKind } from "@/lib/validation/schemas";
import type { Tables, Json } from "@/lib/db/database.types";
type Option = { id: string; name: string; currency: string };
type Field = {
  key: string;
  label: string;
  type?: string;
  options?: string[];
  value?: string;
  required?: boolean;
  nullable?: boolean;
};
const common: Field[] = [
  {
    key: "currency",
    label: "Currency",
    options: [...currencies],
    value: "LKR",
  },
];
const fields: Record<RecordKind, Field[]> = {
  expense: [
    { key: "description", label: "Expense description", required: true },
    { key: "amount", label: "Expense amount", type: "money" },
    ...common,
    { key: "incurred_on", label: "Expense date", type: "date", required: true },
  ],
  company: [
    { key: "name", label: "Company name", required: true },
    { key: "email", label: "Billing email", type: "email" },
    { key: "contact", label: "Contact person" },
    { key: "address", label: "Billing address", type: "textarea" },
    ...common,
    {
      key: "terms_days",
      label: "Payment terms (days)",
      type: "number",
      value: "14",
    },
    { key: "archived", label: "Archive company", type: "checkbox" },
  ],
  service: [
    { key: "name", label: "Service name", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "rate", label: "Default rate", type: "money" },
    ...common,
  ],
  project: [
    { key: "name", label: "Project name", required: true },
    { key: "scope", label: "Scope", type: "textarea" },
    ...common,
    { key: "price", label: "Agreed project total", type: "money" },
    { key: "advance", label: "Advance requirement", type: "money" },
    {
      key: "state",
      label: "Status",
      options: ["active", "completed", "archived"],
    },
  ],
  agreement: [
    { key: "name", label: "Agreement name", required: true },
    ...common,
    {
      key: "billing_day",
      label: "Billing day (1–28; blank uses Settings)",
      type: "number",
      nullable: true,
    },
    { key: "repeat", label: "Repeat", options: ["monthly", "annually"] },
    {
      key: "reminder_days",
      label: "Notify days before billing (blank uses Settings)",
      type: "number",
      nullable: true,
    },
    { key: "starts_on", label: "Start date", type: "date" },
    { key: "ends_on", label: "End date (optional)", type: "date" },
    {
      key: "effective_from",
      label: "Future months from (first day of month)",
      type: "date",
    },
    { key: "active", label: "Active agreement", type: "checkbox" },
  ],
  invoice: [
    ...common,
    {
      key: "kind",
      label: "Invoice type",
      options: ["one-off", "recurring", "advance", "balance"],
    },
    {
      key: "period",
      label: "Invoice for month",
      type: "month",
    },
    {
      key: "repeat",
      label: "Repeat invoice",
      options: ["none", "monthly", "annually"],
    },
    { key: "due_date", label: "Payment due date", type: "date" },
    { key: "discount", label: "Discount amount", type: "money" },
    {
      key: "tax_bps",
      label: "Tax rate in basis points (100 = 1%)",
      type: "number",
      value: "0",
    },
    { key: "notes", label: "Notes and payment instructions", type: "textarea" },
  ],
  payment: [
    ...common,
    { key: "amount", label: "Amount received", type: "money" },
    { key: "received_on", label: "Payment received date", type: "date" },
    { key: "method", label: "Method", options: ["bank", "cash", "other"] },
    { key: "reference", label: "Bank or transaction reference" },
  ],
  proposal: [
    { key: "title", label: "Proposal title", required: true },
    ...common,
    { key: "price", label: "Approved investment", type: "money" },
  ],
  settings: [
    {
      key: "billing_day",
      label: "Recurring invoice billing day (1–28)",
      type: "number",
      value: "1",
    },
    {
      key: "invoice_notice_days",
      label: "Notify days before a new invoice",
      type: "number",
      value: "7",
    },
    { key: "name", label: "Business name", required: true },
    { key: "address", label: "Business address", type: "textarea" },
    { key: "email", label: "Business email", type: "email" },
    {
      key: "bank_details",
      label: "Bank and payment details",
      type: "textarea",
    },
    { key: "notes", label: "Default invoice notes", type: "textarea" },
    ...common,
    {
      key: "terms_days",
      label: "Default payment terms (days)",
      type: "number",
      value: "14",
    },
    { key: "timezone", label: "Timezone", options: ["Asia/Colombo"] },
    {
      key: "proposal_prompt",
      label: "Proposal drafting instructions",
      type: "textarea",
    },
    {
      key: "number_format",
      label: "Document number format",
      value: "{type}-{company}-{year}-{sequence}",
    },
  ],
};
const briefFields = [
  "needs",
  "goals",
  "scope",
  "deliverables",
  "exclusions",
  "timeline",
  "payment_schedule",
  "maintenance",
  "future_options",
];
export function RecordEditor({
  kind,
  id,
  initial = {},
  companies = [],
  projects = [],
  services = [],
  pendingExpenses = [],
  onSave,
  lockCompany = false,
  inlineReview = false,
}: {
  kind: RecordKind;
  onSave?: (form: FormData) => Promise<string>;
  lockCompany?: boolean;
  inlineReview?: boolean;
  id?: string;
  initial?: Record<string, Json | undefined>;
  companies?: Option[];
  projects?: Option[];
  pendingExpenses?: Tables<"company_expenses">[];
  services?: {
    name: string;
    description: string;
    rate: number;
    currency: string;
  }[];
}) {
  const [message, action, pending] = useActionState(
    onSave ? (_: string, form: FormData) => onSave(form) : saveRecord,
    "",
  );
  const [payload, setPayload] = useState("");
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const [lines, setLines] = useState<Line[]>(
    (initial.items as Line[] | undefined) || [
      { description: "", quantity: "1", rate: 0 },
    ],
  );
  const [sections, setSections] = useState<{ title: string; body: string }[]>(
    (initial.sections as { title: string; body: string }[] | undefined) || [
      { title: "Introduction", body: "" },
      { title: "Proposed solution", body: "" },
      { title: "Scope and deliverables", body: "" },
      { title: "Timeline", body: "" },
      { title: "Acceptance and next steps", body: "" },
    ],
  );
  const [showProposalEditor, setShowProposalEditor] = useState(
    Boolean(initial.sections),
  );
  const [brief, setBrief] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      briefFields.map((key) => [
        key,
        String(
          (initial.brief as Record<string, Json> | undefined)?.[key] || "",
        ),
      ]),
    ),
  );
  const [companyId, setCompanyId] = useState(String(initial.company_id || ""));
  const visibleFields = fields[kind].filter(
    (f) => !(kind === "invoice" && id && f.key === "repeat"),
  );
  const [currency, setCurrency] = useState(String(initial.currency || "LKR"));
  const [discount, setDiscount] = useState(Number(initial.discount || 0));
  const [tax, setTax] = useState(Number(initial.tax_bps || 0));
  const needsCompany = [
    "expense",
    "project",
    "agreement",
    "invoice",
    "payment",
    "proposal",
  ].includes(kind);
  const hasRows = kind === "invoice" || kind === "agreement";
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
  }).format(new Date());
  const automaticExpenses =
    kind === "invoice" && !id
      ? pendingExpenses
          .filter(
            (e) =>
              !e.invoice_id &&
              e.company_id === companyId &&
              e.currency === currency &&
              e.incurred_on <= today,
          )
          .map((e) => ({
            description: e.description,
            quantity: "1",
            rate: e.amount,
            expense_id: e.id,
          }))
      : [];
  const previewLines = [...lines, ...automaticExpenses];
  const summary = (() => {
    try {
      return totals(previewLines, discount, tax);
    } catch {
      return null;
    }
  })();
  function prepare(form: HTMLFormElement) {
    try {
      const data: Record<string, unknown> = {};
      const f = new FormData(form);
      for (const field of visibleFields) {
        const value = String(f.get(field.key) || "");
        data[field.key] =
          field.type === "money"
            ? minor(value || "0")
            : field.type === "month"
              ? value
                ? value + "-01"
                : ""
              : field.type === "number"
                ? field.nullable && value === ""
                  ? null
                  : Number(value)
                : field.type === "checkbox"
                  ? f.has(field.key)
                  : value;
      }
      if (kind === "settings" && initial.brand) data.brand = initial.brand;
      if (needsCompany) {
        data.company_id = String(f.get("company_id"));
        data.project_id = String(f.get("project_id") || "");
      }
      if (hasRows) data.items = lines;
      if (kind === "proposal") {
        if (
          !showProposalEditor ||
          !sections.length ||
          sections.some((s) => !s.title.trim() || !s.body.trim())
        ) {
          throw new Error(
            "Generate a proposal or write its sections before reviewing the draft.",
          );
        }
        data.brief = brief;
        data.sections = sections;
      }
      setPayload(JSON.stringify(data));
      setError("");
      setReview(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check the form");
    }
  }
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          prepare(e.currentTarget);
        }}
        className="card"
        hidden={inlineReview && review}
      >
        <div className="grid">
          {needsCompany && (
            <div className="field">
              <label htmlFor="company_id">Company</label>
              <select
                id="company_id"
                name="company_id"
                defaultValue={String(initial.company_id || "")}
                onChange={(e) => setCompanyId(e.target.value)}
                required
                disabled={Boolean(id) || lockCompany}
              >
                <option value="">Select a company</option>
                {companies.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {(id || lockCompany) && (
                <input
                  type="hidden"
                  name="company_id"
                  value={String(initial.company_id)}
                />
              )}
            </div>
          )}
          {needsCompany && kind !== "project" && kind !== "expense" && (
            <div className="field">
              <label htmlFor="project_id">Project (optional)</label>
              <select
                id="project_id"
                name="project_id"
                defaultValue={String(initial.project_id || "")}
              >
                <option value="">No linked project</option>
                {projects.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {visibleFields.map((field) => {
            const raw = initial[field.key];
            const value =
              raw == null
                ? field.value ||
                  (field.type === "date" &&
                  field.key !== "ends_on" &&
                  field.key !== "period"
                    ? new Date()
                        .toISOString()
                        .slice(0, field.key === "effective_from" ? 7 : 10) +
                      (field.key === "effective_from" ? "-01" : "")
                    : "")
                : field.type === "money"
                  ? major(Number(raw))
                  : field.type === "month"
                    ? String(raw).slice(0, 7)
                    : String(raw);
            return (
              <div
                className={
                  "field " + (field.type === "textarea" ? "span-2" : "")
                }
                key={field.key}
              >
                <label htmlFor={field.key}>{field.label}</label>
                {field.options ? (
                  <select
                    id={field.key}
                    name={field.key}
                    defaultValue={value || field.options[0]}
                    onChange={(e) =>
                      field.key === "currency" && setCurrency(e.target.value)
                    }
                  >
                    {field.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={field.key}
                    name={field.key}
                    defaultValue={value}
                  />
                ) : field.type === "checkbox" ? (
                  <input
                    style={{ width: "auto" }}
                    type="checkbox"
                    id={field.key}
                    name={field.key}
                    defaultChecked={
                      raw == null ? field.key === "active" : Boolean(raw)
                    }
                  />
                ) : (
                  <input
                    id={field.key}
                    name={field.key}
                    type={
                      field.type === "money" ? "number" : field.type || "text"
                    }
                    step={field.type === "money" ? "0.01" : undefined}
                    min={
                      field.type === "money" || field.type === "number"
                        ? "0"
                        : undefined
                    }
                    readOnly={
                      Boolean(id) &&
                      ((field.key === "period" &&
                        Boolean(initial.agreement_id)) ||
                        (kind === "agreement" && field.key === "starts_on"))
                    }
                    defaultValue={value || (field.type === "money" ? "0" : "")}
                    required={
                      field.required ||
                      [
                        "due_date",
                        "received_on",
                        "starts_on",
                        "effective_from",
                      ].includes(field.key)
                    }
                    onChange={(e) => {
                      if (field.key === "discount") {
                        try {
                          setDiscount(minor(e.target.value || "0"));
                        } catch {}
                      }
                      if (field.key === "tax_bps")
                        setTax(Number(e.target.value));
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        {kind === "expense" && (
          <p className="notice">
            This cost will be added once to the next new draft invoice for this
            company and currency. You can edit it until it is attached to an
            invoice.
          </p>
        )}
        {kind === "invoice" && (
          <p className="notice">
            Pending expenses are added automatically when a new draft is saved.
            Review the saved invoice before issuing. Repeating invoices use the
            billing day and advance notice in Settings; manage or stop the
            schedule under Agreements.
          </p>
        )}
        {kind === "invoice" && Boolean(initial.agreement_id) && (
          <p>
            <a href={"/agreements/" + initial.agreement_id + "/edit"}>
              Edit recurring schedule
            </a>
          </p>
        )}
        {hasRows && (
          <section>
            <h2>
              {kind === "agreement"
                ? "Recurring service version"
                : "Invoice items"}
            </h2>
            <p className="muted">
              {kind === "agreement"
                ? "Changes apply from the selected month. Existing drafts and issued invoices stay intact."
                : "Edits apply to this draft only. Change the agreement to update future months."}
            </p>
            {previewLines.map((line, n) => (
              <div className="line-row" key={line.expense_id || n}>
                <input
                  aria-label={"Description " + (n + 1)}
                  placeholder="Service or expense description"
                  readOnly={Boolean(line.expense_id)}
                  value={line.description}
                  required
                  onChange={(e) =>
                    setLines(
                      lines.map((r, i) =>
                        i === n ? { ...r, description: e.target.value } : r,
                      ),
                    )
                  }
                />
                <input
                  readOnly={Boolean(line.expense_id)}
                  aria-label={"Quantity " + (n + 1)}
                  type="number"
                  min="0.001"
                  max="100000"
                  step="0.001"
                  value={line.quantity}
                  required
                  onChange={(e) =>
                    setLines(
                      lines.map((r, i) =>
                        i === n ? { ...r, quantity: e.target.value } : r,
                      ),
                    )
                  }
                />
                <input
                  readOnly={Boolean(line.expense_id)}
                  aria-label={"Unit rate " + (n + 1)}
                  type="number"
                  min="0"
                  max="10000000000"
                  step="0.01"
                  defaultValue={major(line.rate)}
                  required
                  onChange={(e) => {
                    try {
                      const rate = minor(e.target.value || "0");
                      e.currentTarget.setCustomValidity("");
                      setLines(
                        lines.map((r, i) => (i === n ? { ...r, rate } : r)),
                      );
                    } catch {
                      e.currentTarget.setCustomValidity(
                        "Enter a valid rate with at most two decimals.",
                      );
                    }
                  }}
                />
                <button
                  type="button"
                  className="secondary"
                  disabled={Boolean(line.expense_id)}
                  title={
                    line.expense_id
                      ? "Automatically included company expense"
                      : undefined
                  }
                  aria-label={"Remove row " + (n + 1)}
                  onClick={() => setLines(lines.filter((_, i) => i !== n))}
                >
                  ×
                </button>
              </div>
            ))}
            <div className="actions">
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setLines([
                    ...lines,
                    { description: "", quantity: "1", rate: 0 },
                  ])
                }
              >
                + Add item
              </button>
              {services.length > 0 && (
                <select
                  aria-label="Add catalogue service"
                  style={{ width: 240 }}
                  value=""
                  onChange={(e) => {
                    const s = services[Number(e.target.value)];
                    if (s)
                      setLines([
                        ...lines,
                        {
                          description: s.description || s.name,
                          quantity: "1",
                          rate: s.rate,
                        },
                      ]);
                  }}
                >
                  <option value="">Add from service catalogue</option>
                  {services.map((s, i) => (
                    <option
                      value={i}
                      key={i}
                      disabled={s.currency !== currency}
                    >
                      {s.name} · {s.currency}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {summary && (
              <div className="summary">
                <p>
                  <span>Subtotal</span>
                  {formatMoney(summary.subtotal, currency)}
                </p>
                <p>
                  <span>Discount</span>
                  {formatMoney(summary.discount, currency)}
                </p>
                <p>
                  <span>Tax</span>
                  {formatMoney(summary.tax, currency)}
                </p>
                <p className="grand">
                  <span>New charges</span>
                  {formatMoney(summary.total, currency)}
                </p>
              </div>
            )}
          </section>
        )}
        {kind === "proposal" && (
          <>
            <ProposalSource
              onManual={() => setShowProposalEditor(true)}
              onApply={(draft) => {
                if (
                  sections.some((s) => s.body.trim()) &&
                  !window.confirm(
                    "Replace your current proposal sections and project terms with this AI draft?",
                  )
                )
                  return false;
                setSections(draft.sections);
                setBrief(draft.brief);
                setShowProposalEditor(true);
                return true;
              }}
            />
            {showProposalEditor && (
              <div>
                <div className="eyebrow">3 · Edit and save</div>
                <details>
                  <summary>Project terms and additional context</summary>

                  <div className="grid">
                    {briefFields.map((k) => (
                      <div className="field" key={k}>
                        <label htmlFor={"brief." + k}>
                          {k.replaceAll("_", " ")}
                        </label>
                        <textarea
                          name={"brief." + k}
                          id={"brief." + k}
                          value={brief[k] || ""}
                          maxLength={4000}
                          onChange={(e) =>
                            setBrief({ ...brief, [k]: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </details>
                <h2>Edit your proposal</h2>
                <p className="muted">
                  Write the solution before the investment. Commercial fields
                  are controlled separately.
                </p>
                {sections.map((s, i) => (
                  <section className="proposal-section" key={i}>
                    <label>
                      Section heading
                      <input
                        value={s.title}
                        required
                        onChange={(e) =>
                          setSections(
                            sections.map((x, n) =>
                              n === i ? { ...x, title: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      Section content
                      <textarea
                        value={s.body}
                        required
                        onChange={(e) =>
                          setSections(
                            sections.map((x, n) =>
                              n === i ? { ...x, body: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() =>
                        setSections(sections.filter((_, n) => n !== i))
                      }
                    >
                      Remove section
                    </button>
                  </section>
                ))}
                <button
                  type="button"
                  className="secondary"
                  onClick={() =>
                    setSections([...sections, { title: "", body: "" }])
                  }
                >
                  + Add section
                </button>
              </div>
            )}
          </>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="form-footer">
          <button>
            Review{" "}
            {kind === "invoice" || kind === "proposal" ? "draft" : "changes"}
          </button>
          <span className="muted">
            Review before saving. Nothing is issued automatically.
          </span>
        </div>
      </form>
      {review && (
        <div
          className={inlineReview ? "inline-review" : "review"}
          role={inlineReview ? "region" : "dialog"}
          aria-modal={inlineReview ? undefined : true}
          aria-labelledby="review-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              e.preventDefault();
              setReview(false);
            }
            if (e.key === "Tab" && !inlineReview) {
              const targets = [
                ...e.currentTarget.querySelectorAll<HTMLElement>(
                  "button:not([disabled]), a[href], input:not([type=hidden]):not([disabled])",
                ),
              ];
              const first = targets[0];
              const last = targets[targets.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
              }
              if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
              }
            }
          }}
        >
          <section className="card">
            <h2 id="review-title">Review {kind}</h2>
            <p>
              Confirm the details below. Saving a draft does not issue or send
              it.
            </p>
            <dl className="detail-list">
              {needsCompany && (
                <>
                  <dt>Company</dt>
                  <dd>
                    {
                      companies.find(
                        (c) => c.id === JSON.parse(payload).company_id,
                      )?.name
                    }
                  </dd>
                </>
              )}
              {visibleFields.map((field) => {
                const value = JSON.parse(payload)[field.key];
                return (
                  <div style={{ display: "contents" }} key={field.key}>
                    <dt>{field.label}</dt>
                    <dd>
                      {field.type === "money"
                        ? formatMoney(Number(value), currency)
                        : field.type === "checkbox"
                          ? value
                            ? "Yes"
                            : "No"
                          : String(value === "" || value == null ? "—" : value)}
                    </dd>
                  </div>
                );
              })}
            </dl>
            {kind === "expense" && (
              <p className="notice">
                This cost will be added once to the next new draft invoice for
                this company and currency. You can edit it until it is attached
                to an invoice.
              </p>
            )}
            {kind === "invoice" && (
              <p className="notice">
                Pending expenses are added automatically when a new draft is
                saved. Review the saved invoice before issuing. Repeating
                invoices use the billing day and advance notice in Settings;
                manage or stop the schedule under Agreements.
              </p>
            )}
            {kind === "invoice" && Boolean(initial.agreement_id) && (
              <p>
                <a href={"/agreements/" + initial.agreement_id + "/edit"}>
                  Edit recurring schedule
                </a>
              </p>
            )}
            {hasRows && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Quantity</th>
                      <th>Unit rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewLines.map((line, index) => (
                      <tr key={index}>
                        <td>{line.description}</td>
                        <td>{line.quantity}</td>
                        <td>{formatMoney(line.rate, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {summary && (
                  <p className="grand">
                    New charges:{" "}
                    <strong>{formatMoney(summary.total, currency)}</strong>
                  </p>
                )}
              </div>
            )}
            {kind === "proposal" &&
              sections.map((section, index) => (
                <section key={index}>
                  <h3>{section.title}</h3>
                  <p style={{ whiteSpace: "pre-wrap" }}>{section.body}</p>
                </section>
              ))}
            <form action={action}>
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="id" value={id || ""} />
              <input type="hidden" name="payload" value={payload} />
              {message && (
                <p className="error" role="alert">
                  {message}
                </p>
              )}
              <div className="actions">
                <button autoFocus disabled={pending}>
                  {pending
                    ? "Saving…"
                    : kind === "invoice" || kind === "proposal"
                      ? "Save draft"
                      : "Save changes"}
                </button>
                <button
                  type="button"
                  className="secondary"
                  disabled={pending}
                  onClick={() => setReview(false)}
                >
                  Back to editing
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
