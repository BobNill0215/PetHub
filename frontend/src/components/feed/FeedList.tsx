'use client';

import { FeedCard } from './FeedCard';

interface FeedItem {
  id: number;
  uuid: string;
  user: { id: number; nickname: string; avatar?: string; city?: string };
  content: string;
  images: string[];
  videoUrl?: string;
  topics: string[];
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  createdAt: string;
}

export function FeedList({ feeds }: { feeds: FeedItem[] }) {
  return (
    <div className="space-y-4">
      {feeds.map((feed) => (
        <FeedCard key={feed.id} feed={feed} />
      ))}
    </div>
  );
}
