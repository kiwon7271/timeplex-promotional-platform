import { actionJson } from "@/lib/api/action-json";
import { onUpdateInquiryMessage, onDeleteInquiryMessage } from "@/actions/inquiries";

export const runtime = "nodejs";

/** PATCH — 댓글 수정 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { body } = (await request.json()) as { body: string };
  return actionJson(await onUpdateInquiryMessage(params.id, body));
}

/** DELETE — 댓글 삭제 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  return actionJson(await onDeleteInquiryMessage(params.id));
}
