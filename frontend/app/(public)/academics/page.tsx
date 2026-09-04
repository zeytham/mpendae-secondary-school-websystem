'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, Calculator, Beaker, Globe, Briefcase, Music,
  ChevronRight, ArrowRight, Download, Award, Users, Clock,
  CheckCircle2, Zap, Star, GraduationCap, Target, TrendingUp,
  ChevronDown, FileText, Calendar,
} from 'lucide-react';
import { timetableApi, studentsApi, teachersApi, settingsApi } from '@/lib/api';
import { Timetable, FORM_LABELS } from '@/types';

/* ── Animated Counter ── */
function AnimCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end center'] });
  useEffect(() => {
    const u = scrollYProgress.on('change', p => {
      if (p > 0.05) setV(Math.round(to * Math.min(p * 2.5, 1)));
    });
    return u;
  }, [to, scrollYProgress]);
  return <span ref={ref}>{v}{suffix}</span>;
}

/* â”€â”€ Days until date â”€â”€ */
function daysUntil(month: number, day = 1): number {
  const now = new Date();
  const target = new Date(now.getFullYear(), month - 1, day);
  if (target < now) target.setFullYear(now.getFullYear() + 1);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

const DEPARTMENTS = [
  {
    key: 'Sayansi',
    icon: Beaker,
    color: '#34D399',
    colorHint: 'rgba(52,211,153,0.08)',
    colorBorder: 'rgba(52,211,153,0.22)',
    desc: 'Fizikia, Kemikali, Biolojia, na Jiografia ya Binadamu',
    subjects: [
      { name: 'Fizikia', desc: 'Sheria za asili, umeme, mwanga, na nguvu', level: 'O & A Level' },
      { name: 'Kemikali', desc: 'Michanganyiko ya kemikali, atomi, na maabara', level: 'O & A Level' },
      { name: 'Biolojia', desc: 'Viumbe hai, mwili wa binadamu, na mazingira', level: 'O & A Level' },
      { name: 'Jiografia', desc: 'Hali ya hewa, ramani, na maliasili', level: 'O Level' },
    ],
  },
  {
    key: 'Hisabati',
    icon: Calculator,
    color: '#60A5FA',
    colorHint: 'rgba(96,165,250,0.08)',
    colorBorder: 'rgba(96,165,250,0.22)',
    desc: 'Hisabati ya Kawaida, Hisabati ya Ziada, na Takwimu',
    subjects: [
      { name: 'Hisabati (Core)', desc: 'Algebra, geometry, na calculus ya msingi', level: 'O Level' },
      { name: 'Hisabati ya Ziada', desc: 'Calculus ya juu, trigonometry, na statistics', level: 'A Level' },
      { name: 'Takwimu', desc: 'Data analysis, probability, na graphs', level: 'O & A Level' },
    ],
  },
  {
    key: 'Lugha',
    icon: Globe,
    color: '#F472B6',
    colorHint: 'rgba(244,114,182,0.08)',
    colorBorder: 'rgba(244,114,182,0.22)',
    desc: 'Kiswahili, Kiingereza, na Lugha za Kigeni',
    subjects: [
      { name: 'Kiswahili', desc: 'Lugha, fasihi, na insha za Kiswahili', level: 'O & A Level' },
      { name: 'Kiingereza', desc: 'Grammar, composition, na literature', level: 'O & A Level' },
      { name: 'Lugha ya Kiarabu', desc: 'Msingi wa lugha ya Kiarabu', level: 'O Level' },
    ],
  },
  {
    key: 'Biashara',
    icon: Briefcase,
    color: '#F59E0B',
    colorHint: 'rgba(245,158,11,0.08)',
    colorBorder: 'rgba(245,158,11,0.22)',
    desc: 'Biashara, Uhasibu, na Uchumi',
    subjects: [
      { name: 'Biashara', desc: 'Kanuni za biashara, masoko, na usimamizi', level: 'O & A Level' },
      { name: 'Uhasibu', desc: 'Vitabu vya hesabu, ripoti za fedha', level: 'O & A Level' },
      { name: 'Uchumi', desc: 'Micro na macro economics', level: 'A Level' },
    ],
  },
  {
    key: 'Sanaa',
    icon: Music,
    color: '#A78BFA',
    colorHint: 'rgba(167,139,250,0.08)',
    colorBorder: 'rgba(167,139,250,0.22)',
    desc: 'Sanaa ya Kuchora, Muziki, na Elimu ya Mwili',
    subjects: [
      { name: 'Sanaa ya Kuchora', desc: 'Michoro, rangi, na ubunifu wa kisanaa', level: 'O Level' },
      { name: 'Muziki', desc: 'Sauti, ala za muziki, na utunzi', level: 'O Level' },
      { name: 'Elimu ya Mwili', desc: 'Michezo, afya, na ustawi wa mwili', level: 'O Level' },
    ],
  },
];

const COMBINATIONS = [
  { code: 'PCB', full: 'Fizikia Â· Kemikali Â· Biolojia', streams: 'Form V & VI', color: '#34D399', desc: 'Bora kwa udaktari na sayansi za maisha', popular: true },
  { code: 'PCM', full: 'Fizikia Â· Kemikali Â· Hisabati', streams: 'Form V & VI', color: '#60A5FA', desc: 'Inayoelekea uhandisi na teknolojia', popular: true },
  { code: 'HGE', full: 'Historia Â· Jiografia Â· Uchumi', streams: 'Form V & VI', color: '#F59E0B', desc: 'Inayoelekea masomo ya jamii na utawala', popular: false },
  { code: 'CBG', full: 'Biashara Â· Jiografia Â· Biolojia', streams: 'Form V & VI', color: '#F472B6', desc: 'Muungano bora wa sayansi na biashara', popular: false },
  { code: 'HGL', full: 'Historia Â· Jiografia Â· Lugha', streams: 'Form V & VI', color: '#A78BFA', desc: 'Inayoelekea sheria, uandishi, na diplomasia', popular: false },
  { code: 'PCB', full: 'Fizikia · Kemikali · Biolojia', streams: 'Form V & VI', color: '#34D399', desc: 'Bora kwa udaktari na sayansi za maisha', popular: true },
  { code: 'PCM', full: 'Fizikia · Kemikali · Hisabati', streams: 'Form V & VI', color: '#60A5FA', desc: 'Inayoelekea uhandisi na teknolojia', popular: true },
  { code: 'HGE', full: 'Historia · Jiografia · Uchumi', streams: 'Form V & VI', color: '#F59E0B', desc: 'Inayoelekea masomo ya jamii na utawala', popular: false },
  { code: 'CBG', full: 'Biashara · Jiografia · Biolojia', streams: 'Form V & VI', color: '#F472B6', desc: 'Muungano bora wa sayansi na biashara', popular: false },
  { code: 'HGL', full: 'Historia · Jiografia · Lugha', streams: 'Form V & VI', color: '#A78BFA', desc: 'Inayoelekea sheria, uandishi, na diplomasia', popular: false },
];

const EXAMS = [
  { name: 'Mtihani wa Kati (Mock)', month: 8, label: 'Agosti 2026', form: 'Form IV & VI', color: '#F59E0B' },
  { name: 'NECTA Form IV', month: 11, label: 'Novemba 2026', form: 'Form IV', color: '#EF4444' },
  { name: 'NECTA Form VI', month: 11, label: 'Novemba 2026', form: 'Form VI', color: '#EF4444' },
  { name: 'Mtihani wa Mwaka', month: 12, label: 'Desemba 2026', form: 'Form I, II, III, V', color: '#00FF41' },
];

export default function AcademicsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const [openDept, setOpenDept] = useState<string | null>('Sayansi');
  const [activeCombo, setActiveCombo] = useState<string | null>(null);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loadingTimetables, setLoadingTimetables] = useState(true);

  /* Dynamic stats */
  const [studentTotal, setStudentTotal] = useState(850);
  const [teacherTotal, setTeacherTotal] = useState(35);
  const [passRateVal, setPassRateVal] = useState(98);
  const [foundedYears, setFoundedYears] = useState(35);

  /* Brochure modal state */
  const [showBrochureModal, setShowBrochureModal] = useState(false);

  useEffect(() => {
    timetableApi.getAll().then(res => {
      setTimetables(res.data.timetables || res.data || []);
    }).catch(() => {}).finally(() => setLoadingTimetables(false));

    studentsApi.getStats().then(r => { if (r.data?.total) setStudentTotal(r.data.total); }).catch(() => {});
    teachersApi.getAll().then(r => {
      const len = Array.isArray(r.data) ? r.data.length : (r.data?.teachers?.length || 0);
      if (len) setTeacherTotal(len);
    }).catch(() => {});
    settingsApi.getSettings().then(r => {
      if (r.data?.nectaPassRate) {
        const p = parseInt(r.data.nectaPassRate, 10);
        if (!isNaN(p)) setPassRateVal(p);
      }
      const f = parseInt(r.data?.founded, 10);
      if (!isNaN(f)) setFoundedYears(new Date().getFullYear() - f);
    }).catch(() => {});
  }, []);

  const dynamicHighlights = [
    { icon: GraduationCap, val: passRateVal, suffix: '%', label: 'Pass Rate ya NECTA', color: '#00FF41' },
    { icon: Award, val: 5, suffix: '', label: 'Idara za Masomo', color: '#00FF41' },
    { icon: Users, val: studentTotal, suffix: '+', label: 'Wanafunzi Wote', color: '#00FF41' },
    { icon: Star, val: foundedYears, suffix: '+', label: 'Miaka ya Uzoefu', color: '#00FF41' },
  ];

  const activeDept = DEPARTMENTS.find(d => d.key === openDept);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', overflowX: 'hidden' }}>

      {/* ── BROCHURE MODAL ── */}
      <AnimatePresence>
        {showBrochureModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(5,8,5,0.92)', backdropFilter: 'blur(16px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
            }}
            onClick={() => setShowBrochureModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              style={{
                width: '100%', maxWidth: 800, maxHeight: '88vh', overflowY: 'auto', borderRadius: '2rem',
                border: '1px solid rgba(0,255,65,0.3)', background: '#050805',
                boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,255,65,0.15)',
                padding: '2.5rem', position: 'relative', color: '#fff',
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowBrochureModal(false)}
                style={{
                  position: 'absolute', top: '1.5rem', right: '1.5rem',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', cursor: 'pointer', transition: 'all .2s',
                }}
              >
                ✕
              </button>

              <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(0,255,65,0.2)', paddingBottom: '1.5rem' }}>
                <span className="badge-gold" style={{ marginBottom: '.75rem', display: 'inline-flex' }}>Brochure ya Masomo 2026</span>
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '.5rem 0' }}>
                  Mpendae Secondary School — Zanzibar
                </h2>
                <p style={{ fontSize: '.88rem', color: 'var(--c-lime)', fontWeight: 700, margin: 0 }}>
                  Falsafa Yetu: &ldquo;Elimu ni Ufunguo wa Maisha&rdquo;
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                <div style={{ background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: '1.25rem', padding: '1.25rem' }}>
                  <h3 style={{ color: '#00FF41', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 .5rem' }}>1. Utangulizi wa Masomo</h3>
                  <p style={{ margin: 0 }}>
                    Mpendae Secondary School inatoa elimu ya sekondari kwa viwango vya O-Level (Form I–IV) na A-Level (Form V–VI). Tunafuata mtaala wa kitaifa wa NECTA huku tukijumuisha ujuzi wa teknolojia na maadili mema.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.25rem' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 .75rem' }}>2. Combinations za Form V & VI (A-Level)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '.75rem' }}>
                    {COMBINATIONS.map(c => (
                      <div key={c.code} style={{ background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.2)', padding: '.75rem', borderRadius: '.875rem' }}>
                        <p style={{ fontWeight: 800, color: '#00FF41', margin: 0 }}>{c.code}</p>
                        <p style={{ fontSize: '.78rem', color: '#fff', margin: '.2rem 0 0' }}>{c.full}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: '1.25rem', padding: '1.25rem' }}>
                  <h3 style={{ color: '#00FF41', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 .5rem' }}>3. Takwimu na Mafanikio</h3>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '.75rem' }}>
                    <div><span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>{passRateVal}%</span><br /><span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,0.4)' }}>Ufaulu NECTA</span></div>
                    <div><span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>{studentTotal}+</span><br /><span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,0.4)' }}>Wanafunzi</span></div>
                    <div><span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>{teacherTotal}</span><br /><span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,0.4)' }}>Walimu Wasomi</span></div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '.75rem 1.75rem', borderRadius: '1rem', background: '#00FF41', color: '#050805',
                    fontWeight: 800, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                  }}
                >
                  <Download style={{ width: 16, height: 16 }} /> Chapisha / Hifadhi PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <div ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Animated bg */}
        <motion.div style={{ position: 'absolute', inset: 0, opacity: heroOpacity }}>
          <div className="pattern-grid" style={{ position: 'absolute', inset: 0, opacity: 0.45 }} />
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,0.07) 0%, transparent 65%)', animation: 'blobFloat 9s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,0.05) 0%, transparent 65%)', animation: 'blobFloat 12s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', top: '40%', left: '35%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,0.03) 0%, transparent 65%)', animation: 'blobFloat 7s ease-in-out infinite 3s' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,255,65,0.3), transparent)', animation: 'scanLine 5s linear infinite' }} />
        </motion.div>

        <motion.div style={{ y: heroY, position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="site-container" style={{ paddingTop: 'calc(var(--nav-h) + var(--announce-h) + 4rem)', paddingBottom: '6rem' }}>
            <div className="acad-hero-grid">

              {/* Left: headline */}
              <div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
                    <BookOpen style={{ width: 14, height: 14 }} /> Masomo &amp; Mitaala
                  </span>
                </motion.div>

                <div style={{ overflow: 'hidden', marginTop: '.75rem' }}>
                  <motion.h1
                    initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(3rem, 7.5vw, 6rem)', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-.03em', marginBottom: '1.5rem' }}
                  >
                    Elimu ya<br />
                    <span style={{ fontStyle: 'italic', color: 'var(--c-lime)', textShadow: '0 0 60px rgba(0,255,65,0.35)' }}>Ubora</span>
                  </motion.h1>
                </div>

                <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.38 }}
                  style={{ fontSize: '1.1rem', color: 'var(--c-w50)', maxWidth: 460, lineHeight: 1.8, marginBottom: '2.5rem' }}>
                  Mitaala yenye ubora wa kimataifa inayotayarisha wanafunzi kwa NECTA, A-Level, na zaidi. Idara 5 zinazofanya kazi pamoja kujenga wasomi wa kesho.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
                  style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
                  <a href="#departments" className="btn-primary" style={{ borderRadius: '999px', padding: '.875rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
                    Gundua Masomo <ChevronRight style={{ width: 16, height: 16 }} />
                  </a>
                  <button
                    onClick={() => setShowBrochureModal(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.875rem 2rem', borderRadius: '999px', border: '1px solid rgba(0,255,65,0.3)', color: 'var(--c-lime)', fontWeight: 700, fontSize: '.9rem', transition: 'all .25s', background: 'rgba(0,255,65,0.06)', cursor: 'pointer' }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#00FF41'; el.style.background = 'rgba(0,255,65,0.15)'; }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(0,255,65,0.3)'; el.style.background = 'rgba(0,255,65,0.06)'; }}
                  >
                    <Download style={{ width: 15, height: 15 }} /> Pakua Brochure
                  </button>
                </motion.div>

                {/* Quick stats strip */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.65 }}
                  style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  {[{ val: passRateVal, s: '%', label: 'Pass Rate' }, { val: 5, s: '', label: 'Idara' }, { val: studentTotal, s: '+', label: 'Wanafunzi' }].map(({ val, s, label }) => (
                    <div key={label}>
                      <p style={{ fontFamily: 'var(--f-display)', fontSize: '2.4rem', fontWeight: 900, color: '#fff', fontStyle: 'italic', margin: 0, lineHeight: 1 }}>
                        <AnimCounter to={val} suffix={s} />
                      </p>
                      <p style={{ fontSize: '.72rem', color: 'var(--c-w35)', fontWeight: 600, marginTop: '.3rem' }}>{label}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right: highlights grid */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {dynamicHighlights.map(({ icon: Icon, val, suffix, label, color }, i) => (
                  <motion.div key={label}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    style={{ padding: '1.75rem', borderRadius: '1.75rem', border: '1px solid rgba(0,255,65,0.2)', background: 'linear-gradient(135deg, rgba(0,255,65,0.06), rgba(0,255,65,0.02))', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #00FF41, transparent)' }} />
                    <Icon style={{ width: 22, height: 22, color: '#00FF41', marginBottom: '1rem' }} />
                    <p style={{ fontFamily: 'var(--f-display)', fontSize: '2.6rem', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1, fontStyle: 'italic' }}>
                      <AnimCounter to={val} suffix={suffix} />
                    </p>
                    <p style={{ fontSize: '.72rem', color: 'var(--c-w35)', margin: '.5rem 0 0', fontWeight: 600 }}>{label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
          <span style={{ fontSize: '.6rem', color: 'var(--c-w35)', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' }}>Sogeza</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(180deg, var(--c-lime), transparent)' }} />
        </motion.div>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SUBJECT DEPARTMENTS â€” Interactive accordion
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="departments" style={{ padding: 'var(--section-py) 0' }}>
        <div className="site-container">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} style={{ marginBottom: '3.5rem' }}>
            <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
              <BookOpen style={{ width: 13, height: 13 }} /> Idara za Masomo
            </span>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', marginTop: '.75rem', letterSpacing: '-.025em' }}>
              Gundua Masomo <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Yetu</span>
            </h2>
            <p style={{ color: 'var(--c-w40)', fontSize: '.95rem', maxWidth: 480, marginTop: '.75rem' }}>Gonga kila idara kuona masomo yake yote na maelezo ya kina.</p>
          </motion.div>

          <div className="acad-dept-grid">
            {/* Left: department list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
              {DEPARTMENTS.map((dept, i) => {
                const Icon = dept.icon;
                const isOpen = openDept === dept.key;
                return (
                  <motion.div key={dept.key}
                    initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.07 }} viewport={{ once: true }}
                    style={{ borderRadius: '1.5rem', overflow: 'hidden', border: `1px solid ${isOpen ? dept.colorBorder : 'var(--c-border)'}`, background: isOpen ? dept.colorHint : 'var(--c-surface)', transition: 'all .3s' }}>
                    <button onClick={() => setOpenDept(isOpen ? null : dept.key)}
                      style={{ width: '100%', padding: '1.4rem 1.75rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.125rem', textAlign: 'left' }}>
                      <div style={{ width: 52, height: 52, borderRadius: '1.125rem', background: `${dept.color}15`, border: `1px solid ${dept.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform .3s', transform: isOpen ? 'rotate(-6deg) scale(1.08)' : 'none' }}>
                        <Icon style={{ width: 24, height: 24, color: dept.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>{dept.key}</p>
                        <p style={{ fontSize: '.78rem', color: 'var(--c-w40)', margin: '.2rem 0 0' }}>{dept.subjects.length} masomo</p>
                      </div>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown style={{ width: 20, height: 20, color: isOpen ? dept.color : 'var(--c-w35)' }} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} style={{ overflow: 'hidden' }}>
                          <div style={{ padding: '0 1.75rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.75rem' }}>
                            {dept.subjects.map((s, si) => (
                              <motion.div key={s.name}
                                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: si * 0.06 }}
                                style={{ padding: '1rem 1.125rem', borderRadius: '1rem', background: `${dept.color}0a`, border: `1px solid ${dept.color}20` }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                                  <p style={{ fontSize: '.88rem', fontWeight: 700, color: '#fff', margin: 0 }}>{s.name}</p>
                                  <span style={{ fontSize: '.58rem', fontWeight: 700, color: dept.color, background: `${dept.color}15`, padding: '2px 7px', borderRadius: '999px', border: `1px solid ${dept.color}25`, whiteSpace: 'nowrap' }}>{s.level}</span>
                                </div>
                                <p style={{ fontSize: '.75rem', color: 'var(--c-w40)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Right: active dept visual */}
            <div>
              <AnimatePresence mode="wait">
                {activeDept ? (
                  <motion.div key={activeDept.key}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
                    style={{ borderRadius: '2rem', border: `1px solid ${activeDept.colorBorder}`, background: 'var(--c-surface)', overflow: 'hidden', position: 'sticky', top: 100 }}>
                    <div style={{ height: 4, background: `linear-gradient(90deg, ${activeDept.color}, transparent)` }} />
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.006) 3px, rgba(255,255,255,0.006) 4px)', pointerEvents: 'none' }} />
                    <div style={{ padding: '2.5rem', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                        <div style={{ width: 72, height: 72, borderRadius: '1.5rem', background: `${activeDept.color}15`, border: `1px solid ${activeDept.colorBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${activeDept.colorHint}` }}>
                          {(() => { const Icon = activeDept.icon; return <Icon style={{ width: 32, height: 32, color: activeDept.color }} />; })()}
                        </div>
                        <div>
                          <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.7rem', fontWeight: 900, color: '#fff', margin: 0 }}>{activeDept.key}</h3>
                          <p style={{ fontSize: '.8rem', color: activeDept.color, fontWeight: 600, margin: '.3rem 0 0', textTransform: 'uppercase', letterSpacing: '.1em' }}>{activeDept.subjects.length} Masomo</p>
                        </div>
                      </div>
                      <p style={{ fontSize: '.95rem', color: 'var(--c-w55)', lineHeight: 1.8, marginBottom: '2rem' }}>{activeDept.desc}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                        {activeDept.subjects.map((s, i) => (
                          <motion.div key={s.name}
                            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.07 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '.875rem', padding: '.875rem 1.125rem', borderRadius: '1rem', background: `${activeDept.color}08`, border: `1px solid ${activeDept.color}18` }}>
                            <CheckCircle2 style={{ width: 16, height: 16, color: activeDept.color, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '.88rem', fontWeight: 700, color: '#fff', margin: 0 }}>{s.name}</p>
                              <p style={{ fontSize: '.72rem', color: 'var(--c-w40)', margin: '.15rem 0 0' }}>{s.desc}</p>
                            </div>
                            <span style={{ fontSize: '.62rem', fontWeight: 700, color: activeDept.color, background: `${activeDept.color}15`, padding: '2px 8px', borderRadius: '999px', border: `1px solid ${activeDept.color}25`, whiteSpace: 'nowrap' }}>{s.level}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ borderRadius: '2rem', border: '1px solid var(--c-border)', background: 'var(--c-surface)', padding: '4rem 2rem', textAlign: 'center' }}>
                    <BookOpen style={{ width: 48, height: 48, color: 'var(--c-w20)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--c-w35)', fontSize: '.9rem' }}>Chagua idara kuona masomo yake</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          COMBINATIONS â€” Interactive visual selector
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ padding: '0 0 var(--section-py)' }}>
        <div className="site-container">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} style={{ marginBottom: '3.5rem' }}>
            <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
              <Target style={{ width: 13, height: 13 }} /> Combinations za Form V &amp; VI
            </span>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', marginTop: '.75rem', letterSpacing: '-.025em' }}>
              Chagua Njia Yako ya <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Mafanikio</span>
            </h2>
            <p style={{ color: 'var(--c-w40)', fontSize: '.95rem', maxWidth: 480, marginTop: '.75rem' }}>Kila combination imeundwa kwa makini kulingana na malengo yako ya taaluma na kazi ya baadaye.</p>
          </motion.div>

          <div style={{ display: 'grid', gap: '1.25rem' }} className="combo-grid">
            {COMBINATIONS.map((c, i) => {
              const isActive = activeCombo === c.code;
              return (
                <motion.div key={c.code}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }} viewport={{ once: true }}
                  onClick={() => setActiveCombo(isActive ? null : c.code)}
                  style={{ borderRadius: '2rem', border: `1px solid ${isActive ? c.color + '50' : 'var(--c-border)'}`, background: isActive ? `${c.color}08` : 'var(--c-surface)', padding: '2rem', cursor: 'pointer', transition: 'all .3s', position: 'relative', overflow: 'hidden', boxShadow: isActive ? `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${c.color}25` : 'none' }}>
                  {/* Top accent */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${c.color}, transparent)`, opacity: isActive ? 1 : 0.4, transition: 'opacity .3s' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {/* Code badge */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: 72, height: 72, borderRadius: '1.5rem', background: `${c.color}15`, border: `1px solid ${c.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isActive ? `0 0 30px ${c.color}30` : 'none', transition: 'box-shadow .3s' }}>
                        <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.4rem', fontWeight: 900, color: c.color, letterSpacing: '-.02em', fontStyle: 'italic' }}>{c.code}</span>
                      </div>
                      {c.popular && (
                        <span style={{ position: 'absolute', top: -8, right: -8, fontSize: '.55rem', fontWeight: 900, color: '#050805', background: '#00FF41', padding: '2px 7px', borderRadius: '999px', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>MAARUFU</span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>{c.full}</h3>
                        <span style={{ padding: '.2rem .7rem', borderRadius: '999px', background: `${c.color}12`, border: `1px solid ${c.color}25`, fontSize: '.65rem', fontWeight: 700, color: c.color, letterSpacing: '.08em' }}>{c.streams}</span>
                      </div>
                      <p style={{ fontSize: '.85rem', color: 'var(--c-w50)', margin: 0 }}>{c.desc}</p>
                    </div>

                    <motion.div animate={{ rotate: isActive ? 90 : 0 }} transition={{ duration: 0.3 }}>
                      <ArrowRight style={{ width: 20, height: 20, color: isActive ? c.color : 'var(--c-w35)', flexShrink: 0 }} />
                    </motion.div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} style={{ overflow: 'hidden' }}>
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${c.color}20`, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          {c.full.split(' Â· ').map(subject => (
                            <div key={subject} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.625rem 1rem', borderRadius: '999px', background: `${c.color}10`, border: `1px solid ${c.color}25` }}>
                              <CheckCircle2 style={{ width: 14, height: 14, color: c.color }} />
                              <span style={{ fontSize: '.82rem', fontWeight: 600, color: '#fff' }}>{subject}</span>
                            </div>
                          ))}
                          <Link href="/admissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.625rem 1.25rem', borderRadius: '999px', background: c.color, color: '#050805', fontWeight: 800, fontSize: '.82rem', textDecoration: 'none', transition: 'opacity .2s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                            Jiandikishe <ChevronRight style={{ width: 14, height: 14 }} />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          EXAM CALENDAR â€” Premium countdown cards
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ padding: '0 0 var(--section-py)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,255,65,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div className="site-container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} style={{ marginBottom: '3.5rem' }}>
            <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
              <Calendar style={{ width: 13, height: 13 }} /> Kalenda ya Mitihani
            </span>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', marginTop: '.75rem', letterSpacing: '-.025em' }}>
              Maandalizi Mapema ni <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Ufunguo</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gap: '1.25rem' }} className="exam-grid">
            {EXAMS.map((exam, i) => {
              const days = daysUntil(exam.month);
              const urgency = days < 60 ? 'high' : days < 120 ? 'medium' : 'low';
              return (
                <motion.div key={exam.name}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.09 }} viewport={{ once: true }}
                  style={{ borderRadius: '2rem', border: `1px solid ${exam.color}22`, background: 'var(--c-surface)', padding: '2rem', overflow: 'hidden', position: 'relative', transition: 'border-color .3s, transform .3s, box-shadow .3s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${exam.color}50`; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 20px 50px rgba(0,0,0,0.4)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${exam.color}22`; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${exam.color}, transparent)` }} />
                  <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${exam.color}, transparent)`, opacity: 0.4 }} />

                  <div className="exam-card-inner">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>{exam.name}</h3>
                        {urgency === 'high' && (
                          <span style={{ padding: '.2rem .6rem', borderRadius: '999px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '.62rem', fontWeight: 800, color: '#EF4444', letterSpacing: '.08em', animation: 'glowPulse 2s ease-in-out infinite' }}>KARIBU</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                        <FileText style={{ width: 13, height: 13, color: 'var(--c-w35)' }} />
                        <span style={{ fontSize: '.8rem', color: 'var(--c-w50)', fontWeight: 600 }}>{exam.form}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <Clock style={{ width: 13, height: 13, color: exam.color }} />
                        <span style={{ fontSize: '.8rem', color: exam.color, fontWeight: 700 }}>{exam.label}</span>
                      </div>
                    </div>

                    {/* Countdown badge */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 90, height: 90, borderRadius: '1.5rem', background: `${exam.color}15`, border: `1px solid ${exam.color}35`, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 0%, ${exam.color}20, transparent 70%)` }} />
                      <span style={{ fontFamily: 'var(--f-display)', fontSize: '2rem', fontWeight: 900, color: exam.color, lineHeight: 1, fontStyle: 'italic', position: 'relative', zIndex: 1 }}>{days}</span>
                      <span style={{ fontSize: '.58rem', color: `${exam.color}90`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', position: 'relative', zIndex: 1 }}>siku</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── RATIBA ZA MASOMO (PUBLIC TIMETABLES) ── */}
      <section id="timetables" style={{ padding: '0 0 var(--section-py)', position: 'relative' }}>
        <div className="site-container">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} style={{ marginBottom: '3rem' }}>
            <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
              <FileText style={{ width: 13, height: 13 }} /> Ratiba Rasmi za Masomo
            </span>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', marginTop: '.75rem', letterSpacing: '-.025em' }}>
              Pakua <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Ratiba Yako</span>
            </h2>
            <p style={{ color: 'var(--c-w40)', fontSize: '.95rem', maxWidth: 480, marginTop: '.75rem' }}>
              Ratiba za masomo zilizopakiwa na Uongozi wa Shule kwa ajili ya wanafunzi na wazazi.
            </p>
          </motion.div>

          {loadingTimetables ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-shimmer" style={{ height: 110, borderRadius: '1.5rem' }} />
              ))}
            </div>
          ) : timetables.length === 0 ? (
            <div style={{ borderRadius: '1.75rem', border: '1px solid var(--c-border)', background: 'var(--c-surface)', padding: '3rem', textAlign: 'center' }}>
              <Calendar style={{ width: 44, height: 44, color: 'var(--c-w20)', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--c-w40)', fontSize: '.9rem' }}>Hakuna ratiba zilizopakiwa kwa sasa. Zitawekwa hivi karibuni.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {timetables.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }} viewport={{ once: true }}
                  style={{
                    borderRadius: '1.5rem', border: '1px solid var(--c-border)', background: 'var(--c-surface)',
                    padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem',
                    transition: 'border-color .3s, transform .3s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(0,255,65,0.3)'; el.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-border)'; el.style.transform = 'translateY(0)'; }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem', marginBottom: '.75rem' }}>
                      <span style={{ fontSize: '.68rem', fontWeight: 800, color: 'var(--c-lime)', background: 'rgba(0,255,65,0.1)', padding: '.25rem .75rem', borderRadius: 999, border: '1px solid rgba(0,255,65,0.2)' }}>
                        {FORM_LABELS[t.form] || t.form} {t.stream ? `— ${t.stream}` : ''}
                      </span>
                      <span style={{ fontSize: '.7rem', color: 'var(--c-w35)' }}>{t.term}</span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3 }}>{t.title}</h3>
                    <p style={{ fontSize: '.75rem', color: 'var(--c-w40)', margin: '.35rem 0 0' }}>Mwaka wa Masomo: {t.academicYear}</p>
                  </div>

                  <a
                    href={t.fileUrl ? (t.fileUrl.includes('/upload/') && !t.fileUrl.includes('fl_attachment') ? t.fileUrl.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(t.title.replace(/[^a-zA-Z0-9_-]/g, '_'))}/`) : t.fileUrl) : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                      padding: '.75rem 1.25rem', borderRadius: '1rem', background: 'rgba(0,255,65,0.12)',
                      border: '1px solid rgba(0,255,65,0.25)', color: '#00FF41', fontWeight: 700, fontSize: '.85rem',
                      textDecoration: 'none', transition: 'background .2s',
                    }}
                  >
                    <Download style={{ width: 15, height: 15 }} /> Pakua Faili ya Ratiba
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CTA â€” Cinematic enrollment
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ padding: '0 0 var(--section-py)' }}>
        <div className="site-container">
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
            style={{ borderRadius: '2.5rem', overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, var(--c-surface) 0%, var(--c-bg2) 100%)', border: '1px solid var(--c-bl-sm)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #34D399, #60A5FA, #00FF41, #A78BFA, #F59E0B)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(0,255,65,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(96,165,250,0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />
            <div className="pattern-grid" style={{ position: 'absolute', inset: 0, opacity: 0.15 }} />

            <div style={{ position: 'relative', zIndex: 1, padding: '5rem 3rem' }}>
              <div className="cta-split">
                <div>
                  <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
                    <TrendingUp style={{ width: 13, height: 13 }} /> Jiandikishe Leo
                  </span>
                  <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', marginTop: '.75rem', marginBottom: '1.5rem', letterSpacing: '-.025em', lineHeight: 1.1 }}>
                    Anza Safari Yako ya<br /><span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Taaluma</span>
                  </h2>
                  <p style={{ fontSize: '1rem', color: 'var(--c-w50)', maxWidth: 440, lineHeight: 1.8, marginBottom: '2.5rem' }}>
                    Nafasi za masomo zinasubiri wanafunzi wenye nia na bidii. Jiandikishe sasa na anza safari yako ya mafanikio pamoja na Mpendae Secondary School.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link href="/admissions" className="btn-primary" style={{ borderRadius: '999px', padding: '.875rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
                      Jiandikishe Sasa <ChevronRight style={{ width: 16, height: 16 }} />
                    </Link>
                    <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.875rem 1.75rem', borderRadius: '999px', border: '1px solid var(--c-border)', color: 'var(--c-w50)', fontWeight: 700, textDecoration: 'none', fontSize: '.9rem', transition: 'all .25s' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-bl)'; el.style.color = 'var(--c-lime)'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-border)'; el.style.color = 'var(--c-w50)'; }}>
                      Wasiliana <ArrowRight style={{ width: 14, height: 14 }} />
                    </Link>
                  </div>
                </div>

                {/* Feature list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
                  {[
                    { icon: Zap, text: 'Walimu waliohitimu kimataifa', color: '#FFD93D' },
                    { icon: Star, text: 'Pass rate ya 98% NECTA 2025', color: '#00FF41' },
                    { icon: Users, text: 'Madarasa madogo â€” umakini wa binafsi', color: '#60A5FA' },
                    { icon: Award, text: 'Tuzo 25+ za kitaifa na kimataifa', color: '#A78BFA' },
                    { icon: GraduationCap, text: 'Msaada wa kuchagua chuo kikuu', color: '#F472B6' },
                  ].map(({ icon: Icon, text, color }) => (
                    <motion.div key={text}
                      initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }} viewport={{ once: true }}
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '1.25rem', border: `1px solid ${color}18`, background: `${color}07` }}>
                      <div style={{ width: 36, height: 36, borderRadius: '.875rem', background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon style={{ width: 16, height: 16, color }} />
                      </div>
                      <span style={{ fontSize: '.88rem', color: 'var(--c-w70)', fontWeight: 600 }}>{text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @media(min-width: 900px) {
          .acad-hero-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 5rem; align-items: center; }
          .acad-dept-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start; }
          .combo-grid { grid-template-columns: 1fr 1fr !important; }
          .exam-grid { grid-template-columns: 1fr 1fr !important; }
          .cta-split { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
          .exam-card-inner { display: flex; align-items: center; gap: 1.5rem; justify-content: space-between; }
        }
        @media(max-width: 899px) {
          .acad-hero-grid { display: flex; flex-direction: column; gap: 3rem; }
          .acad-dept-grid { display: flex; flex-direction: column; gap: 2rem; }
          .cta-split { display: flex; flex-direction: column; gap: 3rem; }
          .exam-card-inner { display: flex; align-items: center; gap: 1.5rem; justify-content: space-between; }
        }
      `}</style>
    </div>
  );
}