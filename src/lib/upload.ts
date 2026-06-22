import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

// 업로드 파일 검증 (jpg/jpeg/png, 5MB 이하)
export const validateImageFile = (file: File): string | null => {
  if (!file || file.size === 0) return "파일을 선택하세요.";
  if (file.size > MAX_FILE_SIZE) return "파일 크기는 5MB 이하만 가능합니다.";

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_MIME_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(ext)) {
    return "jpg, jpeg, png 이미지만 업로드할 수 있습니다.";
  }
  return null;
};

// Storage 경로용 — ASCII만
export const safeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

/** Latin-1으로 잘못 읽힌 UTF-8 파일명인지 (한글 깨짐) */
const isLikelyMojibake = (name: string) => {
  if (/[\uAC00-\uD7A3]/.test(name)) return false;
  return /[\u0080-\u00FF]/.test(name);
};

/** UTF-8 바이트열이 Latin-1 문자열로 저장된 경우 복원 */
const decodeMisreadUtf8 = (name: string): string | null => {
  try {
    if (typeof Buffer !== "undefined") {
      const decoded = Buffer.from(name, "latin1").toString("utf8");
      if (decoded && !decoded.includes("\uFFFD")) return decoded;
    }
    const bytes = Uint8Array.from(name, (c) => c.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder("utf-8").decode(bytes);
    if (decoded && !decoded.includes("\uFFFD")) return decoded;
  } catch {
    /* noop */
  }
  return null;
};

/** 표시·DB 저장용 원본 파일명 정규화 */
export const normalizeUploadFileName = (name: string): string => {
  if (!name) return "file";
  const trimmed = name.trim();

  if (isLikelyMojibake(trimmed)) {
    const decoded = decodeMisreadUtf8(trimmed);
    if (decoded) return decoded;
  }

  return trimmed;
};

/** FormData — 클라이언트 display_file_name 우선 (Server Action file.name 깨짐 방지) */
export const resolveUploadFileName = (formData: FormData, file: File | null | undefined): string => {
  const fromClient = String(formData.get("display_file_name") ?? "").trim();
  return normalizeUploadFileName(fromClient || file?.name || "file");
};

/** 업로드 FormData에 브라우저 기준 파일명 주입 */
export const appendDisplayFileName = (formData: FormData, file: File | null | undefined) => {
  if (!file?.size) return;
  formData.set("display_file_name", normalizeUploadFileName(file.name));
};
