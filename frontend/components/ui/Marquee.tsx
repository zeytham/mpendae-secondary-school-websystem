'use client';

import { ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  speed?: number;    /* seconds for one cycle */
  gap?: string;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

export default function Marquee({
  children,
  speed = 28,
  gap = '0',
  direction = 'left',
  pauseOnHover = true,
  className = '',
}: MarqueeProps) {
  const dur = `${speed}s`;
  const anim = direction === 'left' ? 'ticker' : 'ticker-rev';

  return (
    <div
      style={{ overflow: 'hidden', width: '100%', display: 'flex' }}
      className={className}
    >
      <style>{`
        @keyframes ticker-rev {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: `${anim} ${dur} linear infinite`,
          gap,
          willChange: 'transform',
        }}
        onMouseEnter={e => { if (pauseOnHover) (e.currentTarget as HTMLElement).style.animationPlayState = 'paused'; }}
        onMouseLeave={e => { if (pauseOnHover) (e.currentTarget as HTMLElement).style.animationPlayState = 'running'; }}
      >
        {/* Duplicate for seamless loop */}
        <div style={{ display: 'flex', gap, flexShrink: 0 }}>{children}</div>
        <div style={{ display: 'flex', gap, flexShrink: 0 }} aria-hidden>{children}</div>
      </div>
    </div>
  );
}
