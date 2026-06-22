import { cn } from "@/lib/cn";

export const chatBubbleBaseClass =
  "w-fit max-w-full break-words [overflow-wrap:anywhere] rounded-2xl px-4 py-2.5 text-[14px] leading-[20px]";

/** 발신 방향별 말풍선 스타일 */
export const getChatBubbleClass = (isRight: boolean, isCenter: boolean) =>
  cn(
    chatBubbleBaseClass,
    isCenter && "rounded-lg bg-gray-200/80 px-3 py-2 text-[12px] text-gray-600",
    isRight && "rounded-br-md bg-blue-600 text-white",
    !isRight && !isCenter && "rounded-bl-md border border-gray-200 bg-white text-gray-900",
  );

/** 말풍선 안 링크 URL 스타일 */
export const getChatLinkTextClass = (isRight: boolean, isCenter: boolean) =>
  cn(
    "mt-0.5 block break-all underline underline-offset-2",
    isRight && "text-white",
    isCenter && "text-gray-700",
    !isRight && !isCenter && "text-blue-600",
  );

/** 말풍선 안 링크 라벨 스타일 */
export const getChatLinkLabelClass = (isRight: boolean, isCenter: boolean) =>
  cn(
    "block text-[12px] font-medium leading-[18px]",
    isRight && "text-blue-50",
    isCenter && "text-gray-500",
    !isRight && !isCenter && "text-gray-500",
  );
