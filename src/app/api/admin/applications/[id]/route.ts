import { actionJson } from "@/lib/api/action-json";
import { onApproveApplication, onRejectApplication } from "@/actions/applications";

export const runtime = "nodejs";

/** POST — 입점 승인 */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  return actionJson(await onApproveApplication(params.id));
}

/** DELETE — 입점 반려 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  return actionJson(await onRejectApplication(params.id));
}
