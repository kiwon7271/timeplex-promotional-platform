import { createClient } from "@/lib/supabase/server";
import { CONSENT_NOTICE_COLUMNS } from "@/lib/supabase/query-columns";
import type { ConsentNotice } from "@/types/database";

/** 활성 동의/고지 문구 목록 */
export const getActiveConsentNotices = async (): Promise<ConsentNotice[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("consent_notices")
    .select(CONSENT_NOTICE_COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return data ?? [];
};

/** 매장이 아직 동의하지 않은 활성 문구 */
export const getPendingConsentNotices = async (storeId: string): Promise<ConsentNotice[]> => {
  const notices = await getActiveConsentNotices();
  if (notices.length === 0) return [];

  const supabase = createClient();
  const { data: agreements } = await supabase
    .from("store_consent_agreements")
    .select("consent_notice_id, notice_version")
    .eq("store_id", storeId);

  const agreedKeys = new Set(
    (agreements ?? []).map((row) => `${row.consent_notice_id}:${row.notice_version}`),
  );

  return notices.filter((notice) => !agreedKeys.has(`${notice.id}:${notice.version}`));
};

/** 고객 대화 이용 가능 여부 — 활성 문구 전부 동의 완료 */
export const hasStoreChatConsent = async (storeId: string) => {
  const pending = await getPendingConsentNotices(storeId);
  return pending.length === 0;
};

/** 매장이 동의한 활성 약관 (재열람용) */
export const getAgreedConsentNotices = async (storeId: string) => {
  const notices = await getActiveConsentNotices();
  if (notices.length === 0) return [];

  const supabase = createClient();
  const { data: agreements } = await supabase
    .from("store_consent_agreements")
    .select("consent_notice_id, notice_version, agreed_at")
    .eq("store_id", storeId);

  const agreementMap = new Map(
    (agreements ?? []).map((row) => [`${row.consent_notice_id}:${row.notice_version}`, row]),
  );

  return notices
    .filter((notice) => agreementMap.has(`${notice.id}:${notice.version}`))
    .map((notice) => ({
      id: notice.id,
      title: notice.title,
      content: notice.content,
      version: notice.version,
      agreed_at: agreementMap.get(`${notice.id}:${notice.version}`)!.agreed_at,
    }));
};

