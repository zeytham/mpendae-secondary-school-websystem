'use client';

import Link from 'next/link';
import { useRef, useCallback, useEffect, useState, MouseEvent } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { BookOpen, Microscope, Calculator, Globe2, Palette, ArrowUpRight, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

const PACKAGES = [
  {
    id: 'form1',
    level: 'Form I',
    badge: 'Darasa la Kwanza',
    icon: BookOpen,
    featured: true,
    headline: 'Msingi wa Elimu Bora',
    desc: 'Anza safari yako ya elimu ya sekondari kwenye mazingira bora ya kujifunzia. Form I inakupatia msingi imara wa masomo yote ya msingi.',
    requirements: ['PSLE / Mtihani wa Darasa la 7', 'Fomu ya maombi iliyojazwa', 'Cheti cha kuzaliwa', 'Picha 4 za pasipoti'],
    slots: 'Nafasi 80',
  },
  {
    id: 'form2',
    level: 'Form II',
    badge: 'Darasa la Pili',
    icon: Calculator,
    featured: false,
    headline: 'Kuendelea kwa Nguvu',
    desc: 'Form II inaboreshea wanafunzi uwezo wa kuchambua, kuelewa na kushindana katika masomo ya kisayansi na kiubunifu.',
    requirements: ['Cheti cha Form I', 'Matokeo mazuri ya awali', 'Barua ya uhamisho', 'Kibali cha wazazi'],
    slots: 'Nafasi Chache',
  },
  {
    id: 'form3',
    level: 'Form III',
    badge: 'O-Level Advanced',
    icon: Microscope,
    featured: false,
    headline: 'Hatua ya Utaalamu',
    desc: 'Wanafunzi wa Form III wanaanza kuchagua maeneo ya utaalamu — Sayansi, Sanaa au Biashara — wakijiandaa kwa NECTA.',
    requirements: ['Cheti cha Form II', 'Matokeo ya B au zaidi', 'Barua ya uhamisho', 'Uchaguzi wa mkondo'],
    slots: 'Nafasi 60',
  },
  {
    id: 'form5',
    level: 'Form V',
    badge: 'A-Level',
    icon: Globe2,
    featured: false,
    headline: 'Kiwango cha Juu',
    desc: 'Programu yetu ya A-Level inayofundishwa na walimu wa uzoefu. Mkondo wa Sayansi au Sanaa unaokuandalia chuo kikuu.',
    requirements: ['Cheti cha NECTA O-Level', 'Daraja la Division I au II', 'Barua ya maombi', 'Mahojiano ya kibinafsi'],
    slots: 'Nafasi 40',
  },
  {
    id: 'sanaa',
    level: 'Sanaa',
    badge: 'Mkondo wa Sanaa',
    icon: Palette,
    featured: false,
    headline: 'Ubunifu na Utamaduni',
    desc: 'Mkondo wa Sanaa na Utamaduni unaochanganya masomo ya kawaida na taaluma za ubunifu, sanaa za maonyesho na lugha.',
    requirements: ['Cheti cha darasa lolote', 'Maonyesho ya kipaji', 'Barua ya maombi', 'Kibali cha wazazi'],
    slots: 'Nafasi 30',
  },
];

const CARD_W = 380;

function TiltCard({ children, featured }: { children: React.ReactNode; featured: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-80, 80], [8, -8]);
  const rotateY = useTransform(x, [-80, 80], [-8, 8]);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000, flex: `0 0 ${CARD_W}px`, maxWidth: CARD_W, minWidth: 280, position: 'relative' }}
      className={`pkg-card${featured ? ' featured' : ''}`}
    >
      {/* Glow halo for featured */}
      {featured && (
        <div style={{
          position: 'absolute', inset: -20, borderRadius: '2rem',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,255,65,.18) 0%, transparent 70%)',
          pointerEvents: 'none', animation: 'glowPulse 3s ease-in-out infinite',
        }} />
      )}
      {children}
    </motion.div>
  );
}

