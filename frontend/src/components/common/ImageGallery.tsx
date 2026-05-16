'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export function ImageGallery({ images, index, onClose }: { images: string[]; index: number; onClose: () => void }) {
  const [current, setCurrent] = useState(index);

  const prev = () => setCurrent(c => (c > 0 ? c - 1 : images.length - 1));
  const next = () => setCurrent(c => (c < images.length - 1 ? c + 1 : 0));

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }, []);

  useEffect(() => { document.addEventListener('keydown', handleKey); return () => document.removeEventListener('keydown', handleKey); }, [handleKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-10"><X className="h-8 w-8" /></button>
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white/80 hover:text-white"><ChevronLeft className="h-10 w-10" /></button>
          <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 text-white/80 hover:text-white"><ChevronRight className="h-10 w-10" /></button>
        </>
      )}
      <img src={images[current]} alt="" className="max-h-[90vh] max-w-[90vw] object-contain" onClick={e => e.stopPropagation()} />
      {images.length > 1 && <div className="absolute bottom-4 text-white/60 text-sm">{current + 1} / {images.length}</div>}
    </div>
  );
}
