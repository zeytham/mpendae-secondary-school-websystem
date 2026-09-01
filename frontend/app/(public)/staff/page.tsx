'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { teachersApi } from '@/lib/api';
import { Teacher, DEPARTMENTS } from '@/types';
import { Search, Users, Award, ChevronDown, Star, BookOpen, Mail, Phone } from 'lucide-react';

function TeacherCard({ teacher, featured = false, index = 0 }: { teacher: Teacher; featured?: boolean; index?: number }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: .5, delay: index * .06, ease: [.22, 1, .36, 1] }}
      viewport={{ once: true }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: featured ? '2rem' : '1.5rem',
        overflow: 'hidden', border: `1px solid ${hovered ? 'rgba(0,255,65,.28)' : 'var(--c-border)'}`,
        background: 'var(--c-surface)',
        boxShadow: hovered ? '0 28px 60px rgba(0,0,0,.4), 0 0 0 1px rgba(0,255,65,.1)' : '0 4px 20px rgba(0,0,0,.15)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all .35s cubic-bezier(.22,1,.36,1)',
      }}
    >
      {/* Top section */}
      <div style={{
        padding: featured ? '2.5rem' : '1.5rem',
        display: 'flex', flexDirection: featured ? 'row' : 'column',
        alignItems: featured ? 'center' : 'center', gap: featured ? '2rem' : '1rem',
        background: hovered ? 'linear-gradient(135deg, rgba(0,255,65,.04), transparent)' : 'transparent',
        transition: 'background .35s',
        textAlign: featured ? 'left' : 'center',
      }}>
        {/* Photo */}
        <div style={{
          position: 'relative', flexShrink: 0,
          width: featured ? 96 : 80, height: featured ? 96 : 80,
          borderRadius: '50%',
          border: `3px solid ${hovered ? 'rgba(0,255,65,.5)' : 'rgba(255,255,255,.12)'}`,
          boxShadow: hovered ? '0 0 24px rgba(0,255,65,.25)' : 'none',
          transition: 'all .35s', overflow: 'hidden',
        }}>
          {teacher.photo
            ? <Image src={teacher.photo} alt={`${teacher.firstName} ${teacher.lastName}`} fill style={{ objectFit: 'cover' }} />
            : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(0,255,65,.15), rgba(0,255,65,.05))', color: 'var(--c-lime)', fontSize: featured ? '2rem' : '1.5rem', fontWeight: 800 }}>
                {teacher.firstName[0]}{teacher.lastName[0]}
              </div>
            )
          }
        </div>

        <div style={{ flex: 1 }}>
          {/* Name */}
          <h3 style={{ fontSize: featured ? '1.2rem' : '1rem', fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: '.3rem' }}>
            {teacher.firstName} {teacher.lastName}
          </h3>
          {/* Department */}
          <span style={{
            display: 'inline-block', padding: '.2rem .7rem', borderRadius: 999,
            background: 'rgba(0,255,65,.1)', border: '1px solid rgba(0,255,65,.25)',
            fontSize: '.65rem', fontWeight: 700, color: 'var(--c-lime)',
            letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '.625rem',
          }}>
            {teacher.department}
          </span>
          {/* Qualification */}
          {teacher.qualification && (
            <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.45)', margin: 0 }}>
              <BookOpen style={{ width: 11, height: 11, display: 'inline', marginRight: '.25rem' }} />
              {teacher.qualification}
            </p>
          )}
          {/* Featured: contact links */}
          {featured && (
            <div style={{ display: 'flex', gap: '.75rem', marginTop: '.875rem', flexWrap: 'wrap' }}>
              {teacher.email && (
                <a href={`mailto:${teacher.email}`} style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.75rem', color: 'var(--c-lime)', textDecoration: 'none', fontWeight: 600 }}>
                  <Mail style={{ width: 12, height: 12 }} /> {teacher.email}
                </a>
              )}
              {teacher.phone && (
                <a href={`tel:${teacher.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.75rem', color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontWeight: 600 }}>
                  <Phone style={{ width: 12, height: 12 }} /> {teacher.phone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subjects on hover expand */}
      {teacher.subjects && teacher.subjects.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              width: '100%', padding: '.75rem 1.5rem', background: 'none', border: 'none',
              borderTop: '1px solid rgba(255,255,255,.06)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              color: 'rgba(255,255,255,.45)', fontSize: '.75rem', fontWeight: 600,
              transition: 'color .2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-lime)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.45)')}
          >
            <span>Masomo ({teacher.subjects.length})</span>
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: .25 }}>
              <ChevronDown style={{ width: 14, height: 14 }} />
            </motion.span>
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '.875rem 1.5rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                  {teacher.subjects.map(s => (
                    <span key={s} style={{ padding: '.2rem .65rem', borderRadius: 999, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', fontSize: '.7rem', fontWeight: 600, color: 'rgba(255,255,255,.6)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

export default function StaffPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeDept, setActiveDept] = useState('');

  useEffect(() => {
    teachersApi.getAll()
      .then(r => setTeachers(r.data.teachers || r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const principal = useMemo(() => teachers.find(t => t.department.toLowerCase().includes('mkuu') || t.department.toLowerCase().includes('principal')), [teachers]);
  const others = useMemo(() => teachers.filter(t => t !== principal), [teachers, principal]);

  const filtered = useMemo(() => {
    return others.filter(t => {
      const matchSearch = !search || `${t.firstName} ${t.lastName} ${t.department}`.toLowerCase().includes(search.toLowerCase());
      const matchDept = !activeDept || t.department === activeDept;
      return matchSearch && matchDept;
    });
  }, [others, search, activeDept]);

  const depts = useMemo(() => [...new Set(others.map(t => t.department))].filter(Boolean), [others]);

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
            <Users style={{ width: 14, height: 14 }} /> Timu Yetu
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
              Walimu{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Wetu</span>
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55, delay: .38 }}
            style={{ color: 'rgba(255,255,255,.5)', fontSize: '1.05rem', maxWidth: 440, margin: '0 auto 2.5rem' }}
          >
            Walimu wetu wenye uzoefu na ujuzi wanaohakikisha elimu bora kwa kila mwanafunzi.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .5 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '.75rem',
              background: 'rgba(255,255,255,.06)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,.12)', borderRadius: 999,
              padding: '.65rem 1.4rem', maxWidth: 380, width: '100%',
            }}
          >
            <Search style={{ width: 18, height: 18, color: 'rgba(255,255,255,.35)', flexShrink: 0 }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tafuta mwalimu..."
              style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '.9rem', width: '100%' }}
            />
          </motion.div>
        </div>
      </div>

      <section style={{ padding: '4rem 0 7rem' }}>
        <div className="site-container">

          {/* Principal spotlight */}
          {principal && (
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: .65, ease: [.22, 1, .36, 1] }} viewport={{ once: true }}
              style={{ marginBottom: '3.5rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem' }}>
                <Star style={{ width: 16, height: 16, color: 'var(--c-lime)' }} />
                <span style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: 'rgba(0,255,65,.7)' }}>
                  Mkuu wa Shule
                </span>
              </div>
              <TeacherCard teacher={principal} featured />
            </motion.div>
          )}

          {/* Department tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .5 }} viewport={{ once: true }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', justifyContent: 'center', marginBottom: '3rem' }}
          >
            {['Zote', ...depts].map(d => {
              const active = d === 'Zote' ? !activeDept : activeDept === d;
              return (
                <button
                  key={d}
                  onClick={() => setActiveDept(d === 'Zote' ? '' : d)}
                  style={{
                    padding: '.45rem 1.1rem', borderRadius: 999, cursor: 'pointer',
                    fontSize: '.82rem', fontWeight: 700, border: 'none', outline: 'none',
                    background: active ? 'rgba(0,255,65,.12)' : 'rgba(255,255,255,.04)',
                    color: active ? 'var(--c-lime)' : 'rgba(255,255,255,.5)',
                    boxShadow: active ? 'inset 0 0 0 1px rgba(0,255,65,.35)' : 'inset 0 0 0 1px rgba(255,255,255,.08)',
                    transition: 'all .25s',
                  }}
                >
                  {d}
                </button>
              );
            })}
          </motion.div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}
              >
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="skeleton-shimmer" style={{ height: 200, borderRadius: '1.5rem' }} />
                ))}
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', padding: '5rem 0' }}
              >
                <Users style={{ width: 64, height: 64, color: 'rgba(255,255,255,.08)', margin: '0 auto 1.5rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: '.5rem' }}>Hakuna Walimu</h3>
                <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '.9rem' }}>Badilisha maneno ya utafutaji.</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeDept + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}
              >
                {filtered.map((t, i) => <TeacherCard key={t.id} teacher={t} index={i} />)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
