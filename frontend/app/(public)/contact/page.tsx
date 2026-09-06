'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { settingsApi, formatApiError } from '@/lib/api';
import { SchoolSettings } from '@/types';
import { useToast } from '@/components/ui/Toast';
import {
  MapPin, Phone, Mail, Clock, Send, Loader2,
  MessageCircle, ExternalLink, Zap, CheckCircle2,
} from 'lucide-react';

interface ContactForm { name: string; email: string; subject: string; message: string; }

/* ── Confetti Particle ── */
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * -40,
    color: ['#00FF41', '#ffffff', '#a3e635', '#86efac'][i % 4],
    size: 4 + Math.random() * 6,
    delay: Math.random() * .5,
    duration: .8 + Math.random() * .8,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: [1, 1, 0], rotate: 360 * (Math.random() > .5 ? 1 : -1) }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: Math.random() > .5 ? '50%' : 2, background: p.color }}
        />
      ))}
    </div>
  );
}

/* ── Float Label Input ── */
function FloatInput({
  id, label, type = 'text', required, error, register,
  rows, minLength,
}: {
  id: string; label: string; type?: string; required?: string; error?: string;
  register: ReturnType<typeof useForm<ContactForm>>['register'];
  rows?: number; minLength?: { value: number; message: string };
}) {
  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(false);
  const float = focused || filled;

  const commonProps = {
    id,
    onFocus: () => setFocused(true),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFocused(false);
      setFilled(e.target.value.length > 0);
    },
    style: {
      width: '100%', background: 'rgba(255,255,255,.04)', border: 'none',
      borderBottom: `2px solid ${focused ? 'var(--c-lime)' : error ? '#EF4444' : 'rgba(255,255,255,.15)'}`,
      outline: 'none', color: '#fff', fontSize: '.95rem', paddingTop: '1.4rem',
      paddingBottom: '.6rem', paddingLeft: 0, paddingRight: 0,
      transition: 'border-color .2s', resize: 'none' as const,
      boxShadow: focused ? '0 2px 0 -1px rgba(0,255,65,.3)' : 'none',
    },
  };

  return (
    <div style={{ position: 'relative', paddingBottom: '.25rem' }}>
      <label htmlFor={id} style={{
        position: 'absolute', top: float ? 0 : '1.4rem', left: 0,
        fontSize: float ? '.7rem' : '.95rem',
        color: float ? (error ? '#EF4444' : 'var(--c-lime)') : 'rgba(255,255,255,.4)',
        fontWeight: float ? 700 : 500, letterSpacing: float ? '.05em' : 0,
        transition: 'all .22s cubic-bezier(.22,1,.36,1)',
        pointerEvents: 'none', textTransform: float ? 'uppercase' : 'none',
      }}>
        {label}{required ? ' *' : ''}
      </label>
      {rows
        ? <textarea {...register(id as keyof ContactForm, { required, minLength })} rows={rows} {...commonProps as object} />
        : <input type={type} {...register(id as keyof ContactForm, { required, ...(type === 'email' ? { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Barua pepe si sahihi' } } : {}) })} {...commonProps} />
      }
      {error && <p style={{ fontSize: '.7rem', color: '#EF4444', marginTop: '.25rem', fontWeight: 600 }}>{error}</p>}
    </div>
  );
}

/* ── Progress Bar ── */
function FormProgress({ watch }: { watch: ContactForm }) {
  const fields = [watch.name, watch.email, watch.subject, watch.message];
  const filled = fields.filter(f => f && f.length > 0).length;
  const pct = (filled / fields.length) * 100;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
        <span style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.35)' }}>
          Ukamilishaji wa Fomu
        </span>
        <span style={{ fontSize: '.75rem', fontWeight: 800, color: pct === 100 ? 'var(--c-lime)' : 'rgba(255,255,255,.4)' }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,.08)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: .4, ease: 'easeOut' }}
          style={{
            height: '100%', borderRadius: 99,
            background: pct === 100 ? 'var(--c-lime)' : 'linear-gradient(90deg, var(--c-lime), rgba(0,255,65,.5))',
          }}
        />
      </div>
    </div>
  );
}

