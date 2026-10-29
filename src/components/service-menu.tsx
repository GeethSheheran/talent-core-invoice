"use client";
import { useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import Link from "@/components/navigation-link";
import { deleteService } from "@/app/(admin)/actions";
export function ServiceMenu({
  service,
}: {
  service: { id: string; name: string };
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <details className="service-menu">
        <summary
          className="button secondary"
          aria-label={`Actions for ${service.name}`}
        >
          <MoreHorizontal size={20} />
        </summary>
        <div className="service-menu-options">
          <Link href={`/services/${service.id}/edit`}>Edit</Link>
          <button
            type="button"
            onClick={() => {
              setError("");
              dialog.current?.showModal();
            }}
          >
            Delete
          </button>
        </div>
      </details>
      <dialog
        ref={dialog}
        aria-label={`Delete ${service.name}`}
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <h2>Delete {service.name}?</h2>
        <p>
          This removes the service from the catalogue. Services with
          sub-services or agreed company services cannot be deleted.
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="actions">
          <button
            className="secondary"
            type="button"
            disabled={busy}
            onClick={() => dialog.current?.close()}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const result = await deleteService(service.id);
                if (result) setError(result);
                else dialog.current?.close();
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
