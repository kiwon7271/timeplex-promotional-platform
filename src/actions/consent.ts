"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStoreUser } from "@/lib/auth";
import { getPendingConsentNotices } from "@/lib/consent";
import type { ActionResult } from "@/types/action-result";

/** Supabase: store_consent_agreements INSERT — 활성 동의/고지 전체 동의 */
export const onAgreeConsentNotices = async (): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const pending = await getPendingConsentNotices(profile.store_id);
  if (pending.length === 0) return { ok: true };

  const supabase = createClient();
  const rows = pending.map((notice) => ({
    store_id: profile.store_id!,
    consent_notice_id: notice.id,
    notice_version: notice.version,
    agreed_by: profile.id,
  }));

  const { error } = await supabase.from("store_consent_agreements").upsert(rows, {
    onConflict: "store_id,consent_notice_id,notice_version",
    ignoreDuplicates: true,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath("/store/chats");
  return { ok: true };
};
