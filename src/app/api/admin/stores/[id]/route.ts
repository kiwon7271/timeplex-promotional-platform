import { actionJson } from "@/lib/api/action-json";
import { onUpdateStoreStatus, onUpdateStorePlan } from "@/actions/stores";

export const runtime = "nodejs";

/** PATCH — 매장 상태/요금제 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json()) as { status?: string; planCode?: string };
  if (body.status) {
    return actionJson(await onUpdateStoreStatus(params.id, body.status));
  }
  if (body.planCode) {
    return actionJson(await onUpdateStorePlan(params.id, body.planCode));
  }
  return actionJson({ ok: false, message: "변경할 항목이 없습니다." });
}
