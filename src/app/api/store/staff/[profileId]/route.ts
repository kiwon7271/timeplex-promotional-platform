import { actionJson } from "@/lib/api/action-json";
import { onDeleteStaff } from "@/actions/stores";

export const runtime = "nodejs";

/** DELETE — 직원 삭제 */
export async function DELETE(_request: Request, { params }: { params: { profileId: string } }) {
  return actionJson(await onDeleteStaff(params.profileId));
}
