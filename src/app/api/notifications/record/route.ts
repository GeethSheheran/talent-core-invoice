import { requireAdmin } from "@/lib/auth/require-admin";
import { tableMap } from "@/lib/db/repositories/records";
import { apiError } from "@/lib/http";
import { formatMoney } from "@/lib/billing/money";
export async function GET(request: Request) {
  try {
    const { db } = await requireAdmin();
    const path = new URL(request.url).searchParams.get("path") || "";
    const match =
      /^\/(companies|services|projects|agreements|proposals|invoices|payments|expenses)\/([0-9a-f-]{36})$/i.exec(
        path,
      );
    const headers = { "Cache-Control": "private, no-store" };
    if (!match)
      return Response.json(
        { error: "Record unavailable." },
        { status: 400, headers },
      );
    const table = tableMap[match[1] as keyof typeof tableMap];
    const { data, error } = await db
      .from(table)
      .select("*")
      .eq("id", match[2])
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return Response.json(
        { error: "This record was removed or is no longer available." },
        { status: 404, headers },
      );
    const row = data as Record<string, unknown>;
    const fields = [
      "name",
      "title",
      "number",
      "receipt_number",
      "state",
      "currency",
      "billing_type",
      "due_date",
      "received_on",
      "expense_date",
      "reference",
      "quantity",
      "rate",
      "amount",
      "total",
      "price",
      "email",
      "contact_name",
      "address",
      "description",
      "notes",
    ];
    const details = fields.flatMap((key) => {
      const value = row[key];
      if (
        value === null ||
        value === undefined ||
        value === "" ||
        typeof value === "object"
      )
        return [];
      return [
        {
          label: key.replaceAll("_", " "),
          value:
            typeof value === "number" &&
            ["rate", "amount", "total", "price"].includes(key)
              ? formatMoney(value, String(row.currency || "LKR"))
              : String(value),
        },
      ];
    });
    return Response.json({ details }, { headers });
  } catch (error) {
    const response = apiError(error);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
}
