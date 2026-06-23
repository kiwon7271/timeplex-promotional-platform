import { actionJson } from "@/lib/api/action-json";
import { onPostInquiryMessage } from "@/actions/inquiries";

export const runtime = "nodejs";

/** POST — 문의 댓글 (매장·관리자) */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const formData = await request.formData();
  formData.set("inquiry_id", params.id);
  return actionJson(await onPostInquiryMessage(formData));
}
