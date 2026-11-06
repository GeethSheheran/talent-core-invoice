import Link from "@/components/navigation-link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock3,
  Wallet,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { MetricAmount } from "@/components/metric-amount";
import { BillingChart, type BillingMonth } from "@/components/billing-chart";
import { formatMoney } from "@/lib/billing/money";
import {
  dashboardMoney,
  receivables,
  type OverviewInvoice,
} from "@/lib/dashboard/overview";

type Proposal = {
  id: string;
  company_id: string;
  title: string;
  currency: string;
  price: number;
  state: string;
};
export function DashboardOverview({
  currency,
  today,
  totals,
  months,
  invoices,
  proposals,
  companies,
}: {
  currency: string;
  today: string;
  totals: {
    collected: number;
    issued: number;
    outstanding: number;
    overdue: number;
  };
  months: BillingMonth[];
  invoices: OverviewInvoice[];
  payments: {
    id: string;
    company_id: string;
    amount: number;
    state: string;
    currency: string;
  }[];
  proposals: Proposal[];
  companies: Record<string, string>;
}) {
  const { bands, overdue } = receivables(invoices, today, currency);
  const awaiting = proposals.filter(
    (p) => p.currency === currency && p.state === "issued",
  );
  const proposalValue = awaiting.reduce((sum, p) => sum + p.price, 0);
  const money = (amount: number) => dashboardMoney(amount, currency);
  const cards = [
    {
      label: "Money collected",
      value: totals.collected,
      note: "Confirmed payments · this month",
      icon: ArrowDownLeft,
      tone: "collected",
    },
    {
      label: "Invoices issued",
      value: totals.issued,
      note: "New billing · this month",
      icon: FileText,
      tone: "issued",
    },
    {
      label: "Customers owe",
      value: totals.outstanding,
      note: "Unpaid balance · all issued invoices",
      icon: Wallet,
      tone: "outstanding",
    },
    {
      label: "Overdue to collect",
      value: totals.overdue,
      note: `${overdue.length} overdue ${overdue.length === 1 ? "invoice" : "invoices"}`,
      icon: Clock3,
      tone: "overdue",
    },
  ];
  return (
    <div className="ledger-overview">
      <div className="stats overview-stats">
        {cards.map(({ label, value, note, icon: Icon, tone }) => (
          <section className={`stat metric-${tone}`} key={label}>
            <div className="metric-heading">
              <span>{label}</span>
              <Icon size={18} aria-hidden="true" />
            </div>
            <div
              title={formatMoney(value, currency)}
              aria-label={`${label}: ${formatMoney(value, currency)}`}
            >
              <MetricAmount>{money(value)}</MetricAmount>
            </div>
            <small>{note}</small>
          </section>
        ))}
      </div>
      <div className="overview-main-grid">
        <section className="card overview-trend">
          <div className="heading">
            <div>
              <h2>Billing & collections</h2>
            </div>
            <span className="muted">6 months · {currency}</span>
          </div>
          <BillingChart months={months} currency={currency} />
          <p className="chart-legend">
            <span>Invoices issued</span>
            <span>Money collected</span>
          </p>
          {months.every((m) => !m.issued && !m.collected) && (
            <p className="muted">
              Your trend will appear as you issue invoices and confirm payments.
            </p>
          )}
        </section>
        <section className="card overview-aging">
          <div className="overview-card-heading">
            <h2>When is money due?</h2>
            <Link
              className="overview-card-link"
              href="/invoices"
              aria-label="View invoices"
              title="View invoices"
            >
              <ArrowUpRight size={21} aria-hidden="true" />
            </Link>
          </div>
          <div className="aging-list">
            {bands.map((band, index) => (
              <div className="aging-row" key={band.label}>
                <div>
                  <span>{band.label}</span>
                  <strong title={formatMoney(band.amount, currency)}>
                    {money(band.amount)}
                  </strong>
                </div>
                <div className="aging-track" aria-hidden="true">
                  <span
                    className={`aging-fill aging-${index}`}
                    style={{
                      width: `${totals.outstanding > 0 ? (band.amount / totals.outstanding) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="overview-bottom-grid">
        <section className="card collection-priorities">
          <div className="heading">
            <div>
              <h2>Collect these first</h2>
            </div>
            <span className="muted">Oldest overdue</span>
          </div>
          {overdue.length ? (
            <div className="overview-followups">
              {overdue.slice(0, 5).map((i) => (
                <Link
                  href={`/invoices/${i.id}`}
                  className="overview-followup"
                  key={i.id}
                >
                  <div>
                    <strong>{companies[i.company_id] || "Company"}</strong>
                    <small>
                      {i.number || "Invoice"} · Due {i.due_date}
                    </small>
                  </div>
                  <strong title={formatMoney(i.outstanding, currency)}>
                    {money(i.outstanding)}
                  </strong>
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="overview-empty">
              <CheckCircle2 size={28} />
              <h3>No overdue invoices</h3>
              <p>
                Issued invoices with a late unpaid balance will appear here.
              </p>
            </div>
          )}
          {overdue.length > 5 && (
            <Link href="/invoices">View all invoices →</Link>
          )}
        </section>
        <section className="card overview-sales">
          <div className="overview-card-heading">
            <h2>Proposals awaiting a decision</h2>
            <Link
              className="overview-card-link"
              href="/proposals"
              aria-label="View proposals"
              title="View proposals"
            >
              <ArrowUpRight size={21} aria-hidden="true" />
            </Link>
          </div>
          <div
            className="sales-value"
            title={formatMoney(proposalValue, currency)}
          >
            {money(proposalValue)}
          </div>
          <p className="muted">
            {awaiting.length} issued{" "}
            {awaiting.length === 1 ? "proposal" : "proposals"} · potential work,
            not confirmed revenue
          </p>
          <div className="overview-followups">
            {awaiting.slice(0, 3).map((p) => (
              <Link
                className="overview-followup"
                href={`/proposals/${p.id}`}
                key={p.id}
              >
                <div>
                  <strong>{p.title}</strong>
                  <small>{companies[p.company_id] || "Company"}</small>
                </div>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
          {!awaiting.length && <p>No proposals are waiting for a decision.</p>}
        </section>
      </div>
    </div>
  );
}
