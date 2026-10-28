import { requireAdmin } from "@/lib/auth/require-admin";
import { loadCompanyEditor, loadCompanyRecord } from "@/lib/company-workspace";
import { apiError } from "@/lib/http";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { db } = await requireAdmin();
    const { id } = await params;
    const query = new URL(request.url).searchParams;
    const collection = query.get("collection") || "";
    const record = query.get("record");
    const result = record
      ? await loadCompanyRecord(db, id, collection, record)
      : await loadCompanyEditor(db, id, collection);
    return Response.json(result, {
      status: result.error ? 422 : 200,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const response = apiError(error);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
}
