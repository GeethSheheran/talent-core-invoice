"use client";
import { useActionState, useState } from "react";
import { DiscountInput } from "@/components/discount-input";
import { ProposalSource } from "@/components/proposal-source";
import { saveRecord } from "@/app/(admin)/actions";
import { major, minor, currencies, formatMoney } from "@/lib/billing/money";
import { totals, type Line } from "@/lib/billing/totals";
import type { RecordKind } from "@/lib/validation/schemas";
import type { Tables, Json } from "@/lib/db/database.types";
import {
  agreedServiceLines,
  discountAmount,
  serviceDiscount,
  type AgreedService as PackageItem,
} from "@/lib/billing/agreed-services";
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
    {
      key: "billing_type",
      label: "Payment frequency",
      options: ["monthly", "one-time"],
      value: "monthly",
    },
    { key: "rate", label: "Default rate", type: "money" },

    ...common,
  ],
  project: [
    { key: "name", label: "Agreed services name", required: true },
    { key: "scope", label: "Scope & Details", type: "textarea" },
    ...common,
    { key: "price", label: "Agreed total", type: "money" },
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
    {
      key: "method",
      label: "Method",
      options: ["bank", "cash", "cheque", "other"],
    },
    { key: "reference", label: "Invoice number" },
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
  availableCredit,
  billedServiceIds = [],
  previousBalance,
}: {
  kind: RecordKind;
  onSave?: (form: FormData) => Promise<string>;
  lockCompany?: boolean;
  inlineReview?: boolean;
  id?: string;
  initial?: Record<string, Json | undefined>;
  companies?: Option[];
  projects?: (Option & {
    items?: Json;
    company_id?: string;
    state?: string;
    discount?: number;
    price?: number;
  })[];
  pendingExpenses?: Tables<"company_expenses">[];
  services?: {
    id?: string;
    parent_id?: string | null;
    billing_type?: string;
    name: string;
    description: string;
    rate: number;
    currency: string;
  }[];
  availableCredit?: number;
  billedServiceIds?: string[];
  previousBalance?: number;
}) {
  const [message, action, pending] = useActionState(
    onSave ? (_: string, form: FormData) => onSave(form) : saveRecord,
    "",
  );
  const [payload, setPayload] = useState("");
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  function companyLines(company: string, currency: string): Line[] {
    const agreed = projects.filter(
      (p) =>
        p.company_id === company &&
        p.currency === currency &&
        p.state === "active",
    );
    const result = agreed.flatMap((p) =>
      Array.isArray(p.items) && p.items.length
        ? agreedServiceLines(
            p.items as unknown as PackageItem[],
            p.discount || 0,
            billedServiceIds,
          )
        : [{ description: p.name, quantity: "1", rate: p.price || 0 }],
    );
    return result.length
      ? result
      : [{ description: "", quantity: "1", rate: 0 }];
  }
  const [lines, setLines] = useState<Line[]>(() =>
    (initial.items as Line[] | undefined)?.length
      ? (initial.items as Line[])
      : kind === "invoice" && !id
        ? companyLines(
            String(initial.company_id || ""),
            String(initial.currency || "LKR"),
          )
        : [{ description: "", quantity: "1", rate: 0 }],
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
  const [parentId, setParentId] = useState(String(initial.parent_id || ""));
  const [currency, setCurrency] = useState(String(initial.currency || "LKR"));
  const [projectId, setProjectId] = useState(String(initial.project_id || ""));
  const eligibleProjects = projects.filter(
    (p) =>
      (!p.company_id || p.company_id === companyId) && p.currency === currency,
  );
  const [packageItems, setPackageItems] = useState<PackageItem[]>(() =>
    Array.isArray(initial.items) && kind === "project"
      ? (initial.items as unknown as PackageItem[])
      : [],
  );
  const [packageDiscount, setPackageDiscount] = useState<number>(
    Number(initial.discount_value ?? initial.discount ?? 0),
  );
  const [packageDiscountType, setPackageDiscountType] = useState<
    "amount" | "percentage"
  >(initial.discount_type === "percentage" ? "percentage" : "amount");
  const visibleFields = fields[kind].filter(
    (f) =>
      !(
        kind === "invoice" &&
        (["discount", "tax_bps"].includes(f.key) || (id && f.key === "repeat"))
      ) &&
      !(kind === "project" && ["name", "price", "advance"].includes(f.key)),
  );
  const [discount, setDiscount] = useState(Number(initial.discount || 0));
  const [discountType, setDiscountType] = useState<"amount" | "percentage">(
    "amount",
  );
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
  const effectiveLines = lines;
  const previewLines: Line[] = [...effectiveLines, ...automaticExpenses];
  const summary = (() => {
    try {
      return totals(
        previewLines,
        kind === "invoice"
          ? discountAmount(
              totals(previewLines).subtotal,
              discountType,
              discount,
            )
          : discount,
        tax,
      );
    } catch {
      return null;
    }
  })();

  let packageNetPrice = 0;
  let packageDiscountAmount = 0;
  let packageError = "";
  try {
    packageDiscountAmount = discountAmount(
      totals(agreedServiceLines(packageItems)).total,
      packageDiscountType,
      packageDiscount,
    );
    packageNetPrice = totals(
      agreedServiceLines(packageItems, packageDiscountAmount),
    ).total;
  } catch (e) {
    packageError = e instanceof Error ? e.message : "Check service amounts";
  }

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
      if (hasRows) data.items = effectiveLines;
      if (kind === "invoice") {
        if (!summary) throw new Error("Check invoice amounts and discount.");
        data.discount = summary.discount;
        data.tax_bps = tax;
        // Company services are copied into editable draft rows, without invoking a schedule.
        data.project_id = id ? String(initial.project_id || "") : "";
      }
      if (kind === "service") {
        data.parent_id = parentId || null;
        data.archived = Boolean(initial.archived);
        data.billing_type = String(f.get("billing_type") || "monthly");
      }
      if (kind === "project") {
        if (!packageItems.length)
          throw new Error(
            "Add at least one agreed service from the catalogue.",
          );
        if (packageError) throw new Error(packageError);
        data.advance = 0;
        data.name = packageItems
          .map((item) => item.name)
          .join(", ")
          .slice(0, 160);
        data.discount = packageDiscountAmount;
        data.discount_type = packageDiscountType;
        data.discount_value = packageDiscount;
        if (packageItems.length > 0) {
          data.items = packageItems.map((item) => ({
            ...item,
            discount: serviceDiscount(item),
          }));
          data.price = packageNetPrice;
        } else {
          data.items = [];
        }
      }
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
        <div
          className={
            kind === "service"
              ? "grid service-editor-grid"
              : kind === "payment"
                ? "grid payment-editor-grid"
                : "grid"
          }
        >
          {needsCompany && (
            <div className="field field-company">
              <label htmlFor="company_id">Company</label>
              <select
                id="company_id"
                name="company_id"
                defaultValue={String(initial.company_id || "")}
                onChange={(e) => {
                  const company = companies.find(
                    (c) => c.id === e.target.value,
                  );
                  const nextCurrency = company?.currency || currency;
                  setCompanyId(e.target.value);
                  setCurrency(nextCurrency);
                  if (kind === "invoice" && !id)
                    setLines(companyLines(e.target.value, nextCurrency));
                  const choices = projects.filter(
                    (p) =>
                      p.company_id === e.target.value &&
                      p.currency === nextCurrency &&
                      p.state === "active",
                  );
                  setProjectId(
                    kind === "invoice" && choices.length === 1
                      ? choices[0].id
                      : "",
                  );
                }}
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
          {needsCompany &&
            kind !== "project" &&
            kind !== "expense" &&
            kind !== "invoice" &&
            kind !== "payment" && (
              <div className="field">
                <label htmlFor="project_id">Agreed services (optional)</label>
                <select
                  id="project_id"
                  name="project_id"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  <option value="">No linked services</option>
                  {eligibleProjects.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          {kind === "service" && (
            <div className="field service-parent-field">
              <label htmlFor="parent_id">Main service</label>
              <select
                id="parent_id"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">This is a main service</option>
                {services
                  .filter(
                    (s) =>
                      !s.parent_id && s.id !== id && s.currency === currency,
                  )
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
          {kind === "payment" && initial.invoice_total != null && (
            <div className="field field-invoice-total">
              <label htmlFor="invoice_total">Full invoice amount</label>
              <input
                id="invoice_total"
                readOnly
                value={major(Number(initial.invoice_total))}
              />
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
                  "field field-" +
                  field.key +
                  " " +
                  (field.type === "textarea" ? "span-2" : "")
                }
                key={field.key}
              >
                <label htmlFor={field.key}>{field.label}</label>
                {field.options ? (
                  <select
                    id={field.key}
                    name={field.key}
                    defaultValue={
                      field.key === "currency"
                        ? undefined
                        : value || field.options[0]
                    }
                    value={field.key === "currency" ? currency : undefined}
                    onChange={(e) =>
                      field.key === "currency" &&
                      (setCurrency(e.target.value),
                      setProjectId(""),
                      kind === "service" && setParentId(""),
                      kind === "invoice" &&
                        !id &&
                        setLines(companyLines(companyId, e.target.value)))
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
                      (kind === "payment" &&
                        field.key === "reference" &&
                        Boolean(initial.reference)) ||
                      (Boolean(id) &&
                        ((field.key === "period" &&
                          Boolean(initial.agreement_id)) ||
                          (kind === "agreement" && field.key === "starts_on")))
                    }
                    defaultValue={
                      value ||
                      (field.type === "month"
                        ? today.slice(0, 7)
                        : field.type === "money"
                          ? "0"
                          : "")
                    }
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
                      if (field.key === "tax_bps")
                        setTax(Number(e.target.value));
                      if (field.key === "discount") {
                        try {
                          setDiscount(minor(e.target.value || "0"));
                        } catch {}
                      }
                    }}
                  />
                )}
              </div>
            );
          })}
          {kind === "invoice" && (
            <DiscountInput
              label="Discount"
              type={discountType}
              value={discount}
              onChange={(type, value) => {
                setDiscountType(type);
                setDiscount(value);
              }}
            />
          )}
        </div>
        {kind === "project" && (
          <section>
            <h2>Services agreed with this company</h2>
            <p className="muted">
              Choose a main service or a sub-service on its own. Selecting a
              main service does not add its sub-services. Set the agreed rate
              and billing frequency. Monthly services create a draft each month.
              One-time services are included once. Changes apply to new drafts.
            </p>
            <select
              aria-label="Add agreed service"
              value=""
              onChange={(e) => {
                const service = services.find((s) => s.id === e.target.value);
                if (service)
                  setPackageItems([
                    ...packageItems,
                    {
                      service_id: service.id,
                      ui_key: crypto.randomUUID(),
                      name: service.name,
                      description: service.description,
                      quantity: "1",
                      rate: service.rate,
                      discount: 0,
                      billing_type:
                        service.billing_type === "one-time"
                          ? "one-time"
                          : "monthly",
                    },
                  ]);
              }}
            >
              <option value="">+ Choose a catalogue service</option>
              <optgroup label="Main services">
                {services
                  .filter((s) => s.currency === currency && !s.parent_id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Sub-services only">
                {services
                  .filter((s) => s.currency === currency && s.parent_id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {services.find((parent) => parent.id === s.parent_id)
                        ?.name || "Main service"}{" "}
                      / {s.name}
                    </option>
                  ))}
              </optgroup>
            </select>
            {!packageItems.length && (
              <p className="notice">
                Add a service above. Create new services in the Services
                catalogue first.
              </p>
            )}
            {packageItems.map((item, index) => {
              const change = (value: Partial<PackageItem>) =>
                setPackageItems(
                  packageItems.map((row, n) =>
                    n === index ? { ...row, ...value } : row,
                  ),
                );
              const amountChange = (
                event: React.ChangeEvent<HTMLInputElement>,
                key: "rate" | "discount",
              ) => {
                try {
                  change({ [key]: minor(event.target.value || "0") });
                  event.currentTarget.setCustomValidity("");
                } catch {
                  event.currentTarget.setCustomValidity(
                    "Enter an amount with at most two decimals.",
                  );
                }
              };
              return (
                <fieldset
                  className="agreed-service-row"
                  key={item.id || item.ui_key || index}
                >
                  <legend>{item.name}</legend>
                  <div className="grid">
                    <label>
                      Quantity
                      <input
                        aria-label={`Service quantity ${index + 1}`}
                        type="number"
                        min="0.001"
                        max="100000"
                        step="0.001"
                        required
                        value={item.quantity}
                        onChange={(e) => change({ quantity: e.target.value })}
                      />
                    </label>
                    <label>
                      Agreed rate
                      <input
                        aria-label={`Agreed rate ${index + 1}`}
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        defaultValue={major(item.rate)}
                        onChange={(e) => amountChange(e, "rate")}
                      />
                    </label>
                  </div>
                  <div className="service-discount-frequency">
                    <DiscountInput
                      label={`Service discount ${index + 1}`}
                      type={item.discount_type || "amount"}
                      value={item.discount_value ?? item.discount ?? 0}
                      onChange={(type, value) =>
                        change({ discount_type: type, discount_value: value })
                      }
                    />
                    <label>
                      Payment frequency
                      <select
                        aria-label={`Payment frequency ${index + 1}`}
                        value={item.billing_type}
                        onChange={(e) =>
                          change({
                            billing_type: e.target
                              .value as PackageItem["billing_type"],
                          })
                        }
                      >
                        <option value="monthly">Monthly</option>
                        <option value="one-time">One-time</option>
                      </select>
                    </label>
                  </div>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() =>
                      setPackageItems(
                        packageItems.filter((_, n) => n !== index),
                      )
                    }
                  >
                    Remove {item.name}
                  </button>
                </fieldset>
              );
            })}
            <DiscountInput
              label="Full-service discount"
              type={packageDiscountType}
              value={packageDiscount}
              onChange={(type, value) => {
                setPackageDiscountType(type);
                setPackageDiscount(value);
              }}
            />
            <p className="muted">
              The full-service discount is shared proportionally across services
              after each line discount. Only the monthly share repeats.
            </p>
            {packageError ? (
              <p className="error" role="alert">
                {packageError}
              </p>
            ) : (
              <p className="grand">
                First billing total: {formatMoney(packageNetPrice, currency)}
              </p>
            )}
          </section>
        )}
        {kind === "invoice" &&
        (availableCredit || previousBalance) &&
        companyId === initial.company_id &&
        currency === initial.currency ? (
          <p className="notice">
            Earlier unpaid balance:{" "}
            {formatMoney(previousBalance || 0, currency)}. Available payment
            credit: {formatMoney(availableCredit || 0, currency)}. Credit is
            applied when issuing; earlier balances are listed separately.
          </p>
        ) : null}
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
            schedule under Agreements. Available payment credit applies when
            issuing; earlier unpaid balances are listed separately.
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
                  key={`${line.service_item_id || n}-${line.rate}`}
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
            {
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
                      if (s && s.currency === currency)
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
            }
            {previewLines.some((line) => line.discount) && (
              <p className="muted">
                Service discounts included:{" "}
                {formatMoney(
                  previewLines.reduce(
                    (sum, line) => sum + (line.discount || 0),
                    0,
                  ),
                  currency,
                )}
              </p>
            )}
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
            <h2 id="review-title">
              Review {kind === "project" ? "agreed services" : kind}
            </h2>
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
              {kind === "service" && (
                <div className="field service-parent-field">
                  <label htmlFor="parent_id">Main service</label>
                  <select
                    id="parent_id"
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                  >
                    <option value="">This is a main service</option>
                    {services
                      .filter(
                        (s) =>
                          !s.parent_id &&
                          s.id !== id &&
                          s.currency === currency,
                      )
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
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
                manage or stop the schedule under Agreements. Available payment
                credit applies when issuing; earlier unpaid balances are listed
                separately.
              </p>
            )}
            {kind === "invoice" && Boolean(initial.agreement_id) && (
              <p>
                <a href={"/agreements/" + initial.agreement_id + "/edit"}>
                  Edit recurring schedule
                </a>
              </p>
            )}
            {kind === "project" && (
              <div>
                <h3>Agreed services</h3>
                {packageItems.map((item, n) => (
                  <p key={n}>
                    {item.name} · {item.billing_type} · {item.quantity} ×{" "}
                    {formatMoney(item.rate, currency)} · Discount{" "}
                    {formatMoney(serviceDiscount(item), currency)}
                  </p>
                ))}
                <p>
                  Full-service discount:{" "}
                  {formatMoney(packageDiscountAmount, currency)}
                </p>
                <p className="grand">
                  First billing total: {formatMoney(packageNetPrice, currency)}
                </p>
              </div>
            )}
            {hasRows && (
              <div className="table-wrap">
                <table className="responsive-table">
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
                        <td data-label="Service">{line.description}</td>
                        <td data-label="Quantity">{line.quantity}</td>
                        <td data-label="Unit rate">
                          {formatMoney(line.rate, currency)}
                        </td>
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
