'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ChevronDown, GraduationCap, BookOpen, Users, FlaskConical, Palette } from 'lucide-react';

const ANNOUNCEMENTS = [
  '🎉 Matokeo ya NECTA 2025 yamewadia — Hongera wahitimu wote!',
  '📚 Usajili wa Form I 2026 umefunguliwa — Nafasi ni chache',
  '🏆 Shule Bora ya Zanzibar — Tuzo ya Elimu 2025',
  '📢 Mtihani wa Mock wa Form IV unaanza Septemba 5, 2026',
];

const navLinks = [
  { label: 'Nyumbani', href: '/' },
  { label: 'Kuhusu', href: '/about' },
  {
    label: 'Masomo', href: '/academics',
    children: [
      { label: 'Mitaala', href: '/academics', icon: BookOpen, desc: 'O-Level & A-Level' },
      { label: 'Walimu Wetu', href: '/staff', icon: Users, desc: 'Wataalam wa elimu' },
      { label: 'Maabara', href: '/labs', icon: FlaskConical, desc: 'Vifaa vya kisasa' },
      { label: 'Sanaa & Utamaduni', href: '/arts', icon: Palette, desc: 'Mkondo wa sanaa' },
    ],
  },
  { label: 'Habari', href: '/news' },
  { label: 'Picha', href: '/gallery' },
  { label: 'Matukio', href: '/events' },
  { label: 'Wasiliana', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen]         = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [dropdown, setDropdown]     = useState<string | null>(null);
  const [scrollPct, setScrollPct]   = useState(0);
  const [showAnnounce, setShowAnnounce] = useState(true);
  const pathname  = usePathname();
  const ddRef     = useRef<HTMLDivElement>(null);

  /* Scroll + progress */
  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 30);
      const el = document.documentElement;
      const pct = (window.scrollY / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(Math.min(pct, 100));
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* Close on route change */
  useEffect(() => { setIsOpen(false); setDropdown(null); }, [pathname]);

  /* Click outside dropdown */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDropdown(null);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  /* Keyboard */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDropdown(null); setIsOpen(false); }
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  const announceH = showAnnounce ? 'var(--announce-h)' : '0px';
  const cls = `nav-root${scrolled ? ' nav-scrolled' : ''}${isOpen ? ' nav-open' : ''}${!showAnnounce ? ' announce-hidden' : ''}`;

  return (
    <>
      {/* Skip link */}
      <a
        href="#main-content"
        style={{
          position: 'fixed', left: '-9999px', top: 0, zIndex: 100,
          padding: '.75rem 1.25rem', borderRadius: '0 0 .75rem 0',
          background: 'var(--c-lime)', color: 'var(--c-bg)',
          fontWeight: 700, fontSize: '.875rem', textDecoration: 'none',
        }}
        onFocus={e => { e.currentTarget.style.left = '0'; }}
        onBlur={e  => { e.currentTarget.style.left = '-9999px'; }}
      >
        Ruka kwenda kwenye maudhui
      </a>

      {/* Scroll progress bar */}
      <div
        className="scroll-progress"
        style={{ width: `${scrollPct}%`, top: showAnnounce ? 'var(--announce-h)' : 0 }}
      />

      {/* ── Announcement bar ── */}
      <AnimatePresence>
        {showAnnounce && (
          <motion.div
            initial={{ height: 'var(--announce-h)', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="announce-bar"
            style={{ overflow: 'hidden' }}
          >
            <div className="announce-ticker">
              {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((text, i) => (
                <span key={i} className="announce-item">
                  {text}
                  <span className="announce-sep" style={{ marginLeft: '2.5rem' }}>·</span>
                </span>
              ))}
            </div>
            <button
              className="announce-close"
              onClick={() => setShowAnnounce(false)}
              aria-label="Funga tangazo"
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Navbar ── */}
      <nav className={cls} aria-label="Urambazaji mkuu">
        <div
          className="site-container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'var(--nav-h)' }}
        >
          {/* ── Logo ── */}
          <Link
            href="/"
            aria-label="Mpendae Secondary School — Nyumbani"
            style={{ display: 'flex', alignItems: 'center', gap: '.75rem', textDecoration: 'none' }}
          >
            {/* SVG Shield Logo */}
            <div
              style={{ width: 44, height: 44, flexShrink: 0, transition: 'transform .3s var(--ease-spring), box-shadow .3s ease' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'scale(1.1) rotate(-3deg)';
                el.style.filter = 'drop-shadow(0 0 12px rgba(0,255,65,.5))';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'scale(1) rotate(0)';
                el.style.filter = 'none';
              }}
            >
              <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                <path d="M22 2L4 10V22C4 32.5 12 40.5 22 43C32 40.5 40 32.5 40 22V10L22 2Z" fill="#00FF41" />
                <path d="M22 6L7 13V22C7 31 13.5 38 22 40.5C30.5 38 37 31 37 22V13L22 6Z" fill="#050805" fillOpacity=".25"/>
                <text x="22" y="28" textAnchor="middle" fontFamily="var(--f-head)" fontWeight="900" fontSize="16" fill="#050805">M</text>
              </svg>
            </div>
            <div style={{ lineHeight: 1.28 }}>
              <p style={{ fontSize: '.875rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-.01em' }}>Mpendae Secondary</p>
              <p style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--c-lime)', margin: 0, letterSpacing: '.05em' }}>SCHOOL — ZANZIBAR</p>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <div
            ref={ddRef}
            style={{ display: 'none', alignItems: 'center', gap: '.125rem' }}
            className="desktop-nav"
          >
            {navLinks.map(link =>
              link.children ? (
                <div key={link.label} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setDropdown(dropdown === link.label ? null : link.label)}
                    aria-expanded={dropdown === link.label}
                    aria-haspopup="true"
                    className={`nav-link${pathname.startsWith(link.href) ? ' active' : ''}`}
                    style={{ background: 'none', border: 'none' }}
                  >
                    {link.label}
                    <ChevronDown
                      style={{
                        width: 13, height: 13,
                        transition: 'transform .25s',
                        transform: dropdown === link.label ? 'rotate(180deg)' : 'rotate(0)',
                      }}
                    />
                  </button>
                  <AnimatePresence>
                    {dropdown === link.label && (
                      <motion.div
                        className="nav-dropdown"
                        role="menu"
                        initial={{ opacity: 0, y: -10, scale: .97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: .97 }}
                        transition={{ duration: .18, ease: 'easeOut' }}
                      >
                        {link.children.map(child => {
                          const Icon = child.icon;
                          return (
                            <Link key={child.href} href={child.href} role="menuitem" className="nav-dropdown-link">
                              <div className="nav-dropdown-icon">
                                <Icon style={{ width: 15, height: 15, color: 'var(--c-lime)' }} />
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '.875rem', color: '#fff' }}>{child.label}</p>
                                <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--c-w35)', marginTop: '.1rem' }}>{child.desc}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link${pathname === link.href ? ' active' : ''}`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* ── Right side ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <Link
              href="/admissions"
              className="btn-primary desktop-only"
              style={{ padding: '.58rem 1.375rem', fontSize: '.8rem', borderRadius: '999px' }}
            >
              <GraduationCap style={{ width: 14, height: 14 }} />
              Jiandikishe
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Funga menyu' : 'Fungua menyu'}
              className="mobile-menu-btn"
              style={{
                width: 42, height: 42, borderRadius: '.625rem',
                border: '1px solid var(--c-border)',
                background: isOpen ? 'var(--c-lime-hint)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', transition: 'all .2s', padding: 0,
              }}
            >
              <AnimatePresence mode="wait">
                {isOpen
                  ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: .18 }}><X style={{ width: 18, height: 18 }} /></motion.span>
                  : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: .18 }}><Menu style={{ width: 18, height: 18 }} /></motion.span>
                }
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="nav-mobile"
            style={{ top: `calc(var(--nav-h) + ${announceH})` }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: .22, ease: 'easeOut' }}
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: .22, delay: i * 0.05 }}
              >
                <Link
                  href={link.href}
                  className={`nav-mobile-link${pathname === link.href ? ' active' : ''}`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--c-lime)', flexShrink: 0,
                      boxShadow: '0 0 8px rgba(0,255,65,.6)',
                    }} />
                  )}
                </Link>
                {link.children?.map(child => (
                  <Link key={child.href} href={child.href} className="nav-mobile-child">
                    <span style={{ color: 'var(--c-lime)', marginRight: '.375rem' }}>→</span>
                    {child.label}
                  </Link>
                ))}
              </motion.div>
            ))}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <Link
                href="/admissions"
                className="btn-primary"
                style={{ display: 'flex', justifyContent: 'center', borderRadius: '.875rem', padding: '1rem', gap: '.5rem' }}
              >
                <GraduationCap style={{ width: 16, height: 16 }} />
                Jiandikishe Leo — Nafasi ni Chache
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media(min-width:1024px) {
          .desktop-nav { display:flex !important; }
          .mobile-menu-btn { display:none !important; }
          .desktop-only { display:inline-flex !important; }
        }
        @media(max-width:1023px) {
          .desktop-only { display:none; }
        }
      `}</style>
    </>
  );
}