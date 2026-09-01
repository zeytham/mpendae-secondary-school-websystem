'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, Calculator, Beaker, Globe, Briefcase, Music, Palette, Clock } from 'lucide-react';

const SUBJECTS = {
  'Sayansi': {
    icon: Beaker, color: '#34D399',
    desc: 'Fizikia, Kemikali, Biolojia, na Jiografia ya Binadamu',
    subjects: [
      { name: 'Fizikia', desc: 'Sheria za asili, umeme, mwanga, na nguvu' },
      { name: 'Kemikali', desc: 'Michanganyiko ya kemikali, atomi, na maabara' },
      { name: 'Biolojia', desc: 'Viumbe hai, mwili wa binadamu, na mazingira' },
      { name: 'Jiografia', desc: 'Hali ya hewa, ramani, na maliasili' },
    ],
  },
  'Hisabati': {
    icon: Calculator, color: '#60A5FA',
    desc: 'Hisabati ya Kawaida, Hisabati ya Ziada, na Takwimu',
    subjects: [
      { name: 'Hisabati (Core)', desc: 'Algebra, geometry, na calculus ya msingi' },
      { name: 'Hisabati ya Ziada', desc: 'Calculus ya juu, trigonometry, na statistics' },
      { name: 'Takwimu', desc: 'Data analysis, probability, na graphs' },
    ],
  },
  'Lugha': {
    icon: Globe, color: '#F472B6',
    desc: 'Kiswahili, Kiingereza, na Lugha za Kigeni',
    subjects: [
      { name: 'Kiswahili', desc: 'Lugha, fasihi, na insha za Kiswahili' },
      { name: 'Kiingereza', desc: 'Grammar, composition, na literature' },
      { name: 'Lugha ya Kiarabu', desc: 'Msingi wa lugha ya Kiarabu' },
    ],
  },
  'Biashara': {
    icon: Briefcase, color: '#F59E0B',
    desc: 'Biashara, Uhasibu, na Uchumi',
    subjects: [
      { name: 'Biashara', desc: 'Kanuni za biashara, masoko, na usimamizi' },
      { name: 'Uhasibu', desc: 'Vitabu vya hesabu, ripoti za fedha' },
      { name: 'Uchumi', desc: 'Micro na macro economics' },
    ],
  },
  'Sanaa': {
    icon: Music, color: '#A78BFA',
    desc: 'Sanaa ya Kuchora, Muziki, na Elimu ya Mwili',
    subjects: [
      { name: 'Sanaa ya Kuchora', desc: 'Michoro, rangi, na ubunifu wa kisanaa' },
      { name: 'Muziki', desc: 'Sauti, ala za muziki, na utunzi' },
      { name: 'Elimu ya Mwili', desc: 'Michezo, afya, na ustawi wa mwili' },
    ],
  },
};

const COMBINATIONS = [
  { code: 'PCB', full: 'Fizikia · Kemikali · Biolojia', streams: 'Form V & VI', color: '#34D399' },
  { code: 'PCM', full: 'Fizikia · Kemikali · Hisabati', streams: 'Form V & VI', color: '#60A5FA' },
  { code: 'HGE', full: 'Historia · Jiografia · Uchumi', streams: 'Form V & VI', color: '#F59E0B' },
  { code: 'CBG', full: 'Biashara · Jiografia · Biolojia', streams: 'Form V & VI', color: '#F472B6' },
  { code: 'HGL', full: 'Historia · Jiografia · Lugha', streams: 'Form V & VI', color: '#A78BFA' },
];

const EXAMS = [
  { name: 'Mtihani wa Kati (Mock)', month: 'Agosti 2025', form: 'Form IV & VI', color: '#F59E0B', days: 45 },
  { name: 'NECTA Form IV', month: 'Novemba 2025', form: 'Form IV', color: '#EF4444', days: 95 },
  { name: 'NECTA Form VI', month: 'Novemba 2025', form: 'Form VI', color: '#EF4444', days: 95 },
  { name: 'Mtihani wa Mwaka', month: 'Desemba 2025', form: 'Form I, II, III, V', color: 'var(--c-lime)', days: 125 },
];

