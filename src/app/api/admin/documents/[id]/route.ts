import { NextResponse } from "next/server";
import { actionJson } from "@/lib/api/action-json";
import { onUpdateDocumentStatus, onDownloadDocument } from "@/actions/documents";

export const runtime = "nodejs";

/** PATCH — 서류 상태 변경 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { status, rejectionReason } = (await request.json()) as {
    status: string;
    rejectionReason?: string;
  };
  return actionJson(await onUpdateDocumentStatus(params.id, status, rejectionReason));
}

/** GET — 서류 다운로드 URL */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const result = await onDownloadDocument(params.id);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, data: { url: result.url } });
}
