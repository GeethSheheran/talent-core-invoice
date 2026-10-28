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
  const [searchOpen, setSearchOpen] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div className="list-controls" data-search-open={searchOpen}>
      <button
        ref={searchTrigger}
        type="button"
        className="secondary mobile-search-toggle"
        aria-label={"Search " + label}
        aria-expanded={searchOpen}
        onClick={() => {
          setSearchOpen(!searchOpen);
          if (!searchOpen) requestAnimationFrame(() => search.current?.focus());
        }}
      >
        {searchOpen ? (
          <X size={18} aria-hidden="true" />
        ) : (
          <Search size={18} aria-hidden="true" />
        )}
      </button>
      <label className="list-search">
        <Search size={16} aria-hidden="true" />
        <input
          ref={search}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setSearchOpen(false);
              searchTrigger.current?.focus();
            }
          }}
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
          <span className="filter-label">Filter</span>
          {status && <span className="filter-dot" aria-hidden="true" />}
        </button>
        <div className="list-filter-panel" hidden={!open} inert={!open}>
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
      </div>
    </div>
  );
}