function AccordionItem({ dept, info, isOpen, onToggle }: {
  dept: string;
  info: typeof SUBJECTS[keyof typeof SUBJECTS];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = info.icon;

  return (
    <div
      style={{
        borderRadius: '1.5rem', overflow: 'hidden',
        border: `1px solid ${isOpen ? 'rgba(0,255,65,.25)' : hovered ? 'rgba(255,255,255,.15)' : 'var(--c-border)'}`,
        background: isOpen ? 'rgba(0,255,65,.03)' : 'var(--c-surface)',
        transition: 'all .3s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '1.4rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: '1rem', flexShrink: 0,
          background: `${info.color}18`, border: `1px solid ${info.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: isOpen ? 'rotate(-5deg) scale(1.05)' : 'rotate(0) scale(1)',
          transition: 'transform .3s',
        }}>
          <Icon style={{ width: 22, height: 22, color: info.color }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>{dept}</p>
          <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.45)', margin: '.2rem 0 0' }}>{info.desc}</p>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: .3 }}>
          <ChevronDown style={{ width: 20, height: 20, color: isOpen ? 'var(--c-lime)' : 'rgba(255,255,255,.4)' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: .35, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.875rem' }}>
              {info.subjects.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .3, delay: i * .06 }}
                  style={{ padding: '1rem 1.1rem', borderRadius: '1rem', background: `${info.color}08`, border: `1px solid ${info.color}20` }}
                >
                  <p style={{ fontSize: '.875rem', fontWeight: 700, color: '#fff', margin: 0 }}>{s.name}</p>
                  <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.45)', margin: '.35rem 0 0', lineHeight: 1.5 }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AcademicsPage() {
  const [openDept, setOpenDept] = useState<string | null>('Sayansi');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>

      {/* ── HERO ── */}
      <div style={{
        paddingTop: 'calc(var(--nav-h) + 5rem)', paddingBottom: '5rem',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, var(--c-bg2) 0%, var(--c-surface) 100%)',
      }}>
        <div className="pattern-grid" style={{ position: 'absolute', inset: 0, opacity: .4, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="site-container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.span
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .08 }}
            className="section-label" style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}
          >
            <BookOpen style={{ width: 14, height: 14 }} /> Masomo & Mitaala
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
              Masomo{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Yetu</span>
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55, delay: .38 }}
            style={{ color: 'rgba(255,255,255,.5)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto' }}
          >
            Mitaala yenye ubora wa kimataifa inayotayarisha wanafunzi kwa mustakabali mzuri.
          </motion.p>
        </div>
      </div>

      <section style={{ padding: '4rem 0 7rem' }}>
        <div className="site-container">

          {/* ── SUBJECTS ACCORDION ── */}
          <div style={{ marginBottom: '5rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: .55 }} viewport={{ once: true }}
              style={{ marginBottom: '2rem' }}
            >
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff', marginBottom: '.5rem' }}>
                Idara za Masomo
              </h2>
              <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.9rem' }}>Gonga kila idara kuona masomo yake yote.</p>
            </motion.div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
              {Object.entries(SUBJECTS).map(([dept, info], i) => (
                <motion.div
                  key={dept}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: .5, delay: i * .07 }} viewport={{ once: true }}
                >
                  <AccordionItem
                    dept={dept} info={info}
                    isOpen={openDept === dept}
                    onToggle={() => setOpenDept(openDept === dept ? null : dept)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── COMBINATIONS ── */}
          <div style={{ marginBottom: '5rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: .55 }} viewport={{ once: true }}
              style={{ marginBottom: '2rem' }}
            >
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff', marginBottom: '.5rem' }}>
                Combinations za Form V & VI
              </h2>
              <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.9rem' }}>Chagua combination inayokufaa kwa malengo yako ya masomo.</p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {COMBINATIONS.map((c, i) => (
                <motion.div
                  key={c.code}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: .45, delay: i * .07 }} viewport={{ once: true }}
                  style={{
                    padding: '1.5rem', borderRadius: '1.25rem',
                    background: 'var(--c-surface)', border: '1px solid var(--c-border)',
                    transition: 'all .3s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${c.color}50`; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = `0 16px 40px rgba(0,0,0,.3)`; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-border)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '.875rem' }}>
                    <span style={{
                      fontFamily: 'var(--f-display)', fontSize: '1.6rem', fontWeight: 900,
                      color: c.color, lineHeight: 1, letterSpacing: '-.02em',
                    }}>
                      {c.code}
                    </span>
                    <span style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.4)', padding: '.2rem .6rem', borderRadius: 999, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}>
                      {c.streams}
                    </span>
                  </div>
                  <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'rgba(255,255,255,.7)', lineHeight: 1.6, margin: 0 }}>{c.full}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── EXAM CALENDAR ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: .55 }} viewport={{ once: true }}
              style={{ marginBottom: '2rem' }}
            >
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff', marginBottom: '.5rem' }}>
                Kalenda ya Mitihani
              </h2>
              <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.9rem' }}>Maandalizi mapema ndio ufunguo wa mafanikio.</p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {EXAMS.map((exam, i) => (
                <motion.div
                  key={exam.name}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: .45, delay: i * .08 }} viewport={{ once: true }}
                  style={{
                    padding: '1.5rem', borderRadius: '1.25rem',
                    background: 'var(--c-surface)', border: `1px solid ${exam.color}25`,
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {/* Color accent line */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${exam.color}, transparent)` }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '.9rem', fontWeight: 800, color: '#fff', margin: 0, marginBottom: '.35rem', lineHeight: 1.4 }}>{exam.name}</p>
                      <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.45)', margin: 0, marginBottom: '.25rem' }}>{exam.form}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                        <Clock style={{ width: 11, height: 11, color: exam.color }} />
                        <span style={{ fontSize: '.72rem', fontWeight: 700, color: exam.color }}>{exam.month}</span>
                      </div>
                    </div>
                    <div style={{
                      width: 52, height: 52, borderRadius: '1rem', flexShrink: 0,
                      background: `${exam.color}18`, border: `1px solid ${exam.color}30`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: exam.color, lineHeight: 1 }}>{exam.days}</span>
                      <span style={{ fontSize: '.5rem', color: `${exam.color}90`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>siku</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
