'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { settingsApi, admissionsApi, studentsApi, teachersApi } from '@/lib/api';
import {
  GraduationCap, Users, ClipboardList, Calendar,
  TrendingUp, Clock, ArrowRight, Activity, RefreshCw,
  Award, CheckCircle2, ChevronRight, AlertCircle, FileText, Settings
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { motion } from 'framer-motion';

const AUTO_REFRESH_MS = 30_000;

const CHART_COLORS = ['#00FF41', '#3d8ef8', '#ffa502', '#ff4757', '#9b59b6', '#00e5ff'];
const PIE_COLORS = ['#ffa502', '#00FF41', '#ff4757'];

const FORM_LABELS: Record<string, string> = {
  form1: 'Form I', form2: 'Form II', form3: 'Form III',
  form4: 'Form IV', form5: 'Form V', form6: 'Form VI',
  FORM_1: 'Form I', FORM_2: 'Form II', FORM_3: 'Form III',
  FORM_4: 'Form IV', FORM_5: 'Form V', FORM_6: 'Form VI',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '1.25rem',
  overflow: 'hidden',
  backdropFilter: 'blur(12px)',
};

const tooltipStyle = {
  background: '#060d08',
  border: '1px solid rgba(0, 255, 65, 0.25)',
  borderRadius: 12,
  color: '#fff',
  fontSize: 13,
  boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
};

export default function AdminDashboard() {
  const [dashData, setDashData] = useState<any>(null);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [admStats, setAdmStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [dashRes, stuRes, admRes] = await Promise.all([
        settingsApi.getDashboard().catch(() => ({ data: {} })),
        studentsApi.getStats().catch(() => ({ data: {} })),
        admissionsApi.getStats().catch(() => ({ data: {} })),
      ]);

      setDashData(dashRes.data || {});
      setStudentStats(stuRes.data || {});
      setAdmStats(admRes.data || { total: 0, pending: 0, approved: 0, rejected: 0 });

      if (dashRes.data?.recentAdmissions) {
        setRecentAdmissions(dashRes.data.recentAdmissions);
      }
      setLastUpdated(new Date());
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => fetchData(true), AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  /* Total Student & Graduate Calculations */
  const totalStudents = useMemo(() => {
    return studentStats?.total || dashData?.students || 0;
  }, [studentStats, dashData]);

  const totalGraduates = useMemo(() => {
    return studentStats?.graduated || dashData?.graduated || 0;
  }, [studentStats, dashData]);

  const teacherCount = useMemo(() => {
    return dashData?.teachers || 0;
  }, [dashData]);

  /* Form Chart Data */
  const formChartData = useMemo(() => {
    if (studentStats?.byForm && Array.isArray(studentStats.byForm)) {
      return studentStats.byForm.map((item: any) => ({
        form: FORM_LABELS[item.form] || item.form,
        wanafunzi: item._count?.id || 0,
      }));
    }
    if (studentStats?.formCounts) {
      return Object.entries(studentStats.formCounts).map(([key, val]) => ({
        form: FORM_LABELS[key] || key.toUpperCase(),
        wanafunzi: Number(val) || 0,
      }));
    }
    return [];
  }, [studentStats]);

  const admPieData = useMemo(() => {
    return [
      { name: 'Inasubiri', value: admStats.pending || 0 },
      { name: 'Imekubaliwa', value: admStats.approved || 0 },
      { name: 'Imekataliwa', value: admStats.rejected || 0 },
    ].filter((d) => d.value > 0);
  }, [admStats]);

  /* Greeting */
  const h = new Date().getHours();
  const greeting = h < 12 ? '☀️ Habari za Asubuhi' : h < 17 ? '🌤 Habari za Mchana' : '🌙 Habari za Jioni';

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 130, borderRadius: '1.25rem' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {[280, 280].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: '1.25rem' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      
      {/* Welcome Banner */}
      <div style={{
        ...cardStyle,
        padding: '1.5rem 2rem',
        background: 'linear-gradient(135deg, rgba(0,255,65,.08) 0%, rgba(255,255,255,.02) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #00FF41, transparent)' }} />
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#00FF41' }}>
              {greeting}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(0,255,65,0.1)', padding: '0.2rem 0.6rem', borderRadius: 999, border: '1px solid rgba(0,255,65,0.2)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF41', boxShadow: '0 0 8px #00FF41' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#00FF41', letterSpacing: '0.1em' }}>LIVE SYNC</span>
            </div>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0 }}>
            Dashibodi ya Uongozi — <span style={{ color: '#00FF41' }}>Mpendae Secondary School</span>
          </h1>
          {lastUpdated && (
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.4)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock style={{ width: 12, height: 12 }} />
              Imesasishwa: {format(lastUpdated, 'HH:mm:ss')} · Inajiendesha kikamilifu (Auto-synced)
            </p>
          )}
        </div>

        {/* Quick Action Navigation Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/students" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1.125rem', borderRadius: '0.875rem',
              background: 'rgba(0,255,65,0.15)', border: '1px solid rgba(0,255,65,0.3)',
              color: '#00FF41', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s'
            }}>
              <GraduationCap style={{ width: 16, height: 16 }} /> Simamia Wanafunzi & Wahitimu
            </button>
          </Link>
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1rem', borderRadius: '0.875rem',
              background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)',
              color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <RefreshCw style={{ width: 14, height: 14, animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        
        {/* Total Students */}
        <Link href="/admin/students" style={{ textDecoration: 'none' }}>
          <div style={{
            ...cardStyle, padding: '1.5rem', transition: 'all .25s',
            background: 'linear-gradient(135deg, rgba(0,255,65,0.08) 0%, rgba(255,255,255,0.02) 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Wanafunzi Wanaosoma</p>
              <GraduationCap style={{ color: '#00FF41', width: 24, height: 24 }} />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', margin: '0.5rem 0 0' }}>
              <AnimatedCounter target={totalStudents} duration={1800} />
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#00FF41', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <TrendingUp style={{ width: 14, height: 14 }} /> Form 1 hadi Form 6
            </p>
          </div>
        </Link>

        {/* Total Graduates */}
        <Link href="/admin/students" style={{ textDecoration: 'none' }}>
          <div style={{
            ...cardStyle, padding: '1.5rem', transition: 'all .25s',
            background: 'linear-gradient(135deg, rgba(61,142,248,0.08) 0%, rgba(255,255,255,0.02) 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Wahitimu Waliofaulu</p>
              <Award style={{ color: '#3d8ef8', width: 24, height: 24 }} />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#3d8ef8', margin: '0.5rem 0 0' }}>
              <AnimatedCounter target={totalGraduates} duration={1800} />
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.35rem' }}>
              Wahitimu wa Form 4 & Form 6
            </p>
          </div>
        </Link>

        {/* Teachers */}
        <Link href="/admin/teachers" style={{ textDecoration: 'none' }}>
          <div style={{
            ...cardStyle, padding: '1.5rem', transition: 'all .25s',
            background: 'linear-gradient(135deg, rgba(255,165,2,0.08) 0%, rgba(255,255,255,0.02) 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Walimu Wataalamu</p>
              <Users style={{ color: '#ffa502', width: 24, height: 24 }} />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffa502', margin: '0.5rem 0 0' }}>
              <AnimatedCounter target={teacherCount} duration={1800} />
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.35rem' }}>
              Walimu waliosajiliwa mfumoni
            </p>
          </div>
        </Link>

        {/* Pending Admissions */}
        <Link href="/admin/admissions" style={{ textDecoration: 'none' }}>
          <div style={{
            ...cardStyle, padding: '1.5rem', transition: 'all .25s',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(255,255,255,0.02) 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Maombi Yasiyoshughulikiwa</p>
              <ClipboardList style={{ color: '#ef4444', width: 24, height: 24 }} />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ef4444', margin: '0.5rem 0 0' }}>
              <AnimatedCounter target={admStats.pending} duration={1800} />
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.35rem' }}>
              Jumla ya maombi: {admStats.total}
            </p>
          </div>
        </Link>

      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        
        {/* Form Distribution Chart */}
        <div style={{ ...cardStyle, padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#00FF41', margin: 0 }}>Uchambuzi</p>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0 0' }}>Mgawanyo wa Wanafunzi Kwa Kila Darasa</h3>
            </div>
            <Link href="/admin/students" style={{ color: '#00FF41', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Hariri Idadi <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {formChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={formChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
                <XAxis dataKey="form" tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="wanafunzi" fill="#00FF41" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>
              Hakuna data ya madarasa.
            </div>
          )}
        </div>

        {/* Admissions Pie Chart */}
        <div style={{ ...cardStyle, padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#3d8ef8', margin: 0 }}>Udahili</p>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0 0' }}>Mgawanyo wa Maombi ya Udahili</h3>
            </div>
            <Link href="/admin/admissions" style={{ color: '#3d8ef8', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Angalia Yote <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {admPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={admPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {admPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend formatter={(v) => <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>
              Hakuna maombi ya udahili bado.
            </div>
          )}
        </div>

      </div>

      {/* Recent Admissions Table */}
      <div style={cardStyle}>
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>Maombi ya Udahili ya Hivi Karibuni</h3>
            <p style={{ fontSize: '0.78125rem', color: 'rgba(255,255,255,.45)', margin: '0.2rem 0 0' }}>Wanafunzi wapya walioomba kujiunga na shule.</p>
          </div>
          <Link href="/admin/admissions" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '0.5rem 1rem', borderRadius: '0.75rem',
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
              color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
            }}>
              Tazama Maombi Yote →
            </button>
          </Link>
        </div>

        {recentAdmissions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1rem 1.75rem' }}>Namba ya Kumbukumbu</th>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>Jina la Mwombaji</th>
                  <th style={{ textAlign: 'center', padding: '1rem' }}>Tarehe</th>
                  <th style={{ textAlign: 'right', padding: '1rem 1.75rem' }}>Hali</th>
                </tr>
              </thead>
              <tbody>
                {recentAdmissions.map((adm) => (
                  <tr key={adm.id}>
                    <td style={{ padding: '0.875rem 1.75rem', fontFamily: 'monospace', color: '#00FF41', fontWeight: 700 }}>
                      {adm.referenceNo}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#fff' }}>
                      {adm.firstName} {adm.lastName}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem' }}>
                      {adm.createdAt ? format(new Date(adm.createdAt), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td style={{ padding: '0.875rem 1.75rem', textAlign: 'right' }}>
                      <span className={`badge ${adm.status === 'PENDING' ? 'badge-warning' : adm.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                        {adm.status === 'PENDING' ? 'Inasubiri' : adm.status === 'APPROVED' ? 'Imekubaliwa' : 'Imekataliwa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <ClipboardList style={{ width: 40, height: 40, margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p>Hakuna maombi ya udahili yaliyopokelewa kwa sasa.</p>
          </div>
        )}
      </div>

    </div>
  );
}
