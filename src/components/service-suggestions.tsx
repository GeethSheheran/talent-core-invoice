"use client";
import { useState } from "react";
import groups from "@/lib/services/workbook-suggestions.json";

export type ServiceSuggestion = {
  name: string;
  description: string;
  rate: number | null;
  billing_type: string;
};

export function ServiceSuggestions({
  onApply,
  hasParent,
}: {
  onApply: (value: ServiceSuggestion) => void;
  hasParent: boolean;
}) {
  const [group, setGroup] = useState(0);
  const [choice, setChoice] = useState("");
  const selected =
    choice === "main"
      ? {
          name: groups[group].name,
          description: "",
          rate: null,
          billing_type: "monthly",
        }
      : groups[group].suggestions[Number(choice)];
  return (
    <details className="service-suggestions">
      <summary>Start from your service workbook</summary>
      <p>
        Create a main service first, then add its packages or sub-services
        beneath it. Suggestions are editable and are saved only after review.
      </p>
      <div className="grid">
        <div className="field">
          <label htmlFor="suggestion-group">Service category</label>
          <select
            id="suggestion-group"
            value={group}
            onChange={(e) => {
              setGroup(Number(e.target.value));
              setChoice("");
            }}
          >
            {groups.map((item, index) => (
              <option key={item.name} value={index}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="suggestion-choice">Workbook suggestion</label>
          <select
            id="suggestion-choice"
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
          >
            <option value="">Choose a suggestion</option>
            {!hasParent && (
              <option value="main">{groups[group].name} — main service</option>
            )}
            {groups[group].suggestions.map((item, index) => (
              <option key={index} value={index}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {choice && selected && (
        <>
          <p className="service-suggestion-preview">
            {selected.description || "Add your scope and agreed pricing below."}
          </p>
          <p className="muted">
            {selected.rate == null
              ? "No fixed price selected. Enter the agreed rate below."
              : "Workbook price is in LKR. Confirm it before saving."}{" "}
            Applying replaces the name, description, frequency and rate below.
          </p>
          <button
            type="button"
            className="secondary"
            onClick={() => onApply(selected)}
          >
            Use suggestion
          </button>
        </>
      )}
    </details>
  );
}
