import { totals } from "@/lib/billing/totals";
import { formatMoney } from "@/lib/billing/money";
import {
  agreedServiceLines,
  type AgreedService,
} from "@/lib/billing/agreed-services";
import type { Json } from "@/lib/db/database.types";
export function AgreedServicesSummary({
  items,
  discount,
  currency,
}: {
  items: Json | undefined;
  discount: number;
  currency: string;
}) {
  if (!Array.isArray(items) || !items.length) return null;
  const services = items as unknown as AgreedService[];
  const lines = agreedServiceLines(services, discount);
  return (
    <section>
      <h3>Agreed services</h3>
      <div className="table-wrap">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Frequency</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Discount</th>
              <th>Net amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={services[index].id || index}>
                <td data-label="Service">{line.description}</td>
                <td data-label="Frequency">
                  {line.billing_type === "monthly" ? "Monthly" : "One-time"}
                </td>
                <td data-label="Quantity">{line.quantity}</td>
                <td data-label="Rate">{formatMoney(line.rate, currency)}</td>
                <td data-label="Discount">
                  {formatMoney(line.discount || 0, currency)}
                </td>
                <td data-label="Net amount">
                  {formatMoney(totals([line]).total, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">
        Discounts include each service’s share of the full-service discount.
        Monthly services repeat; one-time services are included once.
      </p>
    </section>
  );
}
