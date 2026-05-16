'use client';

import { useState, useRef } from 'react';
import { apiUpload } from '@/lib/api';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export function ImageUpload({ images, onChange, max = 9 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || images.length >= max) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await apiUpload<{ url: string }>('/upload', form);
      onChange([...images, res.data.url]);
    } catch { /* ignore */ }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (i: number) => onChange(images.filter((_, j) => j !== i));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative h-20 w-20">
            <img src={url} alt="" className="h-full w-full rounded-lg object-cover" />
            <button type="button" onClick={() => remove(i)}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              ×
            </button>
          </div>
        ))}
        {images.length < max && (
          <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500">
            <span className="text-2xl">{uploading ? '⏳' : '+'}</span>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-400">支持 jpg/png/gif/webp，最多 {max} 张</p>
    </div>
  );
}
