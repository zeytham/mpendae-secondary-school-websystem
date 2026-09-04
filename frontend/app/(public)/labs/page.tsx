'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FlaskConical, Microscope, Zap, Monitor, Cpu, ArrowLeft,
  CheckCircle2, Clock, Users, Shield, BookOpen, ChevronRight,
  Activity, Wifi, Layers, Atom, Code2, BarChart3, AlertTriangle,
} from 'lucide-react';

/* ── Animated counter ── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end center'] });

  useEffect(() => {
    const unsub = scrollYProgress.on('change', v => {
      if (v > 0.1) setVal(Math.round(target * Math.min(v * 2, 1)));
    });
    return unsub;
  }, [target, scrollYProgress]);

  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Capacity bar ── */
function CapacityBar({ used, total }: { used: number; total: number }) {
  const pct = Math.round((used / total) * 100);
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
        <span style={{ fontSize: '.68rem', color: 'var(--c-w35)', fontWeight: 600 }}>Uwezo wa matumizi</span>
        <span style={{ fontSize: '.68rem', color: 'var(--c-lime)', fontWeight: 800, fontFamily: 'var(--f-mono)' }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [.22, 1, .36, 1], delay: .3 }}
          viewport={{ once: true }}
          style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--c-lime), #a8ffbe)', boxShadow: '0 0 8px rgba(0,255,65,.4)' }}
        />
      </div>
    </div>
  );
}

const LABS = [
  {
    id: 'chemistry',
    icon: FlaskConical,
    statusIcon: Activity,
    num: '01',
    name: 'Maabara ya Kemikali',
    subtitle: 'Chemistry Laboratory',
    status: 'Inafanya kazi',
    statusOk: true,
    desc: 'Maabara yenye vifaa vya kisasa kwa majaribio ya kemikali, titration, na uchambuzi wa michanganyiko. Wanafunzi hufanya majaribio ya vitendo yanayotayarisha NECTA na zaidi.',
    features: ['Fume hoods 6', 'Vituo 40 vya kazi', 'Vifaa vya usalama vya ISO', 'Reagents za hadhi ya juu'],
    equipment: [
      { name: 'Spectrophotometer', qty: 2 },
      { name: 'pH Meters', qty: 10 },
      { name: 'Burettes & Pipettes', qty: 80 },
      { name: 'Fume Hoods', qty: 6 },
    ],
    capacity: 40,
    currentUsage: 32,
    sessions: 'Jumatatu–Ijumaa',
    established: '2018',
    area: '120 m²',
  },
  {
    id: 'physics',
    icon: Zap,
    statusIcon: Wifi,
    num: '02',
    name: 'Maabara ya Fizikia',
    subtitle: 'Physics Laboratory',
    status: 'Inafanya kazi',
    statusOk: true,
    desc: 'Vifaa vya kuchunguza mwanga, umeme, nguvu za mvuto, na mawimbi ya sauti. Maabara hii inawezesha wanafunzi kuthibitisha nadharia za kisayansi kwa vitendo halisi.',
    features: ['Oscilloscopes za kisasa', 'Optics bench sets', 'Power supplies za kudhibitiwa', 'Sensors za dijiti'],
    equipment: [
      { name: 'Oscilloscopes', qty: 8 },
      { name: 'Function Generators', qty: 8 },
      { name: 'Optics Kits', qty: 15 },
      { name: 'Mass Sets', qty: 30 },
    ],
    capacity: 35,
    currentUsage: 28,
    sessions: 'Kila siku',
    established: '2016',
    area: '110 m²',
  },
  {
    id: 'biology',
    icon: Microscope,
    statusIcon: Atom,
    num: '03',
    name: 'Maabara ya Biolojia',
    subtitle: 'Biology Laboratory',
    desc: 'Microscopes za kisasa, mifano ya anatomia, na viumbe vya kuchunguza. Wanafunzi hujifunza muundo wa seli, mifumo ya mwili wa binadamu, na ikolojia kwa njia ya vitendo.',
    status: 'Inafanya kazi',
    statusOk: true,
    features: ['Microscopes 30 za hadhi', 'Mifano ya anatomia ya plastiki', 'Incubator ya seli', 'Sehemu salama ya dissection'],
    equipment: [
      { name: 'Compound Microscopes', qty: 30 },
      { name: 'Anatomical Models', qty: 12 },
      { name: 'Slide Collections', qty: 500 },
      { name: 'Dissection Kits', qty: 20 },
    ],
    capacity: 35,
    currentUsage: 35,
    sessions: 'Jumatatu–Ijumaa',
    established: '2017',
    area: '115 m²',
  },
  {
    id: 'computer',
    icon: Monitor,
    statusIcon: Code2,
    num: '04',
    name: 'Maabara ya Kompyuta',
    subtitle: 'Computer Laboratory',
    desc: 'Kompyuta 50 za kisasa zenye uunganiko wa intaneti wa kasi ya juu. Wanafunzi hujifunza programu, kuchakata maandishi, na kutumia programu za elimu zinazopendekezwa.',
    status: 'Imeboreka 2024',
    statusOk: true,
    features: ['Kompyuta 50 za kisasa', 'Intaneti 100 Mbps ya fiber', 'Smart projector 120"', 'LAN ya ndani ya shule'],
    equipment: [
      { name: 'Desktop Computers', qty: 50 },
      { name: 'Laser Printers', qty: 3 },
      { name: 'Scanners', qty: 2 },
      { name: 'UPS Systems', qty: 10 },
    ],
    capacity: 50,
    currentUsage: 45,
    sessions: 'Kila siku 6:00–18:00',
    established: '2020',
    area: '160 m²',
  },
  {
    id: 'electronics',
    icon: Cpu,
    statusIcon: Layers,
    num: '05',
    name: 'Warsha ya Teknolojia',
    subtitle: 'Technology Workshop',
    desc: 'Warsha ya mwisho wa teknolojia yenye vifaa vya roboti, Arduino, na ujenzi wa mzunguko wa umeme. Inakuza ujuzi wa uhandisi na ubunifu wa kiteknolojia.',
    status: 'Mpya 2023',
    statusOk: true,
    features: ['Arduino & Raspberry Pi kits', 'Roboti 6 za kutayarisha', '3D Printer ya kisasa', 'Soldering stations 12'],
    equipment: [
      { name: 'Arduino Starter Kits', qty: 20 },
      { name: 'Raspberry Pi Sets', qty: 10 },
      { name: '3D Printers', qty: 2 },
      { name: 'Robot Kits', qty: 6 },
    ],
    capacity: 25,
    currentUsage: 18,
    sessions: 'Jumamosi (ziada) + Alhamisi',
    established: '2023',
    area: '90 m²',
  },
];