/* ── Character Counter ── */
function CharCounter({ value, max = 500 }: { value: string; max?: number }) {
  const len = (value || '').length;
  const color = len > max ? '#EF4444' : len > max * .9 ? '#F59E0B' : 'rgba(255,255,255,.3)';
  return (
    <div style={{ textAlign: 'right', fontSize: '.68rem', color, fontWeight: 700, marginTop: '.3rem' }}>
      {len} / {max}
    </div>
  );
}

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ContactForm>({ defaultValues: { name: '', email: '', subject: '', message: '' } });
  const formValues = watch();
  const messageValue = watch('message') || '';

  useEffect(() => { settingsApi.getSettings().then(r => setSettings(r.data)).catch(() => {}); }, []);

  const onSubmit = async (data: ContactForm) => {
    setSubmitting(true);
    try {
      await settingsApi.contact(data);
      setSent(true);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
      reset();
      toast('Ujumbe wako umetumwa! 🎉', 'success');
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Tatizo limetokea. Jaribu tena baadaye.');
      toast(msg, 'error');
    } finally { setSubmitting(false); }
  };

  const infoItems = [
    settings?.address && { icon: MapPin, label: 'Anwani', value: settings.address },
    settings?.phone && { icon: Phone, label: 'Simu', value: settings.phone, href: `tel:${settings.phone.replace(/\s+/g, '')}` },
    settings?.email && { icon: Mail, label: 'Barua Pepe', value: settings.email, href: `mailto:${settings.email}` },
    { icon: Clock, label: 'Masaa ya Kazi', value: 'Jumatatu – Ijumaa: 7:30 – 17:00' },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string; href?: string }[];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', position: 'relative' }}>
      <Confetti active={confetti} />

      {/* ── HERO ── */}
      <div style={{
        paddingTop: 'calc(var(--nav-h) + 5rem)', paddingBottom: '5rem',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, var(--c-bg2) 0%, var(--c-surface) 100%)',
      }}>
        <div className="pattern-grid" style={{ position: 'absolute', inset: 0, opacity: .4, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,65,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="site-container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.span
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .08 }}
            className="section-label" style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}
          >
            <MessageCircle style={{ width: 14, height: 14 }} /> Wasiliana Nasi
          </motion.span>
          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: .65, delay: .18, ease: [.22, 1, .36, 1] }}
              style={{
                fontFamily: 'var(--f-display)', fontSize: 'clamp(2.8rem,8vw,5.5rem)',
                fontWeight: 800, color: '#fff', lineHeight: 1.05, letterSpacing: '-.025em',
                marginTop: '.75rem', marginBottom: '1.25rem',
              }}
            >
              Tuzungumze{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Sasa</span>
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55, delay: .38 }}
            style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.8, maxWidth: 460, margin: '0 auto 1.75rem' }}
          >
            Una maswali? Timu yetu ipo tayari kukusaidia.
          </motion.p>
          {/* Response time badge */}
          <motion.div
            initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: .4, delay: .52 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '.5rem',
              padding: '.5rem 1.1rem', borderRadius: 999,
              background: 'rgba(0,255,65,.08)', border: '1px solid rgba(0,255,65,.2)',
            }}
          >
            <Zap style={{ width: 14, height: 14, color: 'var(--c-lime)' }} />
            <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--c-lime-pale)' }}>Tunajibu ndani ya masaa 24</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-lime)', animation: 'pulseRing 2s ease infinite' }} />
          </motion.div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <section style={{ padding: '5rem 0 7rem' }}>
        <div className="site-container">
          <div style={{ display: 'grid', gap: '3rem', gridTemplateColumns: '1fr' }}>

            {/* Responsive two-column via inline style trick */}
            <style>{`@media(min-width:1024px){.cg{grid-template-columns:1fr 1.25fr !important;display:grid !important;}}`}</style>
            <div className="cg" style={{ display: 'grid', gap: '3rem' }}>

              {/* ── LEFT ── */}
              <motion.div
                initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: .65, ease: [.22, 1, .36, 1] }} viewport={{ once: true }}
              >
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '2rem', letterSpacing: '-.02em' }}>
                  Mawasiliano Yetu
                </h2>

                {/* Info cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem', marginBottom: '2.5rem' }}>
                  {infoItems.map(({ icon: Icon, label, value, href }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: .45, delay: i * .07 }} viewport={{ once: true }}
                    >
                      <InfoCard icon={Icon} label={label} value={value} href={href} />
                    </motion.div>
                  ))}
                </div>

                {/* Social buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginBottom: '2.5rem' }}>
                  {settings?.whatsapp && (
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/[^\d]/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '.5rem',
                        padding: '.7rem 1.4rem', borderRadius: '1rem',
                        background: 'rgba(37,211,102,.1)', border: '1px solid rgba(37,211,102,.28)',
                        color: '#25D366', fontSize: '.875rem', fontWeight: 700,
                        textDecoration: 'none', transition: 'background .2s, transform .2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                    >
                      <MessageCircle style={{ width: 16, height: 16 }} /> WhatsApp
                    </a>
                  )}
                  {settings?.facebook && (
                    <a
                      href={settings.facebook} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '.5rem',
                        padding: '.7rem 1.4rem', borderRadius: '1rem',
                        background: 'rgba(0,255,65,.08)', border: '1px solid rgba(0,255,65,.2)',
                        color: 'var(--c-lime)', fontSize: '.875rem', fontWeight: 700,
                        textDecoration: 'none', transition: 'background .2s, transform .2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                    >
                      <ExternalLink style={{ width: 16, height: 16 }} /> Facebook
                    </a>
                  )}
                </div>

                {/* Map link */}
                {settings?.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                      padding: '1.25rem 1.5rem', borderRadius: '1.25rem',
                      background: 'var(--c-surface)', border: '1px solid var(--c-border)',
                      textDecoration: 'none', transition: 'all .25s',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = 'rgba(0,255,65,.3)';
                      el.style.background = 'rgba(0,255,65,.04)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = 'var(--c-border)';
                      el.style.background = 'var(--c-surface)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '.875rem', background: 'rgba(0,255,65,.08)', border: '1px solid rgba(0,255,65,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin style={{ width: 20, height: 20, color: 'var(--c-lime)' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '.875rem', fontWeight: 700, color: '#fff', margin: 0 }}>Tazama kwenye Ramani</p>
                        <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)', margin: 0, marginTop: '.2rem' }}>{settings.address}</p>
                      </div>
                    </div>
                    <ExternalLink style={{ width: 16, height: 16, color: 'rgba(255,255,255,.3)', flexShrink: 0 }} />
                  </a>
                )}
              </motion.div>

              {/* ── RIGHT: Form ── */}
              <motion.div
                initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: .65, delay: .1, ease: [.22, 1, .36, 1] }} viewport={{ once: true }}
              >
                <div style={{
                  borderRadius: '2rem', overflow: 'hidden',
                  border: '1px solid var(--c-border)', background: 'var(--c-surface)',
                  boxShadow: '0 32px 80px rgba(0,0,0,.3)',
                }}>
                  {/* Header */}
                  <div style={{ padding: '2rem 2rem 1.5rem', borderBottom: '1px solid var(--c-border)', background: 'linear-gradient(135deg, rgba(0,255,65,.06), transparent)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>Tuma Ujumbe</h2>
                        <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.4)', margin: '.35rem 0 0' }}>Tutakujibu ndani ya masaa 24</p>
                      </div>
                      <div style={{ width: 44, height: 44, borderRadius: '1rem', background: 'rgba(0,255,65,.08)', border: '1px solid rgba(0,255,65,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Send style={{ width: 20, height: 20, color: 'var(--c-lime)' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '2rem' }}>
                    <AnimatePresence mode="wait">
                      {sent ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: .95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: .95 }}
                          style={{ textAlign: 'center', padding: '3rem 1rem', position: 'relative' }}
                        >
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: .1 }}
                            style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,255,65,.1)', border: '2px solid rgba(0,255,65,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}
                          >
                            <CheckCircle2 style={{ width: 42, height: 42, color: 'var(--c-lime)' }} />
                          </motion.div>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '.75rem' }}>Ujumbe Umetumwa! 🎉</h3>
                          <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: '2rem', fontSize: '.9rem', lineHeight: 1.7 }}>
                            Asante kwa kuwasiliana nasi. Tutakujibu ndani ya masaa 24!
                          </p>
                          <button
                            onClick={() => setSent(false)}
                            style={{
                              padding: '.75rem 2rem', borderRadius: '1rem', cursor: 'pointer',
                              background: 'rgba(0,255,65,.1)', border: '1px solid rgba(0,255,65,.25)',
                              color: 'var(--c-lime)', fontWeight: 700, fontSize: '.9rem',
                            }}
                          >
                            Tuma Ujumbe Mwingine
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <FormProgress watch={formValues} />
                          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.75rem' }}>
                              <FloatInput id="name" label="Jina Lako" required="Jina linahitajika" error={errors.name?.message} register={register} />
                              <FloatInput id="email" label="Barua Pepe" type="email" required="Barua pepe inahitajika" error={errors.email?.message} register={register} />
                            </div>
                            <FloatInput id="subject" label="Mada ya Ujumbe" required="Mada inahitajika" error={errors.subject?.message} register={register} />
                            <div>
                              <FloatInput
                                id="message" label="Ujumbe" rows={5}
                                required="Ujumbe unahitajika"
                                minLength={{ value: 10, message: 'Ujumbe ni mfupi sana' }}
                                error={errors.message?.message} register={register}
                              />
                              <CharCounter value={messageValue} max={500} />
                            </div>
                            <motion.button
                              type="submit"
                              disabled={submitting}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: .98 }}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.625rem',
                                padding: '1rem 2rem', borderRadius: '1.1rem', cursor: submitting ? 'wait' : 'pointer',
                                background: submitting ? 'rgba(0,255,65,.3)' : 'var(--c-lime)',
                                color: '#050805', fontWeight: 800, fontSize: '1rem', border: 'none',
                                width: '100%', opacity: submitting ? .7 : 1, transition: 'opacity .2s',
                                position: 'relative', overflow: 'hidden',
                              }}
                              className="btn-shimmer"
                            >
                              {submitting
                                ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Inatuma...</>
                                : <><Send style={{ width: 18, height: 18 }} /> Tuma Ujumbe</>
                              }
                            </motion.button>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Info Card Component */
function InfoCard({ icon: Icon, label, value, href }: { icon: typeof MapPin; label: string; value: string; href?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '1rem',
        padding: '1.1rem 1.25rem', borderRadius: '1.1rem',
        background: 'var(--c-surface)', border: `1px solid ${hov ? 'rgba(0,255,65,.28)' : 'var(--c-border)'}`,
        transform: hov ? 'translateX(6px)' : 'translateX(0)',
        transition: 'all .3s cubic-bezier(.22,1,.36,1)',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '.875rem', flexShrink: 0,
        background: hov ? 'rgba(0,255,65,.15)' : 'rgba(0,255,65,.08)',
        border: `1px solid ${hov ? 'rgba(0,255,65,.4)' : 'rgba(0,255,65,.18)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .3s',
        transform: hov ? 'rotate(10deg) scale(1.1)' : 'rotate(0) scale(1)',
      }}>
        <Icon style={{ width: 20, height: 20, color: 'var(--c-lime)' }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.35)', marginBottom: '.25rem' }}>{label}</p>
        {href
          ? <a href={href} style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--c-lime-pale)', textDecoration: 'none' }}>{value}</a>
          : <p style={{ fontSize: '.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>{value}</p>
        }
      </div>
    </div>
  );
}
