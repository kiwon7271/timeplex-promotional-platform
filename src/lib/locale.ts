/** 매장주가 사용하는 기본 언어 */
export const STORE_LOCALE = "ko";

/** ISO 639-1 → 매장주용 표시명 */
export const LOCALE_LABEL_KO: Record<string, string> = {
  ko: "한국어",
  en: "영어",
  ja: "일본어",
  zh: "중국어",
  "zh-cn": "중국어(간체)",
  "zh-tw": "중국어(번체)",
  es: "스페인어",
  fr: "프랑스어",
  de: "독일어",
  th: "태국어",
  vi: "베트남어",
};

/** 매장주 화면용 언어 이름 */
export const getLocaleLabelKo = (code: string | null | undefined) => {
  if (!code) return "미설정";
  return LOCALE_LABEL_KO[code.toLowerCase()] ?? code.toUpperCase();
};
