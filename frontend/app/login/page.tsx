'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Loader2, Eye, EyeOff, ArrowLeft, Shield, GraduationCap, Award, Users } from 'lucide-react';

interface LoginForm { email: string; password: string; remember: boolean; }

const STATS = [
  { icon: GraduationCap, label: '1000+',   sub: 'Wahitimu' },
  { icon: Users,          label: '35+',     sub: 'Miaka' },
  { icon: Award,          label: 'NECTA',   sub: 'Wabora' },
];

export default function LoginPage() {
  const [showPassword, setShowPassword]   = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [shake, setShake]                 = useState(false);
  const { login }  = useAuth();
  const { toast }  = useToast();
  const router     = useRouter();
  const formRef    = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ defaultValues: { remember: false } });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password, data.remember);
      toast(data.remember ? 'Umefanikiwa kuingia! Utakumbukwa kwenye kifaa hiki.' : 'Umefanikiwa kuingia! Karibu!', 'success');
      router.push('/admin');
    } catch {
      toast('Barua pepe au nenosiri si sahihi.', 'error');
      /* shake animation on error */
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', overflow: 'hidden' }}>

      {/* ── LEFT BRANDING PANEL ── */}
      <div
        style={{
          display: 'none',
          width: '42%',
          minWidth: 400,
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #050805 0%, #0f1a0b 50%, #050805 100%)',
          padding: '4rem 3.5rem',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        className="login-left-panel"
      >
        {/* Background patterns */}
        <div className="pattern-grid" style={{ position: 'absolute', inset: 0, opacity: .6 }} />
        <div className="pattern-dots" style={{ position: 'absolute', inset: 0, opacity: .25 }} />

        {/* Animated orbs */}
        {[
          { top: '10%',  left: '60%', size: 280, delay: '0s',   dur: '9s'  },
          { top: '55%',  left: '-5%', size: 220, delay: '3s',   dur: '12s' },
          { top: '75%',  left: '70%', size: 180, delay: '6s',   dur: '11s' },
        ].map((b, i) => (
          <div key={i} className="login-orb" style={{
            top: b.top, left: b.left, width: b.size, height: b.size,
            background: 'radial-gradient(circle, rgba(0,255,65,.09) 0%, transparent 70%)',
            animationDelay: b.delay, animationDuration: b.dur,
          }} />
        ))}

        {/* Diagonal lime line */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 1, height: '100%', background: 'linear-gradient(180deg,transparent,rgba(0,255,65,.2) 30%,rgba(0,255,65,.4) 50%,rgba(0,255,65,.2) 70%,transparent)' }} />

        {/* Vertical scrolling text — decorative */}
        <div style={{ position: 'absolute', right: '1.5rem', top: 0, bottom: 0, display: 'flex', alignItems: 'center', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'ticker-v 16s linear infinite' }}>
            {['EXCELLENCE', 'INTEGRITY', 'WISDOM', 'EXCELLENCE', 'INTEGRITY', 'WISDOM'].map((w, i) => (
              <span key={i} style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.3em', color: 'rgba(0,255,65,.12)' }}>{w}</span>
            ))}
          </div>
        </div>

        {/* Top: Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem', marginBottom: '4rem' }}>
            <div>
              <svg viewBox="0 0 52 52" fill="none" style={{ width: 52, height: 52 }}>
                <path d="M26 2L4 12V26C4 38.5 14.5 47.5 26 50.5C37.5 47.5 48 38.5 48 26V12L26 2Z" fill="#00FF41" />
                <path d="M26 6L8 15V26C8 36 16.5 44 26 47C35.5 44 44 36 44 26V15L26 6Z" fill="#050805" fillOpacity=".2" />
                <text x="26" y="33" textAnchor="middle" fontFamily="var(--f-head)" fontWeight="900" fontSize="19" fill="#050805">M</text>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '.875rem', fontWeight: 800, color: '#fff', letterSpacing: '-.01em', marginBottom: '.1rem' }}>Mpendae Secondary</p>
              <p style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--c-lime)', letterSpacing: '.12em' }}>SCHOOL — ZANZIBAR</p>
            </div>
          </div>

          {/* Main heading */}
          <h1 style={{
            fontFamily: 'var(--f-display)', fontStyle: 'italic',
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700,
            color: '#fff', lineHeight: 1.12, letterSpacing: '-.025em', marginBottom: '1.25rem',
          }}>
            Maarifa ni<br />
            <span style={{ color: 'var(--c-lime)' }}>nguvu yetu.</span>
          </h1>

          <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.45)', lineHeight: 1.8, maxWidth: 280, marginBottom: '2.5rem' }}>
            Mfumo wa usimamizi wa Mpendae Secondary School — unaotumika na wasimamizi na walimu pekee.
          </p>

          {/* Quote */}
          <div style={{ borderLeft: '3px solid var(--c-lime)', paddingLeft: '1.125rem', marginBottom: '3rem' }}>
            <p style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '1.05rem', color: 'rgba(255,255,255,.7)', lineHeight: 1.6, marginBottom: '.5rem' }}>
              &ldquo;Elimu ni ufunguo wa maisha.&rdquo;
            </p>
            <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--c-lime)', letterSpacing: '.1em' }}>— MPENDAE SECONDARY SCHOOL</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {STATS.map(({ icon: Icon, label, sub }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <Icon style={{ width: 14, height: 14, color: 'var(--c-lime)' }} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--f-display)', fontStyle: 'italic' }}>{label}</span>
                </div>
                <span style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.35)', fontWeight: 600, letterSpacing: '.08em' }}>{sub}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <Shield style={{ width: 13, height: 13, color: 'var(--c-lime)', flexShrink: 0 }} />
            <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>Mfumo salama · HTTPS Encrypted · Zanzibar, TZ</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative' }}>

        {/* Floating orbs — subtle background */}
        {[
          { top: '15%', right: '10%', size: 200 },
          { bottom: '20%', left: '5%', size: 160 },
        ].map((b, i) => (
          <div key={i} className="login-orb" style={{
            ...b, width: b.size, height: b.size,
            background: 'radial-gradient(circle, rgba(0,255,65,.045) 0%, transparent 70%)',
            animationDuration: `${10 + i * 3}s`, animationDelay: `${i * 2}s`,
          }} />
        ))}

        {/* Back to site */}
        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.8125rem', color: 'rgba(255,255,255,.35)', textDecoration: 'none', transition: 'color .2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.35)'}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} /> Rudi kwenye Tovuti
          </Link>
        </div>

        {/* Mobile logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', display: 'block' }} className="mobile-logo-show">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
            <svg viewBox="0 0 44 44" fill="none" style={{ width: 38, height: 38 }}>
              <path d="M22 2L4 10V22C4 32.5 12 40.5 22 43C32 40.5 40 32.5 40 22V10L22 2Z" fill="#00FF41" />
              <text x="22" y="28" textAnchor="middle" fontFamily="var(--f-head)" fontWeight="900" fontSize="14" fill="#050805">M</text>
            </svg>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '.875rem', fontWeight: 800, color: '#fff', margin: 0 }}>Mpendae School</p>
              <p style={{ fontSize: '.65rem', color: 'var(--c-lime)', margin: 0, fontWeight: 700, letterSpacing: '.1em' }}>ADMIN PANEL</p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <motion.div
          ref={formRef}
          style={{
            width: '100%', maxWidth: 420,
            background: 'rgba(255,255,255,.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: '2rem',
            padding: '2.5rem',
            boxShadow: '0 32px 80px rgba(0,0,0,.5)',
            position: 'relative',
            overflow: 'hidden',
          }}
          animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: .5, ease: 'easeInOut' }}
        >
          {/* Card top lime line */}
          <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, background: 'linear-gradient(90deg,transparent,var(--c-lime),transparent)', borderRadius: 1 }} />

          {/* Heading */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-.02em', marginBottom: '.4rem' }}>
              Karibu Tena 👋
            </h2>
            <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.4)' }}>
              Ingia kwenye dashibodi ya usimamizi
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.375rem' }} noValidate>

            {/* Email */}
            <div>
              <label className="form-label">Barua Pepe</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '.875rem', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,.25)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  {...register('email', { required: 'Barua pepe inahitajika' })}
                  className={`form-input${errors.email ? ' shake' : ''}`}
                  style={{ paddingLeft: '2.625rem' }}
                  placeholder="admin@mpendaeschool.ac.tz"
                  autoComplete="email"
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="form-error"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Nenosiri</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '.875rem', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,.25)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Nenosiri linahitajika' })}
                  className="form-input"
                  style={{ paddingLeft: '2.625rem', paddingRight: '2.75rem' }}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '.875rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,.3)', padding: 0, display: 'flex', alignItems: 'center',
                    transition: 'color .2s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.6)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.3)'}
                  aria-label={showPassword ? 'Ficha nenosiri' : 'Onyesha nenosiri'}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="form-error"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Remember me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <input
                type="checkbox"
                id="remember"
                {...register('remember')}
                style={{ width: 16, height: 16, accentColor: 'var(--c-lime)', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.45)', cursor: 'pointer', userSelect: 'none' }}>
                Nikumbuke kwenye kifaa hiki
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ justifyContent: 'center', padding: '.875rem', fontSize: '.9375rem', borderRadius: '1rem', marginTop: '.25rem' }}
            >
              {isLoading ? (
                <>
                  <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
                  Inaingia...
                </>
              ) : (
                <>
                  <Lock style={{ width: 16, height: 16 }} />
                  Ingia kwenye Mfumo
                </>
              )}
            </button>
          </form>

          {/* Security badge */}
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem' }}>
            <Shield style={{ width: 12, height: 12, color: 'rgba(0,255,65,.4)', flexShrink: 0 }} />
            <span style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.2)', textAlign: 'center' }}>
              Encrypted & Secure · HTTPS · Zanzibar, Tanzania
            </span>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media(min-width:1024px) {
          .login-left-panel { display:flex !important; }
          .mobile-logo-show { display:none !important; }
        }
        @media(max-width:1023px) {
          .mobile-logo-show { display:block !important; }
        }
      `}</style>
    </div>
  );
}
