const STORAGE_PREFIX = "store-intro-dismissed";

const getStorageKey = (id: string, version: string) => `${STORAGE_PREFIX}:${id}:${version}`;

/** 공지 팝업 숨김 여부 (버전별) */
export const isIntroDismissed = (id: string, version: string) => {
  if (typeof window === "undefined") return true;

  const until = localStorage.getItem(getStorageKey(id, version));
  if (!until) return false;

  return Date.now() < Number(until);
};

/** 오늘 하루 보지 않기 */
export const dismissIntroForToday = (id: string, version: string) => {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  localStorage.setItem(getStorageKey(id, version), String(endOfDay.getTime()));
};

/** 닫기 — 버전 변경 전까지 숨김 */
export const dismissIntro = (id: string, version: string) => {
  const farFuture = Date.now() + 365 * 24 * 60 * 60 * 1000;
  localStorage.setItem(getStorageKey(id, version), String(farFuture));
};
