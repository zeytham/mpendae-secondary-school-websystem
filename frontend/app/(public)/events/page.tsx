'use client';

import { useEffect, useState, useRef } from 'react';
import { eventsApi } from '@/lib/api';
import { Event } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { format, isPast, isFuture } from 'date-fns';
import { Calendar, MapPin, Clock, Tag, Trophy, BookOpen, Music, GraduationCap, Ticket, CalendarDays } from 'lucide-react';

const STATUS_TABS = [
  { key: '', label: 'Zote' },
  { key: 'UPCOMING', label: 'Zinazokuja' },
  { key: 'ONGOING', label: 'Zinazoendelea' },
  { key: 'PAST', label: 'Zilizopita' },
];

const EVENT_TYPE_ICONS: Record<string, { icon: typeof Trophy; color: string }> = {
  Sherehe:   { icon: Music,          color: '#F472B6' },
  Mitihani:  { icon: BookOpen,       color: '#60A5FA' },
  Michezo:   { icon: Trophy,         color: '#F59E0B' },
  Mkutano:   { icon: CalendarDays,   color: '#A78BFA' },
  Ziara:     { icon: MapPin,         color: '#34D399' },
  Mengine:   { icon: Ticket,         color: 'var(--c-lime)' },
  Wahitimu:  { icon: GraduationCap,  color: 'var(--c-lime)' },
};

