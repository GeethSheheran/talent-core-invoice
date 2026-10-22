/* eslint-disable @next/next/no-img-element -- Embedded original assets must work identically in browser and offline PDF rendering. */
import type { Snapshot } from "@/lib/documents/snapshots";
import { formatMoney } from "@/lib/billing/money";
export function Document({ snapshot: s }: { snapshot: Snapshot }) {
  const currency =
    s.invoice?.currency ||
    s.payment?.currency ||
    s.proposal?.currency ||
    s.statement?.currency ||
    s.company.currency;
  const money = (v: number) => formatMoney(v, currency);
  return (
    <article
      className="document"
      style={{
        color: s.brand.ink,
        fontFamily: s.brand.fontData
          ? "DocumentFont, Arial, sans-serif"
          : "Arial, sans-serif",
      }}
    >
      {s.brand.fontData && (
        <style>{`@font-face{font-family:DocumentFont;src:url("${s.brand.fontData}")}`}</style>
      )}
      <header>
        <div>
          {s.brand.logoData && (
            <img src={s.brand.logoData} alt={s.business.name} />
          )}
          <h2 style={{ color: s.brand.primary }}>{s.business.name}</h2>
          <p>
            {s.business.address}
            <br />
            {s.business.email}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="eyebrow">
            {s.kind === "receipt" ? "Payment receipt" : s.kind}
          </div>
          <h1 style={{ color: s.brand.primary }}>
            {s.invoice?.number ||
              s.payment?.receipt_number ||
              s.proposal?.number ||
              (s.kind === "statement" ? "Statement" : "DRAFT")}
          </h1>
          <p>
            {s.invoice?.issued_at?.slice(0, 10) ||
              s.payment?.received_on ||
              s.statement?.as_of ||
              ""}
          </p>
        </div>
      </header>
      <section>
        <div className="eyebrow">
          {s.kind === "proposal" ? "Prepared for" : "Bill to"}
        </div>
        <h3>{s.company.name}</h3>
        <p>
          {s.company.address}
          <br />
          {s.company.email}
        </p>
      </section>
      {s.invoice && (
        <>
          <section>
            <p>
              <strong>Due date:</strong> {s.invoice.due_date} ·{" "}
              <strong>Currency:</strong> {currency}
              {s.invoice.period && (
                <>
                  {" "}
                  · <strong>Period:</strong> {s.invoice.period.slice(0, 7)}
                </>
              )}
            </p>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "48%" }}>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {s.items?.map((item, i) => (
                  <tr key={i}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{money(item.rate)}</td>
                    <td>{money(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="summary">
              <p>
                <span>Subtotal</span>
                {money(s.invoice.subtotal)}
              </p>
              <p>
                <span>Discount</span>
                {money(s.invoice.discount)}
              </p>
              <p>
                <span>Tax</span>
                {money(s.invoice.tax)}
              </p>
              <p className="grand">
                <span>New charges</span>
                {money(s.invoice.total)}
              </p>
              <p>
                <span>Credit applied at issue</span>
                {money(0)}
              </p>
              <p>
                <span>Current invoice balance at issue</span>
                {money(s.invoice.total)}
              </p>
            </div>
          </section>
          {Boolean(s.references?.length) && (
            <section>
              <h3>Earlier outstanding balances</h3>
              <p>
                Previous balances are listed for reference and should not be
                counted twice. They remain payable against their original
                invoices.
              </p>
              <table>
                <tbody>
                  {s.references?.map((r) => (
                    <tr key={r.number}>
                      <td>{r.number}</td>
                      <td>{money(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
          <section className="commercial">
            <strong>
              Combined amount requested at issue:{" "}
              {money(
                s.invoice.total +
                  (s.references || []).reduce((sum, r) => sum + r.amount, 0),
              )}
            </strong>
          </section>
          <section className="payment-details">
            <h3>Payment details</h3>
            <p>{s.business.bank_details}</p>
            <p>{s.invoice.notes || s.business.notes}</p>
          </section>
        </>
      )}
      {s.payment && (
        <>
          <h2>Payment received</h2>
          <p>
            <strong>{money(s.payment.amount)}</strong> received on{" "}
            {s.payment.received_on} by {s.payment.method}.
          </p>
          <p>Reference: {s.payment.reference || "—"}</p>
          <table>
            <thead>
              <tr>
                <th>Applied to</th>
                <th>Amount</th>
                <th>Balance at confirmation</th>
              </tr>
            </thead>
            <tbody>
              {s.allocations?.map((a) => (
                <tr key={a.number}>
                  <td>{a.number}</td>
                  <td>{money(a.amount)}</td>
                  <td>{money(a.outstanding)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>Unallocated company credit: {money(s.unallocated || 0)}</p>
          <p>
            This receipt acknowledges the payment above. It does not certify
            full settlement of the company account. Later allocations and
            reversals appear on the current statement.
          </p>
        </>
      )}
      {s.proposal && (
        <>
          <h1>{s.proposal.title}</h1>
          {s.proposal.sections.map((section, i) => (
            <section key={i}>
              <h2 style={{ color: s.brand.primary }}>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          <section className="commercial">
            <h2>Investment and payment terms</h2>
            <h3>{money(s.proposal.price)}</h3>
            <p>{s.proposal.brief.payment_schedule}</p>
          </section>
          {["exclusions", "maintenance", "future_options"].map(
            (k) =>
              s.proposal?.brief[k] && (
                <section key={k}>
                  <h2 style={{ textTransform: "capitalize" }}>
                    {k.replaceAll("_", " ")}
                  </h2>
                  <p>{s.proposal.brief[k]}</p>
                </section>
              ),
          )}
        </>
      )}
      {s.statement && (
        <>
          <p>
            Account balances as of {s.statement.as_of}. Currency: {currency}.
          </p>
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Due date</th>
                <th>Issued charges</th>
                <th>Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {s.statement.invoices.map((i) => (
                <tr key={i.number}>
                  <td>{i.number}</td>
                  <td>{i.due_date}</td>
                  <td>{money(i.total)}</td>
                  <td>{money(i.outstanding)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <section className="commercial">
            <p>
              Total outstanding:{" "}
              <strong>
                {money(
                  s.statement.invoices.reduce(
                    (sum, i) => sum + i.outstanding,
                    0,
                  ),
                )}
              </strong>
            </p>
            <p>
              Available confirmed payment credit: {money(s.statement.credit)}
            </p>
          </section>
          <p>
            Earlier balances are counted once. Unallocated credit is shown
            separately until applied to an invoice.
          </p>
        </>
      )}
      <footer>
        {s.business.name} · {s.company.code} · {s.brand.documentTitle}
        <br />
        {s.kind === "proposal" && !s.proposal?.number
          ? "Draft proposal for review. Not issued or accepted."
          : "This document preserves the information recorded at issue. Request a current statement for updated balances."}
      </footer>
    </article>
  );
}
