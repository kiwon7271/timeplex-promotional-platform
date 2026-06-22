import type { HTMLMotionProps } from "motion/react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { ActionResult } from "@/types/action-result";
import type { ControlSize } from "@/lib/ui-control";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  closeOnOverlay?: boolean;
  /** false — X 버튼·Esc 닫기 비활성 (필수 동의 등) */
  closable?: boolean;
  /** 하단 고정 영역 (본문만 스크롤) */
  footer?: ReactNode;
}

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "default" | "outline" | "danger";
  size?: ControlSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  /** true — 아이콘만 표시 (aria-label 필수) */
  iconOnly?: boolean;
  /** iconOnly — 완전 원형 버튼 */
  round?: boolean;
  children?: ReactNode;
}

/** 툴팁 위치 */
export type TooltipPlacement = "top" | "bottom";

/** 아이콘 전용 버튼 — sm/md/lg 높이가 input·select와 동일 */
export interface IconButtonProps extends Omit<ButtonProps, "children" | "iconOnly" | "iconPosition"> {
  icon: ReactNode;
  /** 접근성 라벨 (미지정 시 tooltip 사용) */
  "aria-label"?: string;
  /** 호버·포커스 툴팁 */
  tooltip?: string;
  /** 툴팁 위치 — 스크롤 영역에서는 bottom 권장 */
  tooltipPlacement?: TooltipPlacement;
}

export interface TooltipProps {
  label: string;
  children: ReactNode;
  className?: string;
  placement?: TooltipPlacement;
}

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  icon?: ReactNode;
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[];
  align?: "left" | "right";
  ariaLabel?: string;
  size?: ControlSize;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export interface BadgeProps {
  children?: ReactNode;
  /** 상태 코드 — variant 자동 매핑 */
  value?: string;
  variant?: BadgeVariant;
  className?: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options: readonly string[] | { value: string; label: string }[];
  size?: ControlSize;
  leadingIcon?: ReactNode;
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: ControlSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: ControlSize;
}

export interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

export interface ListSectionProps {
  title: string;
  children: ReactNode;
  /** 타이틀 우측 액션 (검색 등) */
  action?: ReactNode;
  className?: string;
  motionDelay?: number;
  /** true — 바깥 Card 없이 화이트 배경만 */
  plain?: boolean;
}

export interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  motionDelay?: number;
  /** 테이블 목록 — 내부 여백 제거, 헤더·셀 패딩 정렬 */
  flush?: boolean;
}

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "muted";

export interface PageBodyProps {
  children: ReactNode;
  className?: string;
}

export interface TableProps {
  headers: string[];
  children: ReactNode;
}

export interface EmptyStateProps {
  message?: string;
  /** 카드 내부 목록 빈 상태 — border 없음 */
  plain?: boolean;
}

export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: ControlSize;
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  size?: ControlSize;
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  size?: ControlSize;
}

export interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "default" | "outline";
  size?: ControlSize;
  className?: string;
  icon?: ReactNode;
}

export interface StatCardProps {
  label: string;
  value: number | string;
  motionDelay?: number;
}

export interface ActionButtonProps {
  onAction: () => Promise<ActionResult>;
  children?: ReactNode;
  icon?: ReactNode;
  /** iconOnly 또는 children 없을 때 — 미지정 시 tooltip 사용 */
  ariaLabel?: string;
  /** 호버·포커스 툴팁 (iconOnly 시 권장) */
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
  confirm?: string;
  confirmVariant?: "default" | "danger";
  variant?: "outline" | "danger";
  disabled?: boolean;
  iconOnly?: boolean;
  size?: ControlSize;
  className?: string;
}

export interface StatusSelectProps {
  value: string;
  options: SelectProps["options"];
  onChange: (next: string) => Promise<ActionResult>;
  className?: string;
  size?: ControlSize;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  /** 필터 등 쿼리 유지 (page 제외) */
  query?: Record<string, string | undefined>;
  className?: string;
  size?: ControlSize;
}

export interface H1Props extends HTMLMotionProps<"h1"> {}
export interface H2Props extends HTMLMotionProps<"h2"> {}
export interface H3Props extends HTMLMotionProps<"h3"> {}
export interface H4Props extends HTMLMotionProps<"h4"> {}
export interface H5Props extends HTMLMotionProps<"h5"> {}
export interface H6Props extends HTMLMotionProps<"h6"> {}
export interface PProps extends HTMLMotionProps<"p"> {}
