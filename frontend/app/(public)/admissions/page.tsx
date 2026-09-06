'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { admissionsApi, formatApiError } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import CountdownTimer from '@/components/ui/CountdownTimer';
import {
  CheckCircle, ChevronRight, ChevronLeft, Loader2, User, Users,
  GraduationCap, ClipboardCheck, HelpCircle, Download, ArrowRight,
  FileCheck, Search, UserCheck, Copy, Check, RotateCcw, Home,
} from 'lucide-react';

/* ─── STEP CONFIG ─── */
const STEPS = [
  { title: 'Mwanafunzi', icon: User },
  { title: 'Mzazi/Mlezi', icon: Users },
  { title: 'Elimu', icon: GraduationCap },
  { title: 'Kagua', icon: ClipboardCheck },
];

/* ─── 3-STEP PROCESS ─── */
const PROCESS_STEPS = [
  { n: '01', icon: FileCheck, title: 'Wasilisha Ombi', desc: 'Jaza fomu yetu ya mtandaoni kwa usahihi na utume bila ada yoyote.' },
  { n: '02', icon: Search,    title: 'Tathmini',       desc: 'Timu yetu itaangalia ombi lako na kukupigia simu kwa usaili mfupi.' },
  { n: '03', icon: UserCheck, title: 'Karibu Shule!', desc: 'Utapokea barua ya kukubaliwa na mwongozo wa usajili rasmi.' },
];

/* ─── FAQ ─── */
const FAQS = [
  { q: 'Ninaweza kuomba wakati wowote?', a: 'Maombi yanakubaliwa mwaka mzima. Hata hivyo, msimu mkuu wa usajili huanza mwezi wa Novemba hadi Januari.' },
  { q: 'Je, kuna ada ya kuomba?', a: 'Hapana, maombi yetu ya mtandaoni ni ya bure kabisa. Ada ya usajili italipwa baada ya kukubaliwa.' },
  { q: 'Alama za PSLE ni lazima ziwe ngapi?', a: 'Tunakubali wanafunzi wenye alama mbalimbali. Tunazingatia mwanafunzi mzima, si alama tu.' },
  { q: 'Ni masomo gani yanayofundishwa?', a: 'Tunafundisha masomo yote ya kitaifa — Sayansi, Hisabati, Lugha, Biashara, na Sanaa kwa Form I–VI.' },
  { q: 'Je, shule ina bweni?', a: 'Ndiyo, tunakuwa na bweni kwa wanafunzi wa mbali. Tafadhali wasiliana nasi kwa maelezo zaidi.' },
];

interface FormData {
  firstName: string; lastName: string; gender: string; dateOfBirth: string;
  parentName: string; parentPhone: string; parentEmail: string; address: string;
  primarySchool: string; kcpeScore: number; combination: string;
}

/* ─── FAQ Item ─── */
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: .45, delay: index * .07 }} viewport={{ once: true }}
      style={{ borderRadius: '1.1rem', overflow: 'hidden', border: `1px solid ${open ? 'rgba(0,255,65,.25)' : 'var(--c-border)'}`, background: 'var(--c-surface)', transition: 'border-color .25s' }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '1.2rem 1.4rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '1rem', textAlign: 'left' }}
      >
        <HelpCircle style={{ width: 18, height: 18, color: open ? 'var(--c-lime)' : 'rgba(255,255,255,.3)', flexShrink: 0, marginTop: '.1rem', transition: 'color .25s' }} />
        <p style={{ flex: 1, fontSize: '.9rem', fontWeight: 700, color: open ? '#fff' : 'rgba(255,255,255,.75)', margin: 0, transition: 'color .25s' }}>{q}</p>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: .25 }} style={{ color: open ? 'var(--c-lime)' : 'rgba(255,255,255,.35)', fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }}>+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1.4rem 1.2rem 3.2rem' }}>
              <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.75, margin: 0 }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Form Field ─── */
function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: error ? '#EF4444' : 'rgba(255,255,255,.45)', marginBottom: '.5rem', transition: 'color .2s' }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: '.75rem', color: '#EF4444', marginTop: '.35rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.3rem' }}>⚠️ {error}</p>}
    </div>
  );
}

