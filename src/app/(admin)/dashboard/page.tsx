import Link from "@/components/navigation-link";
import { NewMenu } from "@/components/new-menu";
import { DashboardOverview } from "@/components/dashboard-overview";
import { allRows, balances } from "@/lib/db/repositories/records";
import { currencies } from "@/lib/billing/money";
import { metrics, type MetricInvoice } from "@/lib/dashboard/metrics";
import { colomboDate } from "@/lib/utils/dates";
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
  const [allInvoices, allPayments, companies, proposals] = await Promise.all([
    balances(),
    allRows("payments"),
    allRows("companies"),
    allRows("proposals"),
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
          <h1>Overview</h1>
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
      <DashboardOverview
        currency={currency}
        today={today}
        totals={totals}
        months={months}
        invoices={invoices.map((i) => ({
          id: i.id!,
          company_id: i.company_id!,
          number: i.number,
          state: i.state!,
          currency: i.currency!,
          total: i.total || 0,
          outstanding: i.outstanding || 0,
          due_date: i.due_date!,
        }))}
        payments={payments}
        proposals={proposals}
        companies={Object.fromEntries(companies.map((c) => [c.id, c.name]))}
      />
    </>
  );
}
