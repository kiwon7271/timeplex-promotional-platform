// 역할 정의
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  STORE_OWNER: "STORE_OWNER",
  STORE_STAFF: "STORE_STAFF",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// 역할별 진입 경로
export const ROLE_HOME: Record<Role, string> = {
  SUPER_ADMIN: "/admin",
  STORE_OWNER: "/store",
  STORE_STAFF: "/store",
};

// 역할 표시명
export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "통합관리자",
  STORE_OWNER: "매장관리자",
  STORE_STAFF: "매장직원",
};

// 요금제 정의 및 직원 수 제한
export const PLAN_STAFF_LIMIT = {
  Free: 1,
  Starter: 5,
  Business: 10,
  Enterprise: 999,
} as const;

export type PlanCode = keyof typeof PLAN_STAFF_LIMIT;

export const PLAN_CODES = Object.keys(PLAN_STAFF_LIMIT) as PlanCode[];

// 매장 상태
export const STORE_STATUS = ["PENDING", "ACTIVE", "SUSPENDED", "CLOSED"] as const;
export type StoreStatus = (typeof STORE_STATUS)[number];

/** 매장 상태 표시명 */
export const STORE_STATUS_LABEL: Record<StoreStatus, string> = {
  PENDING: "개설 대기",
  ACTIVE: "운영 중",
  SUSPENDED: "운영 정지",
  CLOSED: "폐점",
};

// 온보딩 신청 상태
export const APPLICATION_STATUS = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUS)[number];

/** 입점 신청 상태 표시명 */
export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: "입점 대기",
  APPROVED: "승인",
  REJECTED: "반려",
};

// 문서 타입
export const DOCUMENT_TYPES = [
  "BUSINESS_REGISTRATION_KR",
  "BUSINESS_REGISTRATION_EN",
  "BANK_ACCOUNT_COPY",
  "OWNER_ID",
  "OWNER_PASSPORT",
  "HOMEPAGE_LOGO",
  "EXPECTED_MONTHLY_SALES",
  "MINIMUM_TRANSACTION_AMOUNT",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

/** 문서 종류 표시명 */
export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  BUSINESS_REGISTRATION_KR: "사업자등록증(국문)",
  BUSINESS_REGISTRATION_EN: "사업자등록증(영문)",
  BANK_ACCOUNT_COPY: "통장 사본",
  OWNER_ID: "대표자 신분증",
  OWNER_PASSPORT: "대표자 여권",
  HOMEPAGE_LOGO: "홈페이지·로고",
  EXPECTED_MONTHLY_SALES: "예상 월 매출",
  MINIMUM_TRANSACTION_AMOUNT: "최소 거래 금액",
};

/** 문서 종류 안내 (매장 서류 체크리스트) */
export const DOCUMENT_TYPE_HINT: Record<DocumentType, string> = {
  BUSINESS_REGISTRATION_KR: "카드사 심사용 국문 사업자등록증 사본",
  BUSINESS_REGISTRATION_EN: "카드사 심사용 영문 사업자등록증 또는 영문 등록 증명",
  BANK_ACCOUNT_COPY: "정산·가맹 심사용 계좌 통장 사본",
  OWNER_ID: "대표자 신분증 앞·뒤",
  OWNER_PASSPORT: "외국인 대표자 카드사 심사용 여권 사본",
  HOMEPAGE_LOGO: "매장 홈페이지 또는 로고 (가맹 심사 확인용)",
  EXPECTED_MONTHLY_SALES: "카드사 심사용 예상 월 매출 자료",
  MINIMUM_TRANSACTION_AMOUNT: "카드사 심사용 최소 거래 금액 자료",
};

/** 카드사 심사 서류 — 공통 안내 */
export const CARD_REVIEW_DOCUMENT_TITLE = "카드사 심사 서류";

export const CARD_REVIEW_DOCUMENT_PURPOSE =
  "매장의 카드 결제 가맹(카드사) 심사를 받기 위해 제출하는 서류입니다.";

export const CARD_REVIEW_DOCUMENT_GUIDE_STORE =
  "아래 필수 서류를 모두 제출해 주세요. 통합관리자 검수·승인 후 카드사 심사가 진행됩니다.";

export const CARD_REVIEW_DOCUMENT_GUIDE_ADMIN =
  "카드사 심사용으로 제출된 서류입니다. 내용을 확인한 뒤 승인 또는 반려해 주세요.";

// 문서 상태
export const DOCUMENT_STATUS = ["PENDING", "APPROVED", "REJECTED"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUS)[number];

/** 문서(카드사 심사 서류) 상태 표시명 */
export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  PENDING: "검수 대기",
  APPROVED: "승인",
  REJECTED: "반려",
};

// 예약 링크 제공처
export const RESERVATION_PROVIDERS = [
  "TIMEPLEX",
  "GOOGLE_MAP",
  "KLOOK",
  "TRIPADVISOR",
  "NAVER",
  "OTHER",
] as const;
export type ReservationProvider = (typeof RESERVATION_PROVIDERS)[number];

/** 예약 링크 제공처 표시명 */
export const RESERVATION_PROVIDER_LABEL: Record<ReservationProvider, string> = {
  TIMEPLEX: "Timeplex",
  GOOGLE_MAP: "Google Map",
  KLOOK: "Klook",
  TRIPADVISOR: "Tripadvisor",
  NAVER: "네이버",
  OTHER: "기타",
};

// 대화 채널
export const CHANNELS = ["WEB", "WHATSAPP", "LINE", "INSTAGRAM"] as const;
export type Channel = (typeof CHANNELS)[number];

/** 매장주용 채널 표시명 */
export const CHANNEL_LABEL_KO: Record<Channel, string> = {
  WEB: "웹채팅",
  WHATSAPP: "왓츠앱",
  LINE: "라인",
  INSTAGRAM: "인스타그램",
};

/** 메신저 연결 상태 */
export const CHANNEL_CONNECTION_STATUS = [
  "DISCONNECTED",
  "CONNECTING",
  "CONNECTED",
  "ERROR",
] as const;
export type ChannelConnectionStatus = (typeof CHANNEL_CONNECTION_STATUS)[number];

/** 매장주용 연결 상태 표시명 */
export const CHANNEL_CONNECTION_STATUS_LABEL: Record<ChannelConnectionStatus, string> = {
  DISCONNECTED: "연결 안 됨",
  CONNECTING: "연결 중",
  CONNECTED: "사용 중",
  ERROR: "오류",
};

// 대화 상태
export const CONVERSATION_STATUS = ["OPEN", "CLOSED"] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUS)[number];

// 메시지 발신 주체
export const MESSAGE_SENDER = ["CUSTOMER", "STORE", "SYSTEM"] as const;
export type MessageSender = (typeof MESSAGE_SENDER)[number];

// 문의 — answered_at 기준 표시 (OPEN/ANSWERED) 는 inquiry-thread.ts 참고

// 스토리지 버킷
export const BUCKETS = {
  STORE_DOCUMENTS: "store-documents",
  CHAT_ATTACHMENTS: "chat-attachments",
} as const;

// 파일 업로드 제한
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];
export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"];
