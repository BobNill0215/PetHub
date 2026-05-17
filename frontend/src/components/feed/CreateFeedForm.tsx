'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ImageUpload } from '@/components/common/ImageUpload';
import { apiPost } from '@/lib/api';

export function CreateFeedForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [category, setCategory] = useState('general');
  const [images, setImages] = useState<string[]>([]);
  const [topics, setTopics] = useState('');
  const [links, setLinks] = useState<{ title: string; url: string }[]>([{ title: '', url: '' }]);
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  const updateLink = (i: number, field: 'title' | 'url', value: string) => {
    const next = [...links];
    next[i] = { ...next[i], [field]: value };
    setLinks(next);
  };

  const addLink = () => setLinks([...links, { title: '', url: '' }]);
  const removeLink = (i: number) => setLinks(links.filter((_, j) => j !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const validLinks = links.filter(l => l.title && l.url);
      await apiPost('/feeds', {
        content,
        category,
        isDraft,
        eventDate: eventDate || undefined,
        eventLocation: eventLocation || undefined,
        images,
        links: validLinks.length > 0 ? validLinks : undefined,
        topics: topics ? topics.split(/[,，]/).map(s => s.trim()).filter(Boolean) : [],
      });
      router.push('/feed');
    } catch (err: any) {
      setError(err.response?.data?.message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">说点什么...</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} required
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="分享你家毛孩子的日常 🐾" />
      </div>

      <ImageUpload images={images} onChange={setImages} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">板块</label>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          <option value="general">综合讨论</option>
          <option value="cat">猫咪</option>
          <option value="dog">狗狗</option>
          <option value="smallpet">小宠</option>
          <option value="aquatic">水族</option>
          <option value="reptile">爬虫</option>
          <option value="insect">昆虫</option>
        </select>
      </div>

      <Input id="topics" label="话题标签（逗号分隔）" placeholder="猫咪日常, 萌宠" value={topics} onChange={e => setTopics(e.target.value)} />

      <details className="text-sm text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700">📅 添加活动信息（可选）</summary>
        <div className="mt-2 space-y-2">
          <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input type="text" placeholder="活动地点" value={eventLocation} onChange={e => setEventLocation(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </details>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">🛒 推荐商品链接（可选）</label>
        <p className="text-xs text-gray-400 mb-2">可以添加京东、淘宝、亚马逊等购物链接</p>
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input value={link.title} onChange={e => updateLink(i, 'title', e.target.value)}
                  placeholder="商品名称" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <input value={link.url} onChange={e => updateLink(i, 'url', e.target.value)}
                  placeholder="https://..." className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              {links.length > 1 && (
                <button type="button" onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600 mt-2">×</button>
              )}
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={addLink}>+ 添加链接</Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>{isDraft ? '保存草稿' : '发布帖子'}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setIsDraft(!isDraft); }} className="text-xs">
          {isDraft ? '📝 改为发布' : '💾 存为草稿'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>取消</Button>
      </div>
    </form>
  );
}
