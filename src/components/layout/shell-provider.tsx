"use client";

import AppShell from "@/components/layout/app-shell";
import { ShellContextProvider } from "@/components/layout/shell-context";
import { DialogProvider } from "@/components/providers/dialog-provider";
import type { ShellProviderProps } from "@/types/layout";

/** 레이아웃 메타 Context 제공 및 AppShell 조립 */
const ShellProvider = ({ brand, roleLabel, userEmail, nav, signOutAction, children }: ShellProviderProps) => {
  return (
    <ShellContextProvider value={{ brand, roleLabel, userEmail }}>
      <DialogProvider>
        <AppShell nav={nav} signOutAction={signOutAction}>
          {children}
        </AppShell>
      </DialogProvider>
    </ShellContextProvider>
  );
};

export default ShellProvider;
