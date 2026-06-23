import "server-only";

import { waitUntil } from "@vercel/functions";
import { captureJobError } from "@/lib/logger";
import { runJobWithDispatch, type JobName, type JobPayloadMap } from "@/jobs/queue";

/** Vercel — 응답 반환 후에도 job 실행 유지 */
export const scheduleBackgroundJob = <T extends JobName>(name: T, payload: JobPayloadMap[T]) => {
  waitUntil(
    runJobWithDispatch(name, payload).catch((error) => {
      captureJobError(name, error, { payload, phase: "background" });
    }),
  );
};
