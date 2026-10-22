import { NextResponse } from "next/server";
import { z } from "zod";
import { renderArchived } from "@/lib/documents/storage";
import { requireAdmin } from "@/lib/auth/require-admin";
import { apiError, sameOrigin } from "@/lib/http";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const id = z.uuid().parse((await params).id);
    return NextResponse.json({
      documentId: await renderArchived(id, "invoice"),
    });
  } catch (error) {
    return apiError(error);
  }
}
