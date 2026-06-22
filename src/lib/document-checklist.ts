import type { StoreDocument } from "@/types/database";
import type { StoreDocumentWithUrl } from "@/lib/store-documents";
import type { DocumentType } from "@/lib/constants";
import { DOCUMENT_TYPES } from "@/lib/constants";

type ChecklistDocument = StoreDocument | StoreDocumentWithUrl;

/** 종류별 최신 서류 1건 (체크리스트 슬롯) */
export const groupLatestDocumentsByType = <T extends ChecklistDocument>(
  documents: T[],
): Partial<Record<DocumentType, T>> => {
  const map: Partial<Record<DocumentType, T>> = {};

  for (const doc of documents) {
    const type = doc.doc_type as DocumentType;
    if (!DOCUMENT_TYPES.includes(type)) continue;

    const existing = map[type];
    if (!existing || doc.created_at > existing.created_at) {
      map[type] = doc;
    }
  }

  return map;
};

/** 첨부된 서류 종류 수 (8종 중) */
export const countAttachedDocumentTypes = (
  documents: ChecklistDocument[],
): number => Object.keys(groupLatestDocumentsByType(documents)).length;

/** 매장 서류 제출·검수 요약 */
export const summarizeStoreDocuments = (documents: ChecklistDocument[]) => {
  const byType = groupLatestDocumentsByType(documents);
  const items = Object.values(byType);

  return {
    attached: items.length,
    pending: items.filter((d) => d.status === "PENDING").length,
    approved: items.filter((d) => d.status === "APPROVED").length,
    rejected: items.filter((d) => d.status === "REJECTED").length,
  };
};
