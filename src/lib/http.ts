import "server-only";
import { NextResponse } from "next/server";
import { AccessError } from "@/lib/auth/require-admin";
import { z } from "zod";
export function apiError(error: unknown) {
  if (error instanceof AccessError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof z.ZodError)
    return NextResponse.json(
      { error: "Invalid request parameters" },
      { status: 400 },
    );
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Operation failed" },
    { status: 400 },
  );
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    throw new AccessError(403);
}
