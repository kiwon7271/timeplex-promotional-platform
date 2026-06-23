"use client";

import { useState } from "react";
import { IconPlugConnected } from "@tabler/icons-react";
import type { LineConnectionDiagnostic } from "@/types/store";
import type { StoreChannelConnection } from "@/types/database";
import { CHANNELS, type Channel, type ChannelConnectionStatus } from "@/lib/constants";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import StoreChannelConnectPanel from "@/components/store/elements/store-channel-connect-panel";
import StoreChatGuide from "@/components/store/elements/store-chat-guide";

interface StoreChannelConnectModalProps {
  connections: StoreChannelConnection[];
  lineWebhookUrl: string;
  lineDiagnostic: LineConnectionDiagnostic;
  translationEnabled: boolean;
  onMutated?: () => void;
}

const getConnectionStatus = (
  connections: StoreChannelConnection[],
  channel: Channel,
): ChannelConnectionStatus => {
  const row = connections.find((item) => item.channel === channel);
  return (row?.status as ChannelConnectionStatus) ?? "DISCONNECTED";
};

/** 고객 대화 헤더 — 메신저 연결 설정 */
const StoreChannelConnectModal = ({
  connections,
  lineWebhookUrl,
  lineDiagnostic,
  translationEnabled,
  onMutated,
}: StoreChannelConnectModalProps) => {
  const [open, setOpen] = useState(false);

  const connectedCount = CHANNELS.filter(
    (channel) => getConnectionStatus(connections, channel) === "CONNECTED",
  ).length;

  const onClickOpenButton = () => {
    setOpen(true);
  };

  const onCloseModal = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        icon={<IconPlugConnected size={ICON_SIZE.md} stroke={ICON_STROKE} />}
        onClick={onClickOpenButton}
      >
        메신저 연결{connectedCount > 0 ? ` ${connectedCount}` : ""}
      </Button>

      <Modal
        open={open}
        title="메신저 연결 · 이용 안내"
        onClose={onCloseModal}
        size="lg"
        footer={
          <div className="flex justify-end">
            <Button type="button" variant="primary" onClick={onCloseModal}>
              확인
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <StoreChatGuide translationEnabled={translationEnabled} />
          <StoreChannelConnectPanel
            connections={connections}
            lineWebhookUrl={lineWebhookUrl}
            lineDiagnostic={lineDiagnostic}
            embedded
            onMutated={onMutated}
          />
        </div>
      </Modal>
    </>
  );
};

export default StoreChannelConnectModal;
