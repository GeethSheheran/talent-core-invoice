"use client";
import { useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
export function ListControls({
  label,
  query,
  onQuery,
  status,
  onStatus,
  options,
}: {
  label: string;
  query: string;
  onQuery: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div className="list-controls">
      <label className="list-search">
        <Search size={16} aria-hidden="true" />
        <input
          aria-label={"Search " + label}
          placeholder={"Search " + label + "…"}
          value={query}
          onChange={(event) => onQuery(event.target.value)}
        />
      </label>
      <div
        className="list-filter"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            trigger.current?.focus();
          }
        }}
      >
        <button
          ref={trigger}
          type="button"
          className={"secondary " + (status ? "filter-active" : "")}
          aria-expanded={open}
          aria-label={"Filter " + label}
          onClick={() => setOpen(!open)}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          Filter{status && <span className="filter-dot" aria-hidden="true" />}
        </button>
        {open && (
          <div className="list-filter-panel">
            <label>
              Status
              <select
                aria-label={label + " status"}
                value={status}
                onChange={(event) => onStatus(event.target.value)}
              >
                <option value="">All statuses</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                onStatus("");
                setOpen(false);
              }}
            >
              <X size={14} aria-hidden="true" />
              Clear filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
