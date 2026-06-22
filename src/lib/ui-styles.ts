import type { BadgeVariant } from "@/types/ui";

/** Badge 기본 스타일 */
export const badgeBaseClass =
  "inline-flex h-[22px] items-center justify-center whitespace-nowrap rounded-md border px-2 text-center text-[12px] font-medium leading-none";

/** Badge variant 스타일 */
export const badgeVariantClass: Record<BadgeVariant, string> = {
  default: "border-gray-200 bg-gray-100 text-gray-800",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  muted: "border-gray-200 bg-gray-50 text-gray-600",
};

/** Select 레이아웃 */
export const selectChevronClass =
  "appearance-none bg-[length:16px_16px] bg-[right_0.65rem_center] bg-no-repeat pr-9 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]";

export const selectMdClass = "w-full";
export const selectSmClass = "w-auto min-w-[7rem]";

/** 기타 컨트롤 레이아웃 */
export const inputBaseClass = "w-full";
export const textareaBaseClass = "w-full resize-y";
export const fileInputBaseClass = "block w-full cursor-pointer text-gray-700";

/** LinkButton variant */
export const linkButtonVariantClass = {
  primary: "border border-blue-600 bg-blue-600 text-white hover:bg-blue-700",
  default: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
  outline: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
} as const;

export const linkButtonBaseClass =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors";
