"use client";

import { useState } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import NavIcon from "@/components/layout/nav-icon";
import PendingApplicationNavBadge from "@/components/admin/pending-application-nav-badge";
import { useShell } from "@/components/layout/shell-context";
import IconButton from "@/components/ui/icon-button";
import { getControlIconSize, ICON_STROKE } from "@/lib/icon-size";
import type { AppShellProps, NavBadgeKey } from "@/types/layout";
import type { ReactNode } from "react";

/** 네비 카운트 뱃지 */
const NavBadge = ({ badge }: { badge: NavBadgeKey }) => {
  if (badge === "pendingApplications") return <PendingApplicationNavBadge />;
  return null;
};

/** 이메일에서 아바타 이니셜 추출 */
const getInitials = (email: string) => {
  const name = email.split("@")[0] ?? "U";
  return name.slice(0, 2).toUpperCase();
};

/** 사이드바 로고 영역 */
const ShellBrand = ({
  brand,
  roleLabel,
}: {
  brand: string;
  roleLabel: string;
}) => (
  <div className="flex items-center justify-between px-5 py-5">
    <span className="text-[18px] font-bold tracking-tight text-gray-900">
      {brand}
    </span>
    <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-500">
      {roleLabel}
    </span>
  </div>
);

/** 사이드바 하단 프로필 */
const ShellAccount = ({
  userEmail,
  roleLabel,
  signOutAction,
}: {
  userEmail: string;
  roleLabel: string;
  signOutAction?: ReactNode;
}) => {
  const displayName = userEmail.split("@")[0] ?? userEmail;

  return (
    <div className="border-t border-gray-200 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[12px] font-semibold text-gray-700">
            {getInitials(userEmail)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium leading-[20px] text-gray-900">
              {displayName}
            </p>
            <p className="truncate text-[12px] leading-[16px] text-gray-500">
              {roleLabel}
            </p>
          </div>
        </div>
        {signOutAction ? <div className="shrink-0">{signOutAction}</div> : null}
      </div>
    </div>
  );
};

/** 사이드바/본문 공통 레이아웃 프레임 */
const AppShell = ({ nav, signOutAction, children }: AppShellProps) => {
  const { brand, roleLabel, userEmail } = useShell();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navList = (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
      {nav.map((item) => {
        const active =
          item.href === pathname ||
          (item.href !== "/admin" &&
            item.href !== "/store" &&
            pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] leading-[20px] transition-colors ${
              active
                ? "bg-blue-50 font-medium text-blue-600"
                : "text-gray-800 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <NavIcon name={item.icon} className="h-5 w-5 shrink-0" />
            <span className="min-w-0 flex-1">{item.label}</span>
            {item.badge ? <NavBadge badge={item.badge} /> : null}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarContent = (
    <>
      <ShellBrand brand={brand} roleLabel={roleLabel} />
      {navList}
      <ShellAccount
        userEmail={userEmail}
        roleLabel={roleLabel}
        signOutAction={signOutAction}
      />
    </>
  );

  const sidebarClass = "flex h-full w-[240px] shrink-0 flex-col bg-white";

  return (
    <div className="min-h-screen bg-white md:flex">
      <aside
        className={`sticky top-0 hidden h-screen border-r border-gray-200 md:flex ${sidebarClass}`}
      >
        {sidebarContent}
      </aside>

      <IconButton
        type="button"
        variant="outline"
        size="md"
        icon={<IconMenu2 size={getControlIconSize("md")} stroke={ICON_STROKE} />}
        aria-label="메뉴 열기"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 shadow-sm md:hidden"
      />

      {open ? (
        <>
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className={`fixed inset-y-0 left-0 z-50 border-r border-gray-200 shadow-lg md:hidden ${sidebarClass}`}
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="flex justify-end px-3 pt-3">
              <IconButton
                type="button"
                variant="outline"
                size="md"
                icon={<IconX size={getControlIconSize("md")} stroke={ICON_STROKE} />}
                aria-label="메뉴 닫기"
                onClick={() => setOpen(false)}
              />
            </div>
            {sidebarContent}
          </motion.aside>
        </>
      ) : null}

      <main className="min-w-0 flex-1 bg-white px-5 pb-10 pt-14 md:px-8 md:pt-6 lg:px-10">
        {children}
      </main>
    </div>
  );
};

export default AppShell;
