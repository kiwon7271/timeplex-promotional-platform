import LoginForm from "@/components/auth/login-form";

/** 로그인 페이지 프레임 */
const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
