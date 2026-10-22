import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { apiError, sameOrigin } from "@/lib/http";
import { z } from "zod";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    sameOrigin(request);
    const { db } = await requireAdmin();
    const { data, error } = await db.rpc("queue_invoice_email", {
      p_id: z.uuid().parse((await params).id),
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ attemptId: data, status: "queued" });
  } catch (error) {
    return apiError(error);
  }
}
