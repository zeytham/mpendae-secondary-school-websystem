'use client';

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface LightboxModalProps {
  images: { src: string; caption?: string }[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function LightboxModal({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: LightboxModalProps) {
  const current = images[currentIndex];

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <AnimatePresence>
      <motion.div
        className="lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Picha kubwa"
      >
        {/* Close */}
        <button className="lightbox-close" onClick={onClose} aria-label="Funga">
          <X style={{ width: 18, height: 18 }} />
        </button>

        {/* Prev */}
        {images.length > 1 && (
          <button
            className="lightbox-nav prev"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Picha iliyopita"
          >
            <ChevronLeft style={{ width: 22, height: 22 }} />
          </button>
        )}

        {/* Image */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <div style={{ position: 'relative', maxWidth: 'calc(100vw - 140px)', maxHeight: 'calc(100vh - 120px)' }}>
            <Image
              src={current.src}
              alt={current.caption || `Picha ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="lightbox-img"
              style={{ objectFit: 'contain', maxHeight: 'calc(100vh - 150px)', width: 'auto' }}
            />
          </div>
          {current.caption && (
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '.875rem', textAlign: 'center', maxWidth: 500 }}>
              {current.caption}
            </p>
          )}
        </motion.div>

        {/* Next */}
        {images.length > 1 && (
          <button
            className="lightbox-nav next"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Picha inayofuata"
          >
            <ChevronRight style={{ width: 22, height: 22 }} />
          </button>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div className="lightbox-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
