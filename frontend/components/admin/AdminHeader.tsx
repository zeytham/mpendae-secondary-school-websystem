'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Menu, GraduationCap, Users, Loader2, Bell, Plus, ChevronRight, LogOut, Settings, UserCircle, Command, WifiOff, ClipboardList, CheckCheck, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import { studentsApi, teachersApi, admissionsApi } from '@/lib/api';
import { Student, Teacher } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';

const pageTitles: Record<string, string[]> = {
  '/admin':            ['Admin', 'Dashibodi'],
  '/admin/students':   ['Admin', 'Wanafunzi'],
  '/admin/teachers':   ['Admin', 'Walimu'],
  '/admin/news':       ['Admin', 'Habari'],
  '/admin/gallery':    ['Admin', 'Picha'],
  '/admin/events':     ['Admin', 'Matukio'],
  '/admin/admissions': ['Admin', 'Usajili'],
  '/admin/timetable':  ['Admin', 'Ratiba'],
  '/admin/attendance': ['Admin', 'Mahudhurio'],
  '/admin/reports':    ['Admin', 'Ripoti'],
  '/admin/settings':   ['Admin', 'Mipangilio'],
};

const QUICK_ACTIONS = [
  { label: 'Ongeza Habari',  href: '/admin/news?action=new',     icon: Plus },
  { label: 'Ongeza Picha',   href: '/admin/gallery?action=new',  icon: Plus },
  { label: 'Ongeza Tukio',   href: '/admin/events?action=new',   icon: Plus },
  { label: 'Angalia Ripoti', href: '/admin/reports',              icon: ChevronRight },
];

interface Admission { id: string; firstName: string; lastName: string; referenceNo: string; createdAt: string; status: string; }
interface AdminHeaderProps { onMobileMenuToggle: () => void; }