export default function AdmissionsPage() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, watch, trigger, reset, formState: { errors } } = useForm<FormData>();
  const formData = watch();

  const DEADLINE = '2026-01-31T23:59:59';

  const stepFields: Record<number, (keyof FormData)[]> = {
    0: ['firstName', 'lastName', 'gender', 'dateOfBirth'],
    1: ['parentName', 'parentPhone', 'parentEmail', 'address'],
    2: ['primarySchool', 'kcpeScore'],
  };

  const nextStep = async () => {
    const fields = stepFields[step];
    const valid = await trigger(fields);
    if (valid) {
      setStep(s => s + 1);
    } else {
      const labels: Record<string, string> = {
        firstName: 'Jina la Kwanza',
        lastName: 'Jina la Ukoo',
        gender: 'Jinsia',
        dateOfBirth: 'Tarehe ya Kuzaliwa',
        parentName: 'Jina la Mzazi/Mlezi',
        parentPhone: 'Nambari ya Simu ya Mzazi',
        parentEmail: 'Barua Pepe ya Mzazi',
        address: 'Anwani ya Makazi',
        primarySchool: 'Jina la Shule ya Msingi',
        kcpeScore: 'Alama za PSLE/Matokeo',
      };
      const invalidKeys = fields.filter(f => !formData[f] || !!errors[f]);
      const invalidLabels = invalidKeys.map(k => labels[k] || k);
      if (invalidLabels.length > 0) {
        toast(`Tafadhali jaza sehemu hizi kwa usahihi: ${invalidLabels.join(', ')}`, 'error');
      } else {
        toast('Tafadhali thibitisha sehemu zote kabla ya kuendelea.', 'error');
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await admissionsApi.submit(data as unknown as Record<string, unknown>);
      setReferenceNo(res.data.referenceNo);
      setStep(4);
      toast('Ombi lako limewasilishwa kikamilifu! 🎉', 'success');
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Imeshindikana kuwasilisha ombi. Tafadhali thibitisha taarifa zote na ujaribu tena.');
      toast(msg, 'error');
    } finally { setIsSubmitting(false); }
  };

  const handleCopyRef = () => {
    if (!referenceNo) return;
    navigator.clipboard.writeText(referenceNo);
    setCopied(true);
    toast('Namba ya Rejeleo imenakiliwa!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNewSubmission = () => {
    reset();
    setReferenceNo('');
    setStep(0);
    window.scrollTo({ top: 300, behavior: 'smooth' });
    toast('Fomu imesafishwa — uko tayari kujaza ombi jipya', 'info');
  };

  const getInputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    background: hasError ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,.05)',
    border: `1px solid ${hasError ? '#EF4444' : 'rgba(255,255,255,.12)'}`,
    borderRadius: '.875rem', padding: '.75rem 1rem', color: '#fff', fontSize: '.9rem',
    outline: 'none', transition: 'all .2s ease-in-out',
    boxShadow: hasError ? '0 0 0 3px rgba(239, 68, 68, 0.2)' : 'none',
  });

  const inputStyle = getInputStyle(false);

  /* ── SUCCESS / POST-SUBMISSION VIEW ── */
  if (step === 4) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', paddingTop: 'calc(var(--nav-h) + 3rem)', background: 'var(--c-bg)' }}>
        <motion.div
          initial={{ opacity: 0, scale: .95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: .6, ease: [.22, 1, .36, 1] }}
          style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: .2 }}
            style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(0,255,65,.1)', border: '2px solid rgba(0,255,65,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}
          >
            <CheckCircle style={{ width: 52, height: 52, color: 'var(--c-lime)' }} />
          </motion.div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: '.75rem' }}>Asante Sana! 🎉</h1>
          <p style={{ color: 'rgba(255,255,255,.6)', marginBottom: '2rem', lineHeight: 1.75, fontSize: '.95rem' }}>
            Ombi lako la usajili limepokelewa kikamilifu katika Mfumo wa Mpendae Secondary School. Tutawasiliana nawe hivi karibuni kupitia barua pepe au simu.
          </p>

          <div style={{ padding: '1.75rem', borderRadius: '1.5rem', background: 'rgba(0,255,65,.06)', border: '1px solid rgba(0,255,65,.2)', marginBottom: '2rem', position: 'relative' }}>
            <p style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(0,255,65,.7)', marginBottom: '.5rem' }}>Nambari ya Rejeleo</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--c-lime)', letterSpacing: '.05em', margin: 0 }}>{referenceNo}</p>
              <button
                onClick={handleCopyRef}
                style={{ background: 'rgba(0,255,65,.15)', border: '1px solid rgba(0,255,65,.3)', color: 'var(--c-lime)', borderRadius: '.6rem', padding: '.4rem .75rem', display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', transition: 'background .2s' }}
              >
                {copied ? <><Check style={{ width: 14, height: 14 }} /> Imenakiliwa</> : <><Copy style={{ width: 14, height: 14 }} /> Nakili</>}
              </button>
            </div>
            <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)', margin: 0 }}>Hifadhi nambari hii — utatumia kufuatilia ombi lako.</p>
          </div>

          {/* Action Buttons for Next Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
            <button
              onClick={handleNewSubmission}
              style={{
                width: '100%', padding: '1rem 1.5rem', borderRadius: '1rem',
                background: 'var(--c-lime)', color: '#050805', fontWeight: 800, fontSize: '.95rem',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem',
                boxShadow: '0 4px 20px rgba(0,255,65,.25)', transition: 'transform .15s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(.98)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <RotateCcw style={{ width: 18, height: 18 }} /> Wasilisha Ombi Jingine
            </button>

            <Link
              href="/"
              style={{
                width: '100%', padding: '.875rem 1.5rem', borderRadius: '1rem',
                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
                color: '#fff', fontWeight: 700, fontSize: '.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem',
                textDecoration: 'none', transition: 'background .2s',
              }}
            >
              <Home style={{ width: 18, height: 18 }} /> Rudi Ukurasa Mkuu
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>

      {/* ── HERO ── */}
      <div style={{
        paddingTop: 'calc(var(--nav-h) + 4.5rem)', paddingBottom: '5rem',
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
            <GraduationCap style={{ width: 14, height: 14 }} /> Jiandikishe Sasa
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
              Omba{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--c-lime)' }}>Usajili</span>
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55, delay: .38 }}
            style={{ color: 'rgba(255,255,255,.5)', fontSize: '1.05rem', maxWidth: 460, margin: '0 auto 2rem' }}
          >
            Jiandikishe leo na uanze safari yako ya elimu bora katika Mpendae Secondary School.
          </motion.p>

          {/* Deadline countdown */}
          <motion.div
            initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: .4, delay: .5 }}
            style={{
              display: 'inline-block', padding: '1rem 2rem', borderRadius: '1.25rem',
              background: 'rgba(0,255,65,.08)', border: '1px solid rgba(0,255,65,.2)',
            }}
          >
            <p style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: 'rgba(0,255,65,.7)', marginBottom: '.5rem' }}>
              ⚠ Muda wa Maombi Unakwisha:
            </p>
            <CountdownTimer targetDate={DEADLINE} compact />
          </motion.div>
        </div>
      </div>

      <section style={{ padding: '4rem 0 7rem' }}>
        <div className="site-container">
          <div style={{ display: 'grid', gap: '4rem' }}>
            <style>{`@media(min-width:1024px){.adm-grid{grid-template-columns:1.1fr 1fr !important;}}`}</style>

            {/* ── PROCESS + FORM ── */}
            <div className="adm-grid" style={{ display: 'grid', gap: '3rem' }}>

              {/* Left: Process steps */}
              <div>
                {/* 3-step process */}
                <motion.div
                  initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: .65 }} viewport={{ once: true }}
                  style={{ marginBottom: '3rem' }}
                >
                  <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: '2rem' }}>
                    Hatua 3 Rahisi
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {PROCESS_STEPS.map((ps, i) => {
                      const PIcon = ps.icon;
                      return (
                        <motion.div
                          key={ps.n}
                          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: .45, delay: i * .1 }} viewport={{ once: true }}
                          style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}
                        >
                          <div style={{
                            width: 52, height: 52, borderRadius: '1rem', flexShrink: 0,
                            background: 'rgba(0,255,65,.1)', border: '1px solid rgba(0,255,65,.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                          }}>
                            <PIcon style={{ width: 22, height: 22, color: 'var(--c-lime)' }} />
                            <span style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', background: 'var(--c-lime)', color: '#050805', fontSize: '.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                          </div>
                          <div style={{ paddingTop: '.25rem' }}>
                            <p style={{ fontSize: '.95rem', fontWeight: 800, color: '#fff', margin: 0, marginBottom: '.35rem' }}>{ps.title}</p>
                            <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.65, margin: 0 }}>{ps.desc}</p>
                          </div>
                          {i < PROCESS_STEPS.length - 1 && (
                            <div style={{ position: 'absolute', marginLeft: 25, marginTop: 52, width: 1, height: 'calc(100% - 52px)', background: 'linear-gradient(180deg, rgba(0,255,65,.3), transparent)' }} />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Requirements */}
                <motion.div
                  initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: .65, delay: .1 }} viewport={{ once: true }}
                  style={{ padding: '1.75rem', borderRadius: '1.5rem', background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}
                >
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <ClipboardCheck style={{ width: 18, height: 18, color: 'var(--c-lime)' }} />
                    Mahitaji ya Usajili
                  </h3>
                  {[
                    'Cheti cha Kuzaliwa (Birth Certificate)',
                    'Matokeo ya PSLE / KCPE (asili na nakala)',
                    'Picha 4 za paspoti (za hivi karibuni)',
                    'Barua ya Uthamini kutoka Shule ya Msingi',
                    'Taarifa za Afya (Medical Report)',
                    'Fomu ya Mzazi iliyotiwa saini',
                  ].map((req, i) => (
                    <motion.div
                      key={req}
                      initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: .35, delay: i * .06 }} viewport={{ once: true }}
                      style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.625rem 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,.05)' : 'none' }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,255,65,.15)', border: '1px solid rgba(0,255,65,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle style={{ width: 11, height: 11, color: 'var(--c-lime)' }} />
                      </div>
                      <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.65)', margin: 0, fontWeight: 600 }}>{req}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Right: Multi-step form */}
              <motion.div
                initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: .65, delay: .1 }} viewport={{ once: true }}
              >
                <div style={{ borderRadius: '2rem', border: '1px solid var(--c-border)', background: 'var(--c-surface)', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.3)' }}>
                  {/* Form header */}
                  <div style={{ padding: '2rem 2rem 1.5rem', borderBottom: '1px solid var(--c-border)', background: 'linear-gradient(135deg, rgba(0,255,65,.06), transparent)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0, marginBottom: '.375rem' }}>Fomu ya Maombi</h2>
                    <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.4)', margin: 0 }}>Nyanja zote zenye * ni lazima</p>
                  </div>

                  {/* Progress steps */}
                  <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {STEPS.map(({ title, icon: Icon }, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.35rem' }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: i < step ? 'var(--c-lime)' : i === step ? 'rgba(0,255,65,.15)' : 'rgba(255,255,255,.06)',
                              border: `2px solid ${i < step ? 'var(--c-lime)' : i === step ? 'rgba(0,255,65,.5)' : 'rgba(255,255,255,.12)'}`,
                              transition: 'all .35s',
                            }}>
                              {i < step
                                ? <CheckCircle style={{ width: 16, height: 16, color: '#050805' }} />
                                : <Icon style={{ width: 16, height: 16, color: i === step ? 'var(--c-lime)' : 'rgba(255,255,255,.3)' }} />
                              }
                            </div>
                            <span style={{ fontSize: '.58rem', fontWeight: 700, color: i === step ? 'var(--c-lime)' : i < step ? 'rgba(0,255,65,.6)' : 'rgba(255,255,255,.25)', letterSpacing: '.04em', whiteSpace: 'nowrap' }}>
                              {title}
                            </span>
                          </div>
                          {i < STEPS.length - 1 && (
                            <div style={{ flex: 1, height: 2, margin: '0 .5rem', marginBottom: '1.2rem', background: i < step ? 'var(--c-lime)' : 'rgba(255,255,255,.08)', transition: 'background .35s' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form body */}
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ padding: '2rem' }}>
                      <AnimatePresence mode="wait">
                        {/* Step 0 */}
                        {step === 0 && (
                          <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .3 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>Taarifa za Mwanafunzi</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Field label="Jina la Kwanza *" error={errors.firstName?.message}>
                                  <input {...register('firstName', { required: 'Jina la kwanza linahitajika' })} style={getInputStyle(!!errors.firstName)} placeholder="Jina la kwanza" />
                                </Field>
                                <Field label="Jina la Pili *" error={errors.lastName?.message}>
                                  <input {...register('lastName', { required: 'Jina la ukoo linahitajika' })} style={getInputStyle(!!errors.lastName)} placeholder="Jina la ukoo" />
                                </Field>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Field label="Jinsia *" error={errors.gender?.message}>
                                  <select {...register('gender', { required: 'Chagua jinsia' })} style={{ ...getInputStyle(!!errors.gender), cursor: 'pointer' }}>
                                    <option value="">Chagua...</option>
                                    <option value="MALE">Mume (Male)</option>
                                    <option value="FEMALE">Mke (Female)</option>
                                  </select>
                                </Field>
                                <Field label="Tarehe ya Kuzaliwa *" error={errors.dateOfBirth?.message}>
                                  <input type="date" {...register('dateOfBirth', { required: 'Tarehe ya kuzaliwa inahitajika' })} style={getInputStyle(!!errors.dateOfBirth)} />
                                </Field>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        {/* Step 1 */}
                        {step === 1 && (
                          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .3 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>Taarifa za Mzazi/Mlezi</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                              <Field label="Jina Kamili la Mzazi/Mlezi *" error={errors.parentName?.message}>
                                <input {...register('parentName', { required: 'Jina la mzazi linahitajika' })} style={getInputStyle(!!errors.parentName)} placeholder="Jina kamili la mzazi au mlezi" />
                              </Field>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Field label="Nambari ya Simu *" error={errors.parentPhone?.message}>
                                  <input {...register('parentPhone', { required: 'Simu inahitajika', pattern: { value: /^[+\d]{10,}$/, message: 'Simu lazima iwe na nambari 10 au zaidi' } })} style={getInputStyle(!!errors.parentPhone)} placeholder="+255 7XX XXX XXX" />
                                </Field>
                                <Field label="Barua Pepe *" error={errors.parentEmail?.message}>
                                  <input type="email" {...register('parentEmail', { required: 'Barua pepe inahitajika', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Barua pepe si sahihi' } })} style={getInputStyle(!!errors.parentEmail)} placeholder="barua@pepe.com" />
                                </Field>
                              </div>
                              <Field label="Anwani ya Makazi *" error={errors.address?.message}>
                                <textarea {...register('address', { required: 'Anwani ya makazi inahitajika' })} style={{ ...getInputStyle(!!errors.address), minHeight: 80, resize: 'none' }} placeholder="Mtaa, Wilaya, Mkoa" />
                              </Field>
                            </div>
                          </motion.div>
                        )}
                        {/* Step 2 */}
                        {step === 2 && (
                          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .3 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>Taarifa za Kielimu</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                              <Field label="Jina la Shule ya Msingi *" error={errors.primarySchool?.message}>
                                <input {...register('primarySchool', { required: 'Jina la shule ya msingi linahitajika' })} style={getInputStyle(!!errors.primarySchool)} placeholder="Mfano: Mpendae Primary School" />
                              </Field>
                              <Field label="Alama za PSLE/KCPE *" error={errors.kcpeScore?.message}>
                                <input type="number" {...register('kcpeScore', { required: 'Alama za PSLE zinahitajika', min: { value: 0, message: 'Alama haziwezi kuwa chini ya 0' }, max: { value: 500, message: 'Alama haziwezi kuzidi 500' } })} style={getInputStyle(!!errors.kcpeScore)} placeholder="Mfano: 350" />
                              </Field>
                              <Field label="Combination Inayohitajika">
                                <input {...register('combination')} style={getInputStyle(false)} placeholder="Mfano: PCB, HGE, BCom..." />
                              </Field>
                            </div>
                          </motion.div>
                        )}
                        {/* Step 3: Review */}
                        {step === 3 && (
                          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .3 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>Kagua Maombi Yako</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.5rem' }}>
                              {[
                                { l: 'Jina Kamili', v: `${formData.firstName || ''} ${formData.lastName || ''}` },
                                { l: 'Jinsia', v: formData.gender === 'MALE' ? 'Mume' : formData.gender === 'FEMALE' ? 'Mke' : '—' },
                                { l: 'Tarehe ya Kuzaliwa', v: formData.dateOfBirth || '—' },
                                { l: 'Mzazi/Mlezi', v: formData.parentName || '—' },
                                { l: 'Simu', v: formData.parentPhone || '—' },
                                { l: 'Barua Pepe', v: formData.parentEmail || '—' },
                                { l: 'Anwani', v: formData.address || '—' },
                                { l: 'Shule ya Msingi', v: formData.primarySchool || '—' },
                                { l: 'Alama za PSLE', v: formData.kcpeScore ? String(formData.kcpeScore) : '—' },
                              ].map(({ l, v }) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '.625rem 0', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: '.85rem' }}>
                                  <span style={{ color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>{l}:</span>
                                  <span style={{ color: '#fff', fontWeight: 700, textAlign: 'right' }}>{v}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{ padding: '1rem 1.25rem', borderRadius: '1rem', background: 'rgba(0,255,65,.07)', border: '1px solid rgba(0,255,65,.2)' }}>
                              <p style={{ fontSize: '.8rem', color: 'var(--c-lime)', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
                                ✓ Kwa kubonyeza "Wasilisha", unakubali kwamba taarifa zote ulizotoa ni za kweli na sahihi.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Nav buttons */}
                    <div style={{ padding: '1.25rem 2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <button
                        type="button"
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 0}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '.5rem',
                          padding: '.75rem 1.5rem', borderRadius: '1rem', cursor: step === 0 ? 'not-allowed' : 'pointer',
                          background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
                          color: 'rgba(255,255,255,.5)', fontWeight: 700, fontSize: '.875rem',
                          opacity: step === 0 ? .4 : 1, transition: 'all .2s',
                        }}
                      >
                        <ChevronLeft style={{ width: 16, height: 16 }} /> Nyuma
                      </button>
                      {step < 3 ? (
                        <button type="button" onClick={nextStep} style={{
                          display: 'flex', alignItems: 'center', gap: '.5rem',
                          padding: '.75rem 2rem', borderRadius: '1rem', cursor: 'pointer',
                          background: 'var(--c-lime)', color: '#050805', fontWeight: 800, fontSize: '.875rem', border: 'none',
                        }}>
                          Endelea <ChevronRight style={{ width: 16, height: 16 }} />
                        </button>
                      ) : (
                        <button type="submit" disabled={isSubmitting} style={{
                          display: 'flex', alignItems: 'center', gap: '.5rem',
                          padding: '.75rem 2rem', borderRadius: '1rem', cursor: isSubmitting ? 'wait' : 'pointer',
                          background: isSubmitting ? 'rgba(0,255,65,.4)' : 'var(--c-lime)',
                          color: '#050805', fontWeight: 800, fontSize: '.875rem', border: 'none', opacity: isSubmitting ? .8 : 1,
                        }}>
                          {isSubmitting ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Inawasilisha...</> : <><CheckCircle style={{ width: 16, height: 16 }} /> Wasilisha Ombi</>}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>

            {/* ── FAQ ── */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: .55 }} viewport={{ once: true }}
                style={{ textAlign: 'center', marginBottom: '2.5rem' }}
              >
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff', marginBottom: '.5rem' }}>
                  Maswali Yanayoulizwa Mara Kwa Mara
                </h2>
                <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.9rem' }}>Pata majibu ya haraka kwa maswali yako ya kawaida.</p>
              </motion.div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', maxWidth: 760, margin: '0 auto' }}>
                {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} index={i} />)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
