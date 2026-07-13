import { hasDatabase } from "@/lib/npb-db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const databaseReady = hasDatabase();

  return NextResponse.json(
    {
      database: databaseReady ? "ready" : "missing",
      status: databaseReady ? "ok" : "degraded",
    },
    { status: databaseReady ? 200 : 503 },
  );
}
