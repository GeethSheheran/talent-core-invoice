import Link from "@/components/navigation-link";
import { NotificationPreview } from "@/components/notification-preview";
import { loadNotificationPreview } from "@/lib/notifications/preview";
import { NewMenu } from "@/components/new-menu";
import { BillingChart } from "@/components/billing-chart";
import { allRows, balances } from "@/lib/db/repositories/records";
import { formatMoney, currencies } from "@/lib/billing/money";
import { metrics, type MetricInvoice } from "@/lib/dashboard/metrics";
import { colomboDate } from "@/lib/utils/dates";
import { RecordsTable } from "@/components/records-table";
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ currency?: string }>;
}) {
  const query = await searchParams;
  const currency = currencies.includes(
    query.currency as (typeof currencies)[number],
  )
    ? query.currency!
    : "LKR";
  const [allInvoices, allPayments, companies, notificationPreview] =
    await Promise.all([
      balances(),
      allRows("payments"),
      allRows("companies"),
      loadNotificationPreview(),
    ]);
  const invoices = allInvoices;
  const payments = allPayments;
  const availableCurrencies = currencies.filter(
    (c) =>
      c === currency ||
      invoices.some((i) => i.currency === c) ||
      payments.some((p) => p.currency === c),
  );
  const today = colomboDate();
  const totals = metrics(
    invoices as MetricInvoice[],
    payments,
    today.slice(0, 7),
    today,
    currency,
  );
  const months = Array.from({ length: 6 }, (_, n) => {
    const d = new Date(today + "T00:00:00Z");
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - (5 - n));
    const m = d.toISOString().slice(0, 7);
    return {
      month: m,
      issuedCompanies: new Set(
        invoices
          .filter(
            (i) =>
              i.currency === currency &&
              i.state === "issued" &&
              i.issued_at &&
              colomboDate(new Date(i.issued_at)).slice(0, 7) === m,
          )
          .map((i) => i.company_id),
      ).size,
      collectedCompanies: new Set(
        payments
          .filter(
            (p) =>
              p.currency === currency &&
              p.state === "confirmed" &&
              p.received_on.slice(0, 7) === m,
          )
          .map((p) => p.company_id),
      ).size,
      ...metrics(invoices as MetricInvoice[], payments, m, today, currency),
    };
  });
  return (
    <>
      <div className="heading">
        <div>
          {/* <div className="eyebrow">Your business at a glance</div> */}
          <h1>Overview</h1>
          {/* <p>A clear view of your billing, payments, and what’s next.</p> */}
        </div>
        <div className="actions">
          {availableCurrencies.length > 1 && (
            <nav className="currency-switch" aria-label="Dashboard currency">
              {availableCurrencies.map((c) => (
                <Link
                  key={c}
                  href={"/dashboard?currency=" + c}
                  aria-current={c === currency ? "page" : undefined}
                >
                  {c}
                </Link>
              ))}
            </nav>
          )}
          <NewMenu />
        </div>
      </div>
      <div className="stats">
        {[
          [
            "Collected this month",
            totals.collected,
            "Confirmed payments by received date",
          ],
          ["Issued this month", totals.issued, "New charges by issue date"],
          [
            "Total outstanding",
            totals.outstanding,
            "All issued invoices, live balance",
          ],
          ["Overdue", totals.overdue, "Open balances past their due date"],
        ].map(([label, value, note]) => (
          <div className="stat" key={String(label)}>
            <div>{label}</div>
            <div className="value">{formatMoney(Number(value), currency)}</div>
            <small>{note}</small>
          </div>
        ))}
      </div>
      <div className="grid dashboard-activity-grid">
        <section className="card dashboard-billing">
          <div className="heading">
            <h2>Billing activity</h2>
            <span className="muted">Last 6 months · {currency}</span>
          </div>
          <BillingChart months={months} currency={currency} />
          <p className="chart-legend">
            <span>Issued charges</span>
            <span>Confirmed collections</span>
          </p>
        </section>
        <section className="card dashboard-notifications">
          <div className="heading">
            <h2>Latest notifications</h2>
            <Link className="view-all-link" href="/notifications">
              View all →
            </Link>
          </div>
          {notificationPreview.error ? (
            <p className="error" role="alert">
              {notificationPreview.error}
            </p>
          ) : (
            <NotificationPreview
              items={notificationPreview.items.slice(0, 5)}
            />
          )}
        </section>
      </div>
      <section className="card">
        <div className="heading">
          <h2>Recent invoices</h2>
          <Link className="view-all-link" href="/invoices">
            View all →
          </Link>
        </div>
        <RecordsTable
          collection="invoices"
          rows={invoices
            .filter((i) => i.currency === currency)
            .sort((a, b) =>
              String(b.created_at).localeCompare(String(a.created_at)),
            )
            .slice(0, 5)}
          companies={Object.fromEntries(companies.map((c) => [c.id, c.name]))}
        />
      </section>
      <p className="muted" style={{ fontSize: 11 }}>
        Billing figures, not audited accrual revenue. Currencies stay separate.
        Earlier-balance references never add to charges. Credits and reversals
        affect live outstanding; issued charges show original billing.
      </p>
    </>
  );
}
