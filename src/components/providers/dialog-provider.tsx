"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import AlertModal from "@/components/ui/alert-modal";
import ConfirmModal from "@/components/ui/confirm-modal";
import type { AlertOptions, ConfirmOptions, DialogContextValue } from "@/types/dialog";

const DialogContext = createContext<DialogContextValue | null>(null);

/** alert / confirm 공통 다이얼로그 */
export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [alertState, setAlertState] = useState<(AlertOptions & { open: boolean }) | null>(null);
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { open: boolean }) | null>(null);
  const alertResolveRef = useRef<(() => void) | null>(null);
  const confirmResolveRef = useRef<((value: boolean) => void) | null>(null);

  const openAlert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      alertResolveRef.current = resolve;
      setAlertState({ ...options, open: true });
    });
  }, []);

  const openConfirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirmState({ ...options, open: true });
    });
  }, []);

  const onCloseAlert = () => {
    setAlertState(null);
    alertResolveRef.current?.();
    alertResolveRef.current = null;
  };

  const onConfirm = () => {
    setConfirmState(null);
    confirmResolveRef.current?.(true);
    confirmResolveRef.current = null;
  };

  const onCancelConfirm = () => {
    setConfirmState(null);
    confirmResolveRef.current?.(false);
    confirmResolveRef.current = null;
  };

  return (
    <DialogContext.Provider value={{ openAlert, openConfirm }}>
      {children}
      {alertState ? (
        <AlertModal
          open={alertState.open}
          title={alertState.title}
          message={alertState.message}
          onClose={onCloseAlert}
        />
      ) : null}
      {confirmState ? (
        <ConfirmModal
          open={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={confirmState.cancelLabel}
          variant={confirmState.variant}
          onConfirm={onConfirm}
          onCancel={onCancelConfirm}
        />
      ) : null}
    </DialogContext.Provider>
  );
};

/** 다이얼로그 호출 훅 */
export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog은 DialogProvider 내부에서 사용해야 합니다.");
  }
  return context;
};
