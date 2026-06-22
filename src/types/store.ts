import type { StoreDocumentWithUrl } from "@/lib/store-documents";
import type { Conversation, ReservationLink, Store, StoreChannelConnection } from "@/types/database";
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
  hints: string[];
}

export interface StoreChatLiveLayoutProps extends StoreChatLogLayoutProps {
  storeId: string;
  channelConnections: StoreChannelConnection[];
  translationEnabled: boolean;
  lineWebhookUrl: string;
  lineDiagnostic: LineConnectionDiagnostic;
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
