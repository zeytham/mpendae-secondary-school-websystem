'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { settingsApi, milestonesApi, galleryApi } from '@/lib/api';
import { SchoolSettings, Milestone } from '@/types';
import { BookOpen, Target, Eye, Heart, Users, Award, School, ChevronDown, Quote } from 'lucide-react';
import PageHeroCarousel from '@/components/public/PageHeroCarousel';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: .65, delay: d, ease: 'easeOut' as const } }),
};

export default function AboutPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [timeline, setTimeline] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [principalImage, setPrincipalImage] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  useEffect(() => {
    settingsApi.getSettings().then(r => setSettings(r.data)).catch(() => {});
    milestonesApi.getAll().then(r => setTimeline(r.data)).catch(() => {}).finally(() => setLoading(false));
    galleryApi.getAll().then(r => {
      const photos = r.data as { imageUrl: string }[];
      setHeroImages(photos.slice(0, 6).map(p => p.imageUrl));
      setPrincipalImage(photos[1]?.imageUrl ?? photos[0]?.imageUrl ?? null);
    }).catch(() => {});
  }, []);

  const values = [
    { icon: BookOpen, title: 'Elimu Bora',        desc: 'Elimu ya hali ya juu inayobadilisha maisha ya wanafunzi kwa ujuzi wa kisasa.' },
    { icon: Heart,    title: 'Maadili Mazuri',    desc: 'Uaminifu, heshima, na uwajibikaji katika kila kitu tunachofanya.' },
    { icon: Users,    title: 'Umoja wa Jamii',    desc: 'Tunaimarisha uhusiano kati ya wanafunzi, walimu, wazazi na jamii nzima.' },
    { icon: Award,    title: 'Ubora wa Juu',      desc: 'Tunalenga ubora katika masomo, michezo, na shughuli zote za shule.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>

      {/* ── HERO ── */}
      <PageHeroCarousel images={heroImages}>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.1}>
          <span className="badge-gold" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>Kuhusu Sisi</span>
        </motion.div>
        <motion.h1
          variants={fadeUp} initial="hidden" animate="show" custom={0.22}
          style={{ fontFamily:'var(--f-display)', fontSize:'clamp(2.5rem,6vw,4.5rem)', fontWeight:700, lineHeight:1.05, color:'#fff', marginBottom:'1.25rem' }}
        >
          Historia na <span style={{ fontStyle:'italic', color:'var(--c-lime)' }}>Dhamira</span> Yetu
        </motion.h1>
        <motion.p
          variants={fadeUp} initial="hidden" animate="show" custom={0.35}
          style={{ fontSize:'1.1rem', lineHeight:1.8, color:'rgba(255,255,255,.6)', maxWidth:520, margin:'0 auto' }}
        >
          Tangu 1990, Mpendae Secondary School imekuwa ikitoa elimu bora na kuimarisha vizazi vya Zanzibar.
        </motion.p>
      </PageHeroCarousel>

      {/* ── PRINCIPAL MESSAGE ── */}
      <section style={{ padding:'var(--section-py) 0', background:'linear-gradient(180deg,rgba(15,26,11,.5) 0%,var(--c-bg) 100%)' }}>
        <div className="site-container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'3.5rem', alignItems:'center' }}>
            <style>{`@media(min-width:1024px){.about-principal-grid{grid-template-columns:1fr 1.1fr !important;}}`}</style>
            <div className="about-principal-grid" style={{ display:'contents' }}>
              {/* Image */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" custom={0} viewport={{ once:true }}
                style={{ position:'relative', maxWidth:420, margin:'0 auto', width:'100%' }}
              >
                <div style={{
                  position:'relative', borderRadius:'2rem', overflow:'hidden',
                  aspectRatio:'3/4', border:'1px solid rgba(0,255,65,.12)',
                  boxShadow:'0 40px 80px rgba(0,0,0,.5)',
                }}>
                  {principalImage
                    ? <Image src={principalImage} alt={settings?.principal||'Mkurugenzi'} fill style={{ objectFit:'cover' }} />
                    : <div style={{ height:'100%', background:'linear-gradient(135deg,var(--c-surface),var(--c-surface2))', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <School style={{ width:80, height:80, color:'rgba(255,255,255,.08)' }} />
                      </div>
                  }
                  {/* Overlay */}
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(5,8,5,.7) 0%,transparent 50%)' }} />
                </div>
                {/* Name badge */}
                <motion.div
                  style={{
                    position:'absolute', bottom:'-1.5rem', right:'-1rem',
                    background:'var(--c-lime)', borderRadius:'1rem', padding:'1rem 1.5rem',
                    boxShadow:'0 12px 35px rgba(0,255,65,.3)',
                  }}
                  animate={{ y:[0,-6,0] }}
                  transition={{ duration:3.5, repeat:Infinity, ease:'easeInOut' }}
                >
                  <p style={{ fontSize:'.8rem', fontWeight:800, color:'var(--c-bg)', margin:0 }}>{settings?.principal||'Mwalimu Mkuu'}</p>
                  <p style={{ fontSize:'.68rem', color:'rgba(5,8,5,.65)', margin:0 }}>Mkurugenzi wa Shule</p>
                </motion.div>

                {/* Decorative lime orb */}
                <div style={{
                  position:'absolute', top:'-3rem', left:'-3rem',
                  width:180, height:180, borderRadius:'50%',
                  background:'radial-gradient(circle,rgba(0,255,65,.08) 0%,transparent 70%)',
                  pointerEvents:'none',
                }} />
              </motion.div>

              {/* Text */}
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" custom={0.15} viewport={{ once:true }}>
                <span className="section-label">Ujumbe wa Mkurugenzi</span>
                <h2 style={{ fontFamily:'var(--f-display)', fontSize:'clamp(1.8rem,4vw,2.75rem)', fontWeight:700, color:'#fff', lineHeight:1.15, marginBottom:'1.5rem' }}>
                  Karibu <span style={{ fontStyle:'italic', color:'var(--c-lime)' }}>Mpendae School</span>
                </h2>

                {/* Quote icon */}
                <div style={{ marginBottom:'1.25rem' }}>
                  <Quote style={{ width:36, height:36, color:'var(--c-lime)', opacity:.5 }} />
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:'1rem', color:'rgba(255,255,255,.6)', lineHeight:1.9, fontSize:'.95rem' }}>
                  <p>Kwa niaba yangu mwenyewe na kwa niaba ya walimu, wafanyakazi, na wanafunzi wote wa Mpendae Secondary School, ninakukaribisha kwenye ukurasa wetu wa wavuti.</p>
                  <p>{settings?.about || 'Mpendae Secondary School ina historia ndefu ya kutoa elimu bora kwa vijana wa Zanzibar. Tunaamini kwamba kila mwanafunzi ana uwezo wa kufanikiwa anapopewa mazingira mazuri ya kujifunzia.'}</p>
                  <p>Falsafa yetu ni kwamba elimu si tu kupata alama nzuri bali pia kujenga mtu mzima mwenye maadili, ujuzi, na uwezo wa kuchangia katika jamii yake.</p>
                </div>

                {/* Motto */}
                <blockquote style={{
                  marginTop:'2rem', paddingLeft:'1rem',
                  borderLeft:'3px solid var(--c-lime)',
                  fontFamily:'var(--f-display)', fontStyle:'italic',
                  fontSize:'1.15rem', color:'var(--c-lime)',
                }}>
                  &ldquo;{settings?.motto || 'Elimu ni Ufunguo wa Maisha'}&rdquo;
                </blockquote>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section style={{ padding:'var(--section-py) 0' }}>
        <div className="site-container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap:'1.5rem', marginBottom:'5rem' }}>
            {[
              { icon: Target, num:'01', label:'Dhamira Yetu', en:'Mission', color:'var(--c-lime)', desc:'Kutoa elimu bora, kamili na inayolingana na mahitaji ya wakati wa sasa, ambayo itamfanya mwanafunzi aweze kukabiliana na changamoto za maisha huku akishikamana na maadili mazuri.' },
              { icon: Eye,    num:'02', label:'Maono Yetu',   en:'Vision',  color:'var(--c-lime)', desc:'Kuwa shule inayoongoza katika elimu bora katika Zanzibar na Tanzania, inayoweza kutoa wahitimu wanaoweza kushindana katika soko la kimataifa.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  variants={fadeUp} initial="hidden" whileInView="show" custom={i * .12} viewport={{ once:true }}
                  style={{
                    position:'relative', overflow:'hidden', borderRadius:'1.75rem',
                    border:'1px solid rgba(0,255,65,.1)',
                    background:'linear-gradient(135deg,rgba(15,26,11,.9),rgba(0,255,65,.03))',
                    padding:'2.5rem',
                    transition:'border-color .3s, transform .3s, box-shadow .3s',
                  }}
                  whileHover={{ y:-6, boxShadow:'0 30px 60px rgba(0,0,0,.4), 0 0 30px rgba(0,255,65,.08)', transition:{duration:.3} }}
                >
                  {/* Huge BG number */}
                  <span style={{
                    position:'absolute', top:'1rem', right:'1.5rem',
                    fontFamily:'var(--f-display)', fontSize:'8rem', fontWeight:800,
                    color:'rgba(0,255,65,.04)', lineHeight:1, pointerEvents:'none', userSelect:'none',
                  }}>{item.num}</span>

                  {/* Top accent line */}
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,var(--c-lime),transparent)' }} />

                  <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.75rem' }}>
                    <div style={{
                      width:58, height:58, borderRadius:'1rem', flexShrink:0,
                      background:'rgba(0,255,65,.12)', border:'1px solid rgba(0,255,65,.25)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      <Icon style={{ width:26, height:26, color:'var(--c-lime)' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize:'1.35rem', fontWeight:700, color:'#fff', margin:0 }}>
                        {item.label} <span style={{ color:'rgba(255,255,255,.3)', fontWeight:400, fontSize:'1rem' }}>({item.en})</span>
                      </h3>
                    </div>
                  </div>
                  <p style={{ fontSize:'.95rem', lineHeight:1.85, color:'rgba(255,255,255,.6)', margin:0 }}>{item.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Values */}
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <span className="section-label">Tunachosimamia</span>
            <h2 className="section-title">
              Maadili Yetu <span style={{ fontFamily:'var(--f-display)', fontStyle:'italic', color:'var(--c-lime)' }}>ya Msingi</span>
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1.25rem' }}>
            {values.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                variants={fadeUp} initial="hidden" whileInView="show" custom={i * .09} viewport={{ once:true }}
                style={{
                  position:'relative', overflow:'hidden', borderRadius:'1.5rem',
                  border:'1px solid var(--c-border)',
                  background:'var(--c-surface)',
                  padding:'2rem 1.5rem', textAlign:'center',
                  cursor:'default',
                }}
                whileHover={{ y:-5, borderColor:'rgba(0,255,65,.3)', boxShadow:'0 20px 40px rgba(0,0,0,.4), 0 0 20px rgba(0,255,65,.07)', transition:{duration:.25} }}
              >
                {/* Animated top bar */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,transparent,var(--c-lime),transparent)', transform:'scaleX(0)', transformOrigin:'left', transition:'transform .35s ease' }} className="value-bar" />
                <style>{`.pub-card:hover .value-bar{transform:scaleX(1)}`}</style>

                <div style={{
                  width:60, height:60, borderRadius:'1.1rem', margin:'0 auto 1.25rem',
                  background:'rgba(0,255,65,.08)', border:'1px solid rgba(0,255,65,.2)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <Icon style={{ width:28, height:28, color:'var(--c-lime)' }} />
                </div>
                <h4 style={{ fontSize:'1rem', fontWeight:700, color:'#fff', marginBottom:'.625rem' }}>{title}</h4>
                <p style={{ fontSize:'.85rem', lineHeight:1.7, color:'rgba(255,255,255,.5)', margin:0 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section ref={ref} style={{ padding:'var(--section-py) 0', background:'linear-gradient(180deg,var(--c-bg) 0%,rgba(15,26,11,.5) 50%,var(--c-bg) 100%)' }}>
        <div className="site-container">
          <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
            <span className="section-label">Historia</span>
            <h2 className="section-title">
              Safari Yetu <span style={{ fontFamily:'var(--f-display)', fontStyle:'italic', color:'var(--c-lime)' }}>ya Miaka</span>
            </h2>
          </div>

          <div style={{ position:'relative', maxWidth:760, margin:'0 auto', paddingLeft:'2.5rem' }}>
            {/* Vertical line */}
            <motion.div
              style={{
                position:'absolute', left:'.625rem', top:0, bottom:0, width:2,
                background:'linear-gradient(180deg,var(--c-lime),rgba(0,255,65,.05))',
                scaleY: scrollYProgress,
                transformOrigin:'top',
              }}
            />

            <div style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>
              {loading
                ? [1,2,3].map(i => (
                    <div key={i} style={{ height:80, borderRadius:'1rem', background:'rgba(255,255,255,.03)', animation:'fadeIn 1s ease infinite alternate' }} />
                  ))
                : timeline.length === 0
                ? <p style={{ textAlign:'center', color:'rgba(255,255,255,.3)', padding:'3rem 0' }}>Historia ya shule itaongezwa hivi karibuni.</p>
                : timeline.map(({ year, event }, i) => (
                    <motion.div
                      key={year + event}
                      variants={fadeUp} initial="hidden" whileInView="show" custom={Math.min(i*.06,.3)} viewport={{ once:true, margin:'-40px' }}
                      style={{ position:'relative' }}
                    >
                      {/* Dot */}
                      <div style={{
                        position:'absolute', left:'-2rem', top:'1.25rem',
                        width:20, height:20, borderRadius:'50%',
                        background:'var(--c-lime)', border:'3px solid var(--c-bg)',
                        boxShadow:'0 0 0 3px rgba(0,255,65,.25)',
                      }} />

                      <div style={{
                        borderRadius:'1.25rem', padding:'1.25rem 1.5rem',
                        background:'var(--c-surface)', border:'1px solid var(--c-border)',
                        transition:'border-color .25s, transform .25s',
                      }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='rgba(0,255,65,.25)'; el.style.transform='translateX(6px)'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='var(--c-border)'; el.style.transform='translateX(0)'; }}
                      >
                        <span style={{ fontFamily:'var(--f-display)', fontStyle:'italic', fontSize:'1.25rem', fontWeight:700, color:'var(--c-lime)' }}>{year}</span>
                        <p style={{ marginTop:'.5rem', fontSize:'.9rem', lineHeight:1.75, color:'rgba(255,255,255,.65)' }}>{event}</p>
                      </div>
                    </motion.div>
                  ))
              }
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}