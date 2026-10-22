"use client";
import { useState } from "react";
import { formatMoney } from "@/lib/billing/money";
export type BillingMonth = {
  month: string;
  issued: number;
  collected: number;
  issuedCompanies: number;
  collectedCompanies: number;
};
export function BillingChart({
  months,
  currency,
}: {
  months: BillingMonth[];
  currency: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const max = Math.max(
    1,
    ...months.flatMap((month) => [month.issued, month.collected]),
  );
  return (
    <div className="chart" aria-label="Monthly billing activity">
      {months.map((month, index) => {
        const label = new Date(
          month.month + "-01T00:00:00Z",
        ).toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        });
        return (
          <div className="chart-month" key={month.month}>
            {(["issued", "collected"] as const).map((kind) => {
              const key = month.month + kind;
              const companies =
                kind === "issued"
                  ? month.issuedCompanies
                  : month.collectedCompanies;
              const description = `${label} · ${kind === "issued" ? "Issued" : "Collected"}: ${formatMoney(month[kind], currency)} · ${companies} ${companies === 1 ? "company" : "companies"}`;
              return (
                <button
                  type="button"
                  key={kind}
                  className={"bar " + (kind === "collected" ? "light" : "")}
                  style={{ height: (month[kind] / max) * 100 + "%" }}
                  aria-label={description}
                  aria-describedby={
                    active === key ? "billing-tooltip" : undefined
                  }
                  onPointerEnter={() => setActive(key)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(key)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive(key)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setActive(null);
                  }}
                >
                  {active === key && (
                    <span
                      role="tooltip"
                      id="billing-tooltip"
                      className={
                        "chart-tooltip " +
                        (index > 3 ? "align-right" : "align-left")
                      }
                    >
                      <strong>
                        {label} · {kind === "issued" ? "Issued" : "Collected"}
                      </strong>
                      <span>{formatMoney(month[kind], currency)}</span>
                      <small>
                        {companies} {companies === 1 ? "company" : "companies"}
                      </small>
                    </span>
                  )}
                </button>
              );
            })}
            <span className="chart-label">{label.split(" ")[0]}</span>
          </div>
        );
      })}
    </div>
  );
}
