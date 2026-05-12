import { FeedList } from '@/components/feed/FeedList';

export default function FeedPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">萌宠动态</h1>
      <FeedList />
    </div>
  );
}
