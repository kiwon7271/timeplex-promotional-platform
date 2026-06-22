import {
  DEFAULT_LIST_PAGE_SIZE,
  buildListPath,
  getListRange,
  getListTotalPages,
  parseListPage,
} from "@/lib/list-pagination";

/** 입점 신청 목록 — 페이지당 건수 */
export const APPLICATION_PAGE_SIZE = DEFAULT_LIST_PAGE_SIZE;

export const parseApplicationPage = parseListPage;

export const getApplicationTotalPages = getListTotalPages;

export const getApplicationListRange = (page: number) => getListRange(page, APPLICATION_PAGE_SIZE);

/** 목록·페이징 URL */
export const buildApplicationListPath = (options?: { page?: number }) =>
  buildListPath("/admin/store-admissions", { page: options?.page });
