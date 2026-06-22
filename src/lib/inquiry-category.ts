/** 문의 구분 */
export const INQUIRY_CATEGORIES = [
  "SYSTEM_ERROR",
  "SIGNUP",
  "MESSENGER",
  "CHAT",
  "STORE_STAFF",
  "OTHER",
] as const;

export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number];

export const INQUIRY_CATEGORY_LABEL: Record<InquiryCategory, string> = {
  SYSTEM_ERROR: "시스템 오류",
  SIGNUP: "가입 진행",
  MESSENGER: "메신저 설정",
  CHAT: "채팅 관련",
  STORE_STAFF: "매장/직원",
  OTHER: "기타",
};

export const INQUIRY_CATEGORY_OPTIONS = INQUIRY_CATEGORIES.map((value) => ({
  value,
  label: INQUIRY_CATEGORY_LABEL[value],
}));

/** 목록 필터 — 전체 포함 */
export const INQUIRY_CATEGORY_FILTER_OPTIONS = [
  { value: undefined as InquiryCategory | undefined, label: "전체" },
  ...INQUIRY_CATEGORY_OPTIONS,
];

export const isInquiryCategory = (value: string): value is InquiryCategory =>
  INQUIRY_CATEGORIES.includes(value as InquiryCategory);

/** URL 쿼리 파싱 */
export const parseInquiryCategory = (value?: string): InquiryCategory | undefined => {
  if (!value || !isInquiryCategory(value)) return undefined;
  return value;
};

/** 표시 라벨 */
export const getInquiryCategoryLabel = (category: string) =>
  isInquiryCategory(category) ? INQUIRY_CATEGORY_LABEL[category] : category;
