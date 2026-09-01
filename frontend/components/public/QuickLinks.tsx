'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ClipboardList, BookOpen, Calendar, MessageCircle, ArrowUpRight, Sparkles } from 'lucide-react';
import type { Variants } from 'framer-motion';

const LINKS = [
  { icon: ClipboardList, label: 'Jiandikishe', desc: 'Omba usajili wa Form I au V', href: '/admissions', primary: true, badge: 'Mpya' },
  { icon: BookOpen,      label: 'Masomo',      desc: 'Mitaala na idara zetu',      href: '/academics',  primary: false },
  { icon: Calendar,      label: 'Matukio',     desc: 'Shughuli na hafla za shule', href: '/events',     primary: false },
  { icon: MessageCircle, label: 'Wasiliana',   desc: 'Tupigie simu au ujumbe',     href: '/contact',    primary: false },
];

const wrap: Variants = { hidden: {}, show: { transition: { staggerChildren: .07, delayChildren: .1 } } };
const it: Variants   = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: .5, ease: 'easeOut' as const } } };

export default function QuickLinks() {
  return (
    <div className="site-container" style={{ position: 'relative', zIndex: 20 }}>
      <motion.div
        variants={wrap}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-20px' }}
        className="floating-search"
      >
        <style>{`
          .ql-bento {
            display: grid;
            grid-template-columns: 1fr;
            gap: .875rem;
          }
          @media(min-width:640px) {
            .ql-bento { grid-template-columns: repeat(2,1fr); }
          }
          @media(min-width:1024px) {
            .ql-bento { grid-template-columns: 1.5fr 1fr 1fr 1fr; }
          }
        `}</style>
        <div className="ql-bento">
          {LINKS.map(({ icon: Icon, label, desc, href, primary, badge }) => (
            <motion.div key={href} variants={it}>
              <Link
                href={href}
                className={`ql-card${primary ? ' ql-featured' : ''}`}
                style={{ textDecoration: 'none', height: '100%', minHeight: primary ? 'auto' : 'auto' }}
              >
                {/* Icon row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '.875rem',
                    background: primary ? 'var(--c-lime)' : 'var(--c-lime-hint)',
                    border: `1px solid ${primary ? 'var(--c-lime)' : 'var(--c-lime-edge)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'transform .3s var(--ease-spring)',
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px) scale(1.1)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                  >
                    <Icon style={{ width: 20, height: 20, color: primary ? 'var(--c-bg)' : 'var(--c-lime)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    {badge && (
                      <span className="badge-new" style={{ fontSize: '.58rem' }}>{badge}</span>
                    )}
                    <ArrowUpRight
                      style={{ width: 16, height: 16, color: 'var(--c-w20)', transition: 'transform .25s, color .25s' }}
                      className="ql-arrow"
                    />
                  </div>
                </div>

                {/* Text */}
                <div>
                  <p style={{ fontSize: '.9rem', fontWeight: 700, color: '#fff', marginBottom: '.3rem' }}>{label}</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--c-w50)', lineHeight: 1.45 }}>{desc}</p>
                </div>

                {/* Primary: extra sparkle */}
                {primary && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginTop: '.25rem' }}>
                    <Sparkles style={{ width: 12, height: 12, color: 'var(--c-lime)' }} />
                    <span style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--c-lime)', letterSpacing: '.08em' }}>Nafasi Bado Zinapatikana</span>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <style>{`
        .ql-card:hover .ql-arrow {
          transform: translate(4px,-4px) !important;
          color: var(--c-lime) !important;
        }
      `}</style>
    </div>
  );
}