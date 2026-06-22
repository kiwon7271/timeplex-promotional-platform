"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/constants";
import { requireStoreUser } from "@/lib/auth";
import type { InquiryThreadPayload } from "@/lib/inquiry-thread";
import { isInquiryCategory } from "@/lib/inquiry-category";
import type { ActionResult } from "@/types/action-result";
import type { InquiryMessageWithAuthor } from "@/lib/inquiry-thread";

export type InquiryThreadResult = ActionResult & { data?: InquiryThreadPayload };

const revalidateInquiryPaths = () => {
  revalidatePath("/admin/store-inquiries");
  revalidatePath("/store/inquiries");
};

const mapMessagesWithAuthor = (
  rows: Array<{
    id: string;
    inquiry_id: string;
    author_id: string;
    author_role: string;
    body: string;
    created_at: string;
    profiles: { full_name: string | null; email: string } | null;
  }>,
): InquiryMessageWithAuthor[] =>
  rows.map((row) => ({
    id: row.id,
    inquiry_id: row.inquiry_id,
    author_id: row.author_id,
    author_role: row.author_role,
    body: row.body,
    created_at: row.created_at,
    author_name: row.profiles?.full_name?.trim() || row.profiles?.email || "알 수 없음",
  }));

/** 문의 스레드 조회 — 매장·통합관리자 */
export const getInquiryThread = async (inquiryId: string): Promise<InquiryThreadResult> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };

  const { data: profile } = await supabase.from("profiles").select("role, store_id").eq("id", user.id).single();
  if (!profile) return { ok: false, message: "프로필을 찾을 수 없습니다." };

  const isAdmin = profile.role === ROLES.SUPER_ADMIN;

  const { data: inquiry } = await supabase.from("inquiries").select("*").eq("id", inquiryId).maybeSingle();
  if (!inquiry) return { ok: false, message: "문의를 찾을 수 없습니다." };

  if (!isAdmin && inquiry.store_id !== profile.store_id) {
    return { ok: false, message: "접근 권한이 없습니다." };
  }

  const [{ data: storeRow }, { data: messageRows }] = await Promise.all([
    supabase.from("stores").select("name").eq("id", inquiry.store_id).maybeSingle(),
    supabase
      .from("inquiry_messages")
      .select("*, profiles(full_name, email)")
      .eq("inquiry_id", inquiryId)
      .order("created_at", { ascending: true }),
  ]);

  return {
    ok: true,
    data: {
      inquiry,
      storeName: storeRow?.name ?? "매장",
      messages: mapMessagesWithAuthor(messageRows ?? []),
      isAdmin,
      viewerId: user.id,
      viewerStoreId: profile.store_id,
    },
  };
};

/** Supabase: inquiries INSERT — 매장 문의 등록 */
export const onCreateInquiry = async (formData: FormData): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  if (!title || !body) return { ok: false, message: "제목과 내용을 입력해 주세요." };
  if (!isInquiryCategory(category)) return { ok: false, message: "구분을 선택해 주세요." };

  const now = new Date().toISOString();
  const supabase = createClient();
  const { error } = await supabase.from("inquiries").insert({
    store_id: profile.store_id,
    title,
    body,
    category,
    last_message_at: now,
  });

  if (error) return { ok: false, message: error.message };
  revalidateInquiryPaths();
  return { ok: true };
};

