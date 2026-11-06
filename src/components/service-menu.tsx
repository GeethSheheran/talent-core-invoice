"use client";
import { useId, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import Link from "@/components/navigation-link";
import { deleteService } from "@/app/(admin)/actions";
export function ServiceMenu({
  service,
  canAddSubservice = false,
  onEdit,
  onDeleted,
}: {
  service: { id: string; name: string };
  canAddSubservice?: boolean;
  onEdit?: () => void;
  onDeleted?: () => void;
}) {
  const menuId = useId();
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="button secondary service-menu-trigger"
        aria-label={`Actions for ${service.name}`}
        aria-expanded={open}
        aria-controls={menuId}
        popoverTarget={menuId}
        popoverTargetAction="toggle"
        onClick={() => {
          if (!menu.current || !trigger.current) return;
          const rect = trigger.current.getBoundingClientRect();
          menu.current.style.left = `${Math.max(12, Math.min(rect.right - 210, window.innerWidth - 222))}px`;
          const height = canAddSubservice ? 150 : 108;
          menu.current.style.top = `${Math.max(12, Math.min(rect.bottom + 6, window.innerHeight - height - 12))}px`;
        }}
      >
        <MoreHorizontal size={20} aria-hidden="true" />
      </button>
      <div
        id={menuId}
        ref={menu}
        popover="auto"
        className="service-menu-options service-actions-popover"
        role="group"
        aria-label={`Options for ${service.name}`}
        onToggle={(event) => setOpen(event.newState === "open")}
      >
        {canAddSubservice && (
          <Link
            href={`/services/new?parent=${service.id}`}
            onClick={() => menu.current?.hidePopover()}
          >
            Add sub-service
          </Link>
        )}
        {onEdit ? (
          <button
            type="button"
            onClick={() => {
              menu.current?.hidePopover();
              onEdit();
            }}
          >
            Edit
          </button>
        ) : (
          <Link
            href={`/services/${service.id}/edit`}
            onClick={() => menu.current?.hidePopover()}
          >
            Edit
          </Link>
        )}
        <button
          className="service-delete-option"
          type="button"
          onClick={() => {
            setError("");
            menu.current?.hidePopover();
            dialog.current?.showModal();
          }}
        >
          Delete
        </button>
      </div>
      <dialog
        ref={dialog}
        className="service-delete-dialog"
        onClose={() => trigger.current?.focus()}
        aria-label={`Delete ${service.name}`}
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <h2>Delete {service.name}?</h2>
        <p>
          This removes the service from the catalogue. Its sub-services are kept
          as standalone services. Services used in company agreements cannot be
          deleted.
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="actions">
          <button
            className="secondary"
            autoFocus
            type="button"
            disabled={busy}
            onClick={() => dialog.current?.close()}
          >
            Cancel
          </button>
          <button
            className="danger-button"
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const result = await deleteService(service.id);
                if (result) setError(result);
                else {
                  dialog.current?.close();
                  onDeleted?.();
                }
              } catch {
                setError("Unable to delete. Please try again.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Deleting…" : "Delete service"}
          </button>
        </div>
      </dialog>
    </>
  );
}
