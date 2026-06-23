import { actionJson } from "@/lib/api/action-json";
import { onDeleteInquiry } from "@/actions/inquiries";

export const runtime = "nodejs";

/** DELETE — 문의 삭제 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  return actionJson(await onDeleteInquiry(params.id));
}
