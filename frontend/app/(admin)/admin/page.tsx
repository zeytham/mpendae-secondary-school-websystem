'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { settingsApi, admissionsApi, studentsApi } from '@/lib/api';
import { DashboardStats } from '@/types';
import {
  GraduationCap, Users, ClipboardList, Calendar,
  TrendingUp, Clock, ArrowRight, TrendingDown, Activity, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { motion } from 'framer-motion';

const AUTO_REFRESH_MS = 30_000; // sekunde 30

/* ── Color system: FIXED to Black/White/Lime palette ── */
const CHART_COLORS = ['#00FF41', 'rgba(0,255,65,.7)', 'rgba(0,255,65,.45)', '#a8ffbe', 'rgba(168,255,190,.6)', 'rgba(0,255,65,.3)'];
const PIE_COLORS   = ['#ffa502', '#00FF41', '#ff4757'];

const FORM_LABELS: Record<string, string> = {
  FORM_1: 'Form I', FORM_2: 'Form II', FORM_3: 'Form III',
  FORM_4: 'Form IV', FORM_5: 'Form V', FORM_6: 'Form VI',
};

/* Premium stat card */
function StatCard({ icon: Icon, label, value, trend, href }: {
  icon: React.ElementType; label: string; value: number | string; trend?: number; href?: string;
}) {
  const inner = (
    <div className="admin-stat">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div className="admin-stat-icon">
          <Icon style={{ width: 22, height: 22, color: '#00FF41' }} />
        </div>
        {trend !== undefined && (
          <div className={`admin-stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? <TrendingUp style={{ width: 13, height: 13 }} /> : <TrendingDown style={{ width: 13, height: 13 }} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="admin-stat-value">
        <AnimatedCounter target={typeof value === 'number' ? value : 0} duration={1800} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.5rem' }}>
        <p className="admin-stat-label">{label}</p>
        {href && <ArrowRight style={{ width: 14, height: 14, color: 'rgba(0,255,65,.4)' }} />}
      </div>
    </div>
  );
  return href
    ? <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>
    : <div>{inner}</div>;
}

/* Chart tooltip */
const ChartTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number }[]; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#030604', border: '1px solid rgba(0,255,65,.25)', borderRadius: '.75rem', padding: '.75rem 1rem', boxShadow: '0 16px 40px rgba(0,0,0,.6)' }}>
      {label && <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.4)', marginBottom: '.35rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</p>}
      {payload.map(p => (
        <p key={p.name} style={{ fontSize: '.875rem', fontWeight: 700, color: '#00FF41' }}>{p.value} <span style={{ color: 'rgba(255,255,255,.45)', fontWeight: 400 }}>{p.name}</span></p>
      ))}
    </div>
  );
};

const stagger = { show: { transition: { staggerChildren: .08 } } };
const fadeIn  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: .4, ease: 'easeOut' as const } } };

export default function AdminDashboard() {
  const [stats,        setStats]        = useState<DashboardStats | null>(null);
  const [studentStats, setStudentStats] = useState<{ byForm: { form: string; _count: { id: number } }[] }>({ byForm: [] });
  const [admStats,     setAdmStats]     = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isLoading,    setIsLoading]    = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const [dashRes, stuRes, admRes] = await Promise.all([
        settingsApi.getDashboard(),
        studentsApi.getStats(),
        admissionsApi.getStats(),
      ]);
      setStats(dashRes.data);
      setStudentStats(stuRes.data);
      setAdmStats(admRes.data);
      setLastUpdated(new Date());
    } catch { /* ignore silently */ }
    finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /* First load + auto-refresh kila sekunde 30 */
  useEffect(() => {
    fetchData(false);
    intervalRef.current = setInterval(() => fetchData(true), AUTO_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const formChartData = studentStats.byForm.map(item => ({
    form: FORM_LABELS[item.form] || item.form,
    wanafunzi: item._count.id,
  }));

  const admPieData = [
    { name: 'Inasubiri', value: admStats.pending },
    { name: 'Imekubaliwa', value: admStats.approved },
    { name: 'Imekataliwa', value: admStats.rejected },
  ].filter(d => d.value > 0);

  /* Greeting */
  const h = new Date().getHours();
  const greeting = h < 12 ? '☀️ Habari za Asubuhi' : h < 17 ? '🌤 Habari za Mchana' : '🌙 Habari za Jioni';

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Shimmer stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 130, borderRadius: '1rem' }} />
          ))}
        </div>
        {/* Shimmer charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[260, 260].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: '1rem' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* ── Welcome Banner ── */}
      <motion.div
        variants={fadeIn}
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,65,.06) 0%, rgba(0,255,65,.02) 50%, transparent 100%)',
          border: '1px solid rgba(0,255,65,.12)', borderRadius: '1rem',
          padding: '1.375rem 1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#00FF41,transparent)' }} />

        {/* Left: greeting + live indicator */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.3rem' }}>
            <p style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.18em', color: 'rgba(0,255,65,.6)', margin: 0 }}>
              {greeting}
            </p>
            {/* Live dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: '#00FF41',
                display: 'inline-block',
                boxShadow: '0 0 0 0 rgba(0,255,65,.6)',
                animation: 'livePulse 2s infinite',
              }} />
              <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(0,255,65,.5)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Live</span>
            </div>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-.015em' }}>
            Karibu, <span style={{ color: '#00FF41' }}>Mpendae School</span>
          </h1>
          {/* Last updated */}
          {lastUpdated && (
            <p style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.25)', marginTop: '.3rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              <Clock style={{ width: 10, height: 10 }} />
              Imesasishwa: {format(lastUpdated, 'HH:mm:ss')}
              {' · '} Inasasishwa kila dakika ½
            </p>
          )}
        </div>

        {/* Right: stats + refresh button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {[
            { label: 'Leo', value: format(new Date(), 'dd MMM yyyy') },
            { label: 'Wanafunzi', value: stats?.students ?? '—' },
            { label: 'Maombi', value: admStats.pending },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: 'rgba(255,255,255,.3)', marginBottom: '.2rem' }}>{label}</p>
              <p style={{ fontSize: '.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>{value}</p>
            </div>
          ))}

          {/* Manual refresh button */}
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            title="Sasisha sasa hivi"
            style={{
              width: 36, height: 36, borderRadius: '.625rem',
              background: isRefreshing ? 'rgba(0,255,65,.15)' : 'rgba(0,255,65,.08)',
              border: '1px solid rgba(0,255,65,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              color: '#00FF41', transition: 'all .2s', flexShrink: 0,
            }}
            onMouseEnter={e => { if (!isRefreshing) (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.18)'; }}
            onMouseLeave={e => { if (!isRefreshing) (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.08)'; }}
          >
            <RefreshCw style={{ width: 15, height: 15, animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </motion.div>


      {/* ── Stat Cards ── */}
      <motion.div
        variants={fadeIn}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}
        className="stats-cards-grid"
      >
        <style>{`@media(min-width:1280px){.stats-cards-grid{grid-template-columns:repeat(4,1fr)!important;}}`}</style>
        <StatCard icon={GraduationCap} label="Wanafunzi"    value={stats?.students || 0}          trend={5}  href="/admin/students" />
        <StatCard icon={Users}          label="Walimu"       value={stats?.teachers || 0}           trend={0}  href="/admin/teachers" />
        <StatCard icon={ClipboardList}  label="Maombi"       value={stats?.pendingAdmissions || 0}  trend={12} href="/admin/admissions" />
        <StatCard icon={Calendar}       label="Matukio"      value={stats?.upcomingEvents || 0}             href="/admin/events" />
      </motion.div>

      {/* ── Charts ── */}
      <motion.div variants={fadeIn} style={{ display: 'grid', gap: '1rem' }} className="charts-grid">
        <style>{`@media(min-width:1024px){.charts-grid{grid-template-columns:1.2fr 0.8fr!important;}}`}</style>

        {/* Bar chart */}
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em', color: 'rgba(0,255,65,.6)', marginBottom: '.25rem' }}>Takwimu</p>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Wanafunzi kwa Darasa</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.72rem', color: 'rgba(0,255,65,.7)' }}>
              <Activity style={{ width: 14, height: 14 }} /> Live
            </div>
          </div>
          {formChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={formChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="form" tick={{ fill: 'rgba(255,255,255,.35)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,255,65,.04)' }} />
                <Bar dataKey="wanafunzi" fill="#00FF41" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <TrendingUp style={{ width: 40, height: 40, color: 'rgba(255,255,255,.1)' }} />
              <p style={{ color: 'rgba(255,255,255,.2)', fontSize: '.8125rem' }}>Data haipatikani bado</p>
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '1rem', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em', color: 'rgba(0,255,65,.6)', marginBottom: '.25rem' }}>Usajili</p>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Hali ya Maombi</h3>
          </div>
          {admPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={admPieData} cx="50%" cy="45%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value"
                  animationBegin={0} animationDuration={900}
                >
                  {admPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={v => <span style={{ color: 'rgba(255,255,255,.55)', fontSize: '.75rem', fontWeight: 600 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <ClipboardList style={{ width: 40, height: 40, color: 'rgba(255,255,255,.1)' }} />
              <p style={{ color: 'rgba(255,255,255,.2)', fontSize: '.8125rem' }}>Hakuna maombi bado</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Recent Activity ── */}
      <motion.div variants={fadeIn} style={{ display: 'grid', gap: '1rem' }} className="activity-grid">
        <style>{`@media(min-width:1024px){.activity-grid{grid-template-columns:1fr 1fr!important;}}`}</style>

        {/* Recent News */}
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Habari za Hivi Karibuni</h3>
            <Link href="/admin/news" style={{ fontSize: '.75rem', fontWeight: 700, color: '#00FF41', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              Zote <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          {stats?.recentNews && stats.recentNews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
              {stats.recentNews.map(article => (
                <div key={article.id} style={{ display: 'flex', alignItems: 'center', gap: '.875rem', padding: '.75rem', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '.75rem', transition: 'background .2s, border-left-color .2s', borderLeft: '3px solid transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.04)'; (e.currentTarget as HTMLElement).style.borderLeftColor = '#00FF41'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.03)'; (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent'; }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00FF41', flexShrink: 0, boxShadow: '0 0 6px rgba(0,255,65,.5)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '.8125rem', fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</p>
                    <p style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.35)', margin: 0, marginTop: '.15rem' }}>{article.category} · {article.publishedAt ? format(new Date(article.publishedAt), 'dd/MM/yyyy') : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,.2)', fontSize: '.8125rem' }}>Hakuna habari bado</p>
            </div>
          )}
        </div>

        {/* Recent Admissions */}
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Maombi ya Hivi Karibuni</h3>
            <Link href="/admin/admissions" style={{ fontSize: '.75rem', fontWeight: 700, color: '#00FF41', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              Yote <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          {stats?.recentAdmissions && stats.recentAdmissions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
              {stats.recentAdmissions.map(adm => (
                <div key={adm.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.875rem', padding: '.75rem', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '.75rem', transition: 'background .2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.03)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', minWidth: 0 }}>
                    <Clock style={{ width: 15, height: 15, color: 'rgba(255,255,255,.25)', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '.8125rem', fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adm.firstName} {adm.lastName}</p>
                      <p style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.35)', margin: 0, marginTop: '.15rem' }}>{adm.referenceNo}</p>
                    </div>
                  </div>
                  <span className={`badge flex-shrink-0 ${adm.status === 'PENDING' ? 'badge-warning' : adm.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                    {adm.status === 'PENDING' ? 'Inasubiri' : adm.status === 'APPROVED' ? 'Imekubaliwa' : 'Imekataliwa'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,.2)', fontSize: '.8125rem' }}>Hakuna maombi bado</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
