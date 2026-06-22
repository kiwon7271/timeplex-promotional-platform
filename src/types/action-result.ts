// 서버 액션 공통 응답
export interface ActionResult {
  ok: boolean;
  message?: string;
}

/** 서류 다운로드 URL 응답 */
export type DocumentDownloadResult = ActionResult & { url?: string };
