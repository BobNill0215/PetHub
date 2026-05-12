'use client';

import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { timeAgo } from '@/lib/utils';

interface FeedCardProps {
  feed: {
    id: number;
    user: { nickname: string; avatar?: string; city?: string };
    content: string;
    images: string[];
    likeCount: number;
    commentCount: number;
    createdAt: string;
  };
}

export function FeedCard({ feed }: FeedCardProps) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <Avatar name={feed.user.nickname} src={feed.user.avatar} />
        <div>
          <p className="text-sm font-medium text-gray-900">{feed.user.nickname}</p>
          <p className="text-xs text-gray-500">
            {feed.user.city && `${feed.user.city} · `}{timeAgo(feed.createdAt)}
          </p>
        </div>
      </div>

      {feed.images.length > 0 && (
        <div className="aspect-[3/2] overflow-hidden bg-gray-100">
          <img
            src={feed.images[0]}
            alt="feed image"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <p className="text-sm text-gray-800">{feed.content}</p>
        <div className="mt-4 flex items-center gap-6">
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500">
            <Heart className="h-4 w-4" />
            {feed.likeCount}
          </button>
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500">
            <MessageCircle className="h-4 w-4" />
            {feed.commentCount}
          </button>
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-yellow-500">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
