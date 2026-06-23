import { actionJson } from "@/lib/api/action-json";
import { onInviteStaff } from "@/actions/stores";

export const runtime = "nodejs";

/** POST — 직원 초대 */
export async function POST(request: Request) {
  return actionJson(await onInviteStaff(await request.formData()));
}
