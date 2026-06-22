import "server-only";

import { STORE_LOCALE } from "@/lib/locale";
import { detectLocale, translateText } from "@/lib/translate";

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
  let customerLocale = existingLocale;

  if (!customerLocale) {
    customerLocale = (await detectLocale(body)) ?? "en";
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
