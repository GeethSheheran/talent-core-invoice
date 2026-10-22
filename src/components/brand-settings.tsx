"use client";
import { useActionState, useState } from "react";
import { saveBrand } from "@/app/(admin)/actions";
import type { Brand } from "@root/config/brand.schema";
export function BrandSettings({ initial }: { initial: Brand }) {
  const [brand, setBrand] = useState(initial);
  const [message, action, pending] = useActionState(saveBrand, "");
  return (
    <form className="card" action={action}>
      <h2>Branding</h2>
      <p>
        Use original assets in public/brand. New versions affect new documents
        only.
      </p>
      <div className="grid">
        {(
          [
            "name",
            "version",
            "primary",
            "accent",
            "ink",
            "logo",
            "font",
            "documentTitle",
          ] as const
        ).map((k) => (
          <label key={k}>
            {k}
            <input
              type={["primary", "accent", "ink"].includes(k) ? "color" : "text"}
              value={brand[k] || ""}
              onChange={(e) =>
                setBrand({ ...brand, [k]: e.target.value || null })
              }
            />
          </label>
        ))}
      </div>
      <input type="hidden" name="brand" value={JSON.stringify(brand)} />
      <button disabled={pending}>Save branding</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
