import type { ReactNode } from "react";

import type { NavIconName } from "@/components/layout/nav-icon";

export type NavBadgeKey = "pendingApplications";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIconName;
  /** 좌측 네비 카운트 뱃지 */
  badge?: NavBadgeKey;
}

export interface ShellContextValue {
  brand: string;
  roleLabel: string;
  userEmail: string;
}

export interface ShellProviderProps extends ShellContextValue {
  nav: NavItem[];
  signOutAction?: ReactNode;
  children: ReactNode;
}

export interface AppShellProps {
  nav: NavItem[];
  signOutAction?: ReactNode;
  children: ReactNode;
}

export interface LayoutChildrenProps {
  children: ReactNode;
}

export interface RootLayoutProps {
  children: ReactNode;
}