export default function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const pathname  = usePathname();
  const router    = useRouter();
  const crumbs    = pageTitles[pathname] || ['Admin'];

  /* ── Search ── */
  const [query, setQuery]               = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching]   = useState(false);
  const [searchError, setSearchError]   = useState(false);
  const [students, setStudents]         = useState<Student[]>([]);
  const [teachers, setTeachers]         = useState<Teacher[]>([]);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Notifications & Read State ── */
  const [pendingAdmissions, setPendingAdmissions] = useState<Admission[]>([]);
  const [readNotifIds, setReadNotifIds]           = useState<string[]>([]);
  const [notifLoading, setNotifLoading]           = useState(false);
  const notifFetchedRef = useRef(false);

  /* ── UI toggles ── */
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showNotif, setShowNotif]       = useState(false);
  const [time, setTime]                 = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  /* Load read notifications from localStorage */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mpendae_read_notifs');
      if (saved) setReadNotifIds(JSON.parse(saved));
    } catch { /* skip */ }
  }, []);

  const saveReadNotifs = (ids: string[]) => {
    setReadNotifIds(ids);
    try {
      localStorage.setItem('mpendae_read_notifs', JSON.stringify(ids));
    } catch { /* skip */ }
  };

  const markAsRead = (id: string) => {
    if (!readNotifIds.includes(id)) {
      saveReadNotifs([...readNotifIds, id]);
    }
  };

  const markAllAsRead = () => {
    const allIds = pendingAdmissions.map(a => a.id);
    const combined = Array.from(new Set([...readNotifIds, ...allIds]));
    saveReadNotifs(combined);
  };

  const unreadAdmissions = pendingAdmissions.filter(a => !readNotifIds.includes(a.id));
  const notifCount = unreadAdmissions.length;

  /* Live time */
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  /* ── Real-time search ── */
  const runSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchError(false);
    if (q.trim().length < 2) { setStudents([]); setTeachers([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [sRes, tRes] = await Promise.all([
          studentsApi.getAll({ search: q, limit: 5 }),
          teachersApi.getAll({ search: q }),
        ]);
        setStudents(sRes.data.students || []);
        const tData = tRes.data.teachers || tRes.data;
        setTeachers(Array.isArray(tData) ? tData.slice(0, 5) : []);
        setSearchError(false);
        setShowDropdown(true);
      } catch {
        setSearchError(true);
        setStudents([]); setTeachers([]);
        setShowDropdown(true);
      } finally { setIsSearching(false); }
    }, 350);
  }, []);

  /* ── Fetch notifications (pending admissions) ── */
  const fetchNotifications = useCallback(async () => {
    if (notifLoading) return;
    setNotifLoading(true);
    try {
      const res = await admissionsApi.getAll({ status: 'PENDING', limit: 10 });
      setPendingAdmissions(res.data.admissions || []);
      notifFetchedRef.current = true;
    } catch { /* kimya */ }
    finally { setNotifLoading(false); }
  }, [notifLoading]);

  /* Auto-fetch notifications kila dakika 1 */
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) { setShowUserMenu(false); setShowQuickAdd(false); setShowNotif(false); }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  /* Cmd+K shortcut */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        (document.getElementById('admin-search-input') as HTMLInputElement)?.focus();
      }
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  const goTo = (path: string) => { setShowDropdown(false); setQuery(''); router.push(path); };
  const hasResults = students.length > 0 || teachers.length > 0;
  const greeting   = new Date().getHours() < 12 ? 'Habari za Asubuhi' : new Date().getHours() < 17 ? 'Habari za Mchana' : 'Habari za Jioni';

  return (
    <header className="admin-header">
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMobileMenuToggle}
          className="admin-hamburger"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.5)', padding: '.375rem', borderRadius: '.5rem', display: 'flex', alignItems: 'center', transition: 'color .2s, background .2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.5)'; }}
        >
          <Menu style={{ width: 18, height: 18 }} />
        </button>

        {/* Breadcrumb */}
        <div className="admin-breadcrumb">
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
              {i < crumbs.length - 1 ? (
                <>
                  <span>{c}</span>
                  <ChevronRight style={{ width: 12, height: 12 }} className="admin-breadcrumb-sep" />
                </>
              ) : (
                <span className="admin-breadcrumb-current">{c}</span>
              )}
            </span>
          ))}
        </div>

        {/* Greeting & time */}
        <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.28)', display: 'none' }} className="header-greeting">
          {greeting} · {time}
        </p>
      </div>

      {/* Right */}
      <div ref={userMenuRef} style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>

        {/* ── Search box ── */}
        <div ref={searchBoxRef} style={{ position: 'relative' }}>
          <div className="admin-search" style={{ transition: 'width .25s, border-color .2s, box-shadow .2s' }}>
            {isSearching
              ? <Loader2 style={{ width: 15, height: 15, color: 'rgba(255,255,255,.3)', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              : <Search style={{ width: 15, height: 15, color: 'rgba(255,255,255,.3)', flexShrink: 0 }} />
            }
            <input
              id="admin-search-input"
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); runSearch(e.target.value); }}
              onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
              placeholder="Tafuta... (⌘K)"
              aria-label="Tafuta wanafunzi na walimu"
            />
          </div>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: .97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: .15 }}
                style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 300, background: '#030604', border: '1px solid rgba(255,255,255,.1)', borderRadius: '1rem', boxShadow: '0 20px 50px rgba(0,0,0,.6)', overflow: 'hidden', zIndex: 100 }}
              >
                {searchError ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <WifiOff style={{ width: 28, height: 28, color: 'rgba(255,71,87,.5)', margin: '0 auto .75rem' }} />
                    <p style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.4)', marginBottom: '.25rem' }}>Imeshindikana kuunganika</p>
                    <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.2)' }}>Hakikisha backend server imewashwa</p>
                  </div>
                ) : !hasResults ? (
                  <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '.8125rem', textAlign: 'center', padding: '1.5rem' }}>
                    Hakuna matokeo kwa &quot;{query}&quot;
                  </p>
                ) : (
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {students.length > 0 && (
                      <div>
                        <p style={{ padding: '.75rem 1rem .3rem', fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.16em', color: 'rgba(255,255,255,.25)' }}>Wanafunzi</p>
                        {students.map(s => (
                          <button key={s.id} onClick={() => goTo('/admin/students')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.625rem 1rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'background .15s', textAlign: 'left' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.05)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                          >
                            <div style={{ width: 28, height: 28, borderRadius: '.5rem', background: 'rgba(0,255,65,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <GraduationCap style={{ width: 14, height: 14, color: '#00FF41' }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: '.8125rem', fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.firstName} {s.lastName}</p>
                              <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.35)', margin: 0 }}>{s.regNumber}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {teachers.length > 0 && (
                      <div>
                        <p style={{ padding: '.75rem 1rem .3rem', fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.16em', color: 'rgba(255,255,255,.25)' }}>Walimu</p>
                        {teachers.map(t => (
                          <button key={t.id} onClick={() => goTo('/admin/teachers')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.625rem 1rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'background .15s', textAlign: 'left' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.05)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                          >
                            <div style={{ width: 28, height: 28, borderRadius: '.5rem', background: 'rgba(0,255,65,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Users style={{ width: 14, height: 14, color: 'rgba(0,255,65,.7)' }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: '.8125rem', fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.firstName} {t.lastName}</p>
                              <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.35)', margin: 0 }}>{t.department}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Quick Add ── */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowQuickAdd(!showQuickAdd); setShowUserMenu(false); setShowNotif(false); }}
            style={{
              width: 34, height: 34, borderRadius: '.5rem',
              background: showQuickAdd ? 'rgba(0,255,65,.1)' : 'rgba(255,255,255,.05)',
              border: `1px solid ${showQuickAdd ? 'rgba(0,255,65,.3)' : 'rgba(255,255,255,.1)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: showQuickAdd ? '#00FF41' : 'rgba(255,255,255,.5)',
              transition: 'all .2s', padding: 0, fontSize: 0,
            }}
            aria-label="Vitendo vya haraka"
            title="Vitendo vya haraka"
          >
            <Plus style={{ width: 16, height: 16 }} />
          </button>
          <AnimatePresence>
            {showQuickAdd && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: .15 }}
                style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 200, background: '#030604', border: '1px solid rgba(255,255,255,.1)', borderRadius: '.875rem', boxShadow: '0 16px 40px rgba(0,0,0,.6)', overflow: 'hidden', zIndex: 100 }}
              >
                <p style={{ padding: '.625rem 1rem .25rem', fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em', color: 'rgba(255,255,255,.25)' }}>Ongeza Haraka</p>
                {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
                  <button key={href} onClick={() => { router.push(href); setShowQuickAdd(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '.625rem', padding: '.625rem 1rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'background .15s', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.05)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                  >
                    <Icon style={{ width: 14, height: 14, color: '#00FF41', flexShrink: 0 }} />
                    <span style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.7)', fontWeight: 500 }}>{label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bell — Real Interactive Notifications ── */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              const nextState = !showNotif;
              setShowNotif(nextState);
              setShowUserMenu(false);
              setShowQuickAdd(false);
            }}
            style={{ position: 'relative', width: 34, height: 34, borderRadius: '.5rem', background: showNotif ? 'rgba(0,255,65,.08)' : 'rgba(255,255,255,.05)', border: `1px solid ${showNotif ? 'rgba(0,255,65,.25)' : 'rgba(255,255,255,.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: showNotif ? '#00FF41' : 'rgba(255,255,255,.5)', transition: 'all .2s', padding: 0, fontSize: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.08)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = showNotif ? 'rgba(0,255,65,.08)' : 'rgba(255,255,255,.05)'; (e.currentTarget as HTMLElement).style.color = showNotif ? '#00FF41' : 'rgba(255,255,255,.5)'; }}
            aria-label="Arifa"
          >
            <Bell style={{ width: 16, height: 16 }} />
            {notifCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 999, background: '#ff4757', color: '#fff', fontSize: '.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', boxShadow: '0 0 0 2px #030604', letterSpacing: 0 }}>
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: .15 }}
                style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 330, background: '#030604', border: '1px solid rgba(255,255,255,.1)', borderRadius: '.875rem', boxShadow: '0 16px 40px rgba(0,0,0,.6)', overflow: 'hidden', zIndex: 100 }}
              >
                <div style={{ padding: '.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <p style={{ fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em', color: 'rgba(255,255,255,.35)', margin: 0 }}>Arifa</p>
                    {notifCount > 0 && (
                      <span style={{ fontSize: '.62rem', fontWeight: 800, color: '#ff4757', background: 'rgba(255,71,87,.12)', border: '1px solid rgba(255,71,87,.3)', padding: '.1rem .5rem', borderRadius: 999 }}>
                        {notifCount} mpya
                      </span>
                    )}
                  </div>
                  {pendingAdmissions.length > 0 && notifCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{ background: 'none', border: 'none', color: 'var(--c-lime)', fontSize: '.68rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.25rem', padding: 0 }}
                      title="Tia alama zote zimesomwa"
                    >
                      <CheckCheck style={{ width: 13, height: 13 }} /> Soma Zote
                    </button>
                  )}
                </div>

                {notifLoading && !notifFetchedRef.current ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Loader2 style={{ width: 22, height: 22, color: 'rgba(255,255,255,.2)', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : pendingAdmissions.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Bell style={{ width: 28, height: 28, color: 'rgba(255,255,255,.1)', margin: '0 auto .75rem' }} />
                    <p style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.3)' }}>Hakuna arifa mpya</p>
                    <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.18)', marginTop: '.25rem' }}>Maombi yote yameshughulikiwa ✓</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    <p style={{ padding: '.5rem 1rem .25rem', fontSize: '.68rem', color: 'rgba(255,255,255,.25)', fontWeight: 600, margin: 0 }}>
                      Maombi ya Usajili Yanayosubiri
                    </p>
                    {pendingAdmissions.map(adm => {
                      const isUnread = !readNotifIds.includes(adm.id);
                      return (
                        <button key={adm.id} onClick={() => { markAsRead(adm.id); router.push('/admin/admissions'); setShowNotif(false); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1rem', background: isUnread ? 'rgba(255,71,87,.04)' : 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', transition: 'background .15s', textAlign: 'left' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.05)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isUnread ? 'rgba(255,71,87,.04)' : 'none'}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: '.5rem', background: isUnread ? 'rgba(255,71,87,.12)' : 'rgba(255,255,255,.05)', border: `1px solid ${isUnread ? 'rgba(255,71,87,.3)' : 'rgba(255,255,255,.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <ClipboardList style={{ width: 14, height: 14, color: isUnread ? '#ff4757' : 'rgba(255,255,255,.4)' }} />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontSize: '.8125rem', fontWeight: isUnread ? 800 : 600, color: isUnread ? '#fff' : 'rgba(255,255,255,.6)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {adm.firstName} {adm.lastName}
                            </p>
                            <p style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.35)', margin: 0, marginTop: '.1rem' }}>
                              {adm.referenceNo} · {format(new Date(adm.createdAt), 'dd/MM HH:mm')}
                            </p>
                          </div>
                          {isUnread ? (
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4757', boxShadow: '0 0 8px rgba(255,71,87,.8)', flexShrink: 0 }} title="Haijasomwa" />
                          ) : (
                            <Check style={{ width: 14, height: 14, color: 'rgba(255,255,255,.2)', flexShrink: 0 }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => { markAllAsRead(); router.push('/admin/admissions'); setShowNotif(false); }}
                  style={{ width: '100%', padding: '.75rem 1rem', background: 'rgba(255,255,255,.03)', border: 'none', borderTop: '1px solid rgba(255,255,255,.06)', cursor: 'pointer', color: 'rgba(0,255,65,.7)', fontSize: '.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.375rem', transition: 'background .2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.05)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.03)'}
                >
                  Angalia Maombi Yote <ChevronRight style={{ width: 13, height: 13 }} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Avatar + User menu ── */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowQuickAdd(false); setShowNotif(false); }}
            className="admin-avatar"
            aria-label="Menyu ya mtumiaji"
          >
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </button>
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: .15 }}
                style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 220, background: '#030604', border: '1px solid rgba(255,255,255,.1)', borderRadius: '1rem', boxShadow: '0 20px 50px rgba(0,0,0,.65)', overflow: 'hidden', zIndex: 100 }}
              >
                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                  <p style={{ fontSize: '.875rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Admin'}</p>
                  <p style={{ fontSize: '.72rem', color: 'rgba(0,255,65,.6)', fontWeight: 600, letterSpacing: '.06em' }}>MSIMAMIZI</p>
                </div>
                {[
                  { icon: UserCircle, label: 'Wasifu Wangu',  href: '/admin/settings' },
                  { icon: Settings,   label: 'Mipangilio',    href: '/admin/settings' },
                  { icon: Command,    label: '⌘K Tafuta',     href: '#', onClick: () => { setShowUserMenu(false); (document.getElementById('admin-search-input') as HTMLInputElement)?.focus(); } },
                ].map(({ icon: Icon, label, href, onClick }) => (
                  <button key={label} onClick={() => { onClick ? onClick() : router.push(href); setShowUserMenu(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'background .15s', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                  >
                    <Icon style={{ width: 15, height: 15, color: '#00FF41', flexShrink: 0 }} />
                    <span style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.65)', fontWeight: 500 }}>{label}</span>
                  </button>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
                  <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'background .15s', textAlign: 'left' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,71,87,.08)'; (e.currentTarget as HTMLElement).querySelector('span')!.style.color = '#ff4757'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).querySelector('span')!.style.color = 'rgba(255,255,255,.45)'; }}
                  >
                    <LogOut style={{ width: 15, height: 15, color: '#ff4757', flexShrink: 0 }} />
                    <span style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.45)', fontWeight: 500, transition: 'color .15s' }}>Toka Mara Moja</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @media(min-width:768px){
          .header-greeting { display:block !important; }
        }
        @media(min-width:640px){
          .admin-search { width:220px; }
        }
      `}</style>
    </header>
  );
}
