'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-bg)', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Animated Shield */}
        <motion.div
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          style={{ position: 'relative' }}
        >
          <svg viewBox="0 0 44 44" fill="none" style={{ width: 64, height: 64 }}>
            <path d="M22 2L4 10V22C4 32.5 12 40.5 22 43C32 40.5 40 32.5 40 22V10L22 2Z" fill="var(--c-lime)" />
            <text x="22" y="28" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="15" fill="#050805">M</text>
          </svg>
          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.6, 1.6], opacity: [.5, 0, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
            style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '2px solid var(--c-lime)', pointerEvents: 'none' }}
          />
        </motion.div>
        {/* Dots */}
        <div style={{ display: 'flex', gap: '.5rem' }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: .9, delay: i * .2, ease: 'easeInOut' }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-lime)', opacity: .7 }}
            />
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '.8rem', fontWeight: 600, letterSpacing: '.1em' }}>INAPAKIA...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  /* Sidebar width: 240px expanded, 64px collapsed */
  const sidebarW = collapsed ? '64px' : '240px';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex' }}>

      {/* ── Desktop Sidebar (≥1024px only) ── */}
      <div className="admin-sidebar-desktop">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* ── Mobile Overlay Sidebar (<1024px) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mob-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            className="admin-mobile-overlay"
          >
            <div
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ duration: .28, ease: [.22, 1, .36, 1] }}
              style={{ position: 'relative', zIndex: 50, height: '100%' }}
            >
              <Sidebar collapsed={false} setCollapsed={() => {}} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content area — shifts right equal to sidebar width on desktop ── */}
      <div className="admin-main-content" style={{ '--sidebar-w': sidebarW } as React.CSSProperties}>
        <AdminHeader onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main style={{ flex: 1, padding: '1.25rem', overflowX: 'hidden', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
