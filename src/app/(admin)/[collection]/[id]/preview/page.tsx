import Link from "next/link";
import { notFound } from "next/navigation";
import { allRows, oneRow } from "@/lib/db/repositories/records";
import { brandSnapshot } from "@/lib/documents/brand";
import { snapshotSchema } from "@/lib/documents/snapshots";
import { Document } from "@root/templates/documents/document";
export default async function Preview({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection, id } = await params;
  if (collection !== "invoices" && collection !== "proposals") notFound();
  const record = await oneRow(collection, id);
  if (!record) notFound();
  const [company, settings] = await Promise.all([
    oneRow("companies", record.company_id),
    allRows("settings"),
  ]);
  if (!company) notFound();
  const kind = collection === "invoices" ? "invoice" : "proposal";
  const snapshot = record.snapshot || {
    kind,
    [kind]: record,
    company,
    business: settings[0]?.data,
    brand: await brandSnapshot(),
    items:
      kind === "invoice"
        ? (await allRows("invoice_items")).filter((i) => i.invoice_id === id)
        : undefined,
    references: [],
  };
  return (
    <>
      <div className="heading no-print">
        <div>
          <div className="eyebrow">Document preview</div>
          <h1>
            {record.state === "draft"
              ? "Draft · not issued"
              : "Issued document"}
          </h1>
          <p>
            {record.state === "draft"
              ? "Earlier balances are captured when the invoice is issued."
              : "This preview uses the original issue snapshot."}
          </p>
        </div>
        <Link className="button secondary" href={"/" + collection + "/" + id}>
          Back to details
        </Link>
      </div>
      <Document snapshot={snapshotSchema.parse(snapshot)} />
    </>
  );
}
