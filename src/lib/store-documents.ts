import { createClient } from "@/lib/supabase/server";
import { BUCKETS } from "@/lib/constants";
import type { StoreDocument } from "@/types/database";

export type StoreDocumentWithUrl = StoreDocument & { previewUrl?: string };

/** store_documents — Storage signed URL 부여 (미리보기) */
export const attachDocumentSignedUrls = async (
  documents: StoreDocument[],
): Promise<StoreDocumentWithUrl[]> => {
  if (documents.length === 0) return [];

  const supabase = createClient();

  return Promise.all(
    documents.map(async (doc) => {
      const { data } = await supabase.storage
        .from(BUCKETS.STORE_DOCUMENTS)
        .createSignedUrl(doc.file_path, 60 * 60);

      return { ...doc, previewUrl: data?.signedUrl };
    }),
  );
};
