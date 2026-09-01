'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { newsApi } from '@/lib/api';
import { NewsArticle, Pagination } from '@/types';
import { Newspaper, Clock, ArrowRight, Search, Eye, TrendingUp, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = ['Zote','Matokeo','Matangazo','Maendeleo','Michezo','Sherehe','Habari','Elimu'];

const readingTime = (text: string) => Math.max(1, Math.ceil((text || '').split(' ').length / 200));

const isNew = (dateStr?: string) => {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) < 7 * 24 * 60 * 60 * 1000;
};

const getCategoryColor = (cat: string) => {
  const m: Record<string, string> = {
    Matokeo: 'var(--c-lime)', Michezo: '#F59E0B', Matangazo: '#60A5FA',
    Maendeleo: '#A78BFA', Sherehe: '#F472B6', Habari: 'var(--c-lime)', Elimu: '#34D399',
  };
  return m[cat] || 'var(--c-lime)';
};

function SkeletonCard({ large = false }: { large?: boolean }) {
  return (
    <div style={{ borderRadius:'1.5rem', overflow:'hidden', background:'var(--c-surface)', border:'1px solid var(--c-border)', height: large ? 520 : 340 }}>
      <div style={{ height: large ? 320 : 200, background:'var(--c-bg2)', position:'relative', overflow:'hidden' }}>
        <div className="skeleton-shimmer" style={{ position:'absolute', inset:0 }} />
      </div>
      <div style={{ padding:'1.5rem' }}>
        <div className="skeleton-shimmer" style={{ height:12, width:'40%', borderRadius:6, marginBottom:'.875rem' }} />
        <div className="skeleton-shimmer" style={{ height:18, width:'90%', borderRadius:6, marginBottom:'.5rem' }} />
        <div className="skeleton-shimmer" style={{ height:18, width:'65%', borderRadius:6, marginBottom:'1rem' }} />
        {large && <div className="skeleton-shimmer" style={{ height:13, width:'80%', borderRadius:6, marginBottom:'.4rem' }} />}
        {large && <div className="skeleton-shimmer" style={{ height:13, width:'60%', borderRadius:6 }} />}
      </div>
    </div>
  );
}

