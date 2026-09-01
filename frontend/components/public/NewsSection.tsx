import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Newspaper } from 'lucide-react';
import { newsApi } from '@/lib/api';
import { NewsArticle } from '@/types';
import Reveal from '@/components/ui/Reveal';
import { format } from 'date-fns';

export const revalidate = 60; // sekunde 60 - data inasasishwa mara kwa mara

function isNew(date?: string) {
  if (!date) return false;
  return Date.now() - new Date(date).getTime() < 7 * 24 * 3600 * 1000;
}

function readingTime(text?: string) {
  if (!text) return 2;
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

export default async function NewsSection() {
  let news: NewsArticle[] = [];
  let hasError = false;
  try {
    const res = await newsApi.getPublished({ limit: 4 });
    news = res.data.news;
  } catch {
    hasError = true;
  }

  const [featured, ...rest] = news;

  return (
    <section className="section-padding relative overflow-hidden">
      {/* BG */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(0,255,65,.03) 0%, transparent 60%)' }} />
      <div className="pattern-dots pointer-events-none absolute inset-0 opacity-30" />

      <div className="site-container relative z-10">
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '3rem' }}>
          <div>
            <span className="section-label">Habari Mpya</span>
            <h2 className="section-title">
              Habari za{' '}
              <span className="font-display-italic" style={{ color: 'var(--c-lime)' }}>Hivi Karibuni</span>
            </h2>
            <p style={{ color: 'var(--c-w50)', fontSize: '.95rem', lineHeight: 1.7, maxWidth: 400 }}>
              Endelea kupata habari, matangazo na mafanikio ya shule yetu.
            </p>
          </div>
          <Link href="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.875rem', fontWeight: 700, color: 'var(--c-lime)', textDecoration: 'none' }}>
            Habari Zote <ArrowRight style={{ width: 15, height: 15 }} />
          </Link>
        </div>

        {hasError ? (
          <div style={{ borderRadius: '1.25rem', padding: '3rem', textAlign: 'center', border: '1px solid rgba(255,71,87,.2)', background: 'rgba(255,71,87,.04)' }}>
            <p style={{ color: 'rgba(255,255,255,.4)' }}>Imeshindikana kupakia habari. Jaribu tena baadaye.</p>
          </div>
        ) : news.length > 0 ? (
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
              <style>{`@media(min-width:1024px){.news-bento{grid-template-columns:1.45fr 1fr !important;}}`}</style>
              <div className="news-bento" style={{ display: 'contents' }}>

                {/* Featured */}
                {featured && (
                  <Link href={`/news/${featured.slug}`} className="media-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', height: 300, background: 'var(--c-surface)', flexShrink: 0, overflow: 'hidden' }}>
                      {featured.coverImage
                        ? <Image src={featured.coverImage} alt={featured.title} fill style={{ objectFit: 'cover', transition: 'transform .6s var(--ease-smooth)' }} />
                        : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Newspaper style={{ width: 40, height: 40, color: 'rgba(255,255,255,.08)' }} /></div>
                      }
                      <div className="media-hero__overlay" />
                      {/* Category + NEW badge */}
                      <div style={{ position: 'absolute', top: '.875rem', left: '.875rem', display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                        {featured.category && (
                          <span className="photo-badge" style={{ color: 'var(--c-lime)' }}>{featured.category}</span>
                        )}
                        {isNew(featured.publishedAt) && <span className="badge-new">MPYA</span>}
                      </div>
                    </div>
                    <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.72rem', color: 'var(--c-w35)' }}>
                          <Clock style={{ width: 11, height: 11 }} />
                          {featured.publishedAt ? format(new Date(featured.publishedAt), 'dd MMM yyyy') : ''}
                        </span>
                        <span style={{ fontSize: '.72rem', color: 'var(--c-w35)' }}>·</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.72rem', color: 'var(--c-w35)' }}>
                          ⏱ Dakika {readingTime(featured.excerpt)} kusoma
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: 1.3, letterSpacing: '-.01em' }}>
                        {featured.title}
                      </h3>
                      {featured.excerpt && (
                        <p style={{ fontSize: '.875rem', color: 'var(--c-w50)', lineHeight: 1.75, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                          {featured.excerpt}
                        </p>
                      )}
                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '.375rem', fontSize: '.8rem', fontWeight: 700, color: 'var(--c-lime)' }}>
                        Soma Zaidi <ArrowRight style={{ width: 14, height: 14 }} />
                      </div>
                    </div>
                  </Link>
                )}

                {/* Rest */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {rest.map(article => (
                    <Link key={article.id} href={`/news/${article.slug}`} className="media-card" style={{ display: 'flex', height: '100%' }}>
                      {/* Thumbnail */}
                      <div style={{ position: 'relative', width: 120, minWidth: 120, background: 'var(--c-surface)', overflow: 'hidden', flexShrink: 0 }}>
                        {article.coverImage
                          ? <Image src={article.coverImage} alt={article.title} fill style={{ objectFit: 'cover', transition: 'transform .6s ease' }} />
                          : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Newspaper style={{ width: 24, height: 24, color: 'rgba(255,255,255,.1)' }} /></div>
                        }
                        <div className="gallery-lime-tint" />
                      </div>
                      {/* Body */}
                      <div style={{ padding: '1.125rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.5rem', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                          {article.category && (
                            <span style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--c-lime)' }}>{article.category}</span>
                          )}
                          {isNew(article.publishedAt) && <span className="badge-new" style={{ fontSize: '.55rem' }}>MPYA</span>}
                        </div>
                        <h4 style={{ fontSize: '.9rem', fontWeight: 700, color: '#fff', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                          {article.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.68rem', color: 'var(--c-w35)', marginTop: 'auto' }}>
                          <Clock style={{ width: 10, height: 10 }} />
                          {article.publishedAt ? format(new Date(article.publishedAt), 'dd MMM yyyy') : ''}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ) : (
          <div style={{ padding: '5rem 0', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '1.5rem', background: 'rgba(0,255,65,.06)', border: '1px solid rgba(0,255,65,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Newspaper style={{ width: 36, height: 36, color: 'rgba(255,255,255,.15)' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,.3)' }}>Habari zitaongezwa hivi karibuni</p>
          </div>
        )}
      </div>
    </section>
  );
}