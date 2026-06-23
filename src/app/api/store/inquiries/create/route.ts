import { actionJson } from "@/lib/api/action-json";
import {
  onCreateInquiry,
  onDeleteInquiry,
  onPostInquiryMessage,
  onUpdateInquiryMessage,
  onUpdateInquiryOpening,
} from "@/actions/inquiries";

export const runtime = "nodejs";

/** POST — 문의 등록 */
export async function POST(request: Request) {
  return actionJson(await onCreateInquiry(await request.formData()));
}
