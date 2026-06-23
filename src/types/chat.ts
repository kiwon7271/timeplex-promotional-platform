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
  /** 전송 직후 메시지 목록 갱신 (첨부·링크 등) */
  onSentMessage?: () => void;
  /** 텍스트 전송 — 즉시 UI 반영 */
  onOptimisticSend?: (body: string) => string;
  /** 전송 실패 — 낙관적 메시지 제거 */
  onOptimisticRollback?: (tempId: string) => void;
  /** 전송 성공 — 낙관적 메시지를 서버 응답으로 교체 */
  onConfirmSent?: (tempId: string, message: MessageWithAttachments) => void;
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
  /** 선택된 대화 헤더 우측 액션 (종료 등) */
  conversationActions?: ReactNode;
  /** 메시지 로딩 중 */
  loadingMessages?: boolean;
  /** 대화 목록 페이징 */
  listPage?: number;
  listTotalPages?: number;
  listBasePath?: string;
  listQuery?: Record<string, string | undefined>;
}