function ArticleCard({ article, featured = false, index = 0 }: { article: NewsArticle; featured?: boolean; index?: number }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rt = readingTime(article.excerpt || article.content || '');
  const fresh = isNew(article.publishedAt);
  const catColor = getCategoryColor(article.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .5, delay: index * .07, ease: 'easeOut' }}
    >
      <Link href={`/news/${article.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div
          ref={cardRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            height: '100%', display: 'flex', flexDirection: featured ? 'row' : 'column',
            borderRadius: '1.5rem', overflow: 'hidden',
            border: `1px solid ${hovered ? 'rgba(0,255,65,.28)' : 'var(--c-border)'}`,
            background: 'var(--c-surface)',
            boxShadow: hovered ? '0 28px 60px rgba(0,0,0,.45), 0 0 0 1px rgba(0,255,65,.12)' : '0 4px 20px rgba(0,0,0,.2)',
            transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
            transition: 'all .35s cubic-bezier(.22,1,.36,1)',
          }}
        >
          {/* Image */}
          <div style={{
            position: 'relative',
            flexShrink: 0,
            height: featured ? '100%' : 200,
            width: featured ? '42%' : '100%',
            background: 'var(--c-bg2)',
            overflow: 'hidden',
          }}>
            {article.coverImage
              ? <Image
                  src={article.coverImage} alt={article.title} fill
                  style={{ objectFit: 'cover', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform .6s ease' }}
                />
              : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Newspaper style={{ width: 40, height: 40, color: 'rgba(255,255,255,.06)' }} />
                </div>
            }
            {/* Gradient */}
            <div style={{
              position: 'absolute', inset: 0,
              background: featured
                ? 'linear-gradient(90deg, transparent 60%, rgba(5,8,5,.85) 100%)'
                : 'linear-gradient(180deg, transparent 40%, rgba(5,8,5,.8) 100%)',
              opacity: hovered ? 1 : .7, transition: 'opacity .35s',
            }} />
            {/* Lime tint on hover */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,255,65,.1)',
              opacity: hovered ? 1 : 0, transition: 'opacity .35s',
            }} />
            {/* Category badge */}
            {article.category && (
              <span style={{
                position: 'absolute', top: '.875rem', left: '.875rem',
                padding: '.25rem .7rem', borderRadius: 999,
                background: 'rgba(5,8,5,.75)', backdropFilter: 'blur(8px)',
                border: `1px solid ${catColor}40`,
                fontSize: '.65rem', fontWeight: 700, color: catColor,
                letterSpacing: '.07em', textTransform: 'uppercase',
              }}>
                {article.category}
              </span>
            )}
            {/* NEW badge */}
            {fresh && (
              <span style={{
                position: 'absolute', top: '.875rem', right: '.875rem',
                padding: '.22rem .6rem', borderRadius: 999,
                background: 'rgba(0,255,65,.15)', border: '1px solid rgba(0,255,65,.4)',
                fontSize: '.6rem', fontWeight: 800, color: 'var(--c-lime)',
                letterSpacing: '.08em', display: 'flex', alignItems: 'center', gap: '.3rem',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--c-lime)', animation: 'pulseRing 1.5s ease infinite', display: 'inline-block' }} />
                MPYA
              </span>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: featured ? '2rem 2.5rem' : '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem', marginBottom: '.875rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.68rem', color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>
                <Clock style={{ width: 11, height: 11 }} />
                {article.publishedAt ? format(new Date(article.publishedAt), 'dd MMM yyyy') : ''}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.68rem', color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>
                <BookOpen style={{ width: 11, height: 11 }} />
                {rt} dak kusoma
              </span>
              {(article.views ?? 0) > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.68rem', color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>
                  <Eye style={{ width: 11, height: 11 }} />
                  {article.views}
                </span>
              )}
            </div>

            <h2 style={{
              fontSize: featured ? '1.45rem' : '1rem',
              fontWeight: 800, color: '#fff', lineHeight: 1.4,
              marginBottom: '.875rem', flex: featured ? 0 : 1,
              display: '-webkit-box', WebkitLineClamp: featured ? 3 : 2,
              WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
              letterSpacing: '-.01em',
            }}>
              {article.title}
            </h2>

            {article.excerpt && (
              <p style={{
                fontSize: featured ? '.92rem' : '.83rem',
                color: 'rgba(255,255,255,.45)', lineHeight: 1.7,
                marginBottom: '1.25rem', flex: 1,
                display: '-webkit-box', WebkitLineClamp: featured ? 4 : 2,
                WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
              }}>
                {article.excerpt}
              </p>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(0,255,65,.18), transparent)', margin: '0 0 1rem' }} />

            {/* Read more */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.375rem', fontSize: '.82rem', fontWeight: 700, color: 'var(--c-lime)' }}>
              Soma Zaidi
              <ArrowRight style={{ width: 14, height: 14, transform: hovered ? 'translateX(5px)' : 'translateX(0)', transition: 'transform .25s' }} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 9, pages: 1 });
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeIndicator, setActiveIndicator] = useState({ left: 0, width: 0 });
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const fetchNews = async (page = 1, cat = '') => {
    setLoading(true);
    try {
      const res = await newsApi.getPublished({ page, limit: 9, ...(cat && { category: cat }) });
      setNews(res.data.news);
      setPagination(res.data.pagination);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchNews(1, category); }, [category]);

  // Update sliding indicator
  useEffect(() => {
    const activeIdx = CATEGORIES.findIndex(c => (c === 'Zote' ? '' : c) === category);
    const el = pillRefs.current[activeIdx];
    if (el) setActiveIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [category]);

  const displayed = search.trim()
    ? news.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    : news;

  const featured = displayed[0];
  const rest = displayed.slice(1);

  const pages = Array.from({ length: pagination.pages }, (_, i) => i + 1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>

      {/* ── HERO ── */}
      <div style={{
        paddingTop: 'calc(var(--nav-h) + 5rem)', paddingBottom: '5rem',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, var(--c-bg2) 0%, var(--c-surface) 100%)',
      }}>
        <div className="pattern-grid" style={{ position: 'absolute', inset: 0, opacity: .35, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="site-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Section label */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .08 }}>
            <span className="section-label" style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
              <TrendingUp style={{ width: 14, height: 14 }} /> Habari & Matangazo
            </span>
          </motion.div>

          {/* Kinetic heading */}
          <div style={{ overflow: 'hidden', marginBottom: '1.25rem', marginTop: '.75rem' }}>
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: .65, delay: .18, ease: [.22, 1, .36, 1] }}
              style={{
                fontFamily: 'var(--f-display)', fontSize: 'clamp(2.8rem,8vw,5.5rem)',
                fontWeight: 800, color: '#fff', lineHeight: 1.05, letterSpacing: '-.025em',
                margin: 0,
              }}
            >
              Habari{' '}
              <motion.span
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: .65, delay: .32, ease: [.22, 1, .36, 1] }}
                style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}
              >
                &amp; Matangazo
              </motion.span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55, delay: .44 }}
            style={{ color: 'rgba(255,255,255,.5)', fontSize: '1.05rem', maxWidth: 440, margin: '0 auto 2.5rem' }}
          >
            Endelea kupata habari mpya, matangazo, na mafanikio ya shule yetu.
          </motion.p>

          {/* Glassmorphism search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .54 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '.75rem',
              background: 'rgba(255,255,255,.06)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,.12)', borderRadius: 999,
              padding: '.65rem 1.4rem', maxWidth: 420, width: '100%',
            }}
          >
            <Search style={{ width: 18, height: 18, color: 'rgba(255,255,255,.35)', flexShrink: 0 }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tafuta habari..."
              style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '.9rem', width: '100%' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 1.1+'rem', lineHeight: 1 }}>×</button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <section style={{ padding: '4rem 0 7rem' }}>
        <div className="site-container">

          {/* Sliding category pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .1 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', justifyContent: 'center', marginBottom: '3.5rem', position: 'relative' }}
          >
            {CATEGORIES.map((c, i) => {
              const isActive = (c === 'Zote' ? '' : c) === category;
              return (
                <button
                  key={c}
                  ref={el => { pillRefs.current[i] = el; }}
                  onClick={() => setCategory(c === 'Zote' ? '' : c)}
                  style={{
                    padding: '.45rem 1.15rem', borderRadius: 999, cursor: 'pointer',
                    fontSize: '.85rem', fontWeight: 700, border: 'none', outline: 'none',
                    background: isActive ? 'rgba(0,255,65,.12)' : 'rgba(255,255,255,.04)',
                    color: isActive ? 'var(--c-lime)' : 'rgba(255,255,255,.5)',
                    boxShadow: isActive ? 'inset 0 0 0 1px rgba(0,255,65,.35)' : 'inset 0 0 0 1px rgba(255,255,255,.08)',
                    transition: 'all .25s',
                    position: 'relative',
                  }}
                >
                  {c}
                  {isActive && (
                    <motion.div layoutId="pill-underline" style={{
                      position: 'absolute', bottom: -2, left: '15%', right: '15%', height: 2,
                      background: 'var(--c-lime)', borderRadius: 2,
                    }} />
                  )}
                </button>
              );
            })}
          </motion.div>

          {/* Articles */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} large={i === 1} />)}
                </div>
              </motion.div>
            ) : displayed.length === 0 ? (
              <motion.div
                key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', padding: '5rem 0' }}
              >
                <Newspaper style={{ width: 64, height: 64, color: 'rgba(255,255,255,.08)', margin: '0 auto 1.5rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: '.5rem' }}>Hakuna Habari</h3>
                <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '.9rem' }}>Jaribu kubadilisha kichujio au maneno ya utafutaji.</p>
              </motion.div>
            ) : (
              <motion.div key={category + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .3 }}>

                {/* Featured article (bento large) */}
                {featured && !search && (
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ height: 480 }}>
                      <ArticleCard article={featured} featured index={0} />
                    </div>
                  </div>
                )}

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {(search ? displayed : rest).map((article, i) => (
                    <ArticleCard key={article.id} article={article} index={i + 1} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Numbered pagination */}
          {pagination.pages > 1 && !loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.5rem', marginTop: '3.5rem', flexWrap: 'wrap' }}
            >
              {pages.map(p => (
                <button
                  key={p}
                  onClick={() => fetchNews(p, category)}
                  style={{
                    width: 40, height: 40, borderRadius: '.75rem', cursor: 'pointer',
                    border: p === pagination.page ? 'none' : '1px solid rgba(255,255,255,.1)',
                    background: p === pagination.page ? 'var(--c-lime)' : 'rgba(255,255,255,.04)',
                    color: p === pagination.page ? '#050805' : 'rgba(255,255,255,.55)',
                    fontWeight: p === pagination.page ? 800 : 600, fontSize: '.875rem',
                    transition: 'all .2s',
                  }}
                >
                  {p}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
