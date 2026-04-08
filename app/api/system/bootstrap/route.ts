import { NextResponse } from "next/server";

import { getBootstrapStatus } from "@/lib/server/runtime-config";

export const runtime = "nodejs";

export async function GET() {
  const status = await getBootstrapStatus();

  return NextResponse.json(status);
}
