import { actionJson } from "@/lib/api/action-json";
import { onDeleteConsentNotice } from "@/actions/settings";

export const runtime = "nodejs";

/** DELETE — 동의/고지 삭제 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  return actionJson(await onDeleteConsentNotice(params.id));
}
