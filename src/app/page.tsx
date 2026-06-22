import { redirect } from "next/navigation";

// 루트는 미들웨어가 역할별로 분기하지만, 미인증 시 로그인으로
/** 루트 접근 시 로그인 페이지로 리다이렉트 */
const Home = () => {
  redirect("/login");
};

export default Home;
