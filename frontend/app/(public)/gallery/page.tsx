'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryApi } from '@/lib/api';
import { GalleryPhoto } from '@/types';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Download, ZoomIn, Layers } from 'lucide-react';

function SkeletonPhoto() {
  return <div className="skeleton-shimmer" style={{ aspectRatio: '1', borderRadius: '1rem' }} />;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [filtered, setFiltered] = useState<GalleryPhoto[]>([]);
  const [albums, setAlbums] = useState<{ album: string; _count: { id: number } }[]>([]);
  const [activeAlbum, setActiveAlbum] = useState('');
  const [lightbox, setLightbox] = useState<{ index: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(16);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([galleryApi.getAll(), galleryApi.getAlbums()])
      .then(([photosRes, albumsRes]) => {
        setPhotos(photosRes.data);
        setFiltered(photosRes.data);
        setAlbums(albumsRes.data);
      }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(activeAlbum ? photos.filter(p => p.album === activeAlbum) : photos);
    setDisplayCount(16);
  }, [activeAlbum, photos]);

  const currentPhoto = lightbox !== null ? filtered[lightbox.index] : null;

  const prev = useCallback(() => lightbox && setLightbox({ index: (lightbox.index - 1 + filtered.length) % filtered.length }), [lightbox, filtered.length]);
  const next = useCallback(() => lightbox && setLightbox({ index: (lightbox.index + 1) % filtered.length }), [lightbox, filtered.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, prev, next]);

  const visible = filtered.slice(0, displayCount);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>

      {/* ── HERO ── */}
      <div style={{
        paddingTop: 'calc(var(--nav-h) + 5rem)', paddingBottom: '5rem',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, var(--c-bg2) 0%, var(--c-surface) 100%)',
      }}>
        <div className="pattern-grid" style={{ position: 'absolute', inset: 0, opacity: .4, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '15%', left: '8%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="site-container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.span
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .08 }}
            className="section-label" style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}
          >
            <Layers style={{ width: 14, height: 14 }} /> Picha za Shuleni
          </motion.span>
          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: .65, delay: .18, ease: [.22, 1, .36, 1] }}
              style={{
                fontFamily: 'var(--f-display)', fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
                fontWeight: 800, color: '#fff', lineHeight: 1.05, letterSpacing: '-.025em',
                marginTop: '.75rem', marginBottom: '1.25rem',
              }}
            >
              Matukio{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>kwa Picha</span>
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55, delay: .38 }}
            style={{ color: 'rgba(255,255,255,.5)', fontSize: '1.05rem', maxWidth: 440, margin: '0 auto' }}
          >
            Tazama matukio, shughuli na maisha ya shuleni kupitia picha zetu.
          </motion.p>
        </div>
      </div>

      <section style={{ padding: '4rem 0 7rem' }}>
        <div className="site-container">

          {/* Album filter */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .1 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', justifyContent: 'center', marginBottom: '3rem' }}
          >
            {[{ album: 'Zote', _count: { id: photos.length } }, ...albums].map(({ album, _count }) => {
              const isActive = album === 'Zote' ? !activeAlbum : activeAlbum === album;
              return (
                <button
                  key={album}
                  onClick={() => setActiveAlbum(album === 'Zote' ? '' : album)}
                  style={{
                    padding: '.5rem 1.2rem', borderRadius: 999, cursor: 'pointer',
                    fontSize: '.85rem', fontWeight: 700, border: 'none', outline: 'none',
                    background: isActive ? 'rgba(0,255,65,.12)' : 'rgba(255,255,255,.04)',
                    color: isActive ? 'var(--c-lime)' : 'rgba(255,255,255,.5)',
                    boxShadow: isActive ? 'inset 0 0 0 1px rgba(0,255,65,.35), 0 0 12px rgba(0,255,65,.12)' : 'inset 0 0 0 1px rgba(255,255,255,.08)',
                    transition: 'all .25s',
                  }}
                >
                  {album} ({_count.id})
                </button>
              );
            })}
          </motion.div>

          {/* Photo count */}
          {!isLoading && filtered.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', fontSize: '.8rem', color: 'rgba(255,255,255,.3)', marginBottom: '2rem', fontWeight: 600 }}
            >
              Picha {Math.min(displayCount, filtered.length)} kati ya {filtered.length}
            </motion.p>
          )}

          {/* Grid */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}
              >
                {Array.from({ length: 12 }).map((_, i) => <SkeletonPhoto key={i} />)}
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', padding: '5rem 0' }}
              >
                <ImageIcon style={{ width: 64, height: 64, color: 'rgba(255,255,255,.08)', margin: '0 auto 1.5rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: '.5rem' }}>Hakuna Picha</h3>
                <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '.9rem' }}>Picha zitaongezwa hivi karibuni.</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeAlbum} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ columns: '2 220px', gap: '1rem' }}
              >
                {visible.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: .95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: .4, delay: Math.min(i * .04, .4) }}
                    viewport={{ once: true }}
                    style={{ breakInside: 'avoid', marginBottom: '1rem', position: 'relative', display: 'block' }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <button
                      onClick={() => setLightbox({ index: i })}
                      style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block', position: 'relative', borderRadius: '1rem', overflow: 'hidden' }}
                    >
                      <Image
                        src={photo.imageUrl} alt={photo.title}
                        width={400} height={300}
                        style={{
                          width: '100%', height: 'auto', display: 'block', objectFit: 'cover',
                          transform: hoveredIdx === i ? 'scale(1.06)' : 'scale(1)',
                          transition: 'transform .5s ease',
                        }}
                      />
                      {/* Lime tint overlay */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(180deg, transparent 40%, rgba(0,255,65,.12) 100%)',
                        opacity: hoveredIdx === i ? 1 : 0,
                        transition: 'opacity .35s',
                      }} />
                      {/* Caption slide-in */}
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        padding: '.875rem',
                        background: 'linear-gradient(0deg, rgba(5,8,5,.9) 0%, transparent 100%)',
                        transform: hoveredIdx === i ? 'translateY(0)' : 'translateY(100%)',
                        transition: 'transform .3s cubic-bezier(.22,1,.36,1)',
                      }}>
                        <p style={{ color: '#fff', fontSize: '.78rem', fontWeight: 700, margin: 0, textAlign: 'left' }}>{photo.title}</p>
                        {photo.album && (
                          <p style={{ color: 'var(--c-lime)', fontSize: '.65rem', fontWeight: 600, margin: '.2rem 0 0', letterSpacing: '.05em', textTransform: 'uppercase' }}>{photo.album}</p>
                        )}
                      </div>
                      {/* Zoom icon */}
                      <div style={{
                        position: 'absolute', top: '.75rem', right: '.75rem',
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'rgba(5,8,5,.6)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: hoveredIdx === i ? 1 : 0,
                        transform: hoveredIdx === i ? 'scale(1)' : 'scale(.7)',
                        transition: 'all .25s',
                      }}>
                        <ZoomIn style={{ width: 14, height: 14, color: '#fff' }} />
                      </div>
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Load More */}
          {!isLoading && displayCount < filtered.length && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button
                onClick={() => setDisplayCount(c => c + 16)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '.625rem',
                  padding: '.875rem 2.5rem', borderRadius: '1.1rem', cursor: 'pointer',
                  background: 'rgba(0,255,65,.1)', border: '1px solid rgba(0,255,65,.25)',
                  color: 'var(--c-lime)', fontWeight: 700, fontSize: '.9rem',
                  transition: 'all .25s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.1)'; }}
              >
                Onyesha Zaidi
                <motion.span animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>↓</motion.span>
              </button>
              <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)', marginTop: '.75rem', fontWeight: 600 }}>
                Picha {Math.min(displayCount, filtered.length)} / {filtered.length}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightbox !== null && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .25 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,.97)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            }}
            onClick={() => setLightbox(null)}
          >
            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 10,
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,.15)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', transition: 'background .2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,65,.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
            >
              <X style={{ width: 20, height: 20 }} />
            </button>

            {/* Prev */}
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,.12)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', zIndex: 10, transition: 'all .2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1)'; }}
            >
              <ChevronLeft style={{ width: 24, height: 24 }} />
            </button>

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={lightbox.index}
                initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: .95 }} transition={{ duration: .25 }}
                style={{ maxWidth: '85vw', maxHeight: '82vh', position: 'relative' }}
                onClick={e => e.stopPropagation()}
              >
                <Image
                  src={currentPhoto.imageUrl} alt={currentPhoto.title}
                  width={1200} height={800}
                  style={{ objectFit: 'contain', maxHeight: '80vh', borderRadius: '1rem' }}
                />
                {/* Caption */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem 1.5rem', background: 'linear-gradient(0deg, rgba(5,8,5,.85) 0%, transparent 100%)', borderRadius: '0 0 1rem 1rem' }}>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '.9rem', margin: 0 }}>{currentPhoto.title}</p>
                  {currentPhoto.album && <p style={{ color: 'var(--c-lime)', fontSize: '.72rem', fontWeight: 600, margin: '.2rem 0 0', textTransform: 'uppercase', letterSpacing: '.06em' }}>{currentPhoto.album}</p>}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Next */}
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,.12)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', zIndex: 10, transition: 'all .2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1)'; }}
            >
              <ChevronRight style={{ width: 24, height: 24 }} />
            </button>

            {/* Counter */}
            <div style={{
              position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)',
              padding: '.4rem 1rem', borderRadius: 999,
              background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,.15)',
              fontSize: '.8rem', fontWeight: 700, color: 'rgba(255,255,255,.7)',
            }}>
              {lightbox.index + 1} / {filtered.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
