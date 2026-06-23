import "server-only";

import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { captureJobError } from "@/lib/logger";
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

const runJobByName = async (name: JobName, payload: JobPayloadMap[JobName]) => {
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
      throw new Error(`Unknown job: ${name}`);
  }
};

/** Vercel 별도 invocation — 즉시 200 후 waitUntil로 job 실행 */
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

  waitUntil(
    runJobByName(name, payload).catch((error) => {
      captureJobError(name, error, { payload });
    }),
  );

  return NextResponse.json({ ok: true });
}
