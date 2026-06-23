"use client";

import type { Channel } from "@/lib/constants";
import { CHANNEL_BRAND, getChannelLabel } from "@/lib/channel-brand";
import Text from "@/components/ui/text";

interface StoreChannelComingSoonPanelProps {
  channel: Channel;
}

/** 연동 예정 채널 안내 */
const StoreChannelComingSoonPanel = ({ channel }: StoreChannelComingSoonPanelProps) => {
  const theme = CHANNEL_BRAND[channel];
  const label = getChannelLabel(channel);

  const descriptions: Record<Channel, string> = {
    WEB: "브랜딩 사이트에 웹채팅 위젯을 설치하면, 고객 문의를 이 화면에서 받을 수 있습니다.",
    WHATSAPP: "WhatsApp Business 계정을 연결하면 메시지를 한곳에서 관리할 수 있습니다.",
    INSTAGRAM: "Instagram DM을 연결하면 DM을 이 화면에서 확인·답장할 수 있습니다.",
    LINE: "",
  };

  return (
    <div className="space-y-3 px-1 py-2">
      <Text.Body3 className="text-[13px] leading-relaxed text-gray-700">
        {descriptions[channel]}
      </Text.Body3>
      <div
        className={`rounded-md border px-3 py-2.5 text-[12px] leading-relaxed ${theme.panelBorder} bg-white/80 text-gray-600`}
      >
        {label} 연동은 준비 중입니다. 오픈 시 이 화면에서 바로 연결할 수 있습니다.
      </div>
    </div>
  );
};

export default StoreChannelComingSoonPanel;
