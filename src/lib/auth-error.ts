/** Supabase Auth signIn 오류 → 사용자 안내 문구 */
export const mapSignInError = (message: string) => {
  const msg = message.toLowerCase();

  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  if (msg.includes("email not confirmed")) {
    return "이메일 인증이 완료되지 않았습니다. 관리자에게 문의해 주세요.";
  }

  return "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
};

export const NO_PROFILE_MESSAGE =
  "계정 정보를 찾을 수 없습니다. 회원가입 후 다시 시도하거나 관리자에게 문의해 주세요.";
