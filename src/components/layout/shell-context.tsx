"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ShellContextValue } from "@/types/layout";

/** 레이아웃 메타(brand, role, userEmail) Context */
const ShellContext = createContext<ShellContextValue | null>(null);

/** ShellContext 값 조회 훅 */
export const useShell = (): ShellContextValue => {
  const value = useContext(ShellContext);
  if (!value) throw new Error("ShellContext가 없습니다.");
  return value;
};

interface ShellContextProviderProps {
  value: ShellContextValue;
  children: ReactNode;
}

/** ShellContext Provider (RSC 경계용 명시적 래퍼) */
export const ShellContextProvider = ({ value, children }: ShellContextProviderProps) => (
  <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
);
