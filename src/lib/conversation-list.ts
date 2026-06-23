import {
  ADMIN_LIST_PAGE_SIZE,
  buildListPath,
  getListRange,
  getListTotalPages,
  parseListPage,
} from "@/lib/list-pagination";

export const CONVERSATION_LIST_PAGE_SIZE = ADMIN_LIST_PAGE_SIZE;

export const parseConversationPage = parseListPage;

export const getConversationTotalPages = (total: number) =>
  getListTotalPages(total, CONVERSATION_LIST_PAGE_SIZE);

export const getConversationListRange = (page: number) =>
  getListRange(page, CONVERSATION_LIST_PAGE_SIZE);

export const buildStoreChatsPath = (options?: {
  page?: number;
  q?: string;
  channel?: string;
  conversation?: string;
}) =>
  buildListPath("/store/chats", {
    page: options?.page,
    query: {
      q: options?.q,
      channel: options?.channel,
      conversation: options?.conversation,
    },
  });

export const buildAdminChatsPath = (options?: {
  page?: number;
  store?: string;
  conversation?: string;
}) =>
  buildListPath("/admin/chats", {
    page: options?.page,
    query: {
      store: options?.store,
      conversation: options?.conversation,
    },
  });
