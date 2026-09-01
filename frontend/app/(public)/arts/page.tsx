'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Palette, Music, Theater, Trophy, Star, Users, Calendar,
  ArrowLeft, ChevronRight, Mic, Paintbrush2, Drum, Heart, Globe, CheckCircle2,
} from 'lucide-react';

const PROGRAMS = [
  {
    id: 'visual-arts',
    num: '01',
    icon: Paintbrush2,
    name: 'Sanaa ya Kuona',
    subtitle: 'Visual Arts',
    desc: 'Programu ya sanaa inayofundisha michoro, uchoraji wa rangi, usanifu wa nyumba, na sanamu. Wanafunzi wetu wameshinda tuzo nyingi za sanaa katika ngazi za taifa na kimataifa.',
    activities: ['Michoro ya mkono', 'Uchoraji wa rangi za maji', 'Uchongaji', 'Digital art'],
    achievements: ['Shindano la SUZA 2025 — 1st Place', 'Sanaa Bora — Kikao cha Zanzibar 2024'],
  },
  {
    id: 'music',
    num: '02',
    icon: Music,
    name: 'Muziki',
    subtitle: 'Music & Performance',
    desc: 'Tunayo bendi ya shule, kwaya, na kikundi cha taarab ya kisasa. Wanafunzi hujifunza ala za muziki kama gitaa, piano, ngoma, na kiatu pamoja na nadharia ya muziki.',
    activities: ['Bendi ya shule', 'Kwaya ya shule', 'Taarab ya kisasa', 'Nadharia ya muziki'],
    achievements: ['Shindano la Kwaya Zanzibar 2025 — Nafasi ya 2', 'Tamasha la Muziki — Washindi 2024'],
  },
  {
    id: 'drama',
    num: '03',
    icon: Theater,
    name: 'Mchezo wa Kuigiza',
    subtitle: 'Drama & Theatre',
    desc: 'Kikundi cha mchezo wa kuigiza kinachofanya maonyesho mwaka mzima. Wanafunzi hujifunza uigizaji, kuandika hati, na uelewa wa fasihi kupitia sanaa ya kuigiza.',
    activities: ['Maonyesho ya mwaka', 'Michezo ya Kiswahili', 'Maonyesho ya Kiingereza', 'Improvisation'],
    achievements: ['Mchezo Bora — Tamasha la Utamaduni 2025', 'Mwandishi Bora — BAKIZA 2024'],
  },
  {
    id: 'culture',
    num: '04',
    icon: Globe,
    name: 'Utamaduni wa Zanzibar',
    subtitle: 'Zanzibari Culture',
    desc: 'Programu maalum inayohifadhi na kueneza utamaduni wa Zanzibar — ngoma za asili, mavazi ya kitamaduni, mapishi ya jadi, na historia ya visiwa vyetu. Tunajivunia mizizi yetu.',
    activities: ['Ngoma za asili', 'Mavazi ya kitamaduni', 'Fasihi ya Zanzibar', 'Historia ya visiwa'],
    achievements: ['Tunzo ya Utamaduni — Serikali ya Zanzibar 2025', 'Mbio za utamaduni — Washindi wa Mkoa 2024'],
  },
  {
    id: 'dance',
    num: '05',
    icon: Drum,
    name: 'Dansi & Harakati',
    subtitle: 'Dance & Movement',
    desc: 'Kikundi cha dansi kinachojumuisha ngoma za asili za Afrika Mashariki, dansi za kisasa, na harakati za sanaa. Kikundi hiki kinawakilisha shule katika maeneo mbalimbali.',
    activities: ['Ngoma za Afrika', 'Dansi ya kisasa', 'Hip-hop ya elimu', 'Dansi za sherehe'],
    achievements: ['Tamasha la Dansi Zanzibar 2025 — Dhahabu', 'East Africa Arts Festival 2024 — Finalist'],
  },
];

const EVENTS_CALENDAR = [
  { month: 'Machi',    event: 'Tamasha la Sanaa la Shule — Maonyesho makubwa ya mwaka' },
  { month: 'Juni',     event: 'Kwaya na Muziki — Karamu ya muziki ya msimu wa baridi' },
  { month: 'Agosti',   event: 'Siku ya Utamaduni — Sherehe ya tamaduni za Zanzibar' },
  { month: 'Novemba',  event: 'Maonyesho ya Kuhitimu — Onyesho la mwisho wa muhula' },
];

