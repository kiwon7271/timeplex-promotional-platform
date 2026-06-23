import { actionJson } from "@/lib/api/action-json";
import { onUploadDocument } from "@/actions/documents";

export const runtime = "nodejs";

/** POST — 서류 업로드 */
export async function POST(request: Request) {
  return actionJson(await onUploadDocument(await request.formData()));
}
