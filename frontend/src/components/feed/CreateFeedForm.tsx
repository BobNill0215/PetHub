'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { apiPost } from '@/lib/api';

export function CreateFeedForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [topics, setTopics] = useState('');

  const addImage = () => {
    if (imageUrl && images.length < 9) {
      setImages([...images, imageUrl]);
      setImageUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiPost('/feeds', {
        content,
        images,
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
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          required
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="分享你家毛孩子的日常 🐾"
        />
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="图片URL（可选）"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
        />
        <Button type="button" variant="secondary" onClick={addImage} disabled={!imageUrl}>
          添加
        </Button>
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, j) => j !== i))}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <Input
        id="topics"
        label="话题标签（逗号分隔）"
        placeholder="猫咪日常, 萌宠"
        value={topics}
        onChange={e => setTopics(e.target.value)}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>发布</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>取消</Button>
      </div>
    </form>
  );
}
