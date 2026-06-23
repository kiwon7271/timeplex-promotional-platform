import { NextResponse } from "next/server";
import { onDownloadDocument } from "@/actions/documents";

export const runtime = "nodejs";

/** GET — 서류 다운로드 URL */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const result = await onDownloadDocument(params.id);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, data: { url: result.url } });
}