/** Supabase: inquiry_messages INSERT — 댓글 (운영팀 첫 답변 시 answered_at 기록) */
export const onPostInquiryMessage = async (formData: FormData): Promise<ActionResult> => {
  const inquiryId = String(formData.get("inquiry_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!inquiryId || !body) return { ok: false, message: "내용을 입력해 주세요." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return { ok: false, message: "프로필을 찾을 수 없습니다." };

  const isAdmin = profile.role === ROLES.SUPER_ADMIN;
  const isStoreUser = profile.role === ROLES.STORE_OWNER || profile.role === ROLES.STORE_STAFF;
  if (!isAdmin && !isStoreUser) return { ok: false, message: "권한이 없습니다." };

  const { data: inquiry } = await supabase.from("inquiries").select("*").eq("id", inquiryId).maybeSingle();
  if (!inquiry) return { ok: false, message: "문의를 찾을 수 없습니다." };
  if (!isAdmin && inquiry.store_id !== profile.store_id) {
    return { ok: false, message: "접근 권한이 없습니다." };
  }

  const now = new Date().toISOString();
  const { error: insertError } = await supabase.from("inquiry_messages").insert({
    inquiry_id: inquiryId,
    author_id: profile.id,
    author_role: profile.role,
    body,
  });

  if (insertError) return { ok: false, message: insertError.message };

  const updatePayload: { last_message_at: string; answered_at?: string } = {
    last_message_at: now,
  };
  if (isAdmin && !inquiry.answered_at) {
    updatePayload.answered_at = now;
  }

  const { error: updateError } = await supabase.from("inquiries").update(updatePayload).eq("id", inquiryId);

  if (updateError) return { ok: false, message: updateError.message };

  revalidateInquiryPaths();
  return { ok: true };
};

/** 문의 메타 — last_message_at·answered_at 동기화 */
const syncInquiryMeta = async (
  supabase: ReturnType<typeof createClient>,
  inquiryId: string,
  inquiryCreatedAt: string,
) => {
  const { data: messages } = await supabase
    .from("inquiry_messages")
    .select("created_at, author_role")
    .eq("inquiry_id", inquiryId)
    .order("created_at", { ascending: true });

  const rows = messages ?? [];
  const lastMessageAt = rows.length
    ? rows[rows.length - 1]!.created_at
    : inquiryCreatedAt;
  const firstAdmin = rows.find((row) => row.author_role === ROLES.SUPER_ADMIN);

  await supabase
    .from("inquiries")
    .update({
      last_message_at: lastMessageAt,
      answered_at: firstAdmin?.created_at ?? null,
    })
    .eq("id", inquiryId);
};

/** Supabase: inquiries UPDATE — 최초 문의 구분·제목·본문 수정 (매장) */
export const onUpdateInquiryOpening = async (
  inquiryId: string,
  title: string,
  body: string,
  category: string,
): Promise<ActionResult> => {
  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  const trimmedCategory = category.trim();
  if (!trimmedTitle || !trimmedBody) {
    return { ok: false, message: "제목과 내용을 입력해 주세요." };
  }
  if (!isInquiryCategory(trimmedCategory)) {
    return { ok: false, message: "구분을 선택해 주세요." };
  }

  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const supabase = createClient();
  const { data: inquiry } = await supabase.from("inquiries").select("*").eq("id", inquiryId).maybeSingle();
  if (!inquiry) return { ok: false, message: "문의를 찾을 수 없습니다." };
  if (inquiry.store_id !== profile.store_id) {
    return { ok: false, message: "수정 권한이 없습니다." };
  }

  const { error } = await supabase
    .from("inquiries")
    .update({ title: trimmedTitle, body: trimmedBody, category: trimmedCategory })
    .eq("id", inquiryId);
  if (error) return { ok: false, message: error.message };

  revalidateInquiryPaths();
  return { ok: true };
};

/** Supabase: inquiry_messages UPDATE — 본인 댓글 수정 */
export const onUpdateInquiryMessage = async (
  messageId: string,
  body: string,
): Promise<ActionResult> => {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, message: "내용을 입력해 주세요." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };

  const { data: message } = await supabase
    .from("inquiry_messages")
    .select("*")
    .eq("id", messageId)
    .maybeSingle();
  if (!message) return { ok: false, message: "글을 찾을 수 없습니다." };
  if (message.author_id !== user.id) {
    return { ok: false, message: "수정 권한이 없습니다." };
  }

  const { error } = await supabase
    .from("inquiry_messages")
    .update({ body: trimmed })
    .eq("id", messageId);
  if (error) return { ok: false, message: error.message };

  revalidateInquiryPaths();
  return { ok: true };
};

/** Supabase: inquiry_messages DELETE — 본인 댓글 삭제 */
export const onDeleteInquiryMessage = async (messageId: string): Promise<ActionResult> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };

  const { data: message } = await supabase
    .from("inquiry_messages")
    .select("*")
    .eq("id", messageId)
    .maybeSingle();
  if (!message) return { ok: false, message: "글을 찾을 수 없습니다." };
  if (message.author_id !== user.id) {
    return { ok: false, message: "삭제 권한이 없습니다." };
  }

  const { data: inquiry } = await supabase
    .from("inquiries")
    .select("id, created_at")
    .eq("id", message.inquiry_id)
    .maybeSingle();
  if (!inquiry) return { ok: false, message: "문의를 찾을 수 없습니다." };

  const { error } = await supabase.from("inquiry_messages").delete().eq("id", messageId);
  if (error) return { ok: false, message: error.message };

  await syncInquiryMeta(supabase, inquiry.id, inquiry.created_at);
  revalidateInquiryPaths();
  return { ok: true };
};

/** Supabase: inquiries DELETE — 매장 문의 전체 삭제 */
export const onDeleteInquiry = async (inquiryId: string): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const supabase = createClient();
  const { data: inquiry } = await supabase.from("inquiries").select("id, store_id").eq("id", inquiryId).maybeSingle();
  if (!inquiry) return { ok: false, message: "문의를 찾을 수 없습니다." };
  if (inquiry.store_id !== profile.store_id) {
    return { ok: false, message: "삭제 권한이 없습니다." };
  }

  const { error } = await supabase.from("inquiries").delete().eq("id", inquiryId);
  if (error) return { ok: false, message: error.message };

  revalidateInquiryPaths();
  return { ok: true };
};
