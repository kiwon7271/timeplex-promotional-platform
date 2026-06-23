import type { Conversation } from "@/types/database";
import type { MessageWithAttachments } from "@/types/chat";

type ApiResponse<T> = { ok: true; data: T; message?: string } | { ok: false; message?: string };

const chatFetch = (path: string, init?: RequestInit) =>
  fetch(path, { credentials: "include", cache: "no-store", ...init });

/** GET — 대화 메시지 */
export const fetchChatMessagesApi = async (
  conversationId: string,
): Promise<MessageWithAttachments[]> => {
  try {
    const response = await chatFetch(`/api/store/chats/conversations/${conversationId}/messages`);
    const json = (await response.json()) as ApiResponse<MessageWithAttachments[]>;
    if (!response.ok || !json.ok) return [];
    return json.data ?? [];
  } catch {
    return [];
  }
};

/** POST — 메시지 전송 (multipart) */
export const sendChatMessageApi = async (formData: FormData) => {
  try {
    const response = await chatFetch("/api/store/chats/messages", {
      method: "POST",
      body: formData,
    });

    const json = (await response.json()) as ApiResponse<MessageWithAttachments>;
    return {
      ok: response.ok && json.ok,
      message: !json.ok ? json.message : undefined,
      data: json.ok ? json.data : undefined,
    };
  } catch {
    return { ok: false as const, message: "네트워크 오류" };
  }
};

/** POST — 대화 열람 세션 (읽음·보강, fire-and-forget) */
export const openChatConversationSessionApi = (conversationId: string) => {
  void chatFetch(`/api/store/chats/conversations/${conversationId}/session`, {
    method: "POST",
  });
};

/** GET — 대화 목록 (클라이언트 갱신용) */
export const fetchChatConversationsApi = async (params?: {
  q?: string;
  channel?: string;
  page?: number;
}): Promise<Conversation[]> => {
  try {
    const search = new URLSearchParams();
    if (params?.q) search.set("q", params.q);
    if (params?.channel) search.set("channel", params.channel);
    if (params?.page && params.page > 1) search.set("page", String(params.page));

    const qs = search.toString();
    const response = await chatFetch(`/api/store/chats/conversations${qs ? `?${qs}` : ""}`);
    const json = (await response.json()) as ApiResponse<Conversation[]>;
    if (!response.ok || !json.ok) return [];
    return json.data ?? [];
  } catch {
    return [];
  }
};
