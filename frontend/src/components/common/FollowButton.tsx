'use client';

import { useState } from 'react';
import { apiPost, apiDelete } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

export function FollowButton({ userId, onUpdate }: { userId: number; onUpdate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);

  if (!user || user.id === userId) return null;

  const handleFollow = async () => {
    setLoading(true);
    try { await apiPost(`/users/${userId}/follow`); onUpdate?.(); } catch { /* ignore */ }
    setLoading(false);
  };

  const handleUnfollow = async () => {
    setLoading(true);
    try { await apiDelete(`/users/${userId}/follow`); onUpdate?.(); } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
    >
      + 关注
    </button>
  );
}
