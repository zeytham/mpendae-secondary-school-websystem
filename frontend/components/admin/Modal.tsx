'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  headerIcon?: React.ReactNode;
}

const sizeMap = {
  sm: 420,
  md: 560,
  lg: 740,
  xl: 960,
};

export default function Modal({ isOpen, onClose, title, subtitle, children, size = 'md', footer, headerIcon }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: .18 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 80,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)',
          }}
          onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: .96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: .96, y: 16 }}
            transition={{ duration: .22, ease: [.22, 1, .36, 1] }}
            style={{
              width: '100%', maxWidth: sizeMap[size],
              background: '#0a0d0a',
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: '1.5rem',
              boxShadow: '0 40px 100px rgba(0,0,0,.8), 0 0 0 1px rgba(0,255,65,.06)',
              display: 'flex', flexDirection: 'column',
              maxHeight: '92vh', overflow: 'hidden',
            }}
          >
            {/* Lime accent line on top */}
            <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, var(--c-lime), transparent)', flexShrink: 0 }} />

            {/* ── Header ── */}
            <div style={{
              padding: '1.5rem 1.75rem 1.25rem',
              borderBottom: '1px solid rgba(255,255,255,.07)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem',
              flexShrink: 0, background: 'linear-gradient(135deg, rgba(0,255,65,.04), transparent)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem' }}>
                {headerIcon && (
                  <div style={{ width: 40, height: 40, borderRadius: '.875rem', background: 'rgba(0,255,65,.1)', border: '1px solid rgba(0,255,65,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--c-lime)' }}>
                    {headerIcon}
                  </div>
                )}
                <div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-.01em' }}>{title}</h2>
                  {subtitle && <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)', margin: '.2rem 0 0', fontWeight: 500 }}>{subtitle}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: '.625rem', cursor: 'pointer',
                  background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,.4)', transition: 'all .2s', flexShrink: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,71,87,.12)'; (e.currentTarget as HTMLElement).style.color = '#ff4757'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,71,87,.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.4)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.08)'; }}
                aria-label="Funga"
              >
                <X style={{ width: 15, height: 15 }} />
              </button>
            </div>

            {/* ── Body ── */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem 1.75rem' }}>
              {children}
            </div>

            {/* ── Footer ── */}
            {footer && (
              <div style={{ padding: '1.1rem 1.75rem', borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', justifyContent: 'flex-end', gap: '.75rem', flexShrink: 0, background: 'rgba(255,255,255,.02)' }}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
