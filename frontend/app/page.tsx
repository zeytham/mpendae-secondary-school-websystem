import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { BookOpen, FlaskConical, Globe, Trophy, ChevronRight } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import Hero from '@/components/public/Hero';
import QuickLinks from '@/components/public/QuickLinks';
import NewsSection from '@/components/public/NewsSection';
import EventsSection from '@/components/public/EventsSection';
import GallerySection from '@/components/public/GallerySection';
import StatsSection from '@/components/public/StatsSection';
import AdmissionsCTA from '@/components/public/AdmissionsCTA';
import PackagesSection from '@/components/public/PackagesSection';
import Reveal from '@/components/ui/Reveal';
import { NewsSkeleton, EventsSkeleton, GallerySkeleton, StatsSkeleton } from '@/components/ui/Skeletons';
import { galleryApi, settingsApi } from '@/lib/api';

export const revalidate = 30;
export default async function HomePage() {
  let heroImages: string[] = [];
  let aboutImage: string | null = null;
  let nectaPassRate: string | null = null;
  try {
    const [galleryRes, settingsRes] = await Promise.all([
      galleryApi.getAll(),
      settingsApi.getSettings(),
    ]);
    const photos = galleryRes.data as { imageUrl: string }[];
    heroImages = photos.slice(0, 5).map((p) => p.imageUrl);
    aboutImage = photos[5]?.imageUrl ?? photos[0]?.imageUrl ?? null;
    nectaPassRate = settingsRes.data.nectaPassRate || null;
  } catch {
    heroImages = [];
  }

  return (
    <>
      <Navbar />
      <main id="main-content">

        {/* ── HERO ── Full-screen slideshow */}
        <Hero images={heroImages} />

        {/* ── FLOATING QUICK LINKS ── */}
        <div className="relative z-20">
          <QuickLinks />
        </div>

        {/* ── STATS ── Editorial numbers */}
        <Suspense fallback={<div className="site-container py-16"><StatsSkeleton /></div>}>
          <StatsSection />
        </Suspense>

        {/* ── PACKAGES / ADMISSIONS CAROUSEL ── NEW */}
        <PackagesSection />

        {/* ── ABOUT SNIPPET ── */}
        <section
          className="section-padding relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, rgba(10,15,8,0.5) 0%, rgba(17,26,13,0.35) 50%, rgba(10,15,8,0.5) 100%)' }}
        >
          {/* Radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(0,255,0,0.04) 0%, transparent 60%)' }}
          />

          <div className="site-container relative z-10">
            <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">

              {/* Image */}
              <Reveal delay={0.1}>
                <div className="relative mx-auto max-w-md lg:mx-0 lg:ml-auto">
                  <div
                    className="media-hero relative aspect-[4/5] w-full overflow-hidden"
                    style={{ borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {aboutImage ? (
                      <>
                        <Image src={aboutImage} alt="Mpendae Secondary School" fill className="object-cover" />
                        <div className="media-hero__overlay" />
                      </>
                    ) : (
                      <div
                        className="relative flex h-full w-full items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, var(--black-800), var(--black-700))' }}
                      >
                        <div className="pattern-grid absolute inset-0 opacity-40" />
                        <div className="relative flex flex-col items-center gap-4 text-center">
                          <div
                            className="flex h-20 w-20 items-center justify-center rounded-2xl"
                            style={{ background: 'var(--lime-500)', boxShadow: '0 8px 30px rgba(0,255,0,0.3)' }}
                          >
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--black-900)' }}>M</span>
                          </div>
                          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'rgba(255,255,255,0.2)', fontSize: '1rem' }}>
                            Picha zinakuja hivi karibuni
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* NECTA pass rate badge */}
                  {nectaPassRate && (
                    <div
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-2xl px-6 py-4 text-center lg:left-auto lg:right-6 lg:translate-x-0"
                      style={{
                        background: 'var(--lime-500)',
                        boxShadow: '0 12px 35px rgba(0,255,0,0.35)',
                      }}
                    >
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--black-900)', lineHeight: 1 }}>
                        {nectaPassRate}
                      </p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(6,10,5,0.65)' }}>
                        Ufaulu NECTA {new Date().getFullYear()}
                      </p>
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Text */}
              <Reveal>
                <span className="section-label">Kuhusu Sisi</span>
                <h2
                  className="mb-6"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.9rem, 4vw, 3rem)',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    color: 'var(--white)',
                  }}
                >
                  Shule ya Mfano katika{' '}
                  <em style={{ fontStyle: 'italic', color: 'var(--lime-500)' }}>Zanzibar</em>
                </h2>

                <p className="mb-9 max-w-lg text-base leading-loose" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.9 }}>
                  Mpendae Secondary School ni moja ya shule zinazoongoza elimu Tanzania. Tangu 1990 tumekuwa tukitoa elimu ya hali ya juu kwa vizazi vingi vya wanafunzi — tunafundisha Sayansi, Sanaa na Biashara kwa ngazi ya O-Level na A-Level.
                </p>

                {/* Feature grid */}
                <div className="mb-9 grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: FlaskConical, label: 'Maabara za Kisasa' },
                    { icon: BookOpen,     label: 'Maktaba Kubwa' },
                    { icon: Globe,        label: 'Mitaala ya Kimataifa' },
                    { icon: Trophy,       label: 'Washindi wa NECTA' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="feature-item">
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ background: 'rgba(0,255,0,0.1)', border: '1px solid rgba(0,255,0,0.2)' }}
                      >
                        <Icon className="h-5 w-5" style={{ color: 'var(--lime-500)' }} />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</span>
                    </div>
                  ))}
                </div>

                <Link href="/about" className="btn-primary inline-flex rounded-full px-8">
                  Soma Zaidi <ChevronRight className="h-4 w-4" />
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── NEWS ── */}
        <Suspense fallback={<div className="site-container section-padding"><NewsSkeleton /></div>}>
          <NewsSection />
        </Suspense>

        {/* ── EVENTS ── */}
        <Suspense fallback={<div className="site-container section-padding"><EventsSkeleton /></div>}>
          <EventsSection />
        </Suspense>

        {/* ── GALLERY ── */}
        <Suspense fallback={<div className="site-container section-padding"><GallerySkeleton /></div>}>
          <GallerySection />
        </Suspense>

        {/* ── ADMISSIONS CTA ── */}
        <AdmissionsCTA aboutImage={aboutImage} />

      </main>
      <Footer />
    </>
  );
}