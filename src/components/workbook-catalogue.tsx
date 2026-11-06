"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importServiceWorkbook } from "@/app/(admin)/actions";
import groups from "@/lib/services/workbook-catalogue.json";

export function WorkbookCatalogue({ empty }: { empty: boolean }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <details className="workbook-catalogue" open={empty || undefined}>
      <summary>
        Your workbook: 9 main services ·{" "}
        {groups.reduce((sum, g) => sum + g.children.length, 0)} sub-services &
        packages
      </summary>
      <p>
        Import the service hierarchy from <strong>Our Service (2).xlsx</strong>{" "}
        into your catalogue. Package descriptions retain their included services
        and pricing tiers.
      </p>
      <div className="workbook-category-grid">
        {groups.map((group) => (
          <section className="workbook-category" key={group.name}>
            <h3>{group.name}</h3>
            {group.children.length ? (
              <ul>
                {group.children.map((child) => (
                  <li key={child.name}>{child.name}</li>
                ))}
              </ul>
            ) : (
              <p>No sub-services listed in the workbook.</p>
            )}
          </section>
        ))}
      </div>
      <p className="muted">
        Existing matching services and their prices are kept. Unpriced
        sub-services are imported inactive; enter their agreed rate and choose
        Active to enable them. Main categories have no separate charge. Existing
        services under other categories are not moved.
      </p>
      <button
        disabled={pending}
        type="button"
        onClick={() =>
          start(async () => {
            setMessage("");
            try {
              const response = await importServiceWorkbook();
              if (response.error) {
                setMessage(response.error);
                router.refresh();
              } else {
                const result = response.result as {
                  added: number;
                  existing: number;
                };
                setMessage(
                  `${result.added} services added; ${result.existing} existing services kept.`,
                );
                router.refresh();
              }
            } catch {
              setMessage(
                "Unable to import. Please retry; existing services will not be duplicated.",
              );
            }
          })
        }
      >
        {pending ? "Importing catalogue…" : "Import workbook services"}
      </button>
      {message && <p role="status">{message}</p>}
    </details>
  );
}
