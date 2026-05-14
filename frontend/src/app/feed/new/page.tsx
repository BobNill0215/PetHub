import { CreateFeedForm } from '@/components/feed/CreateFeedForm';

export default function NewFeedPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">发布动态</h1>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <CreateFeedForm />
      </div>
    </div>
  );
}
