"use client";
import Link from "@/components/navigation-link";
import { Plus, ArrowUpRight, Search, Filter } from "lucide-react";
import { useId, useState } from "react";
import { ServiceDrawer } from "@/components/service-drawer";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Json } from "@/lib/db/database.types";

export type ServiceItem = {
  id: string;
  name: string;
  description?: string;
  rate: number;
  currency: string;
  archived?: boolean;
  parent_id?: string | null;
  billing_type?: string;
  created_at?: string;
};

export function ServicesList({
  rows,
  initialQuery = "",
}: {
  rows: Record<string, Json | undefined>[];
  initialQuery?: string;
}) {
  const filterId = useId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<"all" | "monthly" | "one-time">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "archived"
  >("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, ServiceItem>>({});
  const [deleted, setDeleted] = useState<string[]>([]);

  const original: ServiceItem[] = rows.map((r) => ({
    id: String(r.id),
    name: String(r.name || ""),
    description: String(r.description || ""),
    rate: Number(r.rate || 0),
    currency: String(r.currency || "LKR"),
    archived: Boolean(r.archived),
    parent_id: r.parent_id ? String(r.parent_id) : null,
    billing_type: String(r.billing_type || "monthly"),
    created_at: r.created_at ? String(r.created_at) : undefined,
  }));

  const services = [
    ...original.filter((s) => !overrides[s.id]),
    ...Object.values(overrides),
  ].filter((s) => !deleted.includes(s.id));
  const mainServices = services.filter((s) => !s.parent_id);
  const subServices = services.filter((s) => Boolean(s.parent_id));

  const filterMatches = (s: ServiceItem) => {
    if (filterStatus === "active" && s.archived) return false;
    if (filterStatus === "archived" && !s.archived) return false;
    if (filterType !== "all" && s.billing_type !== filterType) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchesSelf =
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q);
      // For main services, also match if any of its sub-services match
      if (!s.parent_id) {
        const matchesChild = subServices.some(
          (sub) =>
            sub.parent_id === s.id &&
            (sub.name.toLowerCase().includes(q) ||
              sub.description?.toLowerCase().includes(q)),
        );
        return matchesSelf || matchesChild;
      }
      return matchesSelf;
    }
    return true;
  };

  const filteredMain = mainServices.filter(
    (main) =>
      filterMatches(main) ||
      subServices.some(
        (sub) => sub.parent_id === main.id && filterMatches(sub),
      ),
  );
  const orphanedSub = subServices.filter(
    (sub) =>
      filterMatches(sub) && !mainServices.some((m) => m.id === sub.parent_id),
  );

  return (
    <>
      <div className="heading collection-heading services-heading">
        <div>
          <h1>Services Catalogue</h1>
        </div>
        <div className="collection-heading-tools">
          <div className="services-search-box">
            <Search size={16} className="search-icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search services and sub-services…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search services"
            />
          </div>
          <button
            className="secondary icon-button catalogue-filter-trigger"
            aria-label="Filter services"
            aria-expanded={filtersOpen}
            popoverTarget={filterId}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const panel = document.getElementById(filterId);
              if (panel) {
                panel.style.left = `${Math.max(12, Math.min(rect.right - 280, window.innerWidth - 292))}px`;
                panel.style.top = `${rect.bottom + 8}px`;
              }
            }}
          >
            <Filter size={18} />
            {(filterType !== "all" || filterStatus !== "all") && (
              <span className="filter-active-dot" />
            )}
          </button>
          <div
            id={filterId}
            popover="auto"
            className="catalogue-filter-popover"
            onToggle={(e) => setFiltersOpen(e.newState === "open")}
          >
            <div className="services-filters">
              <div className="filter-group">
                <Filter size={15} aria-hidden="true" />
                <label htmlFor="billing-filter" className="sr-only">
                  Billing frequency
                </label>
                <select
                  id="billing-filter"
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(
                      e.target.value as "all" | "monthly" | "one-time",
                    )
                  }
                >
                  <option value="all">All frequencies</option>
                  <option value="monthly">Monthly only</option>
                  <option value="one-time">One-time only</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="status-filter" className="sr-only">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value as "all" | "active" | "archived",
                    )
                  }
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active only</option>
                  <option value="archived">Archived only</option>
                </select>
              </div>
            </div>
          </div>
          <Link className="button collection-create" href="/services/new">
            <Plus size={17} aria-hidden="true" />
            <span className="create-full-label">Add service</span>
            <span className="create-short-label">New</span>
          </Link>
        </div>
      </div>

      <div className="services-stats">
        <span>
          <strong>{mainServices.length}</strong> Main Services
        </span>
        <span className="separator">·</span>
        <span>
          <strong>{subServices.length}</strong> Sub-Services
        </span>
      </div>

      {!filteredMain.length && !orphanedSub.length ? (
        <section className="card empty">
          <h3>No matching services</h3>
          <p>Try clearing your search filters or add a new service.</p>
          <button
            className="secondary"
            onClick={() => {
              setQuery("");
              setFilterType("all");
              setFilterStatus("all");
            }}
          >
            Clear filters
          </button>
        </section>
      ) : (
        <div className="services-catalogue-grid">
          {[...filteredMain, ...orphanedSub].map((main) => (
            <section
              className="service-card service-grid-card card"
              key={main.id}
            >
              <button
                className="service-card-open"
                onClick={() => setSelected(main.id)}
                aria-label={`Open ${main.name}`}
              >
                <h2 className="service-name">{main.name}</h2>
                <div className="service-meta">
                  <span
                    className={`badge ${main.billing_type === "one-time" ? "one-time" : "monthly"}`}
                  >
                    {main.billing_type === "one-time" ? "One-time" : "Monthly"}
                  </span>
                  <StatusBadge state={main.archived ? "archived" : "active"} />
                </div>
                <span className="service-card-footer">
                  <span>
                    {subServices.filter((s) => s.parent_id === main.id).length}{" "}
                    sub-services
                  </span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </span>
              </button>
            </section>
          ))}
        </div>
      )}
      <ServiceDrawer
        selected={selected}
        services={services}
        onClose={() => setSelected(null)}
        onSaved={(service) =>
          setOverrides((previous) => ({ ...previous, [service.id]: service }))
        }
        onDeleted={(id) => {
          setOverrides((previous) => ({
            ...previous,
            ...Object.fromEntries(
              services
                .filter((s) => s.parent_id === id)
                .map((s) => [s.id, { ...s, parent_id: null }]),
            ),
          }));
          setDeleted((previous) => [...previous, id]);
        }}
      />
    </>
  );
}
