import { NextResponse } from "next/server";
import { z } from "zod";
import { signedDocument } from "@/lib/documents/storage";
import { requireAdmin } from "@/lib/auth/require-admin";
import { apiError } from "@/lib/http";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    return NextResponse.redirect(
      await signedDocument(z.uuid().parse((await params).id)),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
