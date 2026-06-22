import type {
  ApplicationStatus,
  DocumentStatus,
  Role,
  StoreStatus,
} from "@/lib/constants";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_LABEL,
  DOCUMENT_STATUS,
  DOCUMENT_STATUS_LABEL,
  ROLE_LABEL,
  STORE_STATUS,
  STORE_STATUS_LABEL,
} from "@/lib/constants";

/** 셀렉트 옵션 — value는 코드, label은 한글 */
export const toStatusSelectOptions = <T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
) => values.map((value) => ({ value, label: labels[value] }));

export const STORE_STATUS_OPTIONS = toStatusSelectOptions(STORE_STATUS, STORE_STATUS_LABEL);
export const DOCUMENT_STATUS_OPTIONS = toStatusSelectOptions(DOCUMENT_STATUS, DOCUMENT_STATUS_LABEL);
export const APPLICATION_STATUS_OPTIONS = toStatusSelectOptions(
  APPLICATION_STATUS,
  APPLICATION_STATUS_LABEL,
);

export const getStoreStatusLabel = (status: string) =>
  STORE_STATUS_LABEL[status as StoreStatus] ?? status;

export const getDocumentStatusLabel = (status: string) =>
  DOCUMENT_STATUS_LABEL[status as DocumentStatus] ?? status;

export const getApplicationStatusLabel = (status: string) =>
  APPLICATION_STATUS_LABEL[status as ApplicationStatus] ?? status;

export const getRoleLabel = (role: string) => ROLE_LABEL[role as Role] ?? role;
