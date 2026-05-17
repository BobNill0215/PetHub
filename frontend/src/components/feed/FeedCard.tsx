'use client';

import { Heart, MessageCircle, Bookmark, Repeat2, Eye, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { ImageGallery } from '@/components/common/ImageGallery';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { timeAgo } from '@/lib/utils';
import { apiPost, apiDelete, apiGet } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface FeedItem {
  id: number;
  uuid: string;
  userId?: number;
  user: { id: number; nickname: string; avatar?: string; city?: string };
  content: string;
  images: string[];
  videoUrl?: string;
  links?: { title: string; url: string }[];
  topics: string[];
  category?: string;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  shareCount?: number;
  viewCount?: number;
  isPinned?: boolean;
  isFeatured?: boolean;
  createdAt: string;
  isLiked?: boolean;
}

interface Comment {
  id: number;
  user: { id: number; nickname: string; avatar?: string };
  content: string;
  createdAt: string;
}

export function FeedCard({ feed }: { feed: FeedItem }) {
  const currentUser = useAuthStore((s) => s.user);
  const [liked, setLiked] = useState(feed.isLiked || false);
  const [likeCount, setLikeCount] = useState(feed.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentCount, setCommentCount] = useState(feed.commentCount);
  const [loadingComments, setLoadingComments] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState<number | null>(null);
  const [showLikes, setShowLikes] = useState(false);
  const [likedUsers, setLikedUsers] = useState<any[]>([]);

  const toggleLike = async () => {
    try {
      if (liked) { await apiDelete(`/feeds/${feed.id}/like`); setLiked(false); setLikeCount(c => c - 1); }
      else { await apiPost(`/feeds/${feed.id}/like`); setLiked(true); setLikeCount(c => c + 1); }
    } catch { /* ignore */ }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try { const res = await apiGet<Comment[]>(`/feeds/${feed.id}/comments`); setComments(res.data); } catch { /* ignore */ }
    setLoadingComments(false);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await apiPost<Comment>(`/feeds/${feed.id}/comments`, { content: commentText });
      setComments([res.data, ...comments]);
      setCommentCount(c => c + 1);
      setCommentText('');
    } catch { /* ignore */ }
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/post/${feed.id}`} className="flex items-center gap-3 p-4 hover:bg-gray-50">
        <Avatar name={feed.user.nickname} src={feed.user.avatar} />
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-medium text-gray-900">{feed.user.nickname}</p>
            <p className="text-xs text-gray-500">{feed.user.city && `${feed.user.city} · `}{timeAgo(feed.createdAt)}</p>
          </div>
          {feed.isPinned && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">置顶</span>}
          {feed.isFeatured && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">精华</span>}
        </div>
      </Link>

      {feed.images.length > 0 && (
        <div className="flex gap-1 overflow-x-auto bg-gray-100 cursor-pointer" onClick={() => setGalleryIdx(0)}>
          {feed.images.slice(0, 3).map((url, i) => (
            <div key={i} className="shrink-0 w-full aspect-[3/2] first:block">
              <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
          ))}
          {feed.images.length > 3 && <div className="shrink-0 w-full aspect-[3/2] flex items-center justify-center bg-gray-200 text-gray-500 text-sm">+{feed.images.length - 3}</div>}
        </div>
      )}
      {galleryIdx !== null && <ImageGallery images={feed.images} index={galleryIdx} onClose={() => setGalleryIdx(null)} />}

      <div className="p-4">
        <Link href={`/post/${feed.id}`} className="text-sm text-gray-800 whitespace-pre-wrap block hover:text-gray-600">{feed.content}</Link>

        {feed.topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {feed.topics.map(t => (
              <Link key={t} href={`/topic?name=${encodeURIComponent(t)}`} className="text-xs text-blue-500 hover:text-blue-700">#{t}</Link>
            ))}
          </div>
        )}

        {feed.links && feed.links.length > 0 && (
          <div className="mt-3 space-y-2 border-t pt-3">
            <p className="text-xs font-medium text-gray-500">🛒 推荐商品</p>
            {feed.links.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-700 hover:bg-orange-100">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">{link.title}</span>
                <span className="text-xs text-orange-500 shrink-0">去购买 →</span>
              </a>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-5">
          <button onClick={toggleLike} className={`flex items-center gap-1 text-sm ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
          </button>
          <button onClick={async (e) => { e.stopPropagation(); try { const r = await apiGet<any[]>('/feeds/' + feed.id + '/likes'); setLikedUsers(r.data); setShowLikes(true); } catch {} }}
            className="text-xs text-gray-400 hover:text-gray-600 -ml-2">
            {likeCount} 赞
          </button>
          <button onClick={() => { if (!showComments) loadComments(); setShowComments(!showComments); }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500">
            <MessageCircle className="h-4 w-4" />{commentCount}
          </button>
          <button className="flex items-center gap-1 text-sm text-gray-400" title="浏览">
            <Eye className="h-4 w-4" />{feed.viewCount || 0}
          </button>
          <button onClick={async () => {
            try {
              await apiPost(`/feeds/${feed.id}/share`);
              await navigator.clipboard.writeText(window.location.origin + '/post/' + feed.id);
            } catch { /* ignore */ }
          }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-500">
            <Repeat2 className="h-4 w-4" />{feed.shareCount || 0}
          </button>
        </div>
      </div>

      {showComments && (
        <div className="border-t px-4 py-3">
          {currentUser && (
            <form onSubmit={submitComment} className="mb-3 flex gap-2">
              <Input placeholder="写评论..." value={commentText} onChange={e => setCommentText(e.target.value)} />
              <Button type="submit" size="sm" disabled={!commentText.trim()}>发送</Button>
            </form>
          )}
          {loadingComments ? <p className="text-sm text-gray-400">加载中...</p>
            : comments.length === 0 ? <p className="text-sm text-gray-400">暂无评论</p>
            : <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar name={c.user.nickname} src={c.user.avatar} size="sm" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">{c.user.nickname}</p>
                      <p className="text-sm text-gray-600">{c.content}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{timeAgo(c.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {showLikes && (
        <div className="border-t px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">👍 点赞</span>
            <button onClick={() => setShowLikes(false)} className="text-xs text-gray-400">关闭</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {likedUsers.map((u: any) => (
              <Link key={u.id} href={`/user/${u.id}`}
                className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1 text-xs hover:bg-gray-100">
                <Avatar name={u.nickname} src={u.avatar} size="sm" />
                {u.nickname}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

