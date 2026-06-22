/** LINE Messaging API Webhook 타입 (PoC 최소) */

export interface LineWebhookBody {
  destination: string;
  events: LineEvent[];
}

export interface LineEvent {
  type: string;
  mode?: string;
  timestamp?: number;
  source?: {
    type: string;
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  message?: {
    id: string;
    type: string;
    text?: string;
  };
  replyToken?: string;
}

export interface LineChannelCredentials {
  channel_secret: string;
  channel_access_token: string;
}

export interface LineUserProfile {
  displayName: string;
  userId: string;
  pictureUrl?: string;
}
