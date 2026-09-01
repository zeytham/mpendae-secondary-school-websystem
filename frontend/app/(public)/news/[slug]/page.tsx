'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { newsApi } from '@/lib/api';
import { formatArticleContent } from '@/lib/formatContent';
import { NewsArticle } from '@/types';
import { format } from 'date-fns';
import {
  ArrowLeft, Clock, Eye, User, Share2, Newspaper,
  MessageCircle, Link2, CheckCheck, ExternalLink,
  ArrowUp, BookOpen, Tag, ChevronRight, Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

/* ── helpers ── */
function readingTime(text?: string) {
  if (!text) return 2;
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}
function wordCount(text?: string) {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/* ── Reading progress ring ── */
function ProgressRing({ pct }: { pct: number }) {
  const r = 18; const circ = 2 * Math.PI * r;
  return (
    <svg width={44} height={44} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={22} cy={22} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={3} />
      <circle cx={22} cy={22} r={r} fill="none" stroke="#00FF41" strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        strokeDashoffset={circ - (pct / 100) * circ}
        style={{ transition: 'stroke-dashoffset .2s linear' }}
      />
    </svg>
  );
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      <div style={{ height: '55vh', background: 'rgba(255,255,255,.04)', animation: 'art-pulse 1.6s ease-in-out infinite' }} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '3rem', alignItems: 'start' }}>
        <div>
          {[60, 90, 45, 100, 80, 100, 70, 100, 60].map((w, i) => (
            <div key={i} style={{ height: i < 2 ? (i === 0 ? 44 : 18) : 14, width: `${w}%`, borderRadius: 8, background: 'rgba(255,255,255,.05)', marginBottom: i < 2 ? '1rem' : '.75rem', animation: 'art-pulse 1.6s ease-in-out infinite', animationDelay: `${i * .08}s` }} />
          ))}
        </div>
        <div style={{ height: 320, borderRadius: '1.5rem', background: 'rgba(255,255,255,.04)', animation: 'art-pulse 1.6s ease-in-out infinite' }} />
      </div>
      <style>{`@keyframes art-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle]   = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied]     = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [showTop, setShowTop]   = useState(false);
  const [floatShare, setFloatShare] = useState(false);

  const heroRef    = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 180]); // parallax hero

  /* ── Fetch ── */
  useEffect(() => {
    newsApi.getBySlug(slug)
      .then(r => setArticle(r.data))
      .catch(() => setArticle(null))
      .finally(() => setIsLoading(false));
  }, [slug]);

  /* ── Scroll state ── */
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      const pct = (window.scrollY / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(Math.min(pct, 100));
      setShowTop(window.scrollY > 500);
      setFloatShare(window.scrollY > 400);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const copyLink = useCallback(() => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }, []);

  const shareUrl  = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(article?.title || '');
  const shareEnc  = encodeURIComponent(shareUrl);
  const rt        = readingTime(article?.content);
  const wc        = wordCount(article?.content);

  if (isLoading) return <Skeleton />;

  if (!article) return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', paddingTop: 'var(--nav-h)' }}>
      <div style={{ width: 96, height: 96, borderRadius: '2rem', background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Newspaper style={{ width: 40, height: 40, color: 'var(--c-lime)' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '.5rem' }}>Makala Haikupatikana</p>
        <p style={{ fontSize: '.9rem', color: 'var(--c-w35)' }}>Makala hii haipo au imeondolewa.</p>
      </div>
      <Link href="/news" className="btn-primary" style={{ borderRadius: '999px', padding: '.75rem 2rem' }}>
        <ArrowLeft style={{ width: 15, height: 15 }} /> Rudi kwa Habari
      </Link>
    </div>
  );

  return (
    <>
      {/* ── Fixed reading progress bar (top) ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: 3, zIndex: 9999, width: `${scrollPct}%`, background: 'linear-gradient(90deg, var(--c-lime), #a8ffbe)', boxShadow: '0 0 12px rgba(0,255,65,.6)', transition: 'width .08s linear', borderRadius: '0 2px 2px 0' }} />

      {/* ── Floating back-to-top ── */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 200, width: 48, height: 48, borderRadius: '50%', background: 'var(--c-lime)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,255,65,.4)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: .92 }}
          >
            <ArrowUp style={{ width: 20, height: 20, color: '#050805' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Floating share panel (left side on desktop) ── */}
      <AnimatePresence>
        {floatShare && (
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="article-float-share"
            style={{ position: 'fixed', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '.625rem' }}
          >
            {[
              { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${shareEnc}`, color: '#3b5998' },
              { label: 'X', href: `https://twitter.com/intent/tweet?url=${shareEnc}&text=${shareText}`, color: '#1da1f2' },
              { label: 'WA', href: `https://wa.me/?text=${encodeURIComponent((article.title || '') + '\n' + shareUrl)}`, color: '#25D366' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ width: 40, height: 40, borderRadius: '.75rem', background: 'var(--c-surface)', border: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 800, color: s.color, textDecoration: 'none', transition: 'all .2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = s.color; el.style.color = '#fff'; el.style.borderColor = s.color; el.style.transform = 'scale(1.1)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--c-surface)'; el.style.color = s.color; el.style.borderColor = 'var(--c-border)'; el.style.transform = 'scale(1)'; }}
              >
                {s.label}
              </a>
            ))}
            <button onClick={copyLink}
              style={{ width: 40, height: 40, borderRadius: '.75rem', background: copied ? 'var(--c-lime)' : 'var(--c-surface)', border: `1px solid ${copied ? 'var(--c-lime)' : 'var(--c-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: copied ? '#050805' : 'rgba(255,255,255,.5)', transition: 'all .2s' }}
            >
              {copied ? <CheckCheck style={{ width: 16, height: 16 }} /> : <Link2 style={{ width: 16, height: 16 }} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <article ref={articleRef} style={{ minHeight: '100vh', background: 'var(--c-bg)', paddingBottom: '8rem' }}>

        {/* ═══════════════════════════════════════════════
            HERO — full viewport, parallax image
        ═══════════════════════════════════════════════ */}
        <div ref={heroRef} style={{ position: 'relative', height: '58vh', minHeight: 420, overflow: 'hidden', background: 'var(--c-surface)' }}>
          {article.coverImage ? (
            <motion.div style={{ position: 'absolute', inset: '-10%', y: heroY }}>
              <Image src={article.coverImage} alt={article.title} fill style={{ objectFit: 'cover' }} priority sizes="100vw" />
            </motion.div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, var(--c-lime-hint) 0%, var(--c-surface) 70%)' }}>
              <Newspaper style={{ width: 80, height: 80, color: 'rgba(0,255,65,.15)' }} />
            </div>
          )}
          {/* Layered gradients for depth */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,8,5,.55) 0%, rgba(5,8,5,.0) 35%, rgba(5,8,5,.0) 50%, rgba(5,8,5,.95) 90%, #050805 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(5,8,5,.4) 0%, transparent 60%)' }} />

          {/* Back pill */}
          <div style={{ position: 'absolute', top: 'calc(var(--nav-h) + var(--announce-h) + 1.5rem)', left: 0, right: 0 }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/news"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.5rem 1.125rem', borderRadius: '999px', background: 'rgba(5,8,5,.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', color: 'rgba(255,255,255,.85)', textDecoration: 'none', fontSize: '.8125rem', fontWeight: 600, border: '1px solid rgba(255,255,255,.12)', transition: 'all .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(5,8,5,.75)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(5,8,5,.5)'}
              >
                <ArrowLeft style={{ width: 14, height: 14 }} /> Habari Zote
              </Link>
              {/* Progress ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', background: 'rgba(5,8,5,.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '.35rem .875rem .35rem .35rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,.12)' }}>
                <ProgressRing pct={scrollPct} />
                <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.7)', fontWeight: 700, fontFamily: 'var(--f-mono)' }}>{Math.round(scrollPct)}%</span>
              </div>
            </div>
          </div>

          {/* Hero bottom: category + title teaser */}
          <div style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0 }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
              {article.category && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', padding: '.3rem .875rem', borderRadius: '999px', background: 'rgba(0,255,65,.18)', border: '1px solid rgba(0,255,65,.35)', color: 'var(--c-lime)', fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em', marginBottom: '1rem' }}>
                  <Tag style={{ width: 10, height: 10 }} /> {article.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            TWO-COLUMN LAYOUT — main + sticky sidebar
        ═══════════════════════════════════════════════ */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'start' }} className="article-grid">

            {/* ── MAIN COLUMN ── */}
            <main style={{ minWidth: 0 }}>

              {/* Title block */}
              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .65, ease: [.22, 1, .36, 1] }}
                style={{ paddingTop: '2.5rem' }}
              >
                <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2rem, 5.5vw, 3.2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.12, letterSpacing: '-.025em', marginBottom: '1.75rem' }}>
                  {article.title}
                </h1>

                {/* Meta bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.75rem', borderBottom: '1px solid var(--c-border)', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    {/* Author avatar placeholder */}
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--c-lime-hint)', border: '2px solid var(--c-bl)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User style={{ width: 18, height: 18, color: 'var(--c-lime)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '.85rem', fontWeight: 700, color: '#fff', margin: 0 }}>{article.author || 'Mhariri wa Mpendae'}</p>
                      <p style={{ fontSize: '.72rem', color: 'var(--c-w35)', margin: 0 }}>Mwandishi wa Habari</p>
                    </div>
                  </div>

                  <div style={{ width: 1, height: 32, background: 'var(--c-border)', flexShrink: 0 }} className="meta-divider" />

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
                    {article.publishedAt && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '.375rem', fontSize: '.78rem', color: 'var(--c-w35)' }}>
                        <Clock style={{ width: 13, height: 13 }} />
                        {format(new Date(article.publishedAt), 'dd MMM yyyy')}
                      </span>
                    )}
                    {(article.views ?? 0) > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '.375rem', fontSize: '.78rem', color: 'var(--c-w35)' }}>
                        <Eye style={{ width: 13, height: 13 }} />
                        {article.views?.toLocaleString()} wasomaji
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '.375rem', fontSize: '.78rem', color: 'var(--c-lime)', fontWeight: 700 }}>
                      <BookOpen style={{ width: 13, height: 13 }} />
                      Dakika {rt} kusoma · maneno {wc.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Excerpt / lead */}
                {article.excerpt && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .5, delay: .15 }}
                    style={{ position: 'relative', marginBottom: '2.5rem', paddingLeft: '1.5rem' }}
                  >
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, var(--c-lime), rgba(0,255,65,.2))', borderRadius: 4 }} />
                    <p style={{ fontSize: '1.15rem', lineHeight: 1.75, color: 'rgba(255,255,255,.72)', fontFamily: 'var(--f-display)', fontStyle: 'italic' }}>
                      {article.excerpt}
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Article prose */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: .7, delay: .2 }}
                className="prose-school article-enhanced"
                dangerouslySetInnerHTML={{ __html: formatArticleContent(article.content || '') }}
              />

              {/* ── BOTTOM SHARE ── */}
              <div style={{ marginTop: '4rem', padding: '2rem', borderRadius: '2rem', border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '.75rem', background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Share2 style={{ width: 16, height: 16, color: 'var(--c-lime)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '.875rem', fontWeight: 700, color: '#fff', margin: 0 }}>Shiriki Habari Hii</p>
                    <p style={{ fontSize: '.72rem', color: 'var(--c-w35)', margin: 0 }}>Saidia wengine kupata habari hii</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
                  {[
                    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${shareEnc}`, bg: 'rgba(59,89,152,.12)', border: 'rgba(59,89,152,.3)', color: '#7b9fd4', hoverBg: 'rgba(59,89,152,.25)' },
                    { label: 'Twitter / X', href: `https://twitter.com/intent/tweet?url=${shareEnc}&text=${shareText}`, bg: 'rgba(29,161,242,.1)', border: 'rgba(29,161,242,.25)', color: '#6ab4f5', hoverBg: 'rgba(29,161,242,.22)' },
                    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent((article.title || '') + '\n' + shareUrl)}`, bg: 'rgba(37,211,102,.1)', border: 'rgba(37,211,102,.25)', color: '#5ed99a', hoverBg: 'rgba(37,211,102,.22)' },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.625rem 1.25rem', borderRadius: '999px', background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: '.8125rem', fontWeight: 700, textDecoration: 'none', transition: 'all .2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = s.hoverBg}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = s.bg}
                    >
                      <ExternalLink style={{ width: 13, height: 13 }} /> {s.label}
                    </a>
                  ))}
                  <button onClick={copyLink}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.625rem 1.25rem', borderRadius: '999px', background: copied ? 'rgba(0,255,65,.15)' : 'rgba(255,255,255,.06)', border: `1px solid ${copied ? 'var(--c-bl)' : 'var(--c-border)'}`, color: copied ? 'var(--c-lime)' : 'var(--c-w50)', fontSize: '.8125rem', fontWeight: 700, cursor: 'pointer', transition: 'all .25s' }}
                  >
                    <AnimatePresence mode="wait">
                      {copied
                        ? <motion.span key="c" initial={{ scale: .7 }} animate={{ scale: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}><CheckCheck style={{ width: 14, height: 14 }} />Imenakiliwa!</motion.span>
                        : <motion.span key="l" initial={{ scale: .7 }} animate={{ scale: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}><Link2 style={{ width: 14, height: 14 }} />Nakili Kiungo</motion.span>
                      }
                    </AnimatePresence>
                  </button>
                </div>
              </div>

              {/* Back CTA */}
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Link href="/news"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '.625rem', padding: '.875rem 2.5rem', borderRadius: '999px', border: '1px solid var(--c-border)', color: 'var(--c-w50)', textDecoration: 'none', fontSize: '.875rem', fontWeight: 600, transition: 'all .25s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-bl)'; el.style.color = 'var(--c-lime)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-border)'; el.style.color = 'var(--c-w50)'; }}
                >
                  <ArrowLeft style={{ width: 15, height: 15 }} /> Angalia Habari Zingine
                </Link>
              </div>
            </main>

            {/* ── STICKY SIDEBAR ── */}
            <aside className="article-sidebar" style={{ position: 'sticky', top: 'calc(var(--nav-h) + 1.5rem)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Reading stats card */}
              <div style={{ borderRadius: '1.5rem', border: '1px solid var(--c-bl-sm)', background: 'var(--c-surface)', padding: '1.5rem', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--c-lime), rgba(0,255,65,.3), transparent)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '1.25rem' }}>
                  <Sparkles style={{ width: 15, height: 15, color: 'var(--c-lime)' }} />
                  <p style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--c-lime)', margin: 0 }}>Maelezo ya Makala</p>
                </div>

                {/* Circular progress */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', position: 'relative' }}>
                  <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={60} cy={60} r={50} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={8} />
                    <circle cx={60} cy={60} r={50} fill="none" stroke="#00FF41" strokeWidth={8}
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={2 * Math.PI * 50 - (scrollPct / 100) * 2 * Math.PI * 50}
                      style={{ transition: 'stroke-dashoffset .2s' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--f-display)', fontSize: '1.75rem', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1 }}>{Math.round(scrollPct)}%</p>
                    <p style={{ fontSize: '.62rem', color: 'var(--c-w35)', fontWeight: 600, margin: 0 }}>imesomwa</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.875rem' }}>
                  {[
                    { icon: Clock, val: `${rt} dak`, label: 'Muda wa kusoma' },
                    { icon: BookOpen, val: wc.toLocaleString(), label: 'Maneno' },
                    { icon: Eye, val: (article.views ?? 0).toLocaleString(), label: 'Wasomaji' },
                    { icon: Share2, val: 'Shiriki', label: 'Saidia wengine' },
                  ].map(({ icon: Icon, val, label }) => (
                    <div key={label} style={{ padding: '.875rem', borderRadius: '1rem', background: 'var(--c-lime-soft)', border: '1px solid var(--c-bl-sm)', textAlign: 'center' }}>
                      <Icon style={{ width: 14, height: 14, color: 'var(--c-lime)', margin: '0 auto .4rem' }} />
                      <p style={{ fontSize: '.875rem', fontWeight: 800, color: '#fff', margin: 0 }}>{val}</p>
                      <p style={{ fontSize: '.62rem', color: 'var(--c-w35)', margin: '.15rem 0 0', lineHeight: 1.3 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category + Tags */}
              {article.category && (
                <div style={{ borderRadius: '1.5rem', border: '1px solid var(--c-border)', background: 'var(--c-surface)', padding: '1.25rem' }}>
                  <p style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--c-w35)', margin: '0 0 .875rem' }}>Kundi</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.4rem 1rem', borderRadius: '999px', background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl)', color: 'var(--c-lime)', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    <Tag style={{ width: 11, height: 11 }} /> {article.category}
                  </span>
                </div>
              )}

              {/* More news CTA */}
              <Link href="/news"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.125rem 1.25rem', borderRadius: '1.25rem', border: '1px solid var(--c-border)', background: 'var(--c-surface)', textDecoration: 'none', transition: 'all .25s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-bl)'; el.style.background = 'var(--c-lime-hint)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-border)'; el.style.background = 'var(--c-surface)'; }}
              >
                <div>
                  <p style={{ fontSize: '.8rem', fontWeight: 700, color: '#fff', margin: 0 }}>Habari Zaidi</p>
                  <p style={{ fontSize: '.7rem', color: 'var(--c-w35)', margin: '.1rem 0 0' }}>Angalia habari zingine</p>
                </div>
                <ChevronRight style={{ width: 18, height: 18, color: 'var(--c-lime)' }} />
              </Link>
            </aside>
          </div>
        </div>
      </article>

      <style>{`
        @media(min-width: 960px) {
          .article-grid { grid-template-columns: 1fr 300px !important; }
          .article-float-share { display: flex !important; }
          .meta-divider { display: block !important; }
        }
        @media(max-width: 959px) {
          .article-float-share { display: none !important; }
          .meta-divider { display: none; }
          .article-sidebar { position: static !important; }
        }
        .article-enhanced p { margin-bottom: 1.4em; font-size: 1.05rem; line-height: 1.85; color: rgba(255,255,255,.72); }
        .article-enhanced h2 { font-size: 1.6rem; font-weight: 800; color: #fff; margin: 2.5em 0 .75em; font-family: var(--f-display); }
        .article-enhanced h3 { font-size: 1.2rem; font-weight: 700; color: rgba(255,255,255,.9); margin: 2em 0 .6em; }
        .article-enhanced strong { color: #fff; font-weight: 700; }
        .article-enhanced em { font-style: italic; color: rgba(255,255,255,.8); }
        .article-enhanced blockquote { border-left: 4px solid var(--c-lime); padding: 1.125rem 1.5rem; margin: 2rem 0; background: var(--c-lime-soft); border-radius: 0 1rem 1rem 0; font-style: italic; font-family: var(--f-display); font-size: 1.1rem; color: rgba(255,255,255,.75); }
        .article-enhanced ul, .article-enhanced ol { padding-left: 1.5rem; margin-bottom: 1.4em; }
        .article-enhanced li { margin-bottom: .5em; color: rgba(255,255,255,.7); line-height: 1.75; }
        .article-enhanced a { color: var(--c-lime); text-decoration: underline; text-decoration-color: rgba(0,255,65,.3); }
        .article-enhanced hr { border: none; border-top: 1px solid var(--c-border); margin: 2.5rem 0; }
      `}</style>
    </>
  );
}
