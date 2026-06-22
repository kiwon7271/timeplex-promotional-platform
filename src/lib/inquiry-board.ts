import {
  DEFAULT_LIST_PAGE_SIZE,
  getListRange,
  getListTotalPages,
  parseListPage,
} from "@/lib/list-pagination";
import type { InquiryCategory } from "@/lib/inquiry-category";

/** 문의 게시판 — 페이지당 건수 */
export const INQUIRY_PAGE_SIZE = DEFAULT_LIST_PAGE_SIZE;

export const parseInquiryPage = parseListPage;

export const getInquiryTotalPages = getListTotalPages;

/** 게시판 번호 (최신 글이 큰 번호) */
export const getInquiryRowNumber = (total: number, page: number, index: number) =>
  total - (page - 1) * INQUIRY_PAGE_SIZE - index;

export const getInquiryListRange = (page: number) => getListRange(page, INQUIRY_PAGE_SIZE);

/** 목록·페이지네이션 쿼리 */
export const getInquiryListQuery = (category?: InquiryCategory) =>
  category ? { category } : undefined;
