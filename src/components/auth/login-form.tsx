"use client";

import { useState } from "react";
import { IconLock, IconLogin, IconMail } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "motion/react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Field from "@/components/ui/field";
import ApplicationModal from "@/components/auth/application-modal";
import { fadeUp } from "@/lib/ui-motion";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import { mapSignInError, NO_PROFILE_MESSAGE } from "@/lib/auth-error";
import {
  canAccessStore,
  NO_STORE_MESSAGE,
  PENDING_APPLICATION_MESSAGE,
  REJECTED_APPLICATION_MESSAGE,
} from "@/lib/store-access";

/** 로그인 폼 — 역할은 프로필 기준으로 자동 분기 */
const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  /** 로그인 가능 여부 — 입점 승인 대기·반려 차단 */
  const verifyLoginAccess = async (userId: string) => {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, store_id")
      .eq("id", userId)
      .single();

    if (!profile) {
      await supabase.auth.signOut();
      return NO_PROFILE_MESSAGE;
    }

    if (profile.role === "SUPER_ADMIN" || canAccessStore(profile)) {
      return null;
    }

    const { data: app } = await supabase
      .from("onboarding_applications")
      .select("status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    await supabase.auth.signOut();

    if (app?.status === "PENDING") return PENDING_APPLICATION_MESSAGE;
    if (app?.status === "REJECTED") return REJECTED_APPLICATION_MESSAGE;
    return NO_STORE_MESSAGE;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(mapSignInError(signInError.message));
      setLoading(false);
      return;
    }

    const userId = signInData.user?.id;
    if (!userId) {
      setError("로그인에 실패했습니다.");
      setLoading(false);
      return;
    }

    const accessError = await verifyLoginAccess(userId);
    if (accessError) {
      setError(accessError);
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  };

  return (
    <motion.div
      className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:p-8"
      {...fadeUp}
    >
      <h1 className="text-[22px] font-bold tracking-tight text-gray-900">Timeplex</h1>
      <p className="mt-1 text-[13px] text-gray-500">계정으로 로그인하세요.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="이메일">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            leadingIcon={<IconMail size={ICON_SIZE.md} stroke={ICON_STROKE} />}
          />
        </Field>
        <Field label="비밀번호">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            leadingIcon={<IconLock size={ICON_SIZE.md} stroke={ICON_STROKE} />}
          />
        </Field>
        {error ? <p className="text-[13px] text-red-500">{error}</p> : null}
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full"
          icon={<IconLogin size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
        >
          {loading ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      <div className="mt-6 border-t border-gray-200 pt-6 text-center">
        <p className="text-[13px] text-gray-500">
          매장 입점이 필요하신가요?{" "}
          <button
            type="button"
            onClick={() => setApplyOpen(true)}
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            매장 회원가입
          </button>
        </p>
      </div>

      <ApplicationModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </motion.div>
  );
};

export default LoginForm;
