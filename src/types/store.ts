import type { StoreDocumentWithUrl } from "@/lib/store-documents";
import type { Conversation, ReservationLink, Store } from "@/types/database";
import type { MessageWithAttachments } from "@/types/chat";
import type { DocumentType, PlanCode } from "@/lib/constants";

export interface AgreedConsentNotice {
  id: string;
  title: string;
  content: string;
  version: string;
  agreed_at: string;
}

export interface StoreChatLogLayoutProps {
  conversations: Conversation[];
  messages: MessageWithAttachments[];
  conversationId?: string;
  q?: string;
  channel?: string;
  reservationLinks: ReservationLink[];
}

export interface LineConnectionDiagnostic {
  serviceRoleConfigured: boolean;
  status: string;
  channelId: string | null;
  hasCredentials: boolean;
  errorMessage: string | null;
  lastWebhookAt?: string | null;
  lastWebhookSummary?: string | null;
  hints: string[];
}

export interface StoreChatLiveLayoutProps extends StoreChatLogLayoutProps {
  storeId: string;
  /** 번역 API 설정 여부 — 가이드·입력 placeholder */
  translationEnabled: boolean;
}

export interface StoreInfoFormProps {
  store: Store;
}

export interface StaffMember {
  profile_id: string;
  role: string;
  email: string;
}

export interface StaffManagerProps {
  members: StaffMember[];
  planCode: PlanCode;
  limit: number;
}

export interface ReservationLinkManagerProps {
  links: ReservationLink[];
}

export interface DocumentManagerProps {
  documents: StoreDocumentWithUrl[];
}

export interface DocumentChecklistItemProps {
  docType: DocumentType;
  document?: StoreDocumentWithUrl;
  index: number;
  uploading: boolean;
  onUploadFile: (docType: DocumentType, file: File) => Promise<void>;
}
