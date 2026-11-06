"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, Plus, X } from "lucide-react";
import { RecordEditor } from "@/components/record-editor";
import { ServiceMenu } from "@/components/service-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { saveServiceInDrawer } from "@/app/(admin)/actions";
import { formatMoney } from "@/lib/billing/money";
import type { ServiceItem } from "@/components/services-list";

export function ServiceDrawer({
  selected,
  services,
  onClose,
  onSaved,
  onDeleted,
}: {
  selected: string | null;
  services: ServiceItem[];
  onClose: () => void;
  onSaved: (service: ServiceItem) => void;
  onDeleted: (id: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [rootId, setRootId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "detail" | "edit" | "add">("list");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!selected) return;
    // Opening a different card is an external selection event.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRootId(selected);
    setDetailId(null);
    setMode("list");
    setNotice("");
    dialog.current?.showModal();
  }, [selected]);
  useEffect(() => {
    if (rootId) heading.current?.focus();
  }, [mode, detailId, rootId]);
  const root = services.find((s) => s.id === rootId);
  const detail = services.find((s) => s.id === detailId);
  const current = detail || root;
  const children = services.filter((s) => s.parent_id === rootId);
  const title =
    mode === "add"
      ? "Add sub-service"
      : mode === "edit"
        ? `Edit ${current?.name || "service"}`
        : mode === "detail"
          ? current?.name
          : root?.name;
  function back() {
    setMode(mode === "edit" && detail ? "detail" : "list");
    if (mode !== "edit") setDetailId(null);
  }
  return (
    <dialog
      ref={dialog}
      className="service-drawer"
      aria-labelledby="service-drawer-title"
      onClose={onClose}
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          const r = e.currentTarget.getBoundingClientRect();
          if (e.clientX < r.left || e.clientX > r.right)
            dialog.current?.close();
        }
      }}
    >
      <header className="service-drawer-header">
        {mode !== "list" && (
          <button
            className="secondary icon-button"
            aria-label="Back"
            disabled={busy}
            onClick={back}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 ref={heading} tabIndex={-1} id="service-drawer-title">
          {title}
        </h2>
        <button
          className="secondary icon-button"
          aria-label="Close services"
          disabled={busy}
          onClick={() => dialog.current?.close()}
        >
          <X size={20} />
        </button>
      </header>
      <div className="service-drawer-body">
        <p role="status" className="service-save-status">
          {notice}
        </p>
        {root && (
          <div
            className="service-drawer-view"
            key={`${mode}-${detailId || rootId}`}
          >
            {mode === "list" && (
              <>
                <div className="service-drawer-toolbar">
                  <span>{children.length} sub-services</span>
                  <button
                    onClick={() => {
                      setMode("add");
                      setDetailId(null);
                      setNotice("");
                    }}
                  >
                    <Plus size={16} /> Add sub-service
                  </button>
                  <ServiceMenu
                    service={root}
                    onEdit={() => {
                      setDetailId(null);
                      setMode("edit");
                    }}
                    onDeleted={() => {
                      onDeleted(root.id);
                      dialog.current?.close();
                    }}
                  />
                </div>
                {children.length ? (
                  <div className="service-drawer-list">
                    {children.map((sub) => (
                      <div className="sub-service-row" key={sub.id}>
                        <button
                          className="service-sub-open"
                          onClick={() => {
                            setDetailId(sub.id);
                            setMode("detail");
                            setNotice("");
                          }}
                        >
                          <span>{sub.name}</span>
                          <strong>{formatMoney(sub.rate, sub.currency)}</strong>
                          <ChevronRight size={16} aria-hidden="true" />
                        </button>
                        <ServiceMenu
                          service={sub}
                          onEdit={() => {
                            setDetailId(sub.id);
                            setMode("edit");
                            setNotice("");
                          }}
                          onDeleted={() => onDeleted(sub.id)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty">
                    <p>No sub-services yet.</p>
                    <p>Add the first sub-service to this category.</p>
                  </div>
                )}
              </>
            )}
            {mode === "detail" && current && (
              <>
                <div className="service-detail-price">
                  {formatMoney(current.rate, current.currency)}
                </div>
                <dl className="service-detail-facts">
                  <div>
                    <dt>Main service</dt>
                    <dd>{root.name}</dd>
                  </div>
                  <div>
                    <dt>Frequency</dt>
                    <dd>
                      {current.billing_type === "one-time"
                        ? "One-time"
                        : "Monthly"}
                    </dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <StatusBadge
                        state={current.archived ? "archived" : "active"}
                      />
                    </dd>
                  </div>
                </dl>
                <button
                  onClick={() => {
                    setMode("edit");
                    setNotice("");
                  }}
                >
                  Edit sub-service
                </button>
              </>
            )}
            {(mode === "edit" || mode === "add") && (
              <RecordEditor
                kind="service"
                id={mode === "edit" ? current?.id : undefined}
                initial={
                  mode === "edit"
                    ? { ...current }
                    : {
                        parent_id: root.id,
                        currency: root.currency,
                        billing_type: root.billing_type,
                        archived: false,
                      }
                }
                services={services
                  .filter((s) => !s.archived)
                  .map((s) => ({ ...s, description: s.description || "" }))}
                inlineReview
                onSave={async (form) => {
                  setBusy(true);
                  try {
                    const result = await saveServiceInDrawer(form);
                    if ("error" in result)
                      return result.error || "Unable to save service.";
                    const data = JSON.parse(
                      String(form.get("payload")),
                    ) as Omit<ServiceItem, "id">;
                    onSaved({ ...data, id: result.id });
                    setDetailId(result.id === root.id ? null : result.id);
                    setMode(result.id === root.id ? "list" : "detail");
                    setNotice("Service saved.");
                    return "";
                  } catch {
                    return "Unable to save. Please try again.";
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}
