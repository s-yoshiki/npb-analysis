import { npbQueryService } from "@/modules/npb/composition";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const databaseReady = npbQueryService.isDatabaseReady();

  return NextResponse.json(
    {
      database: databaseReady ? "ready" : "missing",
      status: databaseReady ? "ok" : "degraded",
    },
    { status: databaseReady ? 200 : 503 },
  );
}
