// Supabase 테이블 타입 정의 (MVP)
// Json, const 파생 union, 제네릭 TableShape 은 type 유지. 나머지는 interface.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Timestamps {
  created_at: string;
}

export interface Profile extends Timestamps {
  id: string;
  email: string;
  full_name: string | null;
  role: "SUPER_ADMIN" | "STORE_OWNER" | "STORE_STAFF";
  store_id: string | null;
}

export interface Plan extends Timestamps {
  id: string;
  code: string;
  name: string;
  staff_limit: number;
  price: number;
}

export interface Store extends Timestamps {
  id: string;
  name: string;
  status: string;
  plan_code: string;
  owner_id: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
}

export interface StoreMember extends Timestamps {
  id: string;
  store_id: string;
  profile_id: string;
  role: string;
}

export interface OnboardingApplication extends Timestamps {
  id: string;
  user_id: string | null;
  store_name: string;
  applicant_name: string;
  email: string;
  phone: string | null;
  status: string;
  note: string | null;
  reviewed_at: string | null;
}

export interface StoreDocument extends Timestamps {
  id: string;
  store_id: string;
  doc_type: string;
  file_path: string;
  file_name: string;
  status: string;
  rejection_reason: string | null;
}

export interface ReservationLink extends Timestamps {
  id: string;
  store_id: string;
  provider: string;
  url: string;
}

export interface Conversation extends Timestamps {
  id: string;
  store_id: string;
  channel: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  status: string;
  last_message_at: string | null;
  customer_locale: string | null;
  external_thread_id: string | null;
}

export interface Message extends Timestamps {
  id: string;
  conversation_id: string;
  sender: string;
  body: string;
  translated_body: string | null;
  external_message_id: string | null;
}

export interface MessageAttachment extends Timestamps {
  id: string;
  message_id: string;
  file_path: string;
  file_name: string;
}

export interface MessageReservationLink extends Timestamps {
  id: string;
  message_id: string;
  reservation_link_id: string | null;
  provider: string;
  url: string;
}

export interface Inquiry extends Timestamps {
  id: string;
  store_id: string;
  title: string;
  body: string;
  category: string;
  answered_at: string | null;
  last_message_at: string | null;
}

export interface InquiryMessage extends Timestamps {
  id: string;
  inquiry_id: string;
  author_id: string;
  author_role: string;
  body: string;
}

export interface UsageMonthly extends Timestamps {
  id: string;
  store_id: string;
  year_month: string;
  message_count: number;
  conversation_count: number;
}

export interface StoreEvent extends Timestamps {
  id: string;
  store_id: string;
  event_type: string;
}

export interface ConsentNotice extends Timestamps {
  id: string;
  title: string;
  content: string;
  version: string;
  is_active: boolean;
}

export interface StoreConsentAgreement {
  id: string;
  store_id: string;
  consent_notice_id: string;
  notice_version: string;
  agreed_by: string;
  agreed_at: string;
}

export interface StoreChannelConnection extends Timestamps {
  id: string;
  store_id: string;
  channel: string;
  status: string;
  external_account_id: string | null;
  display_name: string | null;
  connected_at: string | null;
  error_message: string | null;
  credentials?: Json | null;
}

type TableShape<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface DatabaseTables {
  profiles: TableShape<Profile>;
  plans: TableShape<Plan>;
  stores: TableShape<Store>;
  store_members: TableShape<StoreMember>;
  onboarding_applications: TableShape<OnboardingApplication>;
  store_documents: TableShape<StoreDocument>;
  reservation_links: TableShape<ReservationLink>;
  conversations: TableShape<Conversation>;
  messages: TableShape<Message>;
  message_attachments: TableShape<MessageAttachment>;
  message_reservation_links: TableShape<MessageReservationLink>;
  inquiries: TableShape<Inquiry>;
  inquiry_messages: TableShape<InquiryMessage>;
  usage_monthly: TableShape<UsageMonthly>;
  store_events: TableShape<StoreEvent>;
  consent_notices: TableShape<ConsentNotice>;
  store_consent_agreements: TableShape<StoreConsentAgreement>;
  store_channel_connections: TableShape<StoreChannelConnection>;
}

export interface Database {
  public: {
    Tables: DatabaseTables;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
