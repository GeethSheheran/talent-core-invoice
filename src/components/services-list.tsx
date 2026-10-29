"use client";
import { ServiceMenu } from "@/components/service-menu";
import Link from "@/components/navigation-link";
import { Plus, Layers, CornerDownRight, Search, Filter } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/billing/money";
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
  const [query, setQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<"all" | "monthly" | "one-time">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "archived"
  >("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const services: ServiceItem[] = rows.map((r) => ({
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

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: prev[id] === false }));
  };

  return (
    <>
      <div className="heading collection-heading">
        <div>
          <h1>Services Catalogue</h1>
        </div>
        <div className="collection-heading-tools">
          <Link className="button collection-create" href="/services/new">
            <Plus size={17} aria-hidden="true" />
            <span className="create-full-label">Add service</span>
            <span className="create-short-label">New</span>
          </Link>
        </div>
      </div>

      <div className="services-toolbar card">
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
                setFilterType(e.target.value as "all" | "monthly" | "one-time")
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
                setFilterStatus(e.target.value as "all" | "active" | "archived")
              }
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="archived">Archived only</option>
            </select>
          </div>
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
        <div className="services-tree-grid">
          {filteredMain.map((main) => {
            const children = subServices.filter(
              (sub) => sub.parent_id === main.id && filterMatches(sub),
            );
            const allChildren = subServices.filter(
              (sub) => sub.parent_id === main.id,
            );
            const isCollapsed = expanded[main.id] === false;

            return (
              <section className="service-card card" key={main.id}>
                <div className="service-card-header">
                  <div className="service-title-wrap">
                    <span className="service-icon">
                      <Layers size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <div className="service-meta">
                        <span className="badge main-service">Main Service</span>
                        <span
                          className={`badge ${main.billing_type === "one-time" ? "one-time" : "monthly"}`}
                        >
                          {main.billing_type === "one-time"
                            ? "One-time"
                            : "Monthly"}
                        </span>
                        <StatusBadge
                          state={main.archived ? "archived" : "active"}
                        />
                      </div>
                      <h2 className="service-name">
                        <Link href={`/services/${main.id}`}>{main.name}</Link>
                      </h2>
                    </div>
                  </div>
                  <div className="service-header-commercial">
                    <div className="service-rate">
                      {formatMoney(main.rate, main.currency)}
                    </div>
                    <div className="service-actions">
                      <Link
                        className="button secondary"
                        href={`/services/new?parent=${main.id}`}
                        title="Add sub-service under this main service"
                      >
                        + Add sub-service
                      </Link>
                      <ServiceMenu service={main} />
                    </div>
                  </div>
                </div>

                {main.description && (
                  <p className="service-description">{main.description}</p>
                )}

                <div className="sub-services-container">
                  <div className="sub-services-header">
                    <h3>
                      Sub-services ({children.length}
                      {allChildren.length !== children.length
                        ? ` of ${allChildren.length}`
                        : ""}
                      )
                    </h3>
                    {children.length > 0 && (
                      <button
                        type="button"
                        className="text-toggle"
                        onClick={() => toggleExpand(main.id)}
                      >
                        {isCollapsed ? "Show all" : "Hide"}
                      </button>
                    )}
                  </div>

                  {!children.length ? (
                    <div className="no-sub-services">
                      <p className="muted">
                        No sub-services yet. Break this service down into
                        specialized sub-services.
                      </p>
                      <Link
                        className="link-action"
                        href={`/services/new?parent=${main.id}`}
                      >
                        + Add first sub-service
                      </Link>
                    </div>
                  ) : !isCollapsed ? (
                    <div className="sub-services-list">
                      {children.map((sub) => (
                        <div className="sub-service-row" key={sub.id}>
                          <div className="sub-service-info">
                            <CornerDownRight
                              size={15}
                              className="sub-service-indent-icon"
                              aria-hidden="true"
                            />
                            <div>
                              <div className="sub-service-title-row">
                                <Link
                                  href={`/services/${sub.id}`}
                                  className="sub-service-name"
                                >
                                  {sub.name}
                                </Link>
                                <span
                                  className={`badge ${sub.billing_type === "one-time" ? "one-time" : "monthly"}`}
                                >
                                  {sub.billing_type === "one-time"
                                    ? "One-time"
                                    : "Monthly"}
                                </span>
                                {sub.archived && (
                                  <StatusBadge state="archived" />
                                )}
                              </div>
                              {sub.description && (
                                <p className="sub-service-desc">
                                  {sub.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="sub-service-side">
                            <span className="sub-service-rate">
                              {formatMoney(sub.rate, sub.currency)}
                            </span>
                            <ServiceMenu service={sub} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}

          {orphanedSub.length > 0 && (
            <section className="service-card card other-services">
              <div className="service-card-header">
                <h2>Additional Sub-Services</h2>
              </div>
              <div className="sub-services-list">
                {orphanedSub.map((sub) => (
                  <div className="sub-service-row" key={sub.id}>
                    <div className="sub-service-info">
                      <div>
                        <div className="sub-service-title-row">
                          <Link
                            href={`/services/${sub.id}`}
                            className="sub-service-name"
                          >
                            {sub.name}
                          </Link>
                          <span
                            className={`badge ${sub.billing_type === "one-time" ? "one-time" : "monthly"}`}
                          >
                            {sub.billing_type === "one-time"
                              ? "One-time"
                              : "Monthly"}
                          </span>
                        </div>
                        {sub.description && (
                          <p className="sub-service-desc">{sub.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="sub-service-side">
                      <span className="sub-service-rate">
                        {formatMoney(sub.rate, sub.currency)}
                      </span>
                      <ServiceMenu service={sub} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
