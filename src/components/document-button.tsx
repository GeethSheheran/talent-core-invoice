"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function DocumentButton({
  url,
  label = "Generate PDF",
}: {
  url: string;
  label?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <button
        className="secondary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setMessage("");
          try {
            const response = await fetch(url, { method: "POST" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Rendering failed");
            if (data.documentId) {
              const link = document.createElement("a");
              link.href = "/api/documents/" + data.documentId + "/download";
              link.click();
            } else setMessage("Document ready.");
            router.refresh();
          } catch (e) {
            setMessage(e instanceof Error ? e.message : "Unable to render");
            router.refresh();
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Rendering…" : label}
      </button>
      {message && (
        <p role="status" className="error">
          {message}
        </p>
      )}
    </div>
  );
}
