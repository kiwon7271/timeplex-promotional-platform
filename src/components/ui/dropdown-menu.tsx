"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconDotsVertical } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import IconButton from "@/components/ui/icon-button";
import { getControlIconSize, ICON_STROKE } from "@/lib/icon-size";
import type { DropdownMenuProps } from "@/types/ui";

const MENU_WIDTH = 152;

/** 클릭 시 메뉴 — overflow 영역 클리pping 방지를 위해 portal 사용 */
const DropdownMenu = ({
  items,
  align = "right",
  ariaLabel = "더보기",
  size = "sm",
}: DropdownMenuProps) => {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const left =
      align === "right"
        ? Math.max(8, rect.right - MENU_WIDTH)
        : Math.min(window.innerWidth - MENU_WIDTH - 8, rect.left);

    setPosition({
      top: rect.bottom + 4,
      left,
    });
  }, [align]);

  const onClickTriggerButton = () => {
    if (open) {
      setOpen(false);
      return;
    }
    updatePosition();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, updatePosition]);

  const onClickMenuItem = (onClick: () => void, disabled?: boolean) => {
    if (disabled) return;
    setOpen(false);
    onClick();
  };

  return (
    <>
      <span ref={triggerRef} className="inline-flex shrink-0">
        <IconButton
          type="button"
          variant="outline"
          size={size}
          icon={<IconDotsVertical size={getControlIconSize(size)} stroke={ICON_STROKE} />}
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={onClickTriggerButton}
        />
      </span>

      {open && position && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              className="fixed z-[1100] min-w-[152px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
              style={{ top: position.top, left: position.left }}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => onClickMenuItem(item.onClick, item.disabled)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] leading-[20px] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    item.variant === "danger"
                      ? "text-red-600 hover:bg-red-50"
                      : "text-gray-800 hover:bg-gray-50",
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
};

export default DropdownMenu;
