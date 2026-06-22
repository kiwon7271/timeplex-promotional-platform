"use client";

import { IconLink, IconSettings } from "@tabler/icons-react";
import type { ReservationLink } from "@/types/database";
import {
  RESERVATION_PROVIDER_LABEL,
  type ReservationProvider,
} from "@/lib/constants";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import EmptyState from "@/components/ui/empty-state";
import LinkButton from "@/components/ui/link-button";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";

interface ReservationLinkPickerProps {
  open: boolean;
  links: ReservationLink[];
  onClose: () => void;
  onSelect: (link: ReservationLink) => void;
}

const getProviderLabel = (provider: string) =>
  RESERVATION_PROVIDER_LABEL[provider as ReservationProvider] ?? provider;

/** 예약 링크 선택 모달 */
const ReservationLinkPicker = ({
  open,
  links,
  onClose,
  onSelect,
}: ReservationLinkPickerProps) => {
  const onClickLink = (link: ReservationLink) => {
    onSelect(link);
  };

  return (
    <Modal open={open} title="예약 링크 선택" onClose={onClose} size="md">
      {links.length > 0 ? (
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.id}>
              <button
                type="button"
                onClick={() => onClickLink(link)}
                className="flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
              >
                <IconLink
                  size={ICON_SIZE.md}
                  stroke={ICON_STROKE}
                  className="mt-0.5 shrink-0 text-blue-600"
                  aria-hidden
                />
                <span className="min-w-0">
                  <Text.Body2 className="font-medium text-gray-900">
                    {getProviderLabel(link.provider)}
                  </Text.Body2>
                  <Text.Body3 className="mt-1 break-all text-gray-600">
                    {link.url}
                  </Text.Body3>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-4">
          <EmptyState plain message="등록된 예약 링크가 없습니다." />
          <LinkButton
            href="/store/reservation-links"
            variant="primary"
            size="md"
            className="w-full justify-center"
            icon={<IconSettings size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
          >
            예약 링크 관리
          </LinkButton>
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Button type="button" variant="outline" size="md" onClick={onClose}>
          닫기
        </Button>
      </div>
    </Modal>
  );
};

export default ReservationLinkPicker;
