'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryPhoto } from '@/types';
import { X, ZoomIn } from 'lucide-react';

export default function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string } | null>(null);
  const displayPhotos = photos.slice(0, 8);

  // Varying heights for masonry feel using a deterministic pattern
  const heightPattern = ['aspect-[3/2]', 'aspect-[3/4]', 'aspect-[3/2]', 'aspect-square', 'aspect-[3/4]', 'aspect-[3/2]', 'aspect-square', 'aspect-[3/4]'];

  return (
    <>
      {/* Masonry Grid */}
      <div className="gallery-masonry">
        {displayPhotos.map((photo, i) => (
          <div
            key={photo.id}
            className="gallery-item group"
            onClick={() => setLightboxImg({ url: photo.imageUrl, title: photo.title })}
            role="button"
            tabIndex={0}
            aria-label={`Angalia picha: ${photo.title}`}
            onKeyDown={e => e.key === 'Enter' && setLightboxImg({ url: photo.imageUrl, title: photo.title })}
          >
            <div className={`relative w-full overflow-hidden ${heightPattern[i % heightPattern.length]}`}>
              <Image
                src={photo.imageUrl}
                alt={photo.title || 'Picha ya shule'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="gallery-overlay">
                <div className="flex items-center justify-between w-full">
                  {photo.title && (
                    <p className="text-xs font-semibold text-white truncate max-w-[75%]">{photo.title}</p>
                  )}
                  <div
                    className="ml-auto flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'var(--lime-500)' }}
                  >
                    <ZoomIn className="h-4 w-4" style={{ color: 'var(--black-900)' }} />
                  </div>
                </div>
              </div>

              {/* Lime corner accent */}
              <div
                className="pointer-events-none absolute top-0 left-0 h-8 w-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  borderTop: '2px solid var(--lime-500)',
                  borderLeft: '2px solid var(--lime-500)',
                  borderRadius: '0.75rem 0 0 0',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightboxImg(null)}
            className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.95)' }}
          >
            {/* Close button */}
            <button
              onClick={e => { e.stopPropagation(); setLightboxImg(null); }}
              className="absolute top-5 right-5 z-60 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition-all hover:border-lime-500 hover:bg-lime-500 hover:text-black"
              aria-label="Funga"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image container */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-2xl"
              onClick={e => e.stopPropagation()}
              style={{ border: '1px solid rgba(0,255,0,0.15)' }}
            >
              <div className="relative aspect-video w-full">
                <Image
                  src={lightboxImg.url}
                  alt={lightboxImg.title || 'Picha'}
                  fill
                  className="object-contain"
                  style={{ background: '#060A05' }}
                />
              </div>
              {lightboxImg.title && (
                <div
                  className="px-5 py-3 text-sm font-medium"
                  style={{ background: 'rgba(6,10,5,0.95)', color: 'rgba(255,255,255,0.6)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {lightboxImg.title}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}