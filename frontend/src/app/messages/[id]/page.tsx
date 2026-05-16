'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/stores/auth';
import { timeAgo } from '@/lib/utils';

interface Message {
  id: number;
  content: string;
  senderId: number;
  sender: { id: number; nickname: string; avatar?: string };
  createdAt: string;
}

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<{ id: number; nickname: string; avatar?: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout>(null);

  const fetchMessages = async () => {
    try {
      const res = await apiGet<{ data: Message[] }>(`/conversations/${id}/messages`);
      setMessages(res.data.data);
    } catch { /* ignore */ }
  };

  const fetchConv = async () => {
    try {
      const convs = await apiGet<any[]>('/conversations');
      const conv = convs.data.find((c: any) => c.id === Number(id));
      if (conv && user) {
        setOtherUser(Number(conv.user1.id) === user.id ? conv.user2 : conv.user1);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!user || !id) return;
    fetchConv();
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [id, user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await apiPost(`/conversations/${id}/messages`, { content: input });
      setInput('');
      await fetchMessages();
    } catch { /* ignore */ }
    setSending(false);
  };

  if (!user) return <div className="text-center py-20 text-gray-500">请先登录</div>;

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-4">
      <div className="flex items-center gap-3 border-b py-3">
        <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← 返回</button>
        {otherUser && (
          <div className="flex items-center gap-2">
            <Avatar name={otherUser.nickname} src={otherUser.avatar} size="sm" />
            <span className="font-medium text-gray-900">{otherUser.nickname}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map(m => {
          const isMe = Number(m.senderId) === user.id;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <p className="text-sm">{m.content}</p>
                <p className={`mt-0.5 text-[10px] ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {timeAgo(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t py-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入消息..."
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button type="submit" disabled={!input.trim() || sending}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
          发送
        </button>
      </form>
    </div>
  );
}
