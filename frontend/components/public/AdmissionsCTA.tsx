'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { GraduationCap, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface AdmissionsCTAProps {
  aboutImage: string | null;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const POINTS = [
  'Elimu bora ya O-Level na A-Level',
  'Walimu wenye uzoefu wa kimataifa',
  'Maabara za kisasa na maktaba kubwa',
  'Ufaulu wa NECTA wa asilimia ya juu',
];

export default function AdmissionsCTA({ aboutImage }: AdmissionsCTAProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="grid lg:grid-cols-2">

        {/* ── LEFT: Dark CTA ── */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="relative flex min-h-[480px] flex-col justify-center px-8 py-16 sm:px-14 sm:py-20 lg:px-16 lg:py-24"
          style={{ background: 'linear-gradient(160deg, var(--black-900) 0%, var(--black-700) 100%)' }}
        >
          {/* Background grid pattern */}
          <div className="pattern-grid pointer-events-none absolute inset-0 opacity-40" />

          {/* Lime glow */}
          <div
            className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full blur-[80px]"
            style={{ background: 'rgba(0,255,0,0.07)' }}
          />

          <div className="relative z-10 max-w-md">
            <motion.span
              variants={item}
              className="section-label mb-5"
            >
              Uandikishaji {new Date().getFullYear()}
            </motion.span>

            <motion.h2
              variants={item}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                color: 'var(--white)',
                marginBottom: '1.25rem',
              }}
            >
              Jiunge na Familia ya{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--lime-500)' }}>Mpendae</em>
            </motion.h2>

            <motion.p
              variants={item}
              className="mb-8 text-sm leading-loose"
              style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.9 }}
            >
              Nafasi ni chache kwa mwaka huu wa masomo. Wasilisha ombi lako la usajili leo na uwe sehemu ya familia yetu inayokua.
            </motion.p>

            {/* Points */}
            <motion.ul variants={item} className="mb-9 space-y-3">
              {POINTS.map((pt) => (
                <li key={pt} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--lime-500)' }} />
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{pt}</span>
                </li>
              ))}
            </motion.ul>

            {/* Buttons */}
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <Link href="/admissions" className="btn-hero text-sm px-6 py-3">
                <GraduationCap className="h-4 w-4" /> Wasilisha Ombi
              </Link>
              <Link href="/contact" className="btn-hero-outline text-sm px-6 py-3">
                Maswali? Wasiliana <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ── RIGHT: Image ── */}
        <div className="relative min-h-[300px] overflow-hidden lg:min-h-[480px]">
          {aboutImage ? (
            <Image src={aboutImage} alt="Mpendae Secondary School campus" fill className="object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--black-800), var(--black-700))' }}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl"
                  style={{ background: 'var(--lime-500)', boxShadow: '0 0 40px rgba(0,255,0,0.3)' }}
                >
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--black-900)' }}>M</span>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'rgba(255,255,255,0.15)', fontSize: '1.1rem' }}>
                  Picha zinakuja hivi karibuni
                </p>
              </div>
            </div>
          )}
          {/* Overlay gradient from left */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(6,10,5,0.45) 0%, transparent 45%)' }}
          />
          {/* Lime tint overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(0,255,0,0.05) 0%, transparent 50%)' }}
          />

          {/* Stats badge floating */}
          <div
            className="absolute bottom-6 right-6 rounded-2xl px-5 py-4 text-center"
            style={{
              background: 'rgba(6,10,5,0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,255,0,0.2)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            }}
          >
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--lime-500)', lineHeight: 1 }}>
              35+
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Miaka ya Uzoefu
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}