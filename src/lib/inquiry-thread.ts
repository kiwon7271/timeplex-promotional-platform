import { ROLES } from "@/lib/constants";
import type { Inquiry, InquiryMessage } from "@/types/database";

export interface InquiryMessageWithAuthor extends InquiryMessage {
  author_name: string;
}

/** 게시판 글 1건 */
export interface InquiryPost {
  id: string;
  author_id?: string;
  author_role: string;
  author_name: string;
  body: string;
  created_at: string;
  /** 최초 문의 본문 */
  isOpening?: boolean;
}

export interface InquiryThreadPayload {
  inquiry: Inquiry;
  storeName: string;
  messages: InquiryMessageWithAuthor[];
  isAdmin: boolean;
  viewerId: string;
  viewerStoreId: string | null;
}

/** 매장 측 작성자 여부 */
export const isStoreInquiryAuthor = (role: string) =>
  role === ROLES.STORE_OWNER || role === ROLES.STORE_STAFF;

/** 작성자 표시명 */
export const getInquiryAuthorLabel = (post: InquiryPost) =>
  isStoreInquiryAuthor(post.author_role) ? post.author_name : "Timeplex 운영팀";

const sortByCreatedAt = <T extends { created_at: string }>(items: T[]) =>
  [...items].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

/** 문의 본문 + 댓글 — 시간순 평면 목록 */
export const buildInquiryPosts = (
  inquiry: Inquiry,
  storeName: string,
  messages: InquiryMessageWithAuthor[],
): InquiryPost[] => {
  const opening: InquiryPost = {
    id: `opening-${inquiry.id}`,
    author_role: ROLES.STORE_OWNER,
    author_name: storeName,
    body: inquiry.body,
    created_at: inquiry.created_at,
    isOpening: true,
  };

  const replies: InquiryPost[] = messages.map((message) => ({
    id: message.id,
    author_id: message.author_id,
    author_role: message.author_role,
    author_name: message.author_name,
    body: message.body,
    created_at: message.created_at,
  }));

  return sortByCreatedAt([opening, ...replies]);
};

/** 답변 완료 여부 — 운영팀 답변 1건 이상 */
export const isInquiryAnswered = (inquiry: Pick<Inquiry, "answered_at">) => !!inquiry.answered_at;

/** Badge용 상태값 */
export const getInquiryStatusValue = (inquiry: Pick<Inquiry, "answered_at">) =>
  isInquiryAnswered(inquiry) ? "ANSWERED" : "OPEN";

/** 표시 라벨 */
export const getInquiryStatusLabel = (inquiry: Pick<Inquiry, "answered_at">) =>
  isInquiryAnswered(inquiry) ? "답변 완료" : "답변 대기";

interface InquiryPostPermissionContext {
  isAdmin: boolean;
  viewerId: string;
  viewerStoreId: string | null;
  inquiryStoreId: string;
}

/** 글 수정 가능 — 본인 작성분 또는 매장 최초 문의(매장 관리자) */
export const canEditInquiryPost = (post: InquiryPost, ctx: InquiryPostPermissionContext) => {
  if (post.isOpening) {
    return !ctx.isAdmin && ctx.viewerStoreId === ctx.inquiryStoreId;
  }
  return post.author_id === ctx.viewerId;
};

/** 글 삭제 가능 — 본인 작성 댓글만 */
export const canDeleteInquiryPost = (post: InquiryPost, ctx: InquiryPostPermissionContext) => {
  if (post.isOpening) return false;
  return post.author_id === ctx.viewerId;
};
