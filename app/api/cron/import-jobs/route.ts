import { NextResponse } from "next/server";
import { importClinicalLabJobs } from "@/lib/jobs/importer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";

  const authorization = request.headers.get("authorization");
  const url = new URL(request.url);
  return authorization === `Bearer ${secret}` || url.searchParams.get("secret") === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await importClinicalLabJobs();
  const hasError = result.sources.some((source) => source.error);

  return NextResponse.json(result, { status: hasError ? 207 : 200 });
}
