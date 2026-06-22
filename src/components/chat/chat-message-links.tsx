import { cn } from "@/lib/cn";
import { RESERVATION_PROVIDER_LABEL, type ReservationProvider } from "@/lib/constants";
import type { MessageReservationLinkPreview } from "@/types/chat";

interface ChatMessageLinksProps {
  links: MessageReservationLinkPreview[];
  bubbleClassName: string;
  linkLabelClassName: string;
  linkTextClassName: string;
  className?: string;
}

const getProviderLabel = (provider: string) =>
  RESERVATION_PROVIDER_LABEL[provider as ReservationProvider] ?? provider;

/** 채팅 예약 링크 — 일반 말풍선과 동일 스타일, 클릭 시 새 탭 */
const ChatMessageLinks = ({
  links,
  bubbleClassName,
  linkLabelClassName,
  linkTextClassName,
  className,
}: ChatMessageLinksProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {links.map((link) => (
        <a
          key={`${link.provider}-${link.url}`}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className={cn(bubbleClassName, "block transition-opacity hover:opacity-90")}
        >
          <span className={linkLabelClassName}>{getProviderLabel(link.provider)} 예약</span>
          <span className={linkTextClassName}>{link.url}</span>
        </a>
      ))}
    </div>
  );
};

export default ChatMessageLinks;