function EventCard({ event, index }: { event: Event; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const typeInfo = EVENT_TYPE_ICONS[event.category] || EVENT_TYPE_ICONS['Mengine'];
  const Icon = typeInfo.icon;

  const start = new Date(event.startDate);
  const upcoming = isFuture(start);
  const isOngoing = event.status === 'ONGOING';

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: .55, delay: index * .07, ease: [.22, 1, .36, 1] }}
      viewport={{ once: true, margin: '-60px' }}
      style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
    >
      {/* Timeline dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: '.25rem' }}>
        <motion.div
          whileHover={{ scale: 1.2 }}
          style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: upcoming || isOngoing ? 'rgba(0,255,65,.15)' : 'rgba(255,255,255,.06)',
            border: `2px solid ${upcoming || isOngoing ? 'rgba(0,255,65,.5)' : 'rgba(255,255,255,.12)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: upcoming || isOngoing ? '0 0 16px rgba(0,255,65,.2)' : 'none',
          }}
        >
          <Icon style={{ width: 18, height: 18, color: upcoming || isOngoing ? 'var(--c-lime)' : typeInfo.color }} />
        </motion.div>
        <div style={{ width: 1, flex: 1, minHeight: 40, background: 'linear-gradient(180deg, rgba(0,255,65,.3), transparent)', marginTop: '.5rem' }} />
      </div>

      {/* Card */}
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          flex: 1, marginBottom: '1.5rem',
          borderRadius: '1.5rem', overflow: 'hidden',
          border: `1px solid ${hovered ? 'rgba(0,255,65,.25)' : 'var(--c-border)'}`,
          background: 'var(--c-surface)',
          boxShadow: hovered ? '0 20px 50px rgba(0,0,0,.4)' : '0 4px 20px rgba(0,0,0,.15)',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'all .3s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem 1.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
            {/* Date badge */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              width: 52, flexShrink: 0, borderRadius: '.875rem', overflow: 'hidden',
              border: `1px solid ${upcoming ? 'rgba(0,255,65,.3)' : 'rgba(255,255,255,.1)'}`,
            }}>
              <div style={{ background: upcoming ? 'var(--c-lime)' : 'rgba(255,255,255,.1)', width: '100%', padding: '.25rem', textAlign: 'center' }}>
                <span style={{ fontSize: '.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: upcoming ? '#050805' : 'rgba(255,255,255,.5)' }}>
                  {format(start, 'MMM')}
                </span>
              </div>
              <div style={{ padding: '.25rem', textAlign: 'center', width: '100%' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: upcoming ? 'var(--c-lime)' : '#fff', lineHeight: 1 }}>
                  {format(start, 'dd')}
                </span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '.18rem .6rem', borderRadius: 999,
                  background: `${typeInfo.color}18`, border: `1px solid ${typeInfo.color}40`,
                  fontSize: '.62rem', fontWeight: 700, color: typeInfo.color,
                  letterSpacing: '.06em', textTransform: 'uppercase',
                }}>
                  {event.category}
                </span>
                <span style={{
                  padding: '.18rem .6rem', borderRadius: 999, fontSize: '.62rem', fontWeight: 700,
                  letterSpacing: '.06em', textTransform: 'uppercase',
                  background: isOngoing ? 'rgba(0,255,65,.12)' : upcoming ? 'rgba(245,158,11,.1)' : 'rgba(255,255,255,.06)',
                  color: isOngoing ? 'var(--c-lime)' : upcoming ? '#F59E0B' : 'rgba(255,255,255,.4)',
                  border: isOngoing ? '1px solid rgba(0,255,65,.3)' : upcoming ? '1px solid rgba(245,158,11,.3)' : '1px solid rgba(255,255,255,.1)',
                }}>
                  {isOngoing ? 'Inaendelea' : upcoming ? 'Inakuja' : 'Ilipita'}
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', lineHeight: 1.4, margin: 0 }}>
                {event.title}
              </h3>
            </div>
          </div>

          {/* Location + time */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            {event.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.75rem', color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>
                <MapPin style={{ width: 12, height: 12 }} /> {event.location}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.75rem', color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>
              <Clock style={{ width: 12, height: 12 }} />
              {format(start, 'dd MMM yyyy')}
              {event.endDate ? ` – ${format(new Date(event.endDate), 'dd MMM yyyy')}` : ''}
            </span>
          </div>
        </div>

        {/* Countdown for upcoming */}
        {upcoming && (
          <div style={{ padding: '0 1.5rem 1rem' }}>
            <div style={{ padding: '.875rem 1rem', borderRadius: '1rem', background: 'rgba(0,255,65,.06)', border: '1px solid rgba(0,255,65,.14)' }}>
              <p style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(0,255,65,.6)', marginBottom: '.5rem' }}>
                ⏱ Inasimama kwa:
              </p>
              <CountdownTimer targetDate={event.startDate} compact />
            </div>
          </div>
        )}

        {/* Description accordion */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%', padding: '.875rem 1.5rem', background: 'none', border: 'none',
            borderTop: '1px solid rgba(255,255,255,.06)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            color: 'rgba(255,255,255,.5)', fontSize: '.8rem', fontWeight: 600,
            transition: 'color .2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-lime)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.5)')}
        >
          <span>{expanded ? 'Ficha maelezo' : 'Onyesha maelezo zaidi'}</span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: .25 }}>▼</motion.span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: .3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
                <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.75 }}>
                  {event.description || 'Maelezo hayapatikani.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    eventsApi.getAll({ status })
      .then(r => setEvents(r.data.events || r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [status]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>

      {/* ── HERO ── */}
      <div style={{
        paddingTop: 'calc(var(--nav-h) + 5rem)', paddingBottom: '5rem',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, var(--c-bg2) 0%, var(--c-surface) 100%)',
      }}>
        <div className="pattern-grid" style={{ position: 'absolute', inset: 0, opacity: .4, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '25%', right: '8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="site-container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.span
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .08 }}
            className="section-label" style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}
          >
            <CalendarDays style={{ width: 14, height: 14 }} /> Matukio ya Shule
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
              <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>& Shughuli</span>
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55, delay: .38 }}
            style={{ color: 'rgba(255,255,255,.5)', fontSize: '1.05rem', maxWidth: 440, margin: '0 auto' }}
          >
            Fuatilia matukio yote ya shule — mitihani, sherehe, michezo na zaidi.
          </motion.p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <section style={{ padding: '4rem 0 7rem' }}>
        <div className="site-container">

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .1 }}
            style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}
          >
            {STATUS_TABS.map(tab => {
              const active = status === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatus(tab.key)}
                  style={{
                    padding: '.55rem 1.4rem', borderRadius: 999, cursor: 'pointer',
                    fontSize: '.875rem', fontWeight: 700, border: 'none', outline: 'none',
                    background: active ? 'rgba(0,255,65,.12)' : 'rgba(255,255,255,.04)',
                    color: active ? 'var(--c-lime)' : 'rgba(255,255,255,.5)',
                    boxShadow: active ? 'inset 0 0 0 1px rgba(0,255,65,.35), 0 0 12px rgba(0,255,65,.12)' : 'inset 0 0 0 1px rgba(255,255,255,.08)',
                    transition: 'all .25s',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </motion.div>

          {/* Timeline */}
          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div className="skeleton-shimmer" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                      <div className="skeleton-shimmer" style={{ flex: 1, height: 160, borderRadius: '1.5rem' }} />
                    </div>
                  ))}
                </motion.div>
              ) : events.length === 0 ? (
                <motion.div
                  key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center', padding: '5rem 0' }}
                >
                  <CalendarDays style={{ width: 64, height: 64, color: 'rgba(255,255,255,.08)', margin: '0 auto 1.5rem' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: '.5rem' }}>Hakuna Matukio</h3>
                  <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '.9rem' }}>Matukio yataongezwa hivi karibuni.</p>
                </motion.div>
              ) : (
                <motion.div key={status} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {events.map((event, i) => (
                    <EventCard key={event.id} event={event} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
