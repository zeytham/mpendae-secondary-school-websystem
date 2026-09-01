'use client';

import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useRef, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, GraduationCap, Users, Award, MapPin } from 'lucide-react';

interface HeroProps { images: string[]; }

const SLIDES = [
  { headline: 'Elimu ya', highlight: 'Ubora', sub: 'Mpendae Secondary School — Zanzibar' },
  { headline: 'Viongozi wa', highlight: 'Kesho', sub: 'Tunaowaandaa Tangu Leo' },
  { headline: 'Sayansi na', highlight: 'Utamaduni', sub: 'Mitaala ya Kimataifa · Since 1990' },
];

const SLIDE_DUR = 5500;

const FLOAT_BADGES = [
  { icon: Award,       label: 'NECTA Toppers', sub: 'Wahitimu bora' },
  { icon: GraduationCap, label: '1000+ Wahitimu', sub: 'Tangu 1990' },
  { icon: MapPin,      label: 'Zanzibar', sub: 'Tanzania' },
];

export default function Hero({ images }: HeroProps) {
  const SLIDE_DUR_REF = useRef(SLIDE_DUR);
  const autoplay = useRef(Autoplay({ delay: SLIDE_DUR_REF.current, stopOnInteraction: false }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplay.current]);
  const [index, setIndex]   = useState(0);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY]  = useState(0);
  const hasImg = images.length > 0;
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  /* Parallax */
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* Slide select */
  useEffect(() => {
    if (!emblaApi) return;
    const fn = () => setIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', fn);
    return () => { emblaApi.off('select', fn); };
  }, [emblaApi]);

  /* Progress bar */
  useEffect(() => {
    setProgress(0);
    if (progRef.current) clearInterval(progRef.current);
    const step = 100 / (SLIDE_DUR / 50);
    let val = 0;
    progRef.current = setInterval(() => {
      val = Math.min(val + step, 100);
      setProgress(val);
      if (val >= 100) { val = 0; setProgress(0); }
    }, 50);
    return () => { if (progRef.current) clearInterval(progRef.current); };
  }, [index]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const slide = SLIDES[index % SLIDES.length];

  return (
    <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

      {/* BG slideshow */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {hasImg ? (
          <div style={{ height: '100%', transform: `translateY(${scrollY * 0.3}px)`, willChange: 'transform' }}>
            <div style={{ height: '100%' }} ref={emblaRef}>
              <div style={{ display: 'flex', height: '100%' }}>
                {images.map((src, i) => (
                  <div key={i} style={{ position: 'relative', height: '100%', minWidth: 0, flex: '0 0 100%', overflow: 'hidden' }}>
                    <Image
                      src={src}
                      alt={`Mpendae ${i + 1}`}
                      fill
                      priority={i === 0}
                      style={{
                        objectFit: 'cover',
                        transform: index === i ? 'scale(1.06)' : 'scale(1)',
                        transition: 'transform 8s ease',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="pattern-grid" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#050805 0%,#0f1a0b 60%,#050805 100%)' }} />
            {/* Animated blobs */}
            {[
              { top: '20%', left: '60%', size: 400, delay: '0s' },
              { top: '60%', left: '20%', size: 300, delay: '3s' },
              { top: '10%', left: '10%', size: 200, delay: '6s' },
            ].map((b, i) => (
              <div key={i} className="login-orb" style={{ top: b.top, left: b.left, width: b.size, height: b.size, background: 'radial-gradient(circle, rgba(0,255,65,.06) 0%, transparent 70%)', animationDelay: b.delay, animationDuration: `${8 + i * 2}s` }} />
            ))}
          </>
        )}

        {/* Gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg,rgba(5,8,5,.52) 0%,rgba(5,8,5,.22) 30%,rgba(5,8,5,.7) 70%,rgba(5,8,5,.98) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(90deg,rgba(5,8,5,.9) 0%,rgba(5,8,5,.5) 40%,transparent 65%)' }} />
      </div>

      {/* Content */}
      <div className="site-container" style={{ position: 'relative', zIndex: 10, paddingTop: 'calc(var(--nav-h) + var(--announce-h) + 3rem)', paddingBottom: '9rem' }}>
        <div style={{ maxWidth: 660 }}>

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -16 }}
            transition={{ duration: .55, delay: .1 }}
            style={{ marginBottom: '2rem' }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '.625rem',
              padding: '.4rem 1.2rem', borderRadius: '999px',
              background: 'rgba(0,255,65,.08)', border: '1px solid rgba(0,255,65,.22)',
              fontSize: '.68rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-lime)',
            }}>
              <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--c-lime)', animation: 'pulseBig 2s ease-in-out infinite' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-lime)', display: 'block', position: 'relative' }} />
              </span>
              Zanzibar · Tanzania · Est. 1990
            </span>
          </motion.div>

          {/* Headline — clip-path reveal on slide change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: .6, ease: [.22, 1, .36, 1] }}
            >
              <h1 style={{
                fontFamily: 'var(--f-head)',
                fontSize: 'clamp(3rem,9vw,6.75rem)',
                fontWeight: 900,
                lineHeight: .92,
                letterSpacing: '-0.03em',
                marginBottom: '1.5rem',
                color: '#fff',
              }}>
                {slide.headline}<br />
                <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', color: 'var(--c-lime)', animation: 'neonFlick 6s ease-in-out infinite' }}>
                  {slide.highlight}
                </span>
              </h1>
              <p style={{ fontSize: '.78rem', fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: '1.5rem' }}>
                {slide.sub}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ duration: .7, delay: .6 }}
            style={{ fontSize: '1.08rem', lineHeight: 1.82, color: 'rgba(255,255,255,.52)', marginBottom: '2.5rem', maxWidth: 500 }}
          >
            Shule inayounda viongozi wa kesho kupitia elimu bora, thamani imara na mazingira yanayoinspire kila siku.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 18 }}
            transition={{ duration: .55, delay: .78 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}
          >
            <Link href="/admissions" className="btn-hero">
              Jiandikishe Sasa <ArrowRight style={{ width: 18, height: 18 }} />
            </Link>
            <Link href="/about" className="btn-hero-outline">
              Jifunze Zaidi
            </Link>
          </motion.div>

          {/* Stat pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ duration: .6, delay: 1 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}
          >
            {[
              { Icon: GraduationCap, label: '1000+ Wahitimu' },
              { Icon: Users,         label: '200+ Wanafunzi' },
              { Icon: Award,         label: 'NECTA Wabora' },
            ].map(({ Icon, label }) => (
              <div key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                padding: '.45rem 1rem', borderRadius: '999px',
                background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                fontSize: '.75rem', fontWeight: 600, color: 'rgba(255,255,255,.62)',
              }}>
                <Icon style={{ width: 13, height: 13, color: 'var(--c-lime)', flexShrink: 0 }} />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating badges — desktop only */}
        <div style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', display: 'none', flexDirection: 'column', gap: '1rem', zIndex: 20 }} className="hero-float-badges">
          {FLOAT_BADGES.map(({ icon: Icon, label, sub }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : 20 }}
              transition={{ duration: .5, delay: 1 + i * 0.15 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '.75rem',
                padding: '.875rem 1.125rem',
                background: 'rgba(5,8,5,.88)', border: '1px solid rgba(255,255,255,.1)',
                borderRadius: '1rem', backdropFilter: 'blur(14px)',
                animation: `floatY ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`,
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '.625rem', background: 'rgba(0,255,65,.1)', border: '1px solid rgba(0,255,65,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: 16, height: 16, color: 'var(--c-lime)' }} />
              </div>
              <div>
                <p style={{ fontSize: '.8rem', fontWeight: 700, color: '#fff', margin: 0 }}>{label}</p>
                <p style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.4)', margin: 0 }}>{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Slide progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, height: '2px', background: 'rgba(255,255,255,.08)' }}>
        <div style={{ height: '100%', background: 'var(--c-lime)', width: `${progress}%`, transition: 'width .05s linear', boxShadow: '0 0 8px rgba(0,255,65,.6)' }} />
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}
      >
        <div style={{ width: 1, height: 44, background: 'linear-gradient(180deg,var(--c-lime),transparent)' }} />
        <span style={{ fontSize: '.62rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.18)' }}>Scrollisha</span>
      </motion.div>

      {/* Carousel controls */}
      {hasImg && images.length > 1 && (
        <>
          <div style={{ position: 'absolute', bottom: '3rem', right: '2rem', zIndex: 20, display: 'flex', gap: '.5rem' }}>
            <button onClick={prev} className="hero-nav-btn" aria-label="Slide iliyopita"><ChevronLeft style={{ width: 18, height: 18 }} /></button>
            <button onClick={next} className="hero-nav-btn" aria-label="Slide inayofuata"><ChevronRight style={{ width: 18, height: 18 }} /></button>
          </div>
          <div style={{ position: 'absolute', bottom: '3rem', right: '8rem', zIndex: 20, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => emblaApi?.scrollTo(i)} className={`hero-dot${index === i ? ' active' : ''}`} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
          <div style={{ position: 'absolute', top: 'calc(var(--nav-h) + var(--announce-h) + 1.5rem)', right: '2rem', zIndex: 20, fontSize: '.75rem', fontWeight: 700, color: 'rgba(255,255,255,.35)', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
            <span style={{ fontSize: '1.1rem', color: 'var(--c-lime)', fontFamily: 'var(--f-display)', fontStyle: 'italic' }}>{String(index + 1).padStart(2, '0')}</span>
            <span>/</span>
            <span>{String(images.length).padStart(2, '0')}</span>
          </div>
        </>
      )}

      <style>{`
        @media(min-width:1024px){
          .hero-float-badges { display:flex !important; }
        }
      `}</style>
    </section>
  );
}