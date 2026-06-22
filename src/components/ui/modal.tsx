"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Text from "@/components/ui/text";
import IconButton from "@/components/ui/icon-button";
import { getControlIconSize, ICON_STROKE } from "@/lib/icon-size";
import { UI_MOTION_DURATION, UI_MOTION_EASE } from "@/lib/ui-motion";
import type { ModalProps } from "@/types/ui";

const sizeClass = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-3xl",
} as const;

/** 공통 모달 (Portal, overlay, body 스크롤 잠금) */
const Modal = ({
  open,
  title,
  onClose,
  children,
  size = "md",
  closeOnOverlay = true,
  closable = true,
  footer,
}: ModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (closable && e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, closable]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          <motion.button
            type="button"
            aria-label="모달 닫기"
            className="absolute inset-0 h-full w-full cursor-default border-0 bg-black/50 p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: UI_MOTION_DURATION, ease: UI_MOTION_EASE }}
            onClick={closeOnOverlay && closable ? onClose : undefined}
          />

          <motion.div
            className={`relative z-[1001] flex max-h-[min(90vh,720px)] w-full flex-col overflow-hidden rounded-[12px] bg-white shadow-lg ${sizeClass[size]}`}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: UI_MOTION_DURATION, ease: UI_MOTION_EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            {title ? (
              <div className="flex shrink-0 items-center justify-between border-b border-gray-300 px-6 py-4">
                <Text.Header5 id="modal-title" className="text-gray-900">
                  {title}
                </Text.Header5>
                {closable ? (
                  <IconButton
                    type="button"
                    variant="outline"
                    size="md"
                    round
                    onClick={onClose}
                    aria-label="닫기"
                    icon={<IconX size={getControlIconSize("md")} stroke={ICON_STROKE} />}
                  />
                ) : null}
              </div>
            ) : null}

            {footer ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
                <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">{footer}</div>
              </div>
            ) : (
              <div className="overflow-y-auto px-6 py-6">{children}</div>
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};

export default Modal;
