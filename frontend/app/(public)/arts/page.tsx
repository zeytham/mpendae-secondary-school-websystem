'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Palette, Music, Theater, Trophy, Star, Users, Calendar,
  ArrowLeft, ChevronRight, Mic, Drum, Heart, Globe,
  CheckCircle2, Play, Award, Sparkles, Quote,
  ArrowRight, Clock, Zap, ImageIcon,
} from 'lucide-react';
import { eventsApi, galleryApi, settingsApi } from '@/lib/api';

interface ApiEvent {
  _id: string;
  title: string;
  date: string;
  description?: string;
  status?: string;
}

interface GalleryItem {
  id?: string;
  _id?: string;
  url?: string;
  imageUrl?: string;
  title?: string;
  caption?: string;
  description?: string;
  album?: string;
}

function getEmbedUrl(url?: string): string {
  if (!url) return 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0';
  let clean = url.trim();
  if (clean.includes('youtube.com/watch?v=')) {
    const id = clean.split('v=')[1]?.split('&')[0];
    if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0`;
  }
  if (clean.includes('youtu.be/')) {
    const id = clean.split('youtu.be/')[1]?.split('?')[0];
    if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0`;
  }
  return clean;
}

/* ── Animated Number ── */
function AnimNum({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end center'] });
  useEffect(() => {
    const unsub = scrollYProgress.on('change', v => {
      if (v > 0.05) setVal(Math.round(target * Math.min(v * 2.5, 1)));
    });
    return unsub;
  }, [target, scrollYProgress]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* Programs — structure only, no per-item colors. All styling uses --c-lime tokens. */
const PROGRAMS = [
  { id: 'visual-arts', num: '01', icon: Palette, name: 'Sanaa ya Kuona', subtitle: 'Visual Arts', desc: 'Programu ya sanaa inayofundisha michoro, uchoraji wa rangi, usanifu wa nyumba, na sanamu. Wanafunzi wetu wameshinda tuzo nyingi za sanaa katika ngazi za taifa na kimataifa.', activities: ['Michoro ya mkono', 'Uchoraji wa rangi', 'Uchongaji', 'Digital art'], achievements: ['Shindano la SUZA 2025 — Nafasi ya 1', 'Sanaa Bora — Kikao cha Zanzibar 2024'], students: 85, awards: 12 },
  { id: 'music', num: '02', icon: Music, name: 'Muziki', subtitle: 'Music & Performance', desc: 'Tunayo bendi ya shule, kwaya, na kikundi cha taarab ya kisasa. Wanafunzi hujifunza ala za muziki kama gitaa, piano, ngoma pamoja na nadharia ya muziki.', activities: ['Bendi ya shule', 'Kwaya ya shule', 'Taarab ya kisasa', 'Nadharia ya muziki'], achievements: ['Shindano la Kwaya Zanzibar 2025 — Nafasi ya 2', 'Tamasha la Muziki — Washindi 2024'], students: 120, awards: 8 },
  { id: 'drama', num: '03', icon: Theater, name: 'Mchezo wa Kuigiza', subtitle: 'Drama & Theatre', desc: 'Kikundi cha mchezo wa kuigiza kinachofanya maonyesho mwaka mzima. Wanafunzi hujifunza uigizaji, kuandika hati, na uelewa wa fasihi kupitia sanaa ya kuigiza.', activities: ['Maonyesho ya mwaka', 'Michezo ya Kiswahili', 'Maonyesho ya Kiingereza', 'Improvisation'], achievements: ['Mchezo Bora — Tamasha la Utamaduni 2025', 'Mwandishi Bora — BAKIZA 2024'], students: 60, awards: 7 },
  { id: 'culture', num: '04', icon: Globe, name: 'Utamaduni wa Zanzibar', subtitle: 'Zanzibari Culture', desc: 'Programu maalum inayohifadhi na kueneza utamaduni wa Zanzibar — ngoma za asili, mavazi ya kitamaduni, mapishi ya jadi, na historia ya visiwa vyetu.', activities: ['Ngoma za asili', 'Mavazi ya kitamaduni', 'Fasihi ya Zanzibar', 'Historia ya visiwa'], achievements: ['Tunzo ya Utamaduni — Serikali ya Zanzibar 2025', 'Mbio za utamaduni — Washindi wa Mkoa 2024'], students: 95, awards: 10 },
  { id: 'dance', num: '05', icon: Drum, name: 'Dansi & Harakati', subtitle: 'Dance & Movement', desc: 'Kikundi cha dansi kinachojumuisha ngoma za asili za Afrika Mashariki, dansi za kisasa, na harakati za sanaa. Kikundi hiki kinawakilisha shule katika maeneo mbalimbali.', activities: ['Ngoma za Afrika', 'Dansi ya kisasa', 'Hip-hop ya elimu', 'Dansi za sherehe'], achievements: ['Tamasha la Dansi Zanzibar 2025 — Dhahabu', 'East Africa Arts Festival 2024 — Finalist'], students: 75, awards: 6 },
];

const TESTIMONIALS = [
  { text: 'Sanaa ya kuona katika Mpendae Secondary School ilinipa nafasi ya kukuza kipaji changu cha uchoraji na kunisaidia kushinda tuzo ya kitaifa.', name: 'Fatma Ali', role: 'Mwanafunzi Form IV', award: 'Tuzo ya Uchoraji 2025' },
  { text: 'Kujiunga na kikundi cha muziki cha shule kunanifanya nijisikie mwenye kujiamini na nimepata marafiki wengi kupitia tamasha zetu.', name: 'Khamis Said', role: 'Mwanafunzi Form VI', award: 'Bendi ya Shule' },
  { text: 'Mchezo wa kuigiza umenifundisha uwezo wa kuzungumza mbele ya watu na kunifanya nifanye vizuri hata kwenye masomo ya darasani.', name: 'Zuhura Bakari', role: 'Mwanafunzi Form III', award: 'Mchezo Bora 2024' },
];

const DEFAULT_GALLERY: GalleryItem[] = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80', title: 'Maonyesho ya Sanaa ya Kuchora', album: 'Sanaa' },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', title: 'Bendi na Kwaya ya Shule', album: 'Sanaa' },
  { id: '3', imageUrl: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=800&q=80', title: 'Mchezo wa Kuigiza wa BAKIZA', album: 'Sanaa' },
  { id: '4', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', title: 'Ngoma za Asili za Zanzibar', album: 'Sanaa' },
  { id: '5', imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80', title: 'Kikundi cha Dansi cha Shule', album: 'Sanaa' },
  { id: '6', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80', title: 'Tuzo za Utamaduni 2025', album: 'Sanaa' },
];

export default function ArtsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 180]);
  const heroOpacity = useTransform(heroScroll, [0, 0.75], [1, 0]);

  const [activeProgram, setActiveProgram] = useState(PROGRAMS[0]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  /* Dynamic API data */
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reelUrl, setReelUrl] = useState<string>('');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useEffect(() => {
    eventsApi.getAll({ status: 'upcoming' })
      .then(r => setEvents(r.data?.events ?? r.data ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
    galleryApi.getAll({ album: 'Sanaa' })
      .then(async r => {
        let imgs = r.data?.images ?? r.data ?? [];
        if (!imgs || imgs.length === 0) {
          const fallbackRes = await galleryApi.getAll();
          imgs = fallbackRes.data?.images ?? fallbackRes.data ?? [];
        }
        setGallery(imgs.length > 0 ? imgs.slice(0, 6) : DEFAULT_GALLERY);
      })
      .catch(() => setGallery(DEFAULT_GALLERY))
      .finally(() => setLoadingGallery(false));
    settingsApi.getSettings()
      .then(r => { if (r.data?.artsReelUrl) setReelUrl(r.data.artsReelUrl); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveIdx(p => (p + 1) % PROGRAMS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const prog = activeProgram;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════
          HERO — Cinematic parallax
      ══════════════════════════════════════ */}
      <div ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <motion.div style={{ position: 'absolute', inset: 0, opacity: heroOpacity }}>
          <div className="pattern-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
          {/* Lime-only orbs — no off-brand colors */}
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,0.07) 0%, transparent 65%)', animation: 'blobFloat 9s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,0.05) 0%, transparent 65%)', animation: 'blobFloat 11s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', top: '50%', right: '25%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,0.03) 0%, transparent 65%)', animation: 'blobFloat 7s ease-in-out infinite 2s' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,255,65,0.25), transparent)', animation: 'scanLine 5s linear infinite' }} />
        </motion.div>

        <motion.div style={{ y: heroY, position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="site-container" style={{ paddingTop: 'calc(var(--nav-h) + var(--announce-h) + 4rem)', paddingBottom: '6rem' }}>

            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Link href="/academics"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', fontSize: '.78rem', color: 'var(--c-w35)', textDecoration: 'none', marginBottom: '3rem', transition: 'color .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--c-lime)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--c-w35)'}
              >
                <ArrowLeft style={{ width: 12, height: 12 }} /> Masomo &amp; Mitaala
              </Link>
            </motion.div>

            <div className="arts-hero-grid">
              {/* Text side */}
              <div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
                    <Palette style={{ width: 14, height: 14 }} /> Ubunifu &amp; Utamaduni
                  </span>
                </motion.div>
                <div style={{ overflow: 'hidden', marginTop: '.75rem' }}>
                  <motion.h1
                    initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(3rem, 8vw, 6.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-.03em', marginBottom: '1.5rem' }}
                  >
                    Sanaa &amp;<br />
                    <span style={{ fontStyle: 'italic', color: 'var(--c-lime)', textShadow: '0 0 60px rgba(0,255,65,0.3)' }}>Utamaduni</span>
                  </motion.h1>
                </div>

                <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.4 }}
                  style={{ fontSize: '1.1rem', color: 'var(--c-w50)', maxWidth: 480, lineHeight: 1.8, marginBottom: '2.5rem' }}>
                  Tunaamini sanaa ni nguvu ya kubadilisha jamii. Programu zetu za ulimwengu zinakuza ubunifu, heshima ya utamaduni, na mafanikio ya kisanaa kwa kila mwanafunzi.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.52 }}
                  style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                  <Link href="/admissions" className="btn-primary" style={{ borderRadius: '999px', padding: '.875rem 2rem', fontSize: '.9rem', display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
                    Jiunge na Programu <ChevronRight style={{ width: 16, height: 16 }} />
                  </Link>
                  <button
                    onClick={() => setShowVideo(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '.75rem', padding: '.875rem 2rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', transition: 'all .25s' }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--c-bl)'; el.style.background = 'var(--c-lime-hint)'; }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.15)'; el.style.background = 'rgba(255,255,255,0.04)'; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--c-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play style={{ width: 14, height: 14, color: '#050805', marginLeft: 2 }} />
                    </div>
                    Tazama Reel
                  </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.65 }}
                  style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                  {[{ val: 5, s: '+', label: 'Programu' }, { val: 435, s: '+', label: 'Wanafunzi' }, { val: 43, s: '+', label: 'Tuzo za Sanaa' }].map(({ val, s, label }) => (
                    <div key={label}>
                      <p style={{ fontFamily: 'var(--f-display)', fontSize: '2.2rem', fontWeight: 900, color: '#fff', fontStyle: 'italic', margin: 0, lineHeight: 1 }}>
                        <AnimNum target={val} suffix={s} />
                      </p>
                      <p style={{ fontSize: '.72rem', color: 'var(--c-w35)', fontWeight: 600, marginTop: '.3rem' }}>{label}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Gallery mosaic — real images from API or high quality fallbacks */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: '.75rem', height: 480 }}
              >
                {gallery.map((item, i) => {
                  const imgSrc = item.imageUrl || item.url || '';
                  const imgTitle = item.title || item.caption || item.description || 'Sanaa & Utamaduni';
                  const imgKey = item.id || item._id || i;
                  return (
                    <motion.div key={imgKey} whileHover={{ scale: 1.04, zIndex: 10 }} transition={{ duration: 0.3 }}
                      style={{ borderRadius: '1.25rem', overflow: 'hidden', position: 'relative', cursor: 'pointer', gridRow: i === 0 || i === 3 ? 'span 2' : 'span 1', background: 'var(--c-surface)', border: '1px solid rgba(0,255,65,0.2)' }}>
                      <img src={imgSrc} alt={imgTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(5,8,5,0.85) 100%)' }} />
                      {imgTitle && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '.875rem' }}>
                          <p style={{ fontSize: '.72rem', fontWeight: 700, color: '#fff', margin: 0 }}>{imgTitle}</p>
                          {item.album && <p style={{ fontSize: '.6rem', color: 'var(--c-lime)', opacity: 0.8, margin: '.25rem 0 0', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>{item.album}</p>}
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--c-lime), transparent)' }} />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}
          style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
          <span style={{ fontSize: '.6rem', color: 'var(--c-w35)', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' }}>Sogeza</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(180deg, var(--c-lime), transparent)' }} />
        </motion.div>
      </div>

      {/* ══════════════════════════════════════
          INTERACTIVE PROGRAM EXPLORER
      ══════════════════════════════════════ */}
      <section style={{ padding: 'var(--section-py) 0' }}>
        <div className="site-container">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} style={{ marginBottom: '3.5rem' }}>
            <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
              <Star style={{ width: 13, height: 13 }} /> Programu Zetu
            </span>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', marginTop: '.75rem', letterSpacing: '-.025em' }}>
              Chagua Programu <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Yoyote</span>
            </h2>
          </motion.div>

          {/* Tabs — lime only */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
            style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {PROGRAMS.map(p => {
              const Icon = p.icon;
              const isActive = activeProgram.id === p.id;
              return (
                <button key={p.id} onClick={() => setActiveProgram(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.625rem 1.375rem', borderRadius: '999px', border: `1px solid ${isActive ? 'var(--c-bl)' : 'var(--c-border)'}`, background: isActive ? 'var(--c-lime-hint)' : 'var(--c-surface)', color: isActive ? 'var(--c-lime)' : 'var(--c-w50)', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all .25s' }}>
                  <Icon style={{ width: 15, height: 15 }} />
                  <span>{p.name}</span>
                  <span style={{ fontSize: '.6rem', fontFamily: 'var(--f-mono)', opacity: 0.6 }}>{p.num}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Detail panel */}
          <AnimatePresence mode="wait">
            <motion.div key={prog.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
              style={{ display: 'grid', gap: '1.5rem' }} className="prog-detail-grid">

              {/* Main card — lime only */}
              <div style={{ borderRadius: '2rem', border: '1px solid var(--c-bl-sm)', background: 'var(--c-surface)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: 4, background: 'linear-gradient(90deg, var(--c-lime), transparent)' }} />
                <div style={{ padding: '2.5rem', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '1.5rem', background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', boxShadow: 'var(--shadow-lime)' }}>
                      {(() => { const Icon = prog.icon; return <Icon style={{ width: 36, height: 36, color: 'var(--c-lime)' }} />; })()}
                      <span style={{ position: 'absolute', top: -10, right: -10, fontFamily: 'var(--f-mono)', fontSize: '.65rem', fontWeight: 900, color: 'var(--c-lime)', background: 'var(--c-bg)', padding: '2px 7px', borderRadius: 6, border: '1px solid var(--c-bl-sm)' }}>{prog.num}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
                        <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: 0 }}>{prog.name}</h3>
                        <span style={{ padding: '.25rem .875rem', borderRadius: '999px', background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl-sm)', color: 'var(--c-lime)', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em' }}>{prog.subtitle}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <span style={{ fontSize: '.78rem', color: 'var(--c-w35)', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                          <Users style={{ width: 13, height: 13, color: 'var(--c-lime)' }} />{prog.students}+ wanafunzi
                        </span>
                        <span style={{ fontSize: '.78rem', color: 'var(--c-w35)', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                          <Trophy style={{ width: 13, height: 13, color: 'var(--c-lime)' }} />Tuzo {prog.awards}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '1rem', color: 'var(--c-w55)', lineHeight: 1.85, marginBottom: '2rem', maxWidth: 640 }}>{prog.desc}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '2rem' }}>
                    {prog.activities.map(a => (
                      <span key={a} style={{ padding: '.35rem 1rem', borderRadius: '999px', background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl-sm)', fontSize: '.78rem', fontWeight: 600, color: 'var(--c-lime)' }}>{a}</span>
                    ))}
                  </div>

                  <div style={{ height: 1, background: 'linear-gradient(90deg, var(--c-bl-sm), transparent)', marginBottom: '2rem' }} />

                  <p style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--c-lime)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <Trophy style={{ width: 12, height: 12 }} /> Mafanikio Mapya
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
                    {prog.achievements.map((a, i) => (
                      <motion.div key={a} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: i * 0.08 }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem', padding: '1rem 1.25rem', borderRadius: '1rem', background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl-sm)' }}>
                        <Award style={{ width: 16, height: 16, color: 'var(--c-lime)', flexShrink: 0, marginTop: '.1rem' }} />
                        <span style={{ fontSize: '.88rem', color: 'var(--c-w70)', lineHeight: 1.5 }}>{a}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side enroll CTA — lime only */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ borderRadius: '2rem', border: '1px solid var(--c-bl-sm)', background: 'var(--c-surface)', padding: '2rem', textAlign: 'center', flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, var(--c-lime-hint) 0%, transparent 60%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--c-lime), transparent)' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '1.25rem', background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--shadow-lime)' }}>
                      <Sparkles style={{ width: 28, height: 28, color: 'var(--c-lime)' }} />
                    </div>
                    <h4 style={{ fontFamily: 'var(--f-display)', fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '.75rem' }}>Jiunge na {prog.name}</h4>
                    <p style={{ fontSize: '.85rem', color: 'var(--c-w40)', lineHeight: 1.7, marginBottom: '1.75rem' }}>Nafasi bado zipo kwa 2026. Jiandikishe leo na uanze safari yako ya kisanaa.</p>
                    <Link href="/admissions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', borderRadius: '999px', padding: '.875rem 1.5rem', fontSize: '.88rem', background: 'var(--c-lime)', color: '#050805', fontWeight: 800, textDecoration: 'none', transition: 'opacity .2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                      Jiandikishe <ArrowRight style={{ width: 15, height: 15 }} />
                    </Link>
                  </div>
                </div>
                <div style={{ borderRadius: '1.5rem', border: '1px solid var(--c-border)', background: 'var(--c-surface)', padding: '1.5rem' }}>
                  <p style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.15em', color: 'var(--c-w35)', marginBottom: '1rem' }}>Maswali?</p>
                  <p style={{ fontSize: '.88rem', color: 'var(--c-w55)', lineHeight: 1.6, marginBottom: '1.25rem' }}>Timu yetu iko tayari kukusaidia na maswali yoyote kuhusu programu hii.</p>
                  <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', fontSize: '.83rem', fontWeight: 700, color: 'var(--c-lime)', textDecoration: 'none' }}>
                    Wasiliana <ArrowRight style={{ width: 13, height: 13 }} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ACHIEVEMENTS TICKER
      ══════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface)', padding: '1.25rem 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '4rem', animation: 'marqueeScroll 30s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
          {[...Array(3)].map((_, rep) =>
            PROGRAMS.flatMap(p => p.achievements).map((ach, i) => (
              <span key={`${rep}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '.75rem', fontSize: '.8rem', color: 'var(--c-w50)', fontWeight: 600 }}>
                <Award style={{ width: 14, height: 14, color: 'var(--c-lime)', flexShrink: 0 }} />
                {ach}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          EVENTS CALENDAR — Dynamic from API
      ══════════════════════════════════════ */}
      <section style={{ padding: 'var(--section-py) 0' }}>
        <div className="site-container">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} style={{ marginBottom: '3.5rem' }}>
            <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
              <Calendar style={{ width: 13, height: 13 }} /> Matukio ya Mwaka
            </span>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', marginTop: '.75rem', letterSpacing: '-.025em' }}>
              Kalenda ya Sanaa <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>2026</span>
            </h2>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {loadingEvents
              ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ height: 96, borderRadius: '2rem', background: 'var(--c-surface)', border: '1px solid var(--c-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))
              : events.length > 0
                ? events.map((ev, i) => {
                  const d = new Date(ev.date);
                  const month = d.toLocaleDateString('sw-TZ', { month: 'short' });
                  const day = d.getDate().toString().padStart(2, '0');
                  return (
                    <motion.div key={ev._id}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.55, delay: i * 0.1 }} viewport={{ once: true }}
                      style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem', borderRadius: '2rem', border: '1px solid var(--c-border)', background: 'var(--c-surface)', overflow: 'hidden', position: 'relative', transition: 'border-color .3s, transform .3s, box-shadow .3s' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-bl)'; el.style.transform = 'translateX(8px)'; el.style.boxShadow = 'var(--shadow-lime)'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-border)'; el.style.transform = 'translateX(0)'; el.style.boxShadow = 'none'; }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, var(--c-lime), transparent)' }} />
                      <div style={{ width: 72, height: 72, borderRadius: '1.25rem', background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.6rem', fontWeight: 900, color: 'var(--c-lime)', letterSpacing: '.1em' }}>{day}</span>
                        <span style={{ fontFamily: 'var(--f-display)', fontSize: '.9rem', fontWeight: 800, color: 'var(--c-lime)', fontStyle: 'italic' }}>{month}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>{ev.title}</h3>
                          {ev.status && <span style={{ padding: '.2rem .7rem', borderRadius: '999px', background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl-sm)', fontSize: '.62rem', fontWeight: 700, color: 'var(--c-lime)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{ev.status}</span>}
                          {ev.status && <span style={{ padding: '.2rem .7rem', borderRadius: '999px', background: 'var(--c-lime-hint)', border: '1px solid var(--c-lime)', fontSize: '.62rem', fontWeight: 700, color: 'var(--c-lime)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{ev.status}</span>}
                        </div>
                        {ev.description && <p style={{ fontSize: '.88rem', color: 'var(--c-w50)', lineHeight: 1.6, margin: 0 }}>{ev.description}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0 }}>
                        <Clock style={{ width: 14, height: 14, color: 'var(--c-w35)' }} />
                        <span style={{ fontSize: '.75rem', color: 'var(--c-w35)', fontWeight: 600 }}>{d.getFullYear()}</span>
                      </div>
                    </motion.div>
                  );
                })
                : (
                  <div style={{ padding: '3rem 2rem', borderRadius: '2rem', border: '1px solid var(--c-border)', background: 'var(--c-surface)', textAlign: 'center' }}>
                    <Calendar style={{ width: 40, height: 40, color: 'var(--c-w20)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--c-w35)', fontSize: '.9rem' }}>Matukio yataongezwa hivi karibuni.</p>
                  </div>
                )
            }
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROGRAM HIGHLIGHTS CAROUSEL
      ══════════════════════════════════════ */}
      <section style={{ padding: '0 0 var(--section-py)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,255,65,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="site-container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
            <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', justifyContent: 'center' }}>
              <Quote style={{ width: 13, height: 13 }} /> Mafanikio ya Programu
            </span>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', marginTop: '.75rem', letterSpacing: '-.025em' }}>
              Tunajivunia <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Hili</span>
            </h2>
          </motion.div>

          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeIdx}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.5 }}
                style={{ borderRadius: '2rem', border: '1px solid var(--c-lime)', background: 'var(--c-surface)', padding: '3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -20%, var(--c-lime-hint) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--c-lime), transparent)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {(() => { const Icon = PROGRAMS[activeIdx].icon; return (
                    <div style={{ width: 52, height: 52, borderRadius: '1rem', background: 'var(--c-lime-hint)', border: '1px solid var(--c-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: 'var(--shadow-lime)' }}>
                      <Icon style={{ width: 22, height: 22, color: 'var(--c-lime)' }} />
                    </div>
                  ); })()}
                  <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginBottom: '.75rem', fontStyle: 'italic' }}>{PROGRAMS[activeIdx].name}</h3>
                  <p style={{ fontSize: '1rem', color: 'var(--c-w60)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 1.75rem' }}>{PROGRAMS[activeIdx].desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.88rem', color: 'var(--c-w50)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      <Users style={{ width: 14, height: 14, color: 'var(--c-lime)' }} />{PROGRAMS[activeIdx].students}+ wanafunzi
                    </span>
                    <span style={{ padding: '.3rem .875rem', borderRadius: '999px', background: 'var(--c-lime-hint)', border: '1px solid var(--c-lime)', fontSize: '.68rem', fontWeight: 700, color: 'var(--c-lime)' }}>{PROGRAMS[activeIdx].subtitle}</span>
                    <span style={{ fontSize: '.88rem', color: 'var(--c-w50)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      <Trophy style={{ width: 14, height: 14, color: 'var(--c-lime)' }} />Tuzo {PROGRAMS[activeIdx].awards}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '1.75rem' }}>
              {PROGRAMS.map((_, i) => (
                <button key={i} onClick={() => setActiveIdx(i)}
                  style={{ width: i === activeIdx ? 24 : 8, height: 8, borderRadius: '999px', border: 'none', background: i === activeIdx ? 'var(--c-lime)' : 'rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'all .3s', padding: 0 }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS — Auto-rotating
      ══════════════════════════════════════ */}
      <section style={{ padding: '0 0 var(--section-py)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,255,65,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="site-container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
            <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', justifyContent: 'center' }}>
              <Quote style={{ width: 13, height: 13 }} /> Sauti za Wanafunzi
            </span>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', marginTop: '.75rem', letterSpacing: '-.025em' }}>
              Wanasema <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Nini?</span>
            </h2>
          </motion.div>

          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTestimonial}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.5 }}
                style={{ borderRadius: '2rem', border: '1px solid var(--c-lime)', background: 'var(--c-surface)', padding: '3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -20%, var(--c-lime-hint) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--c-lime), transparent)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '1rem', background: 'var(--c-lime-hint)', border: '1px solid var(--c-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: 'var(--shadow-lime)' }}>
                    <Quote style={{ width: 22, height: 22, color: 'var(--c-lime)' }} />
                  </div>
                  <p style={{ fontSize: '1.1rem', color: 'var(--c-w70)', lineHeight: 1.85, marginBottom: '2rem', fontStyle: 'italic', maxWidth: 560, margin: '0 auto 2rem' }}>
                    &ldquo;{TESTIMONIALS[activeTestimonial].text}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: '.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>{TESTIMONIALS[activeTestimonial].name}</p>
                      <p style={{ fontSize: '.75rem', color: 'var(--c-w40)', margin: '.2rem 0 0' }}>{TESTIMONIALS[activeTestimonial].role}</p>
                    </div>
                    <span style={{ padding: '.3rem .875rem', borderRadius: '999px', background: 'var(--c-lime-hint)', border: '1px solid var(--c-lime)', fontSize: '.68rem', fontWeight: 700, color: 'var(--c-lime)' }}>
                      {TESTIMONIALS[activeTestimonial].award}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '1.75rem' }}>
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)}
                  style={{ width: i === activeTestimonial ? 24 : 8, height: 8, borderRadius: '999px', border: 'none', background: i === activeTestimonial ? 'var(--c-lime)' : 'rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'all .3s', padding: 0 }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section style={{ padding: '0 0 var(--section-py)' }}>
        <div className="site-container">
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
            style={{ borderRadius: '2.5rem', border: '1px solid var(--c-bl-sm)', background: 'linear-gradient(135deg, var(--c-surface) 0%, var(--c-bg2) 100%)', overflow: 'hidden', position: 'relative', padding: '5rem 3rem' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, var(--c-lime), transparent)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(0,255,65,0.06) 0%, transparent 55%)', pointerEvents: 'none' }} />
            <div className="pattern-grid" style={{ position: 'absolute', inset: 0, opacity: 0.15 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="arts-cta-grid">
                <div>
                  <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
                    <Heart style={{ width: 13, height: 13 }} /> Kwa Nini Sanaa ni Muhimu
                  </span>
                  <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', marginTop: '.75rem', marginBottom: '1.5rem', letterSpacing: '-.025em', lineHeight: 1.1 }}>
                    Sanaa Inabadilisha<br /><span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Maisha</span>
                  </h2>
                  <p style={{ fontSize: '1rem', color: 'var(--c-w50)', maxWidth: 440, lineHeight: 1.8, marginBottom: '2.5rem' }}>
                    Utafiti unaonyesha wanafunzi wanaojishughulisha na sanaa wanaonyesha ubunifu mkubwa, matokeo bora ya masomo, na ujuzi wa kufanya kazi pamoja.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link href="/admissions" className="btn-primary" style={{ borderRadius: '999px', padding: '.875rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
                      Jiunge na Programu <ChevronRight style={{ width: 16, height: 16 }} />
                    </Link>
                    <Link href="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.875rem 1.75rem', borderRadius: '999px', border: '1px solid var(--c-border)', color: 'var(--c-w50)', fontWeight: 700, textDecoration: 'none', fontSize: '.9rem', transition: 'all .25s' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-bl)'; el.style.color = 'var(--c-lime)'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-border)'; el.style.color = 'var(--c-w50)'; }}>
                      Matukio <ArrowRight style={{ width: 14, height: 14 }} />
                    </Link>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { pct: '75%', label: 'Ubunifu Zaidi', icon: Zap },
                    { pct: '2×', label: 'Matokeo Bora', icon: Star },
                    { pct: '90%', label: 'Hushiriki Jamii', icon: Users },
                    { pct: '100%', label: 'Programu Zote', icon: CheckCircle2 },
                  ].map(({ pct, label, icon: Icon }) => (
                    <div key={label} style={{ padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid var(--c-bl-sm)', background: 'var(--c-lime-hint)', textAlign: 'center' }}>
                      <Icon style={{ width: 20, height: 20, color: 'var(--c-lime)', margin: '0 auto .75rem', display: 'block' }} />
                      <p style={{ fontFamily: 'var(--f-display)', fontSize: '2rem', fontWeight: 900, color: 'var(--c-lime)', fontStyle: 'italic', margin: 0, lineHeight: 1 }}>{pct}</p>
                      <p style={{ fontSize: '.72rem', color: 'var(--c-w40)', margin: '.4rem 0 0', fontWeight: 600 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(5,8,5,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(16px)' }}
            onClick={() => setShowVideo(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: '100%', maxWidth: 840, borderRadius: '2rem', border: '1px solid rgba(0,255,65,0.3)', overflow: 'hidden', background: '#050805', boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 50px rgba(0,255,65,0.15)', position: 'relative' }}
              onClick={e => e.stopPropagation()}>
              
              <button
                onClick={() => setShowVideo(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
              >
                ✕
              </button>

              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
                <iframe
                  width="100%"
                  height="100%"
                  src={getEmbedUrl(reelUrl)}
                  title="Mpendae Arts & Culture Reel"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>

              <div style={{ padding: '1.25rem 1.75rem', background: '#050805', borderTop: '1px solid rgba(0,255,65,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <Sparkles style={{ width: 16, height: 16, color: '#00FF41' }} />
                    Reel ya Sanaa &amp; Utamaduni — Mpendae Secondary School
                  </h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.78rem', margin: '.2rem 0 0' }}>
                    Onyesho maalum la vipaji vya wanafunzi katika ngoma za asili, bendi ya shule, na michezo ya kuigiza.
                  </p>
                </div>
                <button
                  onClick={() => setShowVideo(false)}
                  style={{ padding: '.6rem 1.5rem', borderRadius: '999px', background: '#00FF41', color: '#050805', border: 'none', fontWeight: 800, fontSize: '.82rem', cursor: 'pointer' }}
                >
                  Funga Video
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media(min-width: 900px) {
          .arts-hero-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 5rem; align-items: center; }
          .prog-detail-grid { grid-template-columns: 1.6fr 1fr !important; }
          .arts-cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        }
        @media(max-width: 899px) {
          .arts-hero-grid { display: flex; flex-direction: column; gap: 3rem; }
          .arts-cta-grid { display: flex; flex-direction: column; gap: 3rem; }
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
