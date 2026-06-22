import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { STORE_LOCALE } from "@/lib/locale";
import { detectLocale, translateInboundForStore, translateText } from "@/lib/translate";

/** 매장 → 고객 발신 번역 (한국어 원문 + 고객 언어) */
export const translateStoreOutbound = async (
  body: string,
  customerLocale: string | null,
) => {
  if (!customerLocale || customerLocale === STORE_LOCALE) {
    return { body, translated_body: null as string | null };
  }

  const translated_body = await translateText({
    text: body,
    sourceLocale: STORE_LOCALE,
    targetLocale: customerLocale,
  });

  return { body, translated_body };
};

/** 고객 → 매장 수신 번역 (외국어 원문 + 한국어) */
export const translateCustomerInbound = async (
  body: string,
  existingLocale: string | null,
) => {
  const needsDetect = !existingLocale || existingLocale === STORE_LOCALE;

  if (needsDetect) {
    const combined = await translateInboundForStore(body);
    if (combined) {
      return {
        customerLocale: combined.customerLocale,
        body,
        translated_body: combined.translated_body,
      };
    }
  }

  let customerLocale = existingLocale;

  if (!customerLocale) {
    customerLocale = (await detectLocale(body)) ?? "en";
  } else if (customerLocale === STORE_LOCALE) {
    const detected = await detectLocale(body);
    if (detected && detected !== STORE_LOCALE) {
      customerLocale = detected;
    }
  }

  const translated_body = await translateText({
    text: body,
    sourceLocale: customerLocale,
    targetLocale: STORE_LOCALE,
  });

  return {
    customerLocale,
    body,
    translated_body,
  };
};

/** 발신 번역 전 — customer_locale 미설정 시 최근 고객 메시지로 감지 */
export const resolveCustomerLocale = async (
  supabase: SupabaseClient,
  conversationId: string,
  currentLocale: string | null,
): Promise<string | null> => {
  if (currentLocale && currentLocale !== STORE_LOCALE) return currentLocale;

  const { data: lastCustomer } = await supabase
    .from("messages")
    .select("body")
    .eq("conversation_id", conversationId)
    .eq("sender", "CUSTOMER")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastCustomer?.body?.trim()) return currentLocale;

  const detected = (await detectLocale(lastCustomer.body)) ?? currentLocale;
  if (detected && detected !== currentLocale) {
    await supabase
      .from("conversations")
      .update({ customer_locale: detected })
      .eq("id", conversationId);
  }

  return detected;
};
