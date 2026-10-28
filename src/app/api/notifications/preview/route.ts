import { requireAdmin } from "@/lib/auth/require-admin";
import { loadNotificationPreview } from "@/lib/notifications/preview";
import { apiError } from "@/lib/http";
export async function GET() {
  try {
    const { db } = await requireAdmin();
    const result = await loadNotificationPreview(db);
    return Response.json(result, {
      status: result.error ? 503 : 200,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const response = apiError(error);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
}
