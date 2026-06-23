import { CHANNEL_LABEL_KO, type Channel, type ChannelConnectionStatus } from "@/lib/constants";

export type ChannelBrandTheme = {
  dot: string;
  segmentActive: string;
  segmentInactive: string;
  panelBorder: string;
  panelBg: string;
  headerBg: string;
  headerText: string;
  statusConnected: string;
  statusDisconnected: string;
  statusPending: string;
};

/** 채널별 브랜드 색상 — 세그먼트·패널 UI */
export const CHANNEL_BRAND: Record<Channel, ChannelBrandTheme> = {
  WEB: {
    dot: "bg-blue-500",
    segmentActive: "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600",
    segmentInactive:
      "bg-white text-gray-800 ring-1 ring-inset ring-blue-200 hover:bg-blue-50/80",
    panelBorder: "border-blue-200",
    panelBg: "bg-blue-50/40",
    headerBg: "bg-blue-600",
    headerText: "text-white",
    statusConnected: "bg-blue-100 text-blue-800",
    statusDisconnected: "bg-white/90 text-blue-900",
    statusPending: "bg-white/80 text-gray-600",
  },
  WHATSAPP: {
    dot: "bg-green-500",
    segmentActive: "bg-green-600 text-white shadow-sm ring-2 ring-green-600",
    segmentInactive:
      "bg-white text-gray-800 ring-1 ring-inset ring-green-200 hover:bg-green-50/80",
    panelBorder: "border-green-200",
    panelBg: "bg-green-50/40",
    headerBg: "bg-green-600",
    headerText: "text-white",
    statusConnected: "bg-green-100 text-green-800",
    statusDisconnected: "bg-white/90 text-green-900",
    statusPending: "bg-white/80 text-gray-600",
  },
  INSTAGRAM: {
    dot: "bg-fuchsia-500",
    segmentActive: "bg-fuchsia-600 text-white shadow-sm ring-2 ring-fuchsia-600",
    segmentInactive:
      "bg-white text-gray-800 ring-1 ring-inset ring-fuchsia-200 hover:bg-fuchsia-50/80",
    panelBorder: "border-fuchsia-200",
    panelBg: "bg-fuchsia-50/40",
    headerBg: "bg-gradient-to-r from-purple-600 to-pink-500",
    headerText: "text-white",
    statusConnected: "bg-fuchsia-100 text-fuchsia-800",
    statusDisconnected: "bg-white/90 text-fuchsia-900",
    statusPending: "bg-white/80 text-gray-600",
  },
  LINE: {
    dot: "bg-emerald-500",
    segmentActive: "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600",
    segmentInactive:
      "bg-white text-gray-800 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-50/80",
    panelBorder: "border-emerald-200",
    panelBg: "bg-emerald-50/40",
    headerBg: "bg-emerald-500",
    headerText: "text-white",
    statusConnected: "bg-emerald-100 text-emerald-800",
    statusDisconnected: "bg-white/90 text-emerald-900",
    statusPending: "bg-white/80 text-gray-600",
  },
};

/** 모달 세그먼트 표시 순서 */
export const MESSENGER_CHANNELS: Channel[] = ["WEB", "WHATSAPP", "INSTAGRAM", "LINE"];

/** 연동 가능 여부 — 현재는 라인만 */
export const isChannelConnectable = (channel: Channel) => channel === "LINE";

export const getChannelStatusLabel = (
  channel: Channel,
  connectionStatus: ChannelConnectionStatus,
) => {
  if (!isChannelConnectable(channel)) return "준비 중";
  if (connectionStatus === "CONNECTED") return "연결됨";
  if (connectionStatus === "ERROR") return "오류";
  return "연결 안 됨";
};

export const getChannelStatusClass = (
  channel: Channel,
  connectionStatus: ChannelConnectionStatus,
) => {
  const theme = CHANNEL_BRAND[channel];
  if (!isChannelConnectable(channel)) return theme.statusPending;
  if (connectionStatus === "CONNECTED") return theme.statusConnected;
  if (connectionStatus === "DISCONNECTED" || connectionStatus === "CONNECTING") {
    return theme.statusDisconnected;
  }
  return theme.statusPending;
};

export const getChannelLabel = (channel: Channel) => CHANNEL_LABEL_KO[channel];
