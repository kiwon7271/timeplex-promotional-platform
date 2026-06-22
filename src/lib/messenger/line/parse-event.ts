import type { LineEvent } from "@/lib/messenger/line/types";

/** LINE message 이벤트 → 저장용 본문 */
export const getLineInboundBody = (event: LineEvent) => {
  if (event.type !== "message" || !event.message) return null;

  const { type, text, id } = event.message;

  if (type === "text") {
    const trimmed = text?.trim() ?? "";
    return trimmed ? { body: trimmed, externalMessageId: id } : null;
  }

  const placeholder: Record<string, string> = {
    image: "(이미지)",
    video: "(동영상)",
    audio: "(음성)",
    file: "(파일)",
    location: "(위치)",
    sticker: "(스티커)",
  };

  const body = placeholder[type] ?? `(${type})`;
  return { body, externalMessageId: id };
};

/** 1:1 사용자 메시지만 처리 */
export const getLineUserId = (event: LineEvent) => {
  if (event.source?.type !== "user") return null;
  return event.source.userId?.trim() || null;
};
