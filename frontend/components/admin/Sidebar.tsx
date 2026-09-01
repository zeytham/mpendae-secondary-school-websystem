'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, Newspaper, Image, Calendar,
  ClipboardList, BookOpen, ClipboardCheck, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, AlertTriangle,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { label: 'Dashibodi', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Watu',
    items: [
      { label: 'Wanafunzi', href: '/admin/students', icon: GraduationCap },
      { label: 'Walimu',    href: '/admin/teachers',  icon: Users },
      { label: 'Usajili',   href: '/admin/admissions',icon: ClipboardList },
    ],
  },
  {
    label: 'Maudhui',
    items: [
      { label: 'Habari',  href: '/admin/news',    icon: Newspaper },
      { label: 'Picha',   href: '/admin/gallery', icon: Image },
      { label: 'Matukio', href: '/admin/events',  icon: Calendar },
    ],
  },
  {
    label: 'Mfumo',
    items: [
      { label: 'Ratiba',      href: '/admin/timetable',  icon: BookOpen },
      { label: 'Mahudhurio',  href: '/admin/attendance', icon: ClipboardCheck },
      { label: 'Ripoti',      href: '/admin/reports',    icon: BarChart3 },
      { label: 'Mipangilio',  href: '/admin/settings',   icon: Settings },
    ],
  },
];

interface SidebarProps { collapsed: boolean; setCollapsed: (v: boolean) => void; }

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const W = collapsed ? '4rem' : '15rem';

  return (
    <>
      <aside
        style={{
          position: 'fixed', left: 0, top: 0, height: '100%',
          width: W, zIndex: 40,
          display: 'flex', flexDirection: 'column',
          background: '#030604',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          transition: 'width 0.3s cubic-bezier(0.22,1,0.36,1)',
          overflow: 'hidden',
        }}
      >
        {/* ── Logo ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.875rem',
          padding: '1.25rem', height: '64px', flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,.07)',
          overflow: 'hidden', justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          {/* SVG Shield */}
          <div style={{ flexShrink: 0, width: 32, height: 32 }}>
            <svg viewBox="0 0 44 44" fill="none" style={{ width: '100%', height: '100%' }}>
              <path d="M22 2L4 10V22C4 32.5 12 40.5 22 43C32 40.5 40 32.5 40 22V10L22 2Z" fill="#00FF41" />
              <text x="22" y="28" textAnchor="middle" fontFamily="var(--f-head)" fontWeight="900" fontSize="15" fill="#050805">M</text>
            </svg>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: .2 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                <p style={{ fontSize: '.8rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-.01em' }}>Mpendae School</p>
                <p style={{ fontSize: '.62rem', fontWeight: 700, color: '#00FF41', letterSpacing: '.1em', lineHeight: 1.2 }}>ADMIN PANEL</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Collapse Toggle ── */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute', right: -12, top: 72,
            width: 24, height: 24,
            background: '#030604', border: '1px solid rgba(255,255,255,.12)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,.5)', cursor: 'pointer', zIndex: 50,
            transition: 'all .2s', padding: 0, fontSize: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#00FF41'; (e.currentTarget as HTMLElement).style.color = '#050805'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#030604'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.5)'; }}
          aria-label="Toggle sidebar"
        >
          {collapsed
            ? <ChevronRight style={{ width: 12, height: 12 }} />
            : <ChevronLeft  style={{ width: 12, height: 12 }} />
          }
        </button>

        {/* ── Navigation ── */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '.75rem .5rem .5rem' }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: '.5rem' }}>
              {/* Group label */}
              {!collapsed && (
                <p className="sidebar-group-label">{group.label}</p>
              )}
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <div key={href} style={{ position: 'relative' }}>
                    <Link
                      href={href}
                      title={collapsed ? label : undefined}
                      className={`sidebar-item${active ? ' active' : ''}`}
                      style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                    >
                      <Icon style={{ width: 18, height: 18, flexShrink: 0, color: active ? '#00FF41' : 'rgba(255,255,255,0.5)', transition: 'color .2s' }} />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: .18 }}
                            style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '.875rem' }}
                          >
                            {label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {/* Active dot */}
                      {!collapsed && active && (
                        <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#00FF41', flexShrink: 0, boxShadow: '0 0 8px rgba(0,255,65,.6)' }} />
                      )}
                      {/* Tooltip when collapsed */}
                      {collapsed && (
                        <span className="sidebar-tooltip">{label}</span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── User Section ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '.75rem .5rem', flexShrink: 0 }}>
          {/* User info */}
          {!collapsed && user && (
            <div style={{
              padding: '.75rem .875rem', marginBottom: '.5rem',
              background: 'rgba(0,255,65,.04)', border: '1px solid rgba(0,255,65,.1)',
              borderRadius: '.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '.5rem', background: 'rgba(0,255,65,.15)', border: '1px solid rgba(0,255,65,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#00FF41', fontWeight: 800, fontSize: '.875rem' }}>
                  {user.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '.8rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                  <p style={{ fontSize: '.65rem', color: 'rgba(0,255,65,.6)', fontWeight: 600, letterSpacing: '.08em' }}>MSIMAMIZI</p>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          {logoutConfirm ? (
            <div style={{ padding: '.5rem .875rem', background: 'rgba(255,71,87,.08)', border: '1px solid rgba(255,71,87,.2)', borderRadius: '.75rem', marginBottom: '.25rem' }}>
              <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.65)', marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <AlertTriangle style={{ width: 12, height: 12, color: '#ff4757', flexShrink: 0 }} />
                Una uhakika unataka kutoka?
              </p>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <button onClick={logout} style={{ flex: 1, padding: '.35rem', background: '#ff4757', border: 'none', borderRadius: '.5rem', color: '#fff', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>Ndiyo</button>
                <button onClick={() => setLogoutConfirm(false)} style={{ flex: 1, padding: '.35rem', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '.5rem', color: 'rgba(255,255,255,.6)', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>Hapana</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setLogoutConfirm(true)}
              title={collapsed ? 'Toka' : undefined}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '.75rem',
                padding: '.625rem .875rem', borderRadius: '.75rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,.4)', fontSize: '.875rem', fontWeight: 500,
                transition: 'color .2s, background .2s',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ff4757'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,71,87,.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.4)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
            >
              <LogOut style={{ width: 17, height: 17, flexShrink: 0 }} />
              {!collapsed && <span>Toka (Logout)</span>}
            </button>
          )}

          {/* Version */}
          {!collapsed && (
            <p style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.12)', textAlign: 'center', marginTop: '.5rem', letterSpacing: '.12em' }}>v1.0.0 · Mpendae School</p>
          )}
        </div>
      </aside>
    </>
  );
}
