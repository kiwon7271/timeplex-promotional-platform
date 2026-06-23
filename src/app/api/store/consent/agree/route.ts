import { actionJson } from "@/lib/api/action-json";
import { onAgreeConsentNotices } from "@/actions/consent";

export const runtime = "nodejs";

/** POST — 동의/고지 전체 동의 */
export async function POST() {
  return actionJson(await onAgreeConsentNotices());
}
