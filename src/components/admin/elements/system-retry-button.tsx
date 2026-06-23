"use client";

import { apiPost } from "@/lib/api-client";
import Button from "@/components/ui/button";

const SystemRetryButton = ({
  messageId,
  conversationId,
  mode,
}: {
  messageId: string;
  conversationId: string;
  mode: "delivery" | "translation";
}) => {
  const onClickRetry = async () => {
    await apiPost("/api/admin/system/retry", { messageId, conversationId, mode });
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={onClickRetry}>
      재시도
    </Button>
  );
};

export default SystemRetryButton;
