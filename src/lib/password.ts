export const MIN_PASSWORD_LENGTH = 8;

const WEAK_PASSWORDS = new Set(["1234", "123456", "12345678", "password", "qwerty", "admin123"]);

/** 비밀번호 정책 검증 — 통과 시 null */
export const validatePassword = (password: string): string | null => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상 입력해 주세요.`;
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return "너무 단순한 비밀번호는 사용할 수 없습니다.";
  }
  return null;
};
