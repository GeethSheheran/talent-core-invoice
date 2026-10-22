import { requireAdmin } from "@/lib/auth/require-admin";
import { apiError, sameOrigin } from "@/lib/http";
import { proposalSchema } from "@/lib/validation/schemas";
import { boundedBody } from "@/lib/proposals/request";
import { snapshotSchema } from "@/lib/documents/snapshots";
import { brandSnapshot } from "@/lib/documents/brand";
import { pdfRenderer } from "@/lib/documents/render-pdf";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { db } = await requireAdmin();
    const proposal = proposalSchema.parse(
      JSON.parse((await boundedBody(request, 600000)).toString("utf8")),
    );
    const [{ data: company, error }, { data: settings }] = await Promise.all([
      db
        .from("companies")
        .select("name,code,address,email,currency")
        .eq("id", proposal.company_id)
        .single(),
      db.from("settings").select("data").eq("id", "business").single(),
    ]);
    if (error || !company)
      throw new Error("Select an available company before downloading.");
    const snapshot = snapshotSchema.parse({
      kind: "proposal",
      proposal: { ...proposal, number: null },
      company,
      business: settings?.data || {},
      brand: await brandSnapshot(),
    });
    const bytes = await pdfRenderer.render(snapshot);
    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="proposal-draft.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
