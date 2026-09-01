'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: Date | string;
  className?: string;
  showDays?: boolean;
  compact?: boolean;
}

export default function CountdownTimer({ targetDate, className = '', showDays = true, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) { setExpired(true); return; }

      const days    = Math.floor(diff / 86400000);
      const hours   = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (expired) {
    return (
      <div className={className} style={{ color: 'var(--c-w35)', fontSize: '.8125rem' }}>
        Muda umekwisha
      </div>
    );
  }

  const units = showDays
    ? [
        { val: timeLeft.days,    label: 'Siku' },
        { val: timeLeft.hours,   label: 'Masaa' },
        { val: timeLeft.minutes, label: 'Dak' },
        { val: timeLeft.seconds, label: 'Sek' },
      ]
    : [
        { val: timeLeft.hours,   label: 'Masaa' },
        { val: timeLeft.minutes, label: 'Dak' },
        { val: timeLeft.seconds, label: 'Sek' },
      ];

  if (compact) {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
        {units.map(({ val, label }, i) => (
          <span key={label} style={{ display: 'inline-flex', alignItems: 'baseline', gap: '.2rem', fontSize: '.85rem', fontWeight: 800 }}>
            <span style={{ color: 'var(--c-lime)', fontFamily: 'var(--f-display)' }}>{String(val).padStart(2, '0')}</span>
            <span style={{ color: 'rgba(255,255,255,.4)', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span>
            {i < units.length - 1 && <span style={{ color: 'rgba(255,255,255,.2)', marginLeft: '.25rem' }}>·</span>}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
      {units.map(({ val, label }, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <div className="countdown-box">
            <span
              className="countdown-num"
              key={val}
              style={{ display: 'block', animation: 'countUp 0.3s ease' }}
            >
              {String(val).padStart(2, '0')}
            </span>
            <span className="countdown-label">{label}</span>
          </div>
          {i < units.length - 1 && (
            <span style={{ color: 'var(--c-lime)', fontWeight: 800, fontSize: '1.1rem', paddingBottom: '1rem', opacity: 0.6 }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}
