"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin, requireStoreUser } from "@/lib/auth";
import { BUCKETS, ROLES } from "@/lib/constants";
import { validateImageFile, safeFileName, resolveUploadFileName, normalizeUploadFileName } from "@/lib/upload";
import type { ActionResult, DocumentDownloadResult } from "@/types/action-result";

/** Supabase Storage upload + store_documents INSERT — 매장 서류 이미지 업로드 */
export const onUploadDocument = async (formData: FormData): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const docType = String(formData.get("doc_type") ?? "");
  const file = formData.get("file") as File | null;
  if (!docType) return { ok: false, message: "문서 종류를 선택하세요." };
  if (!file) return { ok: false, message: "파일을 선택하세요." };

  const invalid = validateImageFile(file);
  if (invalid) return { ok: false, message: invalid };

  const supabase = createClient();
  const displayName = resolveUploadFileName(formData, file);
  const fileName = `${Date.now()}_${safeFileName(displayName)}`;
  const path = `${profile.store_id}/${docType}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKETS.STORE_DOCUMENTS)
    .upload(path, file, { contentType: file.type });

  if (uploadError) return { ok: false, message: uploadError.message };

  const { error } = await supabase.from("store_documents").insert({
    store_id: profile.store_id,
    doc_type: docType,
    file_path: path,
    file_name: displayName,
    status: "PENDING",
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/store/documents");
  return { ok: true };
};

/** Supabase Storage remove + store_documents DELETE — 매장 서류 및 파일 삭제 */
export const onDeleteDocument = async (
  id: string,
  filePath: string
): Promise<ActionResult> => {
  await requireStoreUser();
  const supabase = createClient();

  await supabase.storage.from(BUCKETS.STORE_DOCUMENTS).remove([filePath]);
  const { error } = await supabase.from("store_documents").delete().eq("id", id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/store/documents");
  return { ok: true };
};

/** Supabase: store_documents.status UPDATE — 관리자 서류 승인/반려 */
export const onUpdateDocumentStatus = async (
  id: string,
  status: string,
  rejectionReason?: string
): Promise<ActionResult> => {
  await requireSuperAdmin();

  const trimmed = rejectionReason?.trim();
  if (status === "REJECTED") {
    if (!trimmed) return { ok: false, message: "반려 사유를 입력해 주세요." };
    if (trimmed.length > 500) return { ok: false, message: "반려 사유는 500자 이내로 입력해 주세요." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("store_documents")
    .update({
      status,
      rejection_reason: status === "REJECTED" ? trimmed : null,
    })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/stores");
  revalidatePath("/store/documents");
  return { ok: true };
};

/** Supabase Storage signed URL — 서류 다운로드 */
export const onDownloadDocument = async (id: string): Promise<DocumentDownloadResult> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };

  const { data: profile } = await supabase.from("profiles").select("role, store_id").eq("id", user.id).single();
  if (!profile) return { ok: false, message: "프로필을 찾을 수 없습니다." };

  const isAdmin = profile.role === ROLES.SUPER_ADMIN;
  const isStoreUser = profile.role === ROLES.STORE_OWNER || profile.role === ROLES.STORE_STAFF;
  if (!isAdmin && !isStoreUser) return { ok: false, message: "권한이 없습니다." };

  const { data: doc, error } = await supabase
    .from("store_documents")
    .select("file_path, file_name, store_id")
    .eq("id", id)
    .single();

  if (error || !doc) return { ok: false, message: "서류를 찾을 수 없습니다." };
  if (!isAdmin && doc.store_id !== profile.store_id) {
    return { ok: false, message: "접근 권한이 없습니다." };
  }

  const displayName = normalizeUploadFileName(doc.file_name);
  const { data, error: urlError } = await supabase.storage
    .from(BUCKETS.STORE_DOCUMENTS)
    .createSignedUrl(doc.file_path, 60 * 60, { download: displayName });

  if (urlError || !data?.signedUrl) {
    return { ok: false, message: urlError?.message ?? "다운로드 URL 생성에 실패했습니다." };
  }

  return { ok: true, url: data.signedUrl };
};
