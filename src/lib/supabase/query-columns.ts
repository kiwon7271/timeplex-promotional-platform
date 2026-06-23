/** Supabase select — 명시적 컬럼 (select("*") 대체) */

export const PROFILE_COLUMNS =
  "id, email, full_name, role, store_id, created_at" as const;

export const STORE_COLUMNS =
  "id, name, status, plan_code, owner_id, email, phone, address, description, created_at" as const;

export const CONVERSATION_COLUMNS =
  "id, store_id, channel, customer_name, customer_phone, customer_email, status, last_message_at, customer_locale, external_thread_id, assigned_user_id, last_customer_message_at, last_store_message_at, unread_count, priority, created_at" as const;

export const MESSAGE_BASE_COLUMNS =
  "id, conversation_id, sender, body, translated_body, external_message_id, delivery_status, delivered_at, failed_reason, metadata, created_at" as const;

export const MESSAGE_RELATIONS =
  "attachments:message_attachments(file_name, file_path), reservation_links:message_reservation_links(provider, url)" as const;

export const MESSAGE_SELECT = `${MESSAGE_BASE_COLUMNS}, ${MESSAGE_RELATIONS}` as const;

export const RESERVATION_LINK_COLUMNS = "id, store_id, provider, url, created_at" as const;

export const STORE_DOCUMENT_COLUMNS =
  "id, store_id, doc_type, file_path, file_name, status, rejection_reason, created_at" as const;

export const INQUIRY_COLUMNS =
  "id, store_id, title, body, category, answered_at, last_message_at, created_at" as const;

export const USAGE_MONTHLY_COLUMNS =
  "id, store_id, year_month, message_count, conversation_count, created_at" as const;

export const USAGE_MONTHLY_WITH_STORE = `
  ${USAGE_MONTHLY_COLUMNS},
  stores (
    id,
    name
  )
` as const;

export const CONSENT_NOTICE_COLUMNS =
  "id, title, content, version, is_active, created_at" as const;

export const ONBOARDING_APPLICATION_COLUMNS =
  "id, user_id, store_name, applicant_name, email, phone, status, note, reviewed_at, created_at" as const;

export const STORE_MEMBER_WITH_PROFILE =
  "id, store_id, profile_id, role, created_at, profiles(email, full_name, role)" as const;

export const INQUIRY_MESSAGE_COLUMNS =
  "id, inquiry_id, author_id, author_role, body, created_at" as const;

export const INQUIRY_MESSAGE_WITH_PROFILE =
  `${INQUIRY_MESSAGE_COLUMNS}, profiles(full_name, email)` as const;

export const PROFILE_ROLE_COLUMNS = "role, store_id" as const;

export const PROFILE_AUTH_COLUMNS = "id, role, store_id" as const;

export const STORE_MEMBER_COUNT = "id" as const;

export const CONVERSATION_COUNT = "id" as const;

export const STORE_DOCUMENT_STATUS = "status" as const;
