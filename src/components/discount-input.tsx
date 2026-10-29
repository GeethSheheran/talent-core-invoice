"use client";
import { major, minor } from "@/lib/billing/money";
export function DiscountInput({
  label,
  value,
  type,
  onChange,
}: {
  label: string;
  value: number;
  type: "amount" | "percentage";
  onChange: (type: "amount" | "percentage", value: number) => void;
}) {
  return (
    <div className="field discount-field">
      <span>{label}</span>
      <div className="discount-controls">
        <select
          aria-label={`${label} type`}
          value={type}
          onChange={(e) =>
            onChange(e.target.value as "amount" | "percentage", 0)
          }
        >
          <option value="amount">Amount</option>
          <option value="percentage">Percentage (%)</option>
        </select>
        <input
          key={type}
          aria-label={label}
          type="number"
          min="0"
          max={type === "percentage" ? "100" : "10000000000"}
          step="0.01"
          defaultValue={major(value)}
          onChange={(e) => {
            try {
              const amount = minor(e.target.value || "0");
              if (amount < 0 || (type === "percentage" && amount > 10000))
                throw new Error();
              onChange(type, amount);
              e.currentTarget.setCustomValidity("");
            } catch {
              e.currentTarget.setCustomValidity(
                type === "percentage"
                  ? "Enter a percentage from 0 to 100 with at most two decimals."
                  : "Enter a valid amount with at most two decimals.",
              );
            }
          }}
        />
      </div>
    </div>
  );
}
