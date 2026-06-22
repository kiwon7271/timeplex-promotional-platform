import type { BadgeVariant } from "@/types/ui";

/** 상태·역할·요금제 → Badge variant 매핑 */
const BADGE_VARIANT_MAP: Record<string, BadgeVariant> = {
  ACTIVE: "success",
  APPROVED: "success",
  ANSWERED: "success",
  OPEN: "info",
  PENDING: "warning",
  SUSPENDED: "warning",
  REJECTED: "danger",
  CLOSED: "muted",
  STORE_OWNER: "info",
  STORE_STAFF: "default",
  Free: "muted",
  Starter: "info",
  Business: "success",
  Enterprise: "warning",
};

export const resolveBadgeVariant = (value: string): BadgeVariant =>
  BADGE_VARIANT_MAP[value] ?? "default";
