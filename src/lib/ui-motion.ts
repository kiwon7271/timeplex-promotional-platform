/** 공통 motion transition (랜딩 스타일 기준) */
export const UI_MOTION_EASE = "easeInOut" as const;

export const UI_MOTION_DURATION = 0.5;

/** 스크롤 진입 fade-up */
export const fadeUpInView = {
  initial: { y: 12, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  transition: { duration: UI_MOTION_DURATION, ease: UI_MOTION_EASE },
  viewport: { once: true },
} as const;

/** 즉시 fade-up */
export const fadeUp = {
  initial: { y: 12, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: UI_MOTION_DURATION, ease: UI_MOTION_EASE },
} as const;
