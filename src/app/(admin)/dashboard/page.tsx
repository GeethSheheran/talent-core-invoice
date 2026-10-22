import Link from "next/link";
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
  const [allInvoices, allPayments, companies, allocations, events] =
    await Promise.all([
      balances(),
      allRows("payments"),
      allRows("companies"),
      allRows("payment_allocations"),
      allRows("notification_events"),
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
  const credits = payments
    .filter((p) => p.state === "confirmed" && p.currency === currency)
    .reduce(
      (s, p) =>
        s +
        p.amount -
        allocations
          .filter((a) => a.payment_id === p.id)
          .reduce((sum, a) => sum + a.amount, 0),
      0,
    );
  const reminders = events.filter(
    (e) =>
      !e.read_at &&
      invoices.some(
        (i) =>
          i.id === e.invoice_id &&
          i.currency === currency &&
          Number(i.outstanding) > 0,
      ),
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
      <div className="grid">
        <section className="card">
          <div className="heading">
            <h2>Billing activity</h2>
            <span className="muted">Last 6 months · {currency}</span>
          </div>
          <BillingChart months={months} currency={currency} />
          <p className="muted" style={{ fontSize: 12, paddingTop: 12 }}>
            ● Issued charges &nbsp; <span style={{ color: "#98ac76" }}>●</span>{" "}
            Confirmed collections
          </p>
          <details>
            <summary>View monthly values</summary>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Issued</th>
                  <th>Collected</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m) => (
                  <tr key={m.month}>
                    <td>{m.month}</td>
                    <td>{formatMoney(m.issued, currency)}</td>
                    <td>{formatMoney(m.collected, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>
        <section className="card">
          <h2>Needs your attention</h2>
          <div className="stack">
            <Link href="/invoices">
              <strong>{totals.partial}</strong> partially paid invoices
            </Link>
            <Link href="/notifications">
              <strong>{reminders.length}</strong> reminder events with open
              balances
            </Link>
            <Link href="/payments">
              <strong>{formatMoney(credits, currency)}</strong> available
              payment credit
            </Link>
          </div>
          <div className="notice" style={{ marginTop: 26 }}>
            Monthly invoices stay in draft until you review and issue them.
          </div>
          <Link className="button secondary" href="/payments/new">
            Record payment →
          </Link>
        </section>
      </div>
      <section className="card">
        <div className="heading">
          <h2>Recent invoices</h2>
          <Link href="/invoices">View all →</Link>
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
