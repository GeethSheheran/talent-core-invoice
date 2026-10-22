import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { productionJobs } from "@/lib/env";
import { privileged } from "@/lib/supabase/privileged";
import { processOutbox } from "@/lib/notifications/outbox";
import { colomboDate } from "@/lib/utils/dates";
export const maxDuration = 60;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") || "";
  const expected = "Bearer " + secret;
  if (
    !secret ||
    Buffer.byteLength(header) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(header), Buffer.from(expected))
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!productionJobs())
    return NextResponse.json({ status: "disabled outside enabled production" });
  const db = privileged();
  const scan = await db.rpc("scan_daily", { p_today: colomboDate() });
  const outbox = await processOutbox();
  if (scan.error)
    return NextResponse.json(
      { error: "Daily scan failed", outbox },
      { status: 500 },
    );
  return NextResponse.json({ scan: scan.data, outbox });
}
