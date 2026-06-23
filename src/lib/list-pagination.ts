/** 목록 공통 — 페이지당 건수 */
export const DEFAULT_LIST_PAGE_SIZE = 10;

/** 관리자 대용량 목록 — spec 기준 50건 */
export const ADMIN_LIST_PAGE_SIZE = 50;

export const parseListPage = (value?: string) => {
  const page = Number(value);
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
};

export const getListTotalPages = (total: number, pageSize = DEFAULT_LIST_PAGE_SIZE) =>
  Math.max(1, Math.ceil(total / pageSize));

export const getListRange = (page: number, pageSize = DEFAULT_LIST_PAGE_SIZE) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
};

/** 목록·페이징 URL (필터 쿼리 유지) */
export const buildListPath = (
  basePath: string,
  options?: { page?: number; query?: Record<string, string | undefined> },
) => {
  const params = new URLSearchParams();
  if (options?.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value) params.set(key, value);
    }
  }
  if (options?.page && options.page > 1) params.set("page", String(options.page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
};
