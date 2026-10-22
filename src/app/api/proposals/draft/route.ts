import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { apiError, sameOrigin } from "@/lib/http";
import { draftInput } from "@/lib/proposals/draft-schema";
import { draftProposal } from "@/lib/proposals/provider";
import { boundedBody } from "@/lib/proposals/request";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { db } = await requireAdmin();
    const input = draftInput.parse(
      JSON.parse((await boundedBody(request, 200000)).toString("utf8")),
    );
    const [{ data: company, error }, { data: settings }] = await Promise.all([
      db.from("companies").select("name").eq("id", input.company_id).single(),
      db.from("settings").select("data").eq("id", "business").single(),
    ]);
    if (error || !company)
      throw new Error("Select an available company before drafting.");
    const data = settings?.data;
    const instructions =
      data && typeof data === "object" && !Array.isArray(data)
        ? String(data.proposal_prompt || "")
        : "";
    return NextResponse.json(
      await draftProposal(input, company.name, instructions),
    );
  } catch (error) {
    return apiError(error);
  }
}
