import type { ReactNode } from "react";
import type { Conversation, Message, ReservationLink } from "@/types/database";

export interface MessageAttachmentPreview {
  file_name: string;
  file_path?: string;
  url?: string;
}

export interface MessageReservationLinkPreview {
  provider: string;
  url: string;
}

export interface MessageWithAttachments extends Message {
  attachments?: MessageAttachmentPreview[];
  reservation_links?: MessageReservationLinkPreview[];
}

export interface MessageComposerProps {
  conversationId: string;
  reservationLinks: ReservationLink[];
  /** 번역 API 설정 여부 — placeholder 안내용 */
  translationEnabled?: boolean;
  /** 전송 직후 메시지 목록 갱신 */
  onSentMessage?: () => void;
}

export interface ChatThreadLogProps {
  messages: MessageWithAttachments[];
  /** CUSTOMER 메시지 표시명 */
  customerName?: string;
  /** 고객 기준 언어 — 번역 라벨 표시 */
  customerLocale?: string | null;
  /** 이미지 로드 후 스크롤 보정 */
  onMediaLoad?: () => void;
}

/** 공통 채팅방 — 좌측 목록 + 우측 로그 (+ 선택적 composer) */
export interface ChatLogLayoutProps {
  toolbar?: ReactNode;
  conversations: Conversation[];
  messages: MessageWithAttachments[];
  conversationId?: string;
  onSelectConversation: (id: string) => void;
  /** 목록 빈 상태 (매장 미선택 등) */
  listPlaceholder?: string;
  /** 하단 입력 — 없으면 읽기 전용 */
  composer?: ReactNode;
}
