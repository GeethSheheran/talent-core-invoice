import { notFound } from "next/navigation";
import {
  allRows,
  oneRow,
  tableMap,
  type Collection,
} from "@/lib/db/repositories/records";
import { RecordEditor } from "@/components/record-editor";
import type { RecordKind } from "@/lib/validation/schemas";
import type { Json } from "@/lib/db/database.types";
const kinds: Record<string, RecordKind> = {
  expenses: "expense",
  companies: "company",
  services: "service",
  projects: "project",
  agreements: "agreement",
  proposals: "proposal",
  invoices: "invoice",
};
export default async function EditPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection, id } = await params;
  const kind = kinds[collection];
  if (!kind) notFound();
  const [record, companies, projects, services] = await Promise.all([
    oneRow(tableMap[collection as Collection], id),
    ["company", "service"].includes(kind)
      ? Promise.resolve([])
      : allRows("companies"),
    ["agreement", "proposal", "invoice", "payment"].includes(kind)
      ? allRows("projects")
      : Promise.resolve([]),
    ["agreement", "invoice"].includes(kind)
      ? allRows("service_catalogue")
      : Promise.resolve([]),
  ]);
  if (!record) notFound();
  const initial = { ...record } as unknown as Record<string, Json>;
  if ((kind === "invoice" || kind === "proposal") && initial.state !== "draft")
    notFound();
  if (kind === "expense" && initial.invoice_id) notFound();
  if (kind === "invoice")
    initial.items = (
      await allRows("invoice_items", undefined, { invoice_id: id })
    )
      .filter((i) => i.invoice_id === id)
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ ...i, quantity: String(i.quantity) }));
  if (kind === "agreement") {
    const versions = (
      await allRows("agreement_services", undefined, { agreement_id: id })
    )
      .filter((v) => v.agreement_id === id)
      .sort((a, b) => b.effective_from.localeCompare(a.effective_from));
    initial.items = versions[0]?.items || [];
    const currentMonth =
      new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" })
        .format(new Date())
        .slice(0, 7) + "-01";
    initial.effective_from =
      versions[0]?.effective_from > currentMonth
        ? versions[0].effective_from
        : currentMonth;
  }
  return (
    <>
      <div className="heading">
        <div>
          <div className="eyebrow">{collection} / Edit</div>
          <h1>Edit {kind}</h1>
        </div>
      </div>
      <RecordEditor
        kind={kind}
        id={id}
        initial={initial}
        companies={companies}
        projects={projects}
        services={services}
      />
    </>
  );
}
