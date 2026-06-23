import { actionJson } from "@/lib/api/action-json";
import { onCreateConsentNotice, onUpdateConsentNotice } from "@/actions/settings";

export const runtime = "nodejs";

/** POST — 동의/고지 생성·수정 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const id = String(formData.get("id") ?? "");
  if (id) {
    return actionJson(await onUpdateConsentNotice(formData));
  }
  return actionJson(await onCreateConsentNotice(formData));
}