export default function PackagesSection() {
  const autoplay = useRef(Autoplay({ delay: 4800, stopOnInteraction: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', slidesToScroll: 1 },
    [autoplay.current]
  );
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const fn = () => setIdx(emblaApi.selectedScrollSnap());
    emblaApi.on('select', fn);
    return () => { emblaApi.off('select', fn); };
  }, [emblaApi]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section style={{ padding: 'var(--section-py) 0', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle lime glow BG */}
      <div style={{
        position: 'absolute', top: '50%', right: '-10%', transform: 'translateY(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,65,.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="site-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '3rem' }}>
          <div>
            <span className="section-label">Usajili</span>
            <h2 className="section-title">
              Programu za{' '}
              <span className="font-display-italic" style={{ color: 'var(--c-lime)' }}>Masomo</span>
            </h2>
            <p style={{ color: 'var(--c-w50)', fontSize: '.95rem', lineHeight: 1.7, maxWidth: 400 }}>
              Chagua ngazi inayokufaa — elimu kamili kutoka Form I hadi A-Level.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button onClick={prev} className="hero-nav-btn" aria-label="Iliyopita"><ChevronLeft style={{ width: 18, height: 18 }} /></button>
            <button onClick={next} className="hero-nav-btn" aria-label="Inayofuata"><ChevronRight style={{ width: 18, height: 18 }} /></button>
            <Link href="/admissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.875rem', fontWeight: 700, color: 'var(--c-lime)', textDecoration: 'none' }}>
              Zote <ArrowUpRight style={{ width: 15, height: 15 }} />
            </Link>
          </div>
        </div>

        {/* Carousel */}
        <div style={{ overflow: 'hidden', margin: '0 -0.5rem' }} ref={emblaRef}>
          <div style={{ display: 'flex', gap: '1.25rem', padding: '0.5rem 0.5rem 1.5rem' }}>
            {PACKAGES.map(pkg => {
              const Icon = pkg.icon;
              return (
                <TiltCard key={pkg.id} featured={pkg.featured}>
                  {/* Top accent stripe */}
                  <div className="pkg-stripe" />

                  {/* Body — proper padding, no text cramping */}
                  <div className="pkg-body">
                    {/* Icon + badge row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.75rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem' }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: '0.875rem', flexShrink: 0,
                          background: pkg.featured ? 'var(--c-lime)' : 'rgba(0,255,65,.1)',
                          border: `1px solid ${pkg.featured ? 'var(--c-lime)' : 'rgba(0,255,65,.2)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon style={{ width: 24, height: 24, color: pkg.featured ? 'var(--c-bg)' : 'var(--c-lime)' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--c-lime)', marginBottom: '.2rem' }}>
                            {pkg.badge}
                          </p>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                            {pkg.level}
                          </h3>
                        </div>
                      </div>
                      {pkg.featured && (
                        <span style={{
                          padding: '.25rem .75rem', borderRadius: '999px', flexShrink: 0,
                          background: 'var(--c-lime)', color: 'var(--c-bg)',
                          fontSize: '.65rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
                        }}>
                          Maarufu
                        </span>
                      )}
                    </div>

                    {/* Headline */}
                    <h4 style={{
                      fontFamily: 'var(--f-display)', fontStyle: 'italic',
                      fontSize: '1.05rem', fontWeight: 600, color: 'rgba(255,255,255,.8)',
                      marginBottom: '.875rem', lineHeight: 1.3,
                    }}>
                      {pkg.headline}
                    </h4>

                    {/* Description */}
                    <p style={{ fontSize: '.875rem', lineHeight: 1.8, color: 'var(--c-w50)', marginBottom: '1.5rem', flexGrow: 1 }}>
                      {pkg.desc}
                    </p>

                    {/* Divider */}
                    <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(0,255,65,.15), transparent)', marginBottom: '1.25rem' }} />

                    {/* Requirements */}
                    <p style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--c-w35)', marginBottom: '.75rem' }}>
                      Mahitaji
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                      {pkg.requirements.map(r => (
                        <li key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: '.625rem' }}>
                          <CheckCircle2 style={{ width: 15, height: 15, color: 'var(--c-lime)', flexShrink: 0, marginTop: '0.15rem' }} />
                          <span style={{ fontSize: '.825rem', color: 'var(--c-w70)', lineHeight: 1.4 }}>{r}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.75rem', marginTop: 'auto' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '.35rem',
                        padding: '.3rem .875rem', borderRadius: '999px',
                        background: pkg.slots.includes('Chache') ? 'rgba(255,165,2,.1)' : 'rgba(0,255,65,.08)',
                        border: `1px solid ${pkg.slots.includes('Chache') ? 'rgba(255,165,2,.3)' : 'rgba(0,255,65,.18)'}`,
                        fontSize: '.72rem', fontWeight: 700,
                        color: pkg.slots.includes('Chache') ? '#ffa502' : 'var(--c-lime)',
                      }}>
                        {pkg.slots.includes('Chache') && <AlertCircle style={{ width: 11, height: 11 }} />}
                        {pkg.slots}
                      </span>
                      <Link
                        href="/admissions"
                        className="btn-primary"
                        style={{ padding: '.55rem 1.25rem', fontSize: '.78rem', borderRadius: '999px' }}
                      >
                        Omba <ArrowUpRight style={{ width: 13, height: 13 }} />
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '.5rem' }}>
          {PACKAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`hero-dot${idx === i ? ' active' : ''}`}
              aria-label={`Programu ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
