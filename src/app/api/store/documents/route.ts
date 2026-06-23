import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStoreApiUser } from "@/lib/api/store-auth";
import { STORE_DOCUMENT_COLUMNS } from "@/lib/supabase/query-columns";
import { attachDocumentSignedUrls } from "@/lib/store-documents";

export const runtime = "nodejs";

/** GET — 매장 서류 목록 */
export async function GET() {
  const auth = await requireStoreApiUser();
  if ("response" in auth) return auth.response;

  const supabase = createClient();
  const { data: documents } = await supabase
    .from("store_documents")
    .select(STORE_DOCUMENT_COLUMNS)
    .eq("store_id", auth.profile.store_id!)
    .order("created_at", { ascending: false });

  const docsWithUrls = await attachDocumentSignedUrls(documents ?? []);

  return NextResponse.json({ ok: true, data: docsWithUrls });
}
