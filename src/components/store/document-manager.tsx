"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onUploadDocument, onDeleteDocument } from "@/actions/documents";
import { DOCUMENT_TYPES, CARD_REVIEW_DOCUMENT_GUIDE_STORE, CARD_REVIEW_DOCUMENT_PURPOSE } from "@/lib/constants";
import type { DocumentType } from "@/lib/constants";
import { countAttachedDocumentTypes, groupLatestDocumentsByType } from "@/lib/document-checklist";
import { validateImageFile, appendDisplayFileName } from "@/lib/upload";
import type { DocumentManagerProps } from "@/types/store";
import ListSection from "@/components/ui/list-section";
import Text from "@/components/ui/text";
import DocumentChecklistItem from "@/components/store/elements/document-checklist-item";
import { useDialog } from "@/components/providers/dialog-provider";

/** 매장 서류 — 8종 체크리스트 업로드 */
const DocumentManager = ({ documents }: DocumentManagerProps) => {
  const router = useRouter();
  const { openAlert } = useDialog();
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);

  const documentsByType = useMemo(() => groupLatestDocumentsByType(documents), [documents]);
  const attachedCount = countAttachedDocumentTypes(documents);
  const progress = Math.round((attachedCount / DOCUMENT_TYPES.length) * 100);

  const onUploadFile = async (docType: DocumentType, file: File) => {
    const invalid = validateImageFile(file);
    if (invalid) {
      await openAlert({ title: "파일 오류", message: invalid });
      return;
    }

    const existing = documentsByType[docType];
    if (existing?.status === "REJECTED") {
      const delRes = await onDeleteDocument(existing.id, existing.file_path);
      if (!delRes.ok) {
        await openAlert({
          title: "재제출 실패",
          message: delRes.message ?? "기존 서류 삭제에 실패했습니다.",
        });
        return;
      }
    }

    const formData = new FormData();
    formData.set("doc_type", docType);
    formData.set("file", file);
    appendDisplayFileName(formData, file);

    setUploadingType(docType);
    const res = await onUploadDocument(formData);
    setUploadingType(null);

    if (!res.ok) {
      await openAlert({
        title: "업로드 실패",
        message: res.message ?? "업로드 실패",
      });
      return;
    }

    router.refresh();
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-4">
        <Text.Body2 className="font-medium text-blue-900">{CARD_REVIEW_DOCUMENT_PURPOSE}</Text.Body2>
        <Text.Body3 className="text-blue-800">{CARD_REVIEW_DOCUMENT_GUIDE_STORE}</Text.Body3>
      </section>

      <section className="space-y-2 rounded-lg border border-gray-200 bg-white px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text.Body2 className="font-medium text-gray-900">심사 서류 첨부 현황</Text.Body2>
          <Text.Body2 className="font-semibold text-gray-900">
            {attachedCount}/{DOCUMENT_TYPES.length}종
          </Text.Body2>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-valuenow={attachedCount}
          aria-valuemin={0}
          aria-valuemax={DOCUMENT_TYPES.length}
          aria-label="서류 첨부 진행률"
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Text.Body3 className="text-gray-500">jpg, jpeg, png · 파일당 최대 5MB</Text.Body3>
      </section>

      <ListSection title="심사 서류 등록" plain>
        <ol className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {DOCUMENT_TYPES.map((docType, index) => (
            <DocumentChecklistItem
              key={docType}
              docType={docType}
              document={documentsByType[docType]}
              index={index}
              uploading={uploadingType === docType}
              onUploadFile={onUploadFile}
            />
          ))}
        </ol>
      </ListSection>
    </div>
  );
};

export default DocumentManager;
