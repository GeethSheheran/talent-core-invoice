import Link from "next/link";
import { Building2, ChevronLeft } from "lucide-react";
import { CompanySectionNav } from "@/components/company-section-nav";
import { loadCompanySection } from "@/lib/company-data";
import {
  companySection,
  sectionLabels,
  type CompanySection,
  type CompanyCollection,
} from "@/lib/company-sections";
import { CompanyRecordDialog } from "@/components/company-record-dialog";
import { RecordsTable } from "@/components/records-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/billing/money";
import type { Tables } from "@/lib/db/database.types";
async function SectionContent({
  company,
  section,
}: {
  company: Tables<"companies">;
  section: CompanySection;
}) {
  const id = company.id;
  const data = await loadCompanySection(id, section);
  if (data.error) {
    return (
      <section className="card">
        <h2>{sectionLabels[section]} unavailable</h2>
        <p role="alert" className="error">
          {data.error}
        </p>
        <Link
          className="button secondary"
          href={`/companies/${id}?section=${section}`}
        >
          Retry section
        </Link>
        <p className="muted">
          You can continue using the other company sections.
        </p>
      </section>
    );
  }
  if (section === "overview")
    return (
      <section className="card">
        <h2>Company details</h2>
        <dl className="detail-list">
          {[
            ["Company code", company.code],
            ["Contact", company.contact],
            ["Email", company.email],
            ["Address", company.address],
            ["Currency", company.currency],
            ["Payment terms", `${company.terms_days} days`],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "contents" }}>
              <dt>{label}</dt>
              <dd>{value || "—"}</dd>
            </div>
          ))}
        </dl>
        <div className="form-footer">
          <Link className="button secondary" href={`/companies/${id}/edit`}>
            Edit company details
          </Link>
        </div>
      </section>
    );
  if (section === "statement") {
    const rows = data.balances;
    const currencies = [
      ...new Set([
        company.currency,
        ...rows.flatMap((row) => (row.currency ? [row.currency] : [])),
      ]),
    ];
    return (
      <section className="card">
        <h2>Current statement</h2>
        <p className="muted">Live outstanding balances, grouped by currency.</p>
        {currencies.map((currency) => (
          <div className="company-statement-row" key={currency}>
            <div>
              <strong>{currency}</strong>
              <p>
                {formatMoney(
                  rows
                    .filter((row) => row.currency === currency)
                    .reduce((sum, row) => sum + Number(row.outstanding), 0),
                  currency,
                )}
              </p>
            </div>
            <a
              className="button secondary"
              href={`/api/companies/${id}/statement?currency=${currency}`}
            >
              Download statement
            </a>
          </div>
        ))}
      </section>
    );
  }
  const collection: CompanyCollection = section;
  const rows = data.rows;
  return (
    <section className="card">
      <div className="list-heading">
        <h2>{sectionLabels[section]}</h2>
        <CompanyRecordDialog companyId={id} collection={collection} />
      </div>
      <RecordsTable
        collection={collection}
        rows={rows}
        companies={{ [id]: company.name }}
        renderRecord={(recordId, label) => (
          <CompanyRecordDialog
            companyId={id}
            collection={collection}
            recordId={recordId}
            label={label}
          />
        )}
      />
    </section>
  );
}
export async function CompanyDetail({
  company,
  selected,
}: {
  company: Tables<"companies">;
  selected?: string;
}) {
  const section = companySection(selected);
  return (
    <>
      <Link className="company-back" href="/companies">
        <ChevronLeft size={16} aria-hidden="true" />
        All companies
      </Link>
      <div className="heading company-heading">
        <div className="company-title">
          <span className="company-avatar">
            <Building2 size={28} aria-hidden="true" />
          </span>
          <div>
            <div className="eyebrow">Company workspace · {company.code}</div>
            <h1>{company.name}</h1>
            <StatusBadge state={company.archived ? "archived" : "active"} />
          </div>
        </div>
      </div>
      <div className="company-workspace">
        <aside className="company-sidebar">
          <div className="eyebrow">Company sections</div>
          <CompanySectionNav companyId={company.id} selected={section} />
        </aside>
        <div className="company-section" key={section}>
          <SectionContent company={company} section={section} />
        </div>
      </div>
    </>
  );
}
