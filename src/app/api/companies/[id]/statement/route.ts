import { z } from "zod";
import { allRows, balances, oneRow } from "@/lib/db/repositories/records";
import { requireAdmin } from "@/lib/auth/require-admin";
import { apiError } from "@/lib/http";
import { brandSnapshot } from "@/lib/documents/brand";
import { snapshotSchema } from "@/lib/documents/snapshots";
import { pdfRenderer } from "@/lib/documents/render-pdf";
import { colomboDate } from "@/lib/utils/dates";
import { currencies } from "@/lib/billing/money";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const id = z.uuid().parse((await params).id);
    const company = await oneRow("companies", id);
    if (!company) throw new Error("Company not found");
    const currency = z
      .enum(currencies)
      .parse(
        new URL(request.url).searchParams.get("currency") || company.currency,
      );
    const [rows, settings, payments, allocations] = await Promise.all([
      balances(),
      allRows("settings"),
      allRows("payments"),
      allRows("payment_allocations"),
    ]);
    const snapshot = snapshotSchema.parse({
      kind: "statement",
      company,
      business: settings[0].data,
      brand: await brandSnapshot(),
      statement: {
        as_of: colomboDate(),
        currency,
        invoices: rows.filter(
          (i) =>
            i.company_id === id &&
            i.currency === currency &&
            i.state === "issued",
        ),
        credit: payments
          .filter(
            (p) =>
              p.company_id === id &&
              p.currency === currency &&
              p.state === "confirmed",
          )
          .reduce(
            (s, p) =>
              s +
              p.amount -
              allocations
                .filter((a) => a.payment_id === p.id)
                .reduce((t, a) => t + a.amount, 0),
            0,
          ),
      },
    });
    const pdf = await pdfRenderer.render(snapshot);
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="statement.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
