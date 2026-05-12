'use client';

import { FeedCard } from './FeedCard';

const mockFeeds = [
  {
    id: 1,
    user: { nickname: '喵星人', avatar: '', city: '北京' },
    content: '今天的咪咪特别乖，自己玩了一下午的逗猫棒 🐱',
    images: ['https://picsum.photos/seed/cat1/600/400'],
    likeCount: 42,
    commentCount: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    user: { nickname: '汪星人大壮', avatar: '', city: '上海' },
    content: '周末带毛孩子去公园撒欢，跑得可开心了！',
    images: ['https://picsum.photos/seed/dog1/600/400'],
    likeCount: 28,
    commentCount: 5,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function FeedList() {
  return (
    <div className="space-y-4">
      {mockFeeds.map((feed) => (
        <FeedCard key={feed.id} feed={feed} />
      ))}
    </div>
  );
}
