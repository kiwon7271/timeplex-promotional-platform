import type { Profile } from "@/types/database";

/** 입점 승인 전 로그인 차단 안내 */
export const PENDING_APPLICATION_MESSAGE =
  "아직 입점 신청이 승인되지 않았습니다. 통합관리자 승인 후 다시 로그인해 주세요.";

export const REJECTED_APPLICATION_MESSAGE =
  "입점 신청이 반려되었습니다. 관리자에게 문의해 주세요.";

export const NO_STORE_MESSAGE =
  "매장이 연결되지 않은 계정입니다. 관리자에게 문의해 주세요.";

/** 매장관리자 로그인 가능 여부 — 승인 완료(store_id 있음) */
export const canAccessStore = (profile: Pick<Profile, "role" | "store_id">) => {
  if (profile.role === "SUPER_ADMIN") return true;
  return !!profile.store_id;
};
