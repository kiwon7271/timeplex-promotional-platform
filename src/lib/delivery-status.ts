import type { MessageDeliveryStatus } from "@/types/database";

const DELIVERY_STATUS_LABEL: Record<MessageDeliveryStatus, string> = {
  PENDING: "전송 대기",
  TRANSLATING: "번역 중",
  TRANSLATED: "번역 완료",
  SENDING: "전송 중",
  SENT: "전송됨",
  FAILED: "전송 실패",
};

export const getDeliveryStatusLabel = (status: MessageDeliveryStatus | null | undefined) => {
  if (!status) return null;
  return DELIVERY_STATUS_LABEL[status] ?? status;
};

export const isDeliveryPending = (status: MessageDeliveryStatus | null | undefined) =>
  status === "PENDING" || status === "TRANSLATING" || status === "SENDING";

export const isDeliveryFailed = (status: MessageDeliveryStatus | null | undefined) =>
  status === "FAILED";
