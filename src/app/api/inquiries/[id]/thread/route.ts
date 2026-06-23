import { actionJson } from "@/lib/api/action-json";
import { getInquiryThread } from "@/actions/inquiries";

export const runtime = "nodejs";

/** GET — 문의 스레드 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const result = await getInquiryThread(params.id);
  return actionJson(result);
}
