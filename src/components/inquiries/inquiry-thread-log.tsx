"use client";

import {
  buildInquiryPosts,
  type InquiryThreadPayload,
} from "@/lib/inquiry-thread";
import InquiryPostItem from "@/components/inquiries/elements/inquiry-post-item";

export interface InquiryThreadLogProps {
  thread: InquiryThreadPayload;
  onUpdated: () => void;
}

/** 문의 게시판 — 본문·댓글 목록 */
const InquiryThreadLog = ({ thread, onUpdated }: InquiryThreadLogProps) => {
  const posts = buildInquiryPosts(thread.inquiry, thread.storeName, thread.messages);

  return (
    <ol className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
      {posts.map((post) => (
        <InquiryPostItem
          key={post.id}
          post={post}
          thread={thread}
          onUpdated={onUpdated}
        />
      ))}
    </ol>
  );
};

export default InquiryThreadLog;
