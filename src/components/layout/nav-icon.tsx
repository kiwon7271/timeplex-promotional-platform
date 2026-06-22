import {
  IconBuildingStore,
  IconChartBar,
  IconChartLine,
  IconFileDescription,
  IconFileText,
  IconHome,
  IconInfoCircle,
  IconLink,
  IconMessageCircle,
  IconMessages,
  IconSettings,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";

/** 사이드바 네비 아이콘 키 */
export type NavIconName =
  | "home"
  | "store"
  | "application"
  | "chart"
  | "users"
  | "chat"
  | "usage"
  | "inquiry"
  | "settings"
  | "info"
  | "staff"
  | "link"
  | "document";

interface NavIconProps {
  name: NavIconName;
  className?: string;
}

const NAV_ICON_MAP = {
  home: IconHome,
  store: IconBuildingStore,
  application: IconFileDescription,
  chart: IconChartBar,
  users: IconUsers,
  chat: IconMessages,
  usage: IconChartLine,
  inquiry: IconMessageCircle,
  settings: IconSettings,
  info: IconInfoCircle,
  staff: IconUserPlus,
  link: IconLink,
  document: IconFileText,
} as const;

/** 사이드바 Tabler 아이콘 */
const NavIcon = ({ name, className = "h-5 w-5" }: NavIconProps) => {
  const Icon = NAV_ICON_MAP[name];
  if (!Icon) return null;

  return <Icon size={ICON_SIZE.xl} stroke={ICON_STROKE} className={className} aria-hidden />;
};

export default NavIcon;
