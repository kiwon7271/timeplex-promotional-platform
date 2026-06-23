import { actionJson } from "@/lib/api/action-json";
import { onDeleteDocument } from "@/actions/documents";

export const runtime = "nodejs";

/** DELETE — 서류 삭제 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { filePath } = (await request.json()) as { filePath: string };
  return actionJson(await onDeleteDocument(params.id, filePath));
}
