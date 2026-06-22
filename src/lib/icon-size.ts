/** Tabler 아이콘 공통 px 크기 */
export const ICON_SIZE = {
  sm: 18,
  md: 20,
  lg: 22,
  xl: 24,
} as const;

export const ICON_STROKE = 1.75;

/** 컨트롤 sm/md/lg에 맞는 아이콘 px */
export const getControlIconSize = (size: "sm" | "md" | "lg" = "md") =>
  ({ sm: ICON_SIZE.sm, md: ICON_SIZE.md, lg: ICON_SIZE.lg } as const)[size];

export const iconSmClass = "h-[18px] w-[18px] shrink-0";
export const iconMdClass = "h-5 w-5 shrink-0";
export const iconLgClass = "h-[22px] w-[22px] shrink-0";

/** 툴바 한 줄 — 라벨+입력 Field와 버튼 하단 정렬 */
export const toolbarRowClass = "flex flex-col gap-3 sm:flex-row sm:items-end";