const SAFETY_RULES = [
  { icon: Shield, rule: 'Vaa apron, miwani ya usalama, na glavu wakati wa kufanya majaribio yoyote ya kemikali' },
  { icon: AlertTriangle, rule: 'Usiingie maabara bila ruhusa ya mwalimu au msimamizi wa maabara' },
  { icon: Activity, rule: 'Ripoti mara moja ajali, mkato, au spill yoyote ya kemikali' },
  { icon: Shield, rule: 'Usile wala usinywe ndani ya maabara za kemikali, biolojia na fizikia' },
  { icon: BookOpen, rule: 'Soma maelekezo yote ya jaribio kabla ya kuanza — usiwe na haraka' },
  { icon: CheckCircle2, rule: 'Safisha na rudisha vifaa vyote mahali pake sahihi baada ya kila kipindi' },
];

const GLOBAL_STATS = [
  { icon: FlaskConical, val: 5, suffix: '', label: 'Maabara' },
  { icon: Users, val: 185, suffix: '+', label: 'Wanafunzi kwa wakati mmoja' },
  { icon: BarChart3, val: 98, suffix: '%', label: 'Matumizi wastani' },
  { icon: Shield, val: 100, suffix: '%', label: 'Vifaa vya usalama' },
];

export default function LabsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const heroOpacity = useTransform(scrollYProgress, [0, .7], [1, 0]);
  const [activeTab, setActiveTab] = useState<string>('chemistry');

  const activeLab = LABS.find(l => l.id === activeTab) ?? LABS[0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════
          HERO — Cinematic parallax
      ══════════════════════════════════ */}
      <div ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'var(--c-bg)' }}>
        {/* Grid pattern */}
        <motion.div style={{ position: 'absolute', inset: 0, opacity: heroOpacity }}>
          <div className="pattern-grid" style={{ position: 'absolute', inset: 0, opacity: .5 }} />
          {/* Large lime glow */}
          <div style={{ position: 'absolute', top: '-20%', right: '-15%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,.08) 0%, transparent 65%)', animation: 'blobFloat 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,.05) 0%, transparent 65%)', animation: 'blobFloat 10s ease-in-out infinite reverse' }} />
          {/* Scan line */}
          <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(0,255,65,.4), transparent)', animation: 'scanLine 4s linear infinite' }} />
        </motion.div>

        <motion.div style={{ y: heroY, position: 'relative', zIndex: 1 }} className="site-container">
          <div className="site-container" style={{ position: 'relative', zIndex: 1, paddingTop: 'calc(var(--nav-h) + var(--announce-h) + 4rem)', paddingBottom: '6rem' }}>

            <Link href="/academics"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', fontSize: '.78rem', color: 'var(--c-w35)', textDecoration: 'none', marginBottom: '3rem', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--c-lime)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--c-w35)'}
            >
              <ArrowLeft style={{ width: 12, height: 12 }} /> Masomo &amp; Mitaala
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem', alignItems: 'center' }} className="hero-split">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}
                >
                  <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                    <FlaskConical style={{ width: 13, height: 13 }} /> Vifaa vya Kisasa
                  </span>
                </motion.div>

                <div style={{ overflow: 'hidden' }}>
                  <motion.h1
                    initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: .8, delay: .15, ease: [.22, 1, .36, 1] }}
                    style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-.03em', marginBottom: '1.5rem' }}
                  >
                    Maabara<br />
                    <span style={{ fontStyle: 'italic', color: 'var(--c-lime)', textShadow: '0 0 40px rgba(0,255,65,.3)' }}>za Kisasa</span>
                  </motion.h1>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, delay: .35 }}
                  style={{ fontSize: '1.1rem', color: 'var(--c-w50)', maxWidth: 480, lineHeight: 1.75, marginBottom: '2.5rem' }}
                >
                  Vifaa vya kisasa vinawezesha wanafunzi wetu kugundua, kujifunza, na kubuni kupitia sayansi ya vitendo inayotayarisha kwa mustakabali.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .48 }}
                  style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
                >
                  <a href="#labs-section" className="btn-primary" style={{ borderRadius: '999px', padding: '.875rem 2rem', fontSize: '.9rem' }}>
                    Gundua Maabara <ChevronRight style={{ width: 16, height: 16 }} />
                  </a>
                  <Link href="/admissions"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.875rem 2rem', borderRadius: '999px', border: '1px solid var(--c-border)', color: 'var(--c-w50)', fontWeight: 700, textDecoration: 'none', fontSize: '.9rem', transition: 'all .2s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-bl)'; el.style.color = 'var(--c-lime)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-border)'; el.style.color = 'var(--c-w50)'; }}
                  >
                    Jiandikishe
                  </Link>
                </motion.div>
              </div>

              {/* Stats grid */}
              <motion.div
                initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: .7, delay: .4 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
                className="hero-stats-grid"
              >
                {GLOBAL_STATS.map(({ icon: Icon, val, suffix, label }, i) => (
                  <div key={label} style={{ padding: '1.75rem', borderRadius: '1.5rem', border: '1px solid var(--c-bl-sm)', background: 'var(--c-surface)', position: 'relative', overflow: 'hidden', transition: 'border-color .3s, transform .3s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-bl)'; el.style.transform = 'scale(1.03)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-bl-sm)'; el.style.transform = 'scale(1)'; }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: i === 0 ? 'var(--c-lime)' : `rgba(0,255,65,${.5 - i * .1})` }} />
                    <Icon style={{ width: 20, height: 20, color: 'var(--c-lime)', marginBottom: '1rem' }} />
                    <p style={{ fontFamily: 'var(--f-display)', fontSize: '2.5rem', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1, fontStyle: 'italic' }}>
                      <Counter target={val} suffix={suffix} />
                    </p>
                    <p style={{ fontSize: '.75rem', color: 'var(--c-w35)', margin: '.5rem 0 0', fontWeight: 600 }}>{label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}
        >
          <span style={{ fontSize: '.65rem', color: 'var(--c-w35)', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' }}>Sogeza chini</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(180deg, var(--c-lime), transparent)' }} />
        </motion.div>
      </div>

      {/* ══════════════════════════════════
          INTERACTIVE LAB EXPLORER
      ══════════════════════════════════ */}
      <section id="labs-section" style={{ padding: '7rem 0' }}>
        <div className="site-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }} viewport={{ once: true }}
            style={{ marginBottom: '3rem' }}
          >
            <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
              <Layers style={{ width: 13, height: 13 }} /> Gundua Maabara Zetu
            </span>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginTop: '.75rem', letterSpacing: '-.02em' }}>
              Chagua Maabara{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Yoyote</span>
            </h2>
          </motion.div>

          {/* Tab selector */}
          <div style={{ display: 'flex', gap: '.625rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {LABS.map(lab => {
              const Icon = lab.icon;
              const isActive = activeTab === lab.id;
              return (
                <button key={lab.id} onClick={() => setActiveTab(lab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '.5rem',
                    padding: '.625rem 1.25rem', borderRadius: '999px',
                    border: `1px solid ${isActive ? 'var(--c-bl)' : 'var(--c-border)'}`,
                    background: isActive ? 'var(--c-lime-hint)' : 'var(--c-surface)',
                    color: isActive ? 'var(--c-lime)' : 'var(--c-w50)',
                    fontSize: '.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
                  }}
                >
                  <Icon style={{ width: 14, height: 14 }} />
                  <span className="lab-tab-label">{lab.name.split(' ').slice(-1)[0]}</span>
                  <span style={{ fontSize: '.6rem', fontFamily: 'var(--f-mono)', color: isActive ? 'rgba(0,255,65,.6)' : 'var(--c-w35)' }}>{lab.num}</span>
                </button>
              );
            })}
          </div>

          {/* Active lab detail */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .4 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="lab-detail-grid">

              {/* Main info card */}
              <div style={{ borderRadius: '2rem', border: '1px solid var(--c-bl-sm)', background: 'var(--c-surface)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: 4, background: 'linear-gradient(90deg, var(--c-lime), rgba(0,255,65,.3), transparent)' }} />

                {/* Scanline overlay */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,65,.008) 3px, rgba(0,255,65,.008) 4px)', pointerEvents: 'none', borderRadius: '2rem' }} />

                <div style={{ padding: '2.5rem', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {/* Icon */}
                    <div style={{ width: 72, height: 72, borderRadius: '1.5rem', background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                      {(() => { const Icon = activeLab.icon; return <Icon style={{ width: 32, height: 32, color: 'var(--c-lime)' }} />; })()}
                      <span style={{ position: 'absolute', top: -10, right: -10, fontFamily: 'var(--f-mono)', fontSize: '.65rem', fontWeight: 900, color: 'var(--c-lime)', background: 'var(--c-bg)', padding: '2px 7px', borderRadius: 6, border: '1px solid var(--c-bl)' }}>{activeLab.num}</span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-.02em', fontFamily: 'var(--f-display)' }}>
                          {activeLab.name}
                        </h3>
                        <span style={{ padding: '.25rem .75rem', borderRadius: '999px', background: activeLab.statusOk ? 'rgba(0,255,65,.12)' : 'rgba(255,71,87,.12)', border: `1px solid ${activeLab.statusOk ? 'rgba(0,255,65,.3)' : 'rgba(255,71,87,.3)'}`, color: activeLab.statusOk ? 'var(--c-lime)' : 'var(--c-red)', fontSize: '.65rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: activeLab.statusOk ? 'var(--c-lime)' : 'var(--c-red)', animation: 'glowPulse 2s ease-in-out infinite', display: 'inline-block' }} />
                          {activeLab.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '.78rem', color: 'var(--c-lime)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', margin: 0 }}>{activeLab.subtitle}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: '1rem', color: 'var(--c-w55)', lineHeight: 1.8, marginBottom: '2rem' }}>{activeLab.desc}</p>

                  {/* Capacity bar */}
                  <CapacityBar used={activeLab.currentUsage} total={activeLab.capacity} />

                  {/* Meta chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginTop: '1.75rem' }}>
                    {[
                      { icon: Users, label: `Uwezo: ${activeLab.capacity} wanafunzi` },
                      { icon: Clock, label: activeLab.sessions },
                      { icon: BookOpen, label: `Kuanzishwa: ${activeLab.established}` },
                      { icon: Layers, label: `Eneo: ${activeLab.area}` },
                    ].map(({ icon: MI, label }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '.45rem', padding: '.45rem .875rem', borderRadius: '999px', background: 'rgba(255,255,255,.04)', border: '1px solid var(--c-border)' }}>
                        <MI style={{ width: 12, height: 12, color: 'var(--c-lime)', flexShrink: 0 }} />
                        <span style={{ fontSize: '.75rem', color: 'var(--c-w50)', fontWeight: 500 }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Two sub-cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="lab-sub-cards">
                {/* Features */}
                <div style={{ borderRadius: '1.75rem', border: '1px solid var(--c-border)', background: 'var(--c-surface)', padding: '1.75rem' }}>
                  <p style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--c-lime)', margin: '0 0 1.25rem' }}>Vipengele Muhimu</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
                    {activeLab.features.map((f, i) => (
                      <motion.div key={f}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: .35, delay: i * .06 }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: '.625rem' }}
                      >
                        <CheckCircle2 style={{ width: 15, height: 15, color: 'var(--c-lime)', flexShrink: 0, marginTop: '.1rem' }} />
                        <span style={{ fontSize: '.85rem', color: 'var(--c-w55)', lineHeight: 1.5 }}>{f}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div style={{ borderRadius: '1.75rem', border: '1px solid var(--c-border)', background: 'var(--c-surface)', padding: '1.75rem' }}>
                  <p style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--c-lime)', margin: '0 0 1.25rem' }}>Vifaa &amp; Idadi</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                    {activeLab.equipment.map((eq, i) => (
                      <motion.div key={eq.name}
                        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: .35, delay: i * .06 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.625rem .875rem', borderRadius: '.75rem', background: 'var(--c-lime-soft)', border: '1px solid var(--c-bl-sm)' }}
                      >
                        <span style={{ fontSize: '.8rem', color: 'var(--c-w55)', fontWeight: 500 }}>{eq.name}</span>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', fontWeight: 900, color: 'var(--c-lime)', minWidth: 28, textAlign: 'right' }}>{eq.qty}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          SAFETY RULES — Visual list
      ══════════════════════════════════ */}
      <section style={{ padding: '0 0 7rem' }}>
        <div className="site-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }} viewport={{ once: true }}
            style={{ marginBottom: '2.5rem' }}
          >
            <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
              <Shield style={{ width: 13, height: 13 }} /> Kanuni za Usalama
            </span>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginTop: '.75rem', letterSpacing: '-.02em' }}>
              Zinazidi Sharti —{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Lazima Zifuatwe</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {SAFETY_RULES.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: .45, delay: i * .07 }}
                  viewport={{ once: true }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem 1.5rem', borderRadius: '1.25rem', border: '1px solid rgba(255,71,87,.15)', background: 'rgba(255,71,87,.04)', transition: 'border-color .2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,71,87,.3)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,71,87,.15)'}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '.75rem', background: 'rgba(255,71,87,.1)', border: '1px solid rgba(255,71,87,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: 16, height: 16, color: 'var(--c-red)' }} />
                  </div>
                  <p style={{ fontSize: '.875rem', color: 'var(--c-w55)', lineHeight: 1.65, margin: 0 }}>{item.rule}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CTA — cinematic
      ══════════════════════════════════ */}
      <section style={{ padding: '0 0 7rem' }}>
        <div className="site-container">
          <motion.div
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .7 }} viewport={{ once: true }}
            style={{ borderRadius: '2.5rem', border: '1px solid var(--c-bl-sm)', background: 'var(--c-surface)', overflow: 'hidden', position: 'relative', padding: '5rem 3rem', textAlign: 'center' }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -20%, rgba(0,255,65,.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, var(--c-lime), transparent)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: 80, height: 80, borderRadius: '1.75rem', background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 0 40px rgba(0,255,65,.2)' }}>
                <FlaskConical style={{ width: 36, height: 36, color: 'var(--c-lime)' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', marginBottom: '1rem', letterSpacing: '-.02em' }}>
                Karibu Kujua Zaidi
              </h3>
              <p style={{ color: 'var(--c-w50)', maxWidth: 420, margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
                Jiandikishe leo na upate fursa ya kutumia maabara zetu za kisasa za sayansi na teknolojia.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/admissions" className="btn-primary" style={{ borderRadius: '999px', padding: '.875rem 2.5rem' }}>
                  Jiandikishe Sasa <ChevronRight style={{ width: 16, height: 16 }} />
                </Link>
                <Link href="/contact"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.875rem 2rem', borderRadius: '999px', border: '1px solid var(--c-border)', color: 'var(--c-w50)', fontWeight: 700, textDecoration: 'none', fontSize: '.9rem', transition: 'all .25s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-bl)'; el.style.color = 'var(--c-lime)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--c-border)'; el.style.color = 'var(--c-w50)'; }}
                >
                  Wasiliana Nasi
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @media(min-width: 768px) {
          .hero-split { grid-template-columns: 1fr 1fr !important; }
          .lab-detail-grid { grid-template-columns: 1.25fr 1fr !important; grid-template-rows: auto !important; }
        }
        @media(max-width: 767px) {
          .lab-sub-cards { grid-template-columns: 1fr !important; }
          .hero-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .lab-tab-label { display: none; }
        }
        @media(min-width: 1024px) {
          .lab-tab-label { display: inline; }
        }
      `}</style>
    </div>
  );
}
