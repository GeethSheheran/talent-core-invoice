"use client";
import { useEffect, useState } from "react";
export function NotificationRecord({ href }: { href?: string }) {
  const [details, setDetails] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(Boolean(href));
  useEffect(() => {
    if (!href) return;
    const abort = new AbortController();
    fetch(`/api/notifications/record?${new URLSearchParams({ path: href })}`, {
      cache: "no-store",
      signal: abort.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Unable to load record.");
        setDetails(result.details);
      })
      .catch((error) => {
        if (!abort.signal.aborted)
          setError(
            error instanceof Error ? error.message : "Unable to load record.",
          );
      })
      .finally(() => {
        if (!abort.signal.aborted) setBusy(false);
      });
    return () => abort.abort();
  }, [href]);
  if (!href)
    return (
      <p className="muted">No current record is linked to this activity.</p>
    );
  return (
    <section className="notification-record">
      <h3>Record details</h3>
      {busy ? (
        <p role="status">Loading record…</p>
      ) : error ? (
        <p role="status">{error}</p>
      ) : (
        <dl className="detail-list">
          {details.map((detail) => (
            <div key={detail.label} style={{ display: "contents" }}>
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
