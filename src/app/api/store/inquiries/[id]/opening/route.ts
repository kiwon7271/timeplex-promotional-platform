import { actionJson } from "@/lib/api/action-json";
import { onUpdateInquiryOpening } from "@/actions/inquiries";

export const runtime = "nodejs";

/** PATCH — 문의 본문 수정 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { title, body, category } = (await request.json()) as {
    title: string;
    body: string;
    category: string;
  };
  return actionJson(await onUpdateInquiryOpening(params.id, title, body, category));
}
