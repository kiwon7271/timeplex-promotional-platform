/** Route API 공통 응답 */
export type ApiResult<T = void> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message?: string };

/** 클라이언트 — Route API 공통 fetch */
export const apiGet = async <T>(path: string): Promise<ApiResult<T>> => {
  try {
    const response = await fetch(path, { cache: "no-store", credentials: "include" });
    const json = (await response.json()) as ApiResult<T>;
    if (!response.ok) {
      return { ok: false, message: json.ok ? undefined : json.message ?? "요청 실패" };
    }
    return json;
  } catch {
    return { ok: false, message: "네트워크 오류" };
  }
};

export const apiPost = async <T = void>(
  path: string,
  body?: FormData | Record<string, unknown>,
): Promise<ApiResult<T>> => {
  try {
    const isFormData = body instanceof FormData;
    const response = await fetch(path, {
      method: "POST",
      credentials: "include",
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
    });
    const json = (await response.json()) as ApiResult<T>;
    if (!response.ok) {
      return { ok: false, message: json.ok ? undefined : json.message ?? "요청 실패" };
    }
    return json;
  } catch {
    return { ok: false, message: "네트워크 오류" };
  }
};

export const apiPatch = async <T = void>(
  path: string,
  body: Record<string, unknown>,
): Promise<ApiResult<T>> => {
  try {
    const response = await fetch(path, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await response.json()) as ApiResult<T>;
    if (!response.ok) {
      return { ok: false, message: json.ok ? undefined : json.message ?? "요청 실패" };
    }
    return json;
  } catch {
    return { ok: false, message: "네트워크 오류" };
  }
};

export const apiDelete = async (path: string, body?: Record<string, unknown>): Promise<ApiResult> => {
  try {
    const response = await fetch(path, {
      method: "DELETE",
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = (await response.json()) as ApiResult;
    if (!response.ok) {
      return { ok: false, message: json.ok ? undefined : json.message ?? "요청 실패" };
    }
    return json;
  } catch {
    return { ok: false, message: "네트워크 오류" };
  }
};
