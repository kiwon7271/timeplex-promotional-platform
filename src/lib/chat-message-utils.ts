/** 이미지 전용 placeholder 본문 여부 (클라이언트·서버 공용) */
export const isImagePlaceholderBody = (body: string) =>
  body === "(이미지)" || body.trim() === "";

/** 예약 링크 전용 placeholder 본문 여부 */
export const isLinkPlaceholderBody = (body: string) =>
  body === "(예약링크)" || body.trim() === "";

/** 첨부 placeholder 본문 여부 */
export const isAttachmentPlaceholderBody = (body: string) =>
  isImagePlaceholderBody(body) || isLinkPlaceholderBody(body);
