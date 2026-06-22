import { cn } from "@/lib/cn";

export type ControlSize = "sm" | "md" | "lg";

/** sm / md / lg — 동일 티어 내 input·select·button·checkbox·radio 높이 통일 */
export const CONTROL_SIZE = {
  sm: {
    height: "h-9 min-h-9",
    square: "h-9 w-9 min-h-9",
    text: "text-[13px] leading-[18px]",
    px: "px-2.5",
    checkbox: "h-3.5 w-3.5",
    radio: "h-3.5 w-3.5",
  },
  md: {
    height: "h-10 min-h-10",
    square: "h-10 w-10 min-h-10",
    text: "text-[14px] leading-[20px]",
    px: "px-3",
    checkbox: "h-4 w-4",
    radio: "h-4 w-4",
  },
  lg: {
    height: "h-11 min-h-11",
    square: "h-11 w-11 min-h-11",
    text: "text-[16px] leading-[22px]",
    px: "px-4",
    checkbox: "h-5 w-5",
    radio: "h-5 w-5",
  },
} as const;

const boxBorder = "box-border py-0";

/** 폼 컨트롤 공통 스타일 */
export const controlFocusClass =
  "transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20";

export const controlDisabledClass =
  "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

export const controlFieldClass = cn(
  "rounded-md border border-gray-300 bg-white text-gray-900",
  controlFocusClass,
  controlDisabledClass,
);

export const getControlHeightClass = (size: ControlSize = "md") =>
  cn(CONTROL_SIZE[size].height, boxBorder);

/** 텍스트 input / select 공통 */
export const getInputClass = (size: ControlSize = "md") =>
  cn(
    controlFieldClass,
    getControlHeightClass(size),
    CONTROL_SIZE[size].px,
    CONTROL_SIZE[size].text,
    "w-full placeholder:text-gray-500",
  );

/** 버튼(텍스트) */
export const getButtonTextClass = (size: ControlSize = "md") =>
  cn(
    getControlHeightClass(size),
    CONTROL_SIZE[size].px,
    CONTROL_SIZE[size].text,
    "rounded-md",
  );

/** 버튼(아이콘 전용) */
export const getButtonIconOnlyClass = (size: ControlSize = "md", round = false) =>
  cn(CONTROL_SIZE[size].square, boxBorder, "shrink-0 p-0", round ? "rounded-full" : "rounded-md");

/** LinkButton */
export const getLinkButtonSizeClass = (size: ControlSize = "md") =>
  cn(getControlHeightClass(size), CONTROL_SIZE[size].px, CONTROL_SIZE[size].text);

/** 선택 컨트롤 라벨 텍스트 */
export const getChoiceTextClass = (size: ControlSize = "md") => CONTROL_SIZE[size].text;

/** 체크박스 input */
export const getCheckboxInputClass = (size: ControlSize = "md") =>
  cn(
    "shrink-0 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600/20",
    CONTROL_SIZE[size].checkbox,
  );

/** 체크박스·라디오 라벨 행 */
export const getChoiceLabelClass = (size: ControlSize = "md") =>
  cn("inline-flex cursor-pointer items-center gap-2", getControlHeightClass(size));

/** 라디오 input */
export const getRadioInputClass = (size: ControlSize = "md") =>
  cn(
    "shrink-0 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600/20",
    CONTROL_SIZE[size].radio,
  );

/** textarea — min-height만 티어에 맞춤 (멀티라인) */
export const getTextareaClass = (size: ControlSize = "md") =>
  cn(
    controlFieldClass,
    CONTROL_SIZE[size].px,
    CONTROL_SIZE[size].text,
    "w-full resize-y py-2 placeholder:text-gray-500",
    size === "sm" ? "min-h-9" : size === "md" ? "min-h-10" : "min-h-11",
  );

/** file input — file 버튼 높이를 티어에 맞춤 */
export const getFileInputClass = (size: ControlSize = "md") => {
  const fileBtn =
    size === "sm"
      ? "file:h-9 file:px-2.5 file:text-[13px]"
      : size === "md"
        ? "file:h-10 file:px-3 file:text-[14px]"
        : "file:h-11 file:px-4 file:text-[16px]";

  return cn(
    "block w-full cursor-pointer text-gray-700",
    CONTROL_SIZE[size].text,
    "file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-gray-300 file:bg-white",
    "file:font-medium file:text-gray-800 file:transition-colors file:box-border file:py-0 hover:file:bg-gray-50",
    fileBtn,
  );
};

/** 페이지네이션 — 숫자 버튼 */
export const getPaginationItemClass = (size: ControlSize = "md") =>
  cn(
    "inline-flex shrink-0 items-center justify-center rounded-md border box-border leading-none transition-colors",
    getControlHeightClass(size),
    CONTROL_SIZE[size].text,
    size === "sm" ? "min-w-9 px-2" : size === "md" ? "min-w-10 px-2.5" : "min-w-11 px-3",
  );

/** 페이지네이션 — 이전/다음 (아이콘, button·IconButton과 동일 높이) */
export const getPaginationChevronClass = (size: ControlSize = "md") =>
  cn(
    getButtonIconOnlyClass(size),
    "inline-flex shrink-0 items-center justify-center",
    "border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50",
  );

/** @deprecated getInputClass(size) 사용 */
export const controlMdClass = getInputClass("md");

/** @deprecated getInputClass("md") 사용 */
export const controlMdH10Class = getInputClass("md");

/** @deprecated getInputClass("sm") 사용 */
export const controlSmClass = getInputClass("sm");

/** @deprecated getCheckboxInputClass 사용 */
export const checkboxClass = getCheckboxInputClass("md");

/** @deprecated getFileInputClass 사용 */
export const fileInputClass = getFileInputClass("md");
