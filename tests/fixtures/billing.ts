import type { PGlite } from "@electric-sql/pglite";
export const brand = {
  version: "test-v1",
  name: "Fictional Studio",
  primary: "#254d42",
  accent: "#dbedbb",
  ink: "#202b28",
  logo: null,
  font: null,
  documentTitle: "Test document",
};
export async function rpc<T = string>(
  db: PGlite,
  name: string,
  args: unknown[],
) {
  const result = await db.query<{ result: T }>(
    `select public.${name}(${args.map((_, i) => "$" + (i + 1)).join(",")}) as result`,
    args,
  );
  return result.rows[0].result;
}
export async function company(db: PGlite, currency = "LKR") {
  return rpc(db, "save_record", [
    "company",
    null,
    {
      name: "Fictional Company",
      email: "client@example.test",
      address: "Test address",
      contact: "Test contact",
      currency,
      terms_days: 14,
    },
  ]);
}
export async function invoice(
  db: PGlite,
  company_id: string,
  amount = 2000000,
  extra: Record<string, unknown> = {},
) {
  return rpc(db, "save_record", [
    "invoice",
    null,
    {
      company_id,
      currency: "LKR",
      kind: "one-off",
      due_date: "2026-10-20",
      discount: 0,
      tax_bps: 0,
      items: [{ description: "Monthly services", quantity: "1", rate: amount }],
      ...extra,
    },
  ]);
}
export async function payment(
  db: PGlite,
  company_id: string,
  amount: number,
  extra: Record<string, unknown> = {},
) {
  return rpc(db, "save_record", [
    "payment",
    null,
    {
      company_id,
      currency: "LKR",
      amount,
      received_on: "2026-10-13",
      method: "bank",
      reference: "TEST",
      ...extra,
    },
  ]);
}
export async function issue(db: PGlite, id: string) {
  return rpc<{ number: string; snapshot: unknown }>(db, "issue_invoice", [
    id,
    brand,
  ]);
}
export async function balance(db: PGlite, id: string) {
  return Number(
    (
      await db.query<{ outstanding: number }>(
        "select outstanding from public.invoice_balances where id=$1",
        [id],
      )
    ).rows[0].outstanding,
  );
}
