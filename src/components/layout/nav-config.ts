import type { NavIconName } from "@/components/layout/nav-icon";
import type { NavItem } from "@/types/layout";

export type { NavItem } from "@/types/layout";

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "대시보드", icon: "home" as NavIconName },
  { href: "/admin/stores", label: "매장 관리", icon: "store" as NavIconName },
  { href: "/admin/store-admissions", label: "입점관리", icon: "application" as NavIconName, badge: "pendingApplications" },
  { href: "/admin/demand", label: "매장 수요", icon: "chart" as NavIconName },
  { href: "/admin/visitor-stats", label: "방문자 통계", icon: "users" as NavIconName },
  { href: "/admin/chats", label: "대화 로그", icon: "chat" as NavIconName },
  { href: "/admin/chat-usage", label: "채팅사용량", icon: "usage" as NavIconName },
  { href: "/admin/store-inquiries", label: "매장문의", icon: "inquiry" as NavIconName },
  { href: "/admin/settings", label: "설정", icon: "settings" as NavIconName },
  { href: "/admin/system", label: "시스템", icon: "settings" as NavIconName },
];

export const STORE_NAV: NavItem[] = [
  { href: "/store", label: "대시보드", icon: "home" as NavIconName },
  { href: "/store/info", label: "매장 정보", icon: "info" as NavIconName },
  { href: "/store/staff", label: "직원 관리", icon: "staff" as NavIconName },
  { href: "/store/reservation-links", label: "예약 링크", icon: "link" as NavIconName },
  { href: "/store/documents", label: "카드사 심사", icon: "document" as NavIconName },
  { href: "/store/chats", label: "고객 대화", icon: "chat" as NavIconName },
  { href: "/store/inquiries", label: "문의", icon: "inquiry" as NavIconName },
];
