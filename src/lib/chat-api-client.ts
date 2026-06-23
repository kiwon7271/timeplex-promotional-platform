import type { Conversation } from "@/types/database";
import type { MessageWithAttachments } from "@/types/chat";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; message?: string };

/** GET — 대화 메시지 */
export const fetchChatMessagesApi = async (
  conversationId: string,
): Promise<MessageWithAttachments[]> => {
  const response = await fetch(`/api/store/chats/conversations/${conversationId}/messages`, {
    cache: "no-store",
  });

  const json = (await response.json()) as ApiResponse<MessageWithAttachments[]>;
  if (!response.ok || !json.ok) return [];
  return json.data ?? [];
};

/** POST — 메시지 전송 (multipart) */
export const sendChatMessageApi = async (formData: FormData) => {
  const response = await fetch("/api/store/chats/messages", {
    method: "POST",
    body: formData,
  });

  const json = (await response.json()) as ApiResponse<MessageWithAttachments>;
  return {
    ok: response.ok && json.ok,
    message: !json.ok ? json.message : undefined,
    data: json.ok ? json.data : undefined,
  };
};

/** POST — 대화 열람 세션 (읽음·보강, fire-and-forget) */
export const openChatConversationSessionApi = (conversationId: string) => {
  void fetch(`/api/store/chats/conversations/${conversationId}/session`, {
    method: "POST",
  });
};

/** GET — 대화 목록 (클라이언트 갱신용) */
export const fetchChatConversationsApi = async (params?: {
  q?: string;
  channel?: string;
  page?: number;
}): Promise<Conversation[]> => {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.channel) search.set("channel", params.channel);
  if (params?.page && params.page > 1) search.set("page", String(params.page));

  const qs = search.toString();
  const response = await fetch(`/api/store/chats/conversations${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
  });

  const json = (await response.json()) as ApiResponse<Conversation[]>;
  if (!response.ok || !json.ok) return [];
  return json.data ?? [];
};
