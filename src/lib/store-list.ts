import {
  DEFAULT_LIST_PAGE_SIZE,
  buildListPath,
  getListRange,
  getListTotalPages,
  parseListPage,
} from "@/lib/list-pagination";

/** 매장 목록 — 페이지당 건수 */
export const STORE_PAGE_SIZE = DEFAULT_LIST_PAGE_SIZE;

export const parseStorePage = parseListPage;

export const parseStoreNameQuery = (value?: string) => value?.trim() ?? "";

export const getStoreTotalPages = getListTotalPages;

export const getStoreListRange = (page: number) => getListRange(page, STORE_PAGE_SIZE);

/** 목록·페이징 URL (매장명 필터 유지) */
export const buildStoreListPath = (options?: { page?: number; q?: string }) =>
  buildListPath("/admin/stores", {
    page: options?.page,
    query: options?.q ? { q: parseStoreNameQuery(options.q) } : undefined,
  });
