"use client";

import { useMemo, useState } from "react";
import type { Channel, ChannelConnectionStatus } from "@/lib/constants";
import {
  CHANNEL_BRAND,
  getChannelLabel,
  getChannelStatusClass,
  getChannelStatusLabel,
  MESSENGER_CHANNELS,
} from "@/lib/channel-brand";
import type { LineConnectionDiagnostic } from "@/types/store";
import type { StoreChannelConnection } from "@/types/database";
import { cn } from "@/lib/cn";
import SegmentControl from "@/components/ui/segment-control";
import Text from "@/components/ui/text";
import StoreLineConnectCard from "@/components/store/elements/store-line-connect-card";
import StoreChannelComingSoonPanel from "@/components/store/elements/store-channel-coming-soon-panel";

interface StoreChannelConnectPanelProps {
  connections: StoreChannelConnection[];
  lineWebhookUrl: string;
  lineDiagnostic: LineConnectionDiagnostic;
  embedded?: boolean;
  onMutated?: () => void;
}

const getConnectionStatus = (
  connections: StoreChannelConnection[],
  channel: Channel,
): ChannelConnectionStatus => {
  const row = connections.find((item) => item.channel === channel);
  return (row?.status as ChannelConnectionStatus) ?? "DISCONNECTED";
};

const getConnection = (connections: StoreChannelConnection[], channel: Channel) =>
  connections.find((item) => item.channel === channel);

/** 매장주용 메신저 연결 — 세그먼트 + 채널별 패널 */
const StoreChannelConnectPanel = ({
  connections,
  lineWebhookUrl,
  lineDiagnostic,
  embedded = false,
  onMutated,
}: StoreChannelConnectPanelProps) => {
  const [activeChannel, setActiveChannel] = useState<Channel>("LINE");

  const segmentOptions = useMemo(
    () =>
      MESSENGER_CHANNELS.map((channel) => {
        const status = getConnectionStatus(connections, channel);
        const theme = CHANNEL_BRAND[channel];

        return {
          value: channel,
          label: getChannelLabel(channel),
          dotClassName: theme.dot,
          activeClassName: theme.segmentActive,
          inactiveClassName: theme.segmentInactive,
          statusLabel: getChannelStatusLabel(channel, status),
          statusClassName: getChannelStatusClass(channel, status),
        };
      }),
    [connections],
  );

  const activeTheme = CHANNEL_BRAND[activeChannel];
  const activeStatus = getConnectionStatus(connections, activeChannel);
  const activeStatusLabel = getChannelStatusLabel(activeChannel, activeStatus);

  return (
    <div className={embedded ? "space-y-4" : "rounded-lg border border-gray-200 bg-white p-4"}>
      <div>
        <Text.Body2 className="font-semibold text-gray-900">SNS 연동</Text.Body2>
        <Text.Body3 className="mt-1 text-[13px] text-gray-600">
          채널을 선택하면 연동 상태와 설정을 확인할 수 있습니다.
        </Text.Body3>
      </div>

      <SegmentControl
        value={activeChannel}
        options={segmentOptions}
        onChange={setActiveChannel}
        ariaLabel="SNS 채널 선택"
      />

      <div
        className={cn(
          "overflow-hidden rounded-lg border",
          activeTheme.panelBorder,
          activeTheme.panelBg,
        )}
        role="tabpanel"
      >
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-2 px-4 py-3",
            activeTheme.headerBg,
            activeTheme.headerText,
          )}
        >
          <div className="flex items-center gap-2">
            <span className={cn("h-3 w-3 rounded-full ring-2 ring-white/50", activeTheme.dot)} />
            <span className="text-[15px] font-semibold">{getChannelLabel(activeChannel)}</span>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[12px] font-medium",
              getChannelStatusClass(activeChannel, activeStatus),
            )}
          >
            {activeStatusLabel}
          </span>
        </div>

        <div className="p-4">
          {activeChannel === "LINE" ? (
            <StoreLineConnectCard
              connection={getConnection(connections, "LINE")}
              lineWebhookUrl={lineWebhookUrl}
              lineDiagnostic={lineDiagnostic}
              embeddedInPanel
              onMutated={onMutated}
            />
          ) : (
            <StoreChannelComingSoonPanel channel={activeChannel} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreChannelConnectPanel;
