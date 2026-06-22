import { IconSearch } from "@tabler/icons-react";
import { getControlIconSize, ICON_STROKE } from "@/lib/icon-size";
import Input from "@/components/ui/input";
import IconButton from "@/components/ui/icon-button";

export interface StoreListFilterProps {
  q?: string;
}

/** 매장 목록 — 매장명 검색 (타이틀 우측 배치) */
const StoreListFilter = ({ q = "" }: StoreListFilterProps) => {
  return (
    <form method="get" className="flex items-center gap-2">
      <Input
        name="q"
        defaultValue={q}
        placeholder="매장명 검색"
        size="md"
        className="min-w-0 flex-1"
        leadingIcon={<IconSearch size={getControlIconSize("md")} stroke={ICON_STROKE} />}
      />
      <IconButton
        type="submit"
        variant="default"
        size="md"
        tooltip="검색"
        aria-label="매장명 검색"
        icon={<IconSearch size={getControlIconSize("md")} stroke={ICON_STROKE} />}
      />
    </form>
  );
};

export default StoreListFilter;
