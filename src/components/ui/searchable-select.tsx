"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { getInputClass, type ControlSize } from "@/lib/ui-control";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import type { SearchableSelectProps } from "@/types/searchable-select";

/** 검색 가능한 셀렉트 */
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "선택하세요",
  searchPlaceholder = "검색...",
  emptyMessage = "검색 결과가 없습니다.",
  size = "md",
  className,
}: SearchableSelectProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (!open && selected) setQuery(selected.label);
    if (!open && !selected) setQuery("");
  }, [open, selected]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  const onFocusInput = () => {
    setOpen(true);
    if (selected) setQuery("");
  };

  const onBlurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    const related = e.relatedTarget as Node | null;
    if (related && rootRef.current?.contains(related)) return;
    setOpen(false);
  };

  const onSelectOption = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <IconSearch
        size={ICON_SIZE.md}
        stroke={ICON_STROKE}
        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400"
        aria-hidden
      />
      <input
        type="text"
        value={open ? query : (selected?.label ?? "")}
        placeholder={open ? searchPlaceholder : placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={onFocusInput}
        onBlur={onBlurInput}
        className={cn(getInputClass(size), "pl-10 pr-10")}
      />
      <IconChevronDown
        size={ICON_SIZE.md}
        stroke={ICON_STROKE}
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform",
          open && "rotate-180",
        )}
        aria-hidden
      />

      {open ? (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelectOption(opt.value)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-[14px] leading-[20px] transition-colors hover:bg-gray-50",
                    opt.value === value ? "bg-blue-50 font-medium text-blue-600" : "text-gray-800",
                  )}
                >
                  {opt.label}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-[13px] text-gray-500">{emptyMessage}</li>
          )}
        </ul>
      ) : null}
    </div>
  );
};

export default SearchableSelect;
