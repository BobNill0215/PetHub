'use client';

import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/common/Avatar';
import { timeAgo } from '@/lib/utils';
import { apiPost, apiDelete } from '@/lib/api';

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
  isLiked?: boolean;
}

export function FeedCard({ feed }: { feed: FeedItem }) {
  const [liked, setLiked] = useState(feed.isLiked || false);
  const [likeCount, setLikeCount] = useState(feed.likeCount);

  const toggleLike = async () => {
    try {
      if (liked) {
        await apiDelete(`/feeds/${feed.id}/like`);
        setLiked(false);
        setLikeCount(c => c - 1);
      } else {
        await apiPost(`/feeds/${feed.id}/like`);
        setLiked(true);
        setLikeCount(c => c + 1);
      }
    } catch {
      // ignore
    }
  };

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
          <img src={feed.images[0]} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="p-4">
        <p className="text-sm text-gray-800 whitespace-pre-wrap">{feed.content}</p>
        {feed.topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {feed.topics.map(t => (
              <span key={t} className="text-xs text-blue-500">#{t}</span>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center gap-6">
          <button onClick={toggleLike} className={`flex items-center gap-1.5 text-sm ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            {likeCount}
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
