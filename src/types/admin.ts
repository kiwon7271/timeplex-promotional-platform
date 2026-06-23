import type { ConsentNotice, Conversation, Store } from "@/types/database";
import type { MessageWithAttachments } from "@/types/chat";
import type { StoreDocumentWithUrl } from "@/lib/store-documents";

export interface ConsentManagerProps {
  notices: ConsentNotice[];
  onMutated?: () => void;
}

export interface StoreMemberRow {
  id: string;
  email: string;
  role: string;
}

export interface StoreDocumentReviewPanelProps {
  documents: StoreDocumentWithUrl[];
}

export interface StoreListTableProps {
  stores: Store[];
  membersByStore: Record<string, StoreMemberRow[]>;
  documentsByStore: Record<string, StoreDocumentWithUrl[]>;
  page: number;
  totalPages: number;
  nameQuery: string;
}

export interface AdminChatLogLayoutProps {
  stores: Pick<Store, "id" | "name">[];
  conversations: Conversation[];
  messages: MessageWithAttachments[];
  storeId?: string;
  conversationId?: string;
  listPage?: number;
  listTotalPages?: number;
}
