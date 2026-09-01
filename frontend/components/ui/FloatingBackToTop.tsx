'use client';

import { useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

export default function FloatingBackToTop() {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const onScroll = () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      ref={btnRef}
      onClick={scrollTop}
      className="back-to-top"
      aria-label="Rudi juu"
    >
      <ArrowUp style={{ width: 20, height: 20 }} />
    </button>
  );
}
