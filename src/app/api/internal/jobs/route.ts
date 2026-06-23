import "server-only";

import { NextResponse } from "next/server";
import { captureJobError, captureRouteError } from "@/lib/logger";
import { runDeliverMessageJob } from "@/jobs/deliver-message";
import { runTranslateMessageJob } from "@/jobs/translate-message";
import { runUpdateUsageJob } from "@/jobs/update-usage";
import type { JobName, JobPayloadMap } from "@/jobs/queue";

export const runtime = "nodejs";
export const maxDuration = 60;

const isAuthorized = (request: Request) => {
  const secret = process.env.INTERNAL_JOB_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
};

/** Vercel 별도 invocation — 백그라운드 job 실행 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  let body: { name?: JobName; payload?: JobPayloadMap[JobName] };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "invalid json" }, { status: 400 });
  }

  const { name, payload } = body;
  if (!name || !payload) {
    return NextResponse.json({ message: "name and payload required" }, { status: 400 });
  }

  try {
    switch (name) {
      case "translate-message":
        await runTranslateMessageJob(payload as JobPayloadMap["translate-message"]);
        break;
      case "deliver-message":
        await runDeliverMessageJob(payload as JobPayloadMap["deliver-message"]);
        break;
      case "update-usage":
        await runUpdateUsageJob(payload as JobPayloadMap["update-usage"]);
        break;
      default:
        return NextResponse.json({ message: "unknown job" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    captureRouteError("/api/internal/jobs", error, { name, payload });
    captureJobError(name, error, { payload });
    return NextResponse.json({ ok: false, message: "job failed" }, { status: 500 });
  }
}
