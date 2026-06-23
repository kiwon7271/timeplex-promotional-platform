import { CHANNEL_LABEL_KO, type Channel, type ChannelConnectionStatus } from "@/lib/constants";

export type ChannelBrandTheme = {
  dot: string;
  segmentActive: string;
  segmentInactive: string;
  panelBorder: string;
  panelBg: string;
  panelGlow: string;
  headerBg: string;
  headerText: string;
  statusConnected: string;
  statusDisconnected: string;
  statusPending: string;
};

/** 채널별 라이트 네온 테마 — 세그먼트·패널 UI */
export const CHANNEL_BRAND: Record<Channel, ChannelBrandTheme> = {
  WEB: {
    dot: "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.85)]",
    segmentActive:
      "bg-white/95 text-blue-800 ring-2 ring-blue-300/70 shadow-[0_0_22px_rgba(59,130,246,0.32)]",
    segmentInactive:
      "bg-blue-50/50 text-blue-900/75 ring-1 ring-blue-200/60 shadow-[0_0_14px_rgba(59,130,246,0.1)] hover:bg-blue-50/90 hover:shadow-[0_0_18px_rgba(59,130,246,0.2)]",
    panelBorder: "border-blue-200/70",
    panelBg: "bg-blue-50/25",
    panelGlow: "shadow-[0_0_24px_rgba(59,130,246,0.12)]",
    headerBg: "border-b border-blue-200/50 bg-gradient-to-r from-blue-50/90 to-white",
    headerText: "text-blue-900",
    statusConnected: "bg-blue-100/90 text-blue-700 ring-1 ring-blue-200/70",
    statusDisconnected: "bg-white/80 text-blue-800/70 ring-1 ring-blue-100",
    statusPending: "bg-white/70 text-gray-500 ring-1 ring-gray-200/80",
  },
  WHATSAPP: {
    dot: "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.85)]",
    segmentActive:
      "bg-white/95 text-green-800 ring-2 ring-green-300/70 shadow-[0_0_22px_rgba(34,197,94,0.32)]",
    segmentInactive:
      "bg-green-50/50 text-green-900/75 ring-1 ring-green-200/60 shadow-[0_0_14px_rgba(34,197,94,0.1)] hover:bg-green-50/90 hover:shadow-[0_0_18px_rgba(34,197,94,0.2)]",
    panelBorder: "border-green-200/70",
    panelBg: "bg-green-50/25",
    panelGlow: "shadow-[0_0_24px_rgba(34,197,94,0.12)]",
    headerBg: "border-b border-green-200/50 bg-gradient-to-r from-green-50/90 to-white",
    headerText: "text-green-900",
    statusConnected: "bg-green-100/90 text-green-700 ring-1 ring-green-200/70",
    statusDisconnected: "bg-white/80 text-green-800/70 ring-1 ring-green-100",
    statusPending: "bg-white/70 text-gray-500 ring-1 ring-gray-200/80",
  },
  INSTAGRAM: {
    dot: "bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.85)]",
    segmentActive:
      "bg-white/95 text-fuchsia-800 ring-2 ring-fuchsia-300/70 shadow-[0_0_22px_rgba(217,70,239,0.32)]",
    segmentInactive:
      "bg-fuchsia-50/50 text-fuchsia-900/75 ring-1 ring-fuchsia-200/60 shadow-[0_0_14px_rgba(217,70,239,0.1)] hover:bg-fuchsia-50/90 hover:shadow-[0_0_18px_rgba(217,70,239,0.2)]",
    panelBorder: "border-fuchsia-200/70",
    panelBg: "bg-fuchsia-50/25",
    panelGlow: "shadow-[0_0_24px_rgba(217,70,239,0.12)]",
    headerBg: "border-b border-fuchsia-200/50 bg-gradient-to-r from-fuchsia-50/90 via-pink-50/50 to-white",
    headerText: "text-fuchsia-900",
    statusConnected: "bg-fuchsia-100/90 text-fuchsia-700 ring-1 ring-fuchsia-200/70",
    statusDisconnected: "bg-white/80 text-fuchsia-800/70 ring-1 ring-fuchsia-100",
    statusPending: "bg-white/70 text-gray-500 ring-1 ring-gray-200/80",
  },
  LINE: {
    dot: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]",
    segmentActive:
      "bg-white/95 text-emerald-800 ring-2 ring-emerald-300/70 shadow-[0_0_22px_rgba(16,185,129,0.32)]",
    segmentInactive:
      "bg-emerald-50/50 text-emerald-900/75 ring-1 ring-emerald-200/60 shadow-[0_0_14px_rgba(16,185,129,0.1)] hover:bg-emerald-50/90 hover:shadow-[0_0_18px_rgba(16,185,129,0.2)]",
    panelBorder: "border-emerald-200/70",
    panelBg: "bg-emerald-50/25",
    panelGlow: "shadow-[0_0_24px_rgba(16,185,129,0.12)]",
    headerBg: "border-b border-emerald-200/50 bg-gradient-to-r from-emerald-50/90 to-white",
    headerText: "text-emerald-900",
    statusConnected: "bg-emerald-100/90 text-emerald-700 ring-1 ring-emerald-200/70",
    statusDisconnected: "bg-white/80 text-emerald-800/70 ring-1 ring-emerald-100",
    statusPending: "bg-white/70 text-gray-500 ring-1 ring-gray-200/80",
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