export default function ArtsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>

      {/* ── HERO ── */}
      <div style={{
        paddingTop: 'calc(var(--nav-h) + var(--announce-h) + 5rem)',
        paddingBottom: '5rem',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, var(--c-bg2) 0%, var(--c-surface) 100%)',
      }}>
        <div className="pattern-grid" style={{ position: 'absolute', inset: 0, opacity: .4, pointerEvents: 'none' }} />
        {/* Lime glow blobs */}
        <div style={{ position: 'absolute', top: '5%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '0', left: '-5%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="site-container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Back link */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
            <Link
              href="/academics"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem', color: 'var(--c-w35)', textDecoration: 'none', marginBottom: '2.5rem', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--c-w35)'}
            >
              <ArrowLeft style={{ width: 13, height: 13 }} /> Masomo &amp; Mitaala
            </Link>
          </motion.div>

          <div style={{ textAlign: 'center' }}>
            <motion.span
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .08 }}
              className="section-label"
              style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}
            >
              <Palette style={{ width: 14, height: 14 }} /> Ubunifu & Utamaduni
            </motion.span>

            <div style={{ overflow: 'hidden' }}>
              <motion.h1
                initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ duration: .65, delay: .18, ease: [.22, 1, .36, 1] }}
                style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
                  fontWeight: 800, color: '#fff',
                  lineHeight: 1.05, letterSpacing: '-.025em',
                  marginTop: '.75rem', marginBottom: '1.25rem',
                }}
              >
                Sanaa &{' '}
                <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Utamaduni</span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, delay: .38 }}
              style={{ color: 'var(--c-w50)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.7 }}
            >
              Tunaamini sanaa ni nguvu ya kubadilisha jamii. Programu zetu zinakuza ubunifu, heshima ya utamaduni, na mafanikio ya kisanaa kwa kila mwanafunzi.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .5 }}
              style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}
            >
              {[
                { icon: Palette, val: '5+',   label: 'Programu za Sanaa' },
                { icon: Trophy,  val: '20+',  label: 'Tuzo za Sanaa' },
                { icon: Users,   val: '200+', label: 'Wanafunzi wa Sanaa' },
              ].map(({ icon: Icon, val, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
                    <Icon style={{ width: 14, height: 14, color: 'var(--c-lime)' }} />
                    <span style={{ fontFamily: 'var(--f-display)', fontSize: '2rem', fontWeight: 900, color: '#fff', fontStyle: 'italic' }}>{val}</span>
                  </div>
                  <p style={{ fontSize: '.72rem', color: 'var(--c-w35)', fontWeight: 600 }}>{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── PROGRAMS ── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="site-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .55 }} viewport={{ once: true }}
            style={{ marginBottom: '3rem' }}
          >
            <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
              <Star style={{ width: 13, height: 13 }} /> Programu Zetu
            </span>
            <h2 style={{
              fontFamily: 'var(--f-display)',
              fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              fontWeight: 800, color: '#fff',
              marginTop: '.75rem', marginBottom: '.5rem',
            }}>
              Elewa Sanaa kutoka Ndani
            </h2>
            <p style={{ color: 'var(--c-w35)', fontSize: '.9rem', maxWidth: 420 }}>
              Kila programu imeundwa kwa makini ili kukuza vipaji vya kipekee vya mwanafunzi.
            </p>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {PROGRAMS.map((prog, i) => {
              const Icon = prog.icon;
              return (
                <motion.div
                  key={prog.id}
                  id={prog.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: .5, delay: i * .06 }}
                  viewport={{ once: true }}
                  style={{
                    borderRadius: '2rem',
                    border: '1px solid var(--c-border)',
                    background: 'var(--c-surface)',
                    overflow: 'hidden',
                    transition: 'border-color .3s, box-shadow .3s, transform .3s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--c-bl)';
                    el.style.boxShadow = '0 24px 60px rgba(0,0,0,.4), 0 0 0 1px rgba(0,255,65,.08)';
                    el.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--c-border)';
                    el.style.boxShadow = 'none';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Lime top accent */}
                  <div style={{ height: 3, background: 'linear-gradient(90deg, var(--c-lime), rgba(0,255,65,.3), transparent)' }} />

                  <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="arts-card-grid">

                    {/* Left: info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.125rem', marginBottom: '1.25rem' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div style={{
                            width: 56, height: 56, borderRadius: '1.125rem',
                            background: 'var(--c-lime-hint)',
                            border: '1px solid var(--c-bl-sm)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Icon style={{ width: 24, height: 24, color: 'var(--c-lime)' }} />
                          </div>
                          <span style={{
                            position: 'absolute', top: -8, right: -8,
                            fontSize: '.6rem', fontWeight: 900, color: 'var(--c-lime)',
                            fontFamily: 'var(--f-mono)',
                            background: 'var(--c-bg)', padding: '1px 5px', borderRadius: 4,
                            border: '1px solid var(--c-bl-sm)',
                          }}>{prog.num}</span>
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-.015em' }}>
                            {prog.name}
                          </h3>
                          <p style={{ fontSize: '.72rem', color: 'var(--c-lime)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', margin: '.25rem 0 0' }}>
                            {prog.subtitle}
                          </p>
                        </div>
                      </div>
                      <p style={{ fontSize: '.9rem', color: 'var(--c-w50)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                        {prog.desc}
                      </p>
                      {/* Activity tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                        {prog.activities.map(a => (
                          <span key={a} style={{
                            padding: '.3rem .875rem', borderRadius: '999px',
                            background: 'var(--c-lime-hint)',
                            border: '1px solid var(--c-bl-sm)',
                            fontSize: '.75rem', fontWeight: 600, color: 'var(--c-lime)',
                          }}>
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: achievements */}
                    <div style={{
                      background: 'var(--c-lime-soft)',
                      borderRadius: '1.25rem',
                      border: '1px solid var(--c-bl-sm)',
                      padding: '1.25rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                        <Trophy style={{ width: 14, height: 14, color: 'var(--c-lime)' }} />
                        <p style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--c-lime)', margin: 0 }}>
                          Mafanikio
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
                        {prog.achievements.map(a => (
                          <div key={a} style={{ display: 'flex', alignItems: 'flex-start', gap: '.625rem' }}>
                            <CheckCircle2 style={{ width: 14, height: 14, color: 'var(--c-lime)', flexShrink: 0, marginTop: '.15rem' }} />
                            <p style={{ fontSize: '.825rem', color: 'var(--c-w55)', margin: 0, lineHeight: 1.5 }}>{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── EVENTS CALENDAR ── */}
      <section style={{ padding: '0 0 7rem' }}>
        <div className="site-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .55 }} viewport={{ once: true }}
            style={{ marginBottom: '2.5rem' }}
          >
            <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
              <Calendar style={{ width: 13, height: 13 }} /> Matukio ya Mwaka
            </span>
            <h2 style={{
              fontFamily: 'var(--f-display)',
              fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              fontWeight: 800, color: '#fff',
              marginTop: '.75rem', marginBottom: '.5rem',
            }}>
              Kalenda ya Sanaa 2026
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {EVENTS_CALENDAR.map((ev, i) => (
              <motion.div
                key={ev.month}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: .45, delay: i * .07 }}
                viewport={{ once: true }}
                style={{
                  padding: '1.5rem',
                  borderRadius: '1.5rem',
                  border: '1px solid var(--c-bl-sm)',
                  background: 'var(--c-surface)',
                  position: 'relative', overflow: 'hidden',
                  transition: 'border-color .3s, transform .3s, box-shadow .3s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--c-bl)';
                  el.style.transform = 'translateY(-4px)';
                  el.style.boxShadow = '0 16px 40px rgba(0,0,0,.35)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--c-bl-sm)';
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }}
              >
                {/* Lime top bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: 'linear-gradient(90deg, var(--c-lime), rgba(0,255,65,.3), transparent)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem', marginBottom: '.875rem' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '.875rem',
                    background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Mic style={{ width: 18, height: 18, color: 'var(--c-lime)' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--c-lime)', fontStyle: 'italic' }}>
                    {ev.month}
                  </span>
                </div>
                <p style={{ fontSize: '.875rem', color: 'var(--c-w55)', lineHeight: 1.6, margin: 0 }}>{ev.event}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ARTS CTA ── */}
      <section style={{ padding: '0 0 7rem' }}>
        <div className="site-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }} viewport={{ once: true }}
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              borderRadius: '2rem',
              border: '1px solid var(--c-bl-sm)',
              background: 'linear-gradient(135deg, var(--c-surface) 0%, var(--c-bg2) 100%)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, var(--c-lime-hint) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '1.25rem',
                background: 'var(--c-lime-hint)', border: '1px solid var(--c-bl)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.75rem',
              }}>
                <Heart style={{ width: 28, height: 28, color: 'var(--c-lime)' }} />
              </div>

              <h3 style={{
                fontFamily: 'var(--f-display)',
                fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                fontWeight: 800, color: '#fff', marginBottom: '1rem', lineHeight: 1.2,
              }}>
                Kwa Nini Sanaa ni Muhimu?
              </h3>
              <p style={{ color: 'var(--c-w50)', maxWidth: 480, margin: '0 auto 2.5rem', lineHeight: 1.8, fontSize: '.95rem' }}>
                Utafiti unaonyesha wanafunzi wanaojishughulisha na sanaa wanaonyesha uboreshaji mkubwa wa ubunifu, uvumilivu, na ujuzi wa kufanya kazi pamoja — sifa muhimu kwa dunia ya kesho.
              </p>

              {/* Stat row */}
              <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                {[
                  { pct: '75%', label: 'Wanaonyesha ubunifu zaidi' },
                  { pct: '2×',  label: 'Matokeo bora ya masomo' },
                  { pct: '90%', label: 'Hushiriki katika jamii' },
                ].map(({ pct, label }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--f-display)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--c-lime)', fontStyle: 'italic', margin: 0 }}>{pct}</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--c-w35)', margin: '.25rem 0 0' }}>{label}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/admissions"
                  className="btn-primary"
                  style={{ padding: '.875rem 2rem', borderRadius: '999px', fontSize: '.9rem' }}
                >
                  Jiunge na Programu za Sanaa <ChevronRight style={{ width: 16, height: 16 }} />
                </Link>
                <Link
                  href="/events"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                    padding: '.875rem 2rem', borderRadius: '999px',
                    border: '1px solid var(--c-border)',
                    color: 'var(--c-w50)', fontWeight: 700,
                    textDecoration: 'none', fontSize: '.9rem', transition: 'all .2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-bl)'; (e.currentTarget as HTMLElement).style.color = 'var(--c-lime)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--c-w50)'; }}
                >
                  Angalia Matukio
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @media(min-width: 768px) {
          .arts-card-grid { grid-template-columns: 1.5fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
