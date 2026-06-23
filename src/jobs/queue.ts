import "server-only";

import { getAppBaseUrl } from "@/lib/app-url";
import { captureJobError, log } from "@/lib/logger";
import { runDeliverMessageJob, type DeliverMessagePayload } from "@/jobs/deliver-message";
import { runTranslateMessageJob, type TranslateMessagePayload } from "@/jobs/translate-message";
import { runUpdateUsageJob, type UpdateUsagePayload } from "@/jobs/update-usage";

export type JobName = "translate-message" | "deliver-message" | "update-usage";

export type JobPayloadMap = {
  "translate-message": TranslateMessagePayload;
  "deliver-message": DeliverMessagePayload;
  "update-usage": UpdateUsagePayload;
};

const runJob = async <T extends JobName>(name: T, payload: JobPayloadMap[T]) => {
  switch (name) {
    case "translate-message":
      return runTranslateMessageJob(payload as TranslateMessagePayload);
    case "deliver-message":
      return runDeliverMessageJob(payload as DeliverMessagePayload);
    case "update-usage":
      return runUpdateUsageJob(payload as UpdateUsagePayload);
    default:
      throw new Error(`Unknown job: ${name}`);
  }
};

const dispatchJobViaHttp = async <T extends JobName>(name: T, payload: JobPayloadMap[T]) => {
  const secret = process.env.INTERNAL_JOB_SECRET?.trim();
  const appUrl = getAppBaseUrl();

  if (!secret || !appUrl) return false;

  const response = await fetch(`${appUrl}/api/internal/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ name, payload }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Job HTTP dispatch failed (${response.status}): ${text.slice(0, 200)}`);
  }

  return true;
};

/** HTTP dispatch → 인라인 fallback */
export const enqueueJob = <T extends JobName>(name: T, payload: JobPayloadMap[T]) => {
  void (async () => {
    try {
      if (await dispatchJobViaHttp(name, payload)) {
        log.debug("Job dispatched via HTTP", { name });
        return;
      }

      await runJob(name, payload);
    } catch (error) {
      captureJobError(name, error, { payload });

      try {
        if (await dispatchJobViaHttp(name, payload)) return;
        await runJob(name, payload);
      } catch (retryError) {
        captureJobError(name, retryError, { payload, retry: "inline" });
      }
    }
  })();
};

export const runJobSync = runJob;
