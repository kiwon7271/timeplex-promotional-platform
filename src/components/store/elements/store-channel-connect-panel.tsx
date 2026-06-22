"use client";

import {
  CHANNEL_CONNECTION_STATUS_LABEL,
  CHANNEL_LABEL_KO,
  CHANNELS,
  type Channel,
  type ChannelConnectionStatus,
} from "@/lib/constants";
import type { LineConnectionDiagnostic } from "@/types/store";
import type { StoreChannelConnection } from "@/types/database";
import Badge from "@/components/ui/badge";
import Text from "@/components/ui/text";
import StoreLineConnectCard from "@/components/store/elements/store-line-connect-card";

interface StoreChannelConnectPanelProps {
  connections: StoreChannelConnection[];
  lineWebhookUrl: string;
  lineDiagnostic: LineConnectionDiagnostic;
  /** 모달 내부 — 바깥 테두리 제거 */
  embedded?: boolean;
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

/** 매장주용 메신저 연결 상태 */
const StoreChannelConnectPanel = ({
  connections,
  lineWebhookUrl,
  lineDiagnostic,
  embedded = false,
}: StoreChannelConnectPanelProps) => (
  <div className={embedded ? "space-y-3" : "rounded-lg border border-gray-200 bg-white p-4"}>
    <div className="mb-3">
      <Text.Body2 className="font-semibold text-gray-900">메신저 연결</Text.Body2>
      <Text.Body3 className="mt-1 text-gray-600">
        고객이 사용하는 앱과 연결하면, 아래 고객 대화 화면에서 한곳에 모아 볼 수 있습니다.
      </Text.Body3>
    </div>
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {CHANNELS.filter((channel) => channel !== "LINE").map((channel) => {
        const status = getConnectionStatus(connections, channel);
        const isWeb = channel === "WEB";

        return (
          <li
            key={channel}
            className="flex flex-col gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[14px] font-medium text-gray-900">
                {CHANNEL_LABEL_KO[channel]}
              </span>
              <Badge value={CHANNEL_CONNECTION_STATUS_LABEL[status]} />
            </div>
            <Text.Body3 className="text-[12px] leading-relaxed text-gray-600">
              {isWeb
                ? "웹 문의는 기본으로 사용할 수 있습니다."
                : status === "CONNECTED"
                  ? "연결되어 메시지를 받을 수 있습니다."
                  : "준비 중입니다. Meta 연동 후 제공됩니다."}
            </Text.Body3>
          </li>
        );
      })}

      <StoreLineConnectCard
        connection={getConnection(connections, "LINE")}
        lineWebhookUrl={lineWebhookUrl}
        lineDiagnostic={lineDiagnostic}
      />
    </ul>
  </div>
);

export default StoreChannelConnectPanel;
