import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { apiError, sameOrigin } from "@/lib/http";
import { extractSource, MAX_SOURCE_BYTES } from "@/lib/proposals/extract";
import { boundedBody } from "@/lib/proposals/request";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const body = await boundedBody(request, MAX_SOURCE_BYTES + 16384);
    const form = await new Response(new Uint8Array(body), {
      headers: { "Content-Type": request.headers.get("content-type") || "" },
    }).formData();
    const file = form.get("file");
    if (!(file instanceof File))
      throw new Error("Choose a document to import.");
    return NextResponse.json({ text: await extractSource(file) });
  } catch (error) {
    return apiError(error);
  }
}
