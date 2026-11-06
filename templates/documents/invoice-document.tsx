/* eslint-disable @next/next/no-img-element -- Offline PDF uses embedded brand assets. */
import type { Snapshot } from "@/lib/documents/snapshots";
export function InvoiceDocument({ snapshot: s }: { snapshot: Snapshot }) {
  const inv = s.invoice!;
  const money = (n: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n / 100);
  const balance = inv.balance_at_issue ?? inv.total - (inv.credit_applied || 0);
  const earlier = (s.references || []).reduce((sum, r) => sum + r.amount, 0);
  return (
    <article
      className="document invoice-document"
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
      <header
        className="invoice-doc-header"
        style={{ borderColor: s.brand.primary }}
      >
        <div className="invoice-doc-logo">
          {s.brand.logoData ? (
            <img src={s.brand.logoData} alt={s.business.name} />
          ) : (
            <h2 style={{ color: s.brand.primary }}>{s.business.name}</h2>
          )}
        </div>
        <div className="invoice-doc-title">
          <div className="invoice-doc-number">
            {inv.number || "Number assigned on issue"}
          </div>
          <h1 style={{ color: s.brand.primary }}>INVOICE</h1>
          {!inv.number && (
            <span className="invoice-draft-label">DRAFT · NOT ISSUED</span>
          )}
        </div>
      </header>
      <section className="invoice-parties">
        <div>
          <div className="eyebrow">Bill to</div>
          <h3>{s.company.name}</h3>
          <p>{s.company.address}</p>
          <p>{s.company.email}</p>
        </div>
        <div>
          <div className="eyebrow">Bill from</div>
          <h3>{s.business.name}</h3>
          <p>{s.business.address}</p>
          <p>{s.business.email}</p>
        </div>
      </section>
      <section className="invoice-doc-meta">
        <span>
          <strong>Issued:</strong> {inv.issued_at?.slice(0, 10) || "Not issued"}
        </span>
        <span>
          <strong>Due:</strong> {inv.due_date}
        </span>
        {inv.period && (
          <span>
            <strong>Period:</strong> {inv.period.slice(0, 7)}
          </span>
        )}
        <span>
          <strong>Currency:</strong> {inv.currency}
        </span>
      </section>
      <table className="invoice-doc-items">
        <colgroup>
          <col style={{ width: "40%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Discount</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {s.items?.map((item, i) => (
            <tr key={i}>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{money(item.rate)}</td>
              <td>{money(item.discount || 0)}</td>
              <td>{money(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <section className="invoice-doc-totals">
        <dl>
          <div>
            <dt>Subtotal after service discounts</dt>
            <dd>{money(inv.subtotal)}</dd>
          </div>
          <div>
            <dt>Discount</dt>
            <dd>{money(inv.discount)}</dd>
          </div>
          <div>
            <dt>Tax</dt>
            <dd>{money(inv.tax)}</dd>
          </div>
          <div className="invoice-total">
            <dt>New charges</dt>
            <dd>{money(inv.total)}</dd>
          </div>
          {Boolean(inv.credit_applied) && (
            <div>
              <dt>Credit applied</dt>
              <dd>{money(inv.credit_applied || 0)}</dd>
            </div>
          )}
          <div>
            <dt>Invoice balance{inv.number ? " at issue" : ""}</dt>
            <dd>{money(balance)}</dd>
          </div>
        </dl>
      </section>
      {Boolean(s.references?.length) && (
        <section className="invoice-doc-references">
          <h3>Earlier outstanding balances</h3>
          <p>
            Payable against the original invoices; do not count these balances
            twice.
          </p>
          {s.references?.map((r) => (
            <div key={r.number}>
              <span>{r.number}</span>
              <strong>{money(r.amount)}</strong>
            </div>
          ))}
        </section>
      )}
      <section className="invoice-doc-due">
        <strong>Total amount requested{inv.number ? " at issue" : ""}</strong>
        <strong>
          {inv.currency} {money(balance + earlier)}
        </strong>
      </section>
      <section className="payment-details">
        <h3>Payment details</h3>
        <p>{s.business.bank_details || "Contact us for payment details."}</p>
        {(inv.notes || s.business.notes) && (
          <p className="invoice-doc-notes">{inv.notes || s.business.notes}</p>
        )}
      </section>
    </article>
  );
}
