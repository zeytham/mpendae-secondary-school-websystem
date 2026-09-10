'use client';

import { useState, useEffect, useMemo } from 'react';
import { studentsApi, attendanceApi, admissionsApi, formatApiError } from '@/lib/api';
import { FORM_LABELS, Form } from '@/types';
import { useToast } from '@/components/ui/Toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Loader2, TrendingUp, Users, GraduationCap, ClipboardList,
  BarChart2, Download, Printer, Search, RefreshCw, X
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminPageHeader, BtnPrimary, AdminInput, AdminSelect } from '@/components/admin/AdminForm';

/* ── Palette & Styles ── */
const CHART_COLORS = ['#00FF41', '#3d8ef8', '#ffa502', '#ff4757', '#9b59b6', 'rgba(0,255,65,.4)'];
const FORMS: Form[] = ['FORM_1', 'FORM_2', 'FORM_3', 'FORM_4', 'FORM_5', 'FORM_6'];
type ReportType = 'summary' | 'students' | 'attendance' | 'admissions';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Anasoma',
  INACTIVE: 'Hayuko',
  GRADUATED: 'Amehitimu',
  TRANSFERRED: 'Amehamia',
};

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Wanaume',
  FEMALE: 'Wanawake',
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
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
};

interface StudentStatData {
  total: number;
  byForm: { form: string; _count: { id: number } }[];
  byGender: { gender: string; _count: { id: number } }[];
  byStatus: { status: string; _count: { id: number } }[];
}

interface AttendanceRecord {
  id?: string;
  studentId?: string;
  name?: string;
  studentName?: string;
  regNumber?: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

interface AdmissionStatData {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function ReportsAdminPage() {
  const [reportType, setReportType] = useState<ReportType>('summary');
  const { toast } = useToast();

  /* Data States */
  const [stuData, setStuData] = useState<StudentStatData | null>(null);
  const [stuLoading, setStuLoading] = useState(false);

  const [attForm, setAttForm] = useState<Form>('FORM_1');
  const [attStart, setAttStart] = useState(format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'));
  const [attEnd, setAttEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attData, setAttData] = useState<AttendanceRecord[]>([]);
  const [attLoading, setAttLoading] = useState(false);
  const [attSearch, setAttSearch] = useState('');
  const [attFilterRate, setAttFilterRate] = useState<'all' | 'low' | 'good'>('all');

  const [admData, setAdmData] = useState<AdmissionStatData | null>(null);
  const [admLoading, setAdmLoading] = useState(false);

  /* Print Modal State */
  const [printModalOpen, setPrintModalOpen] = useState(false);

  /* Auto-load initial overview stats */
  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    loadStudentsReport();
    loadAttReport();
    loadAdmReport();
  };

  const loadStudentsReport = async () => {
    setStuLoading(true);
    try {
      const res = await studentsApi.getStats();
      setStuData(res.data);
    } catch (err) {
      toast(formatApiError(err, 'Hitilafu ya kupakia ripoti ya wanafunzi'), 'error');
    } finally {
      setStuLoading(false);
    }
  };

  const loadAttReport = async () => {
    setAttLoading(true);
    try {
      const res = await attendanceApi.getReport({ form: attForm, startDate: attStart, endDate: attEnd });
      const rawList = Array.isArray(res.data) ? res.data : (res.data?.report || []);
      // Standardize record structure defensively
      const formatted: AttendanceRecord[] = rawList.map((item: any) => ({
        id: item.id || item.studentId || Math.random().toString(),
        studentId: item.studentId || item.id,
        name: item.name || item.studentName || 'Mwanafunzi',
        studentName: item.studentName || item.name || 'Mwanafunzi',
        regNumber: item.regNumber || '-',
        total: Number(item.total) || 0,
        present: Number(item.present) || 0,
        absent: Number(item.absent) || 0,
        late: Number(item.late) || 0,
        excused: Number(item.excused) || 0,
        percentage: typeof item.percentage === 'number' ? item.percentage : 0,
      }));
      setAttData(formatted);
    } catch (err) {
      toast(formatApiError(err, 'Hitilafu ya kupakia ripoti ya mahudhurio'), 'error');
    } finally {
      setAttLoading(false);
    }
  };

  const loadAdmReport = async () => {
    setAdmLoading(true);
    try {
      const res = await admissionsApi.getStats();
      setAdmData(res.data);
    } catch (err) {
      toast(formatApiError(err, 'Hitilafu ya kupakia ripoti ya maombi'), 'error');
    } finally {
      setAdmLoading(false);
    }
  };

  /* Chart Formatted Data (Safe fallbacks) */
  const formChartData = useMemo(() => {
    return (stuData?.byForm || []).map((d) => ({
      form: FORM_LABELS[d.form as Form] || d.form,
      Wanafunzi: d._count?.id || 0,
    }));
  }, [stuData]);

  const genderData = useMemo(() => {
    return (stuData?.byGender || []).map((d) => ({
      name: GENDER_LABELS[d.gender] || d.gender,
      value: d._count?.id || 0,
    }));
  }, [stuData]);

  const filteredAttData = useMemo(() => {
    return attData.filter((item) => {
      const nameMatch = (item.name || '').toLowerCase().includes(attSearch.toLowerCase()) ||
                        (item.regNumber || '').toLowerCase().includes(attSearch.toLowerCase());
      if (!nameMatch) return false;
      if (attFilterRate === 'low') return item.percentage < 75;
      if (attFilterRate === 'good') return item.percentage >= 75;
      return true;
    });
  }, [attData, attSearch, attFilterRate]);

  const attPresenceRate = useMemo(() => {
    if (!attData || attData.length === 0) return null;
    const avg = attData.reduce((s, r) => s + (r.percentage || 0), 0) / attData.length;
    return avg.toFixed(1);
  }, [attData]);

  const admPieData = useMemo(() => {
    if (!admData) return [];
    return [
      { name: 'Yanayosubiri', value: admData.pending || 0 },
      { name: 'Yaliyokubaliwa', value: admData.approved || 0 },
      { name: 'Yaliyokataliwa', value: admData.rejected || 0 },
    ].filter((d) => d.value > 0);
  }, [admData]);

  /* CSV Export Helper */
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [headers.join(','), ...rows.map((e) => e.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* CSV Generators */
  const exportAttendanceCSV = () => {
    if (!attData.length) return toast('Hakuna data ya mahudhurio ya kupakua', 'error');
    const headers = ['Mwanafunzi', 'Nambari ya Usajili', 'Siku Zote', 'Aliyepo', 'Hakuwepo', 'Amechelewa', 'Ruhusiwa', 'Asilimia (%)'];
    const rows = attData.map((r) => [
      r.name || r.studentName || '',
      r.regNumber || '',
      r.total,
      r.present,
      r.absent,
      r.late,
      r.excused,
      r.percentage.toFixed(1),
    ]);
    exportToCSV(`mahudhurio_${attForm}`, headers, rows);
    toast('Ripoti ya CSV imepakuliwa vyema!', 'success');
  };

  const exportStudentsCSV = () => {
    if (!stuData) return toast('Hakuna data ya wanafunzi ya kupakua', 'error');
    const headers = ['Aina ya Takwimu', 'Kitengo', 'Idadi'];
    const rows: (string | number)[][] = [];

    (stuData.byForm || []).forEach((f) => {
      rows.push(['Kwa Darasa', FORM_LABELS[f.form as Form] || f.form, f._count?.id || 0]);
    });
    (stuData.byGender || []).forEach((g) => {
      rows.push(['Kwa Jinsia', GENDER_LABELS[g.gender] || g.gender, g._count?.id || 0]);
    });
    (stuData.byStatus || []).forEach((s) => {
      rows.push(['Kwa Hali', STATUS_LABELS[s.status] || s.status, s._count?.id || 0]);
    });

    exportToCSV('takwimu_wanafunzi', headers, rows);
    toast('Ripoti ya Wanafunzi imepakuliwa!', 'success');
  };

  /* Trigger Native Print Dialog */
  const handlePrint = () => {
    window.print();
  };

  /* Helper Selector Card */
  const ReportTypeCard = ({ id, label, icon: Icon, description }: { id: ReportType; label: string; icon: React.ElementType; description: string }) => {
    const active = reportType === id;
    return (
      <button
        onClick={() => setReportType(id)}
        style={{
          padding: '1.25rem',
          borderRadius: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0.75rem',
          border: `1px solid ${active ? 'rgba(0,255,65,.5)' : 'rgba(255,255,255,.08)'}`,
          background: active ? 'linear-gradient(135deg, rgba(0,255,65,.12) 0%, rgba(0,255,65,.03) 100%)' : 'rgba(255,255,255,.03)',
          color: active ? '#00FF41' : 'rgba(255,255,255,.65)',
          cursor: 'pointer',
          transition: 'all .25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: active ? '0 10px 30px rgba(0,255,65,.15)' : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{
            padding: '0.625rem',
            borderRadius: '0.875rem',
            background: active ? 'rgba(0,255,65,.2)' : 'rgba(255,255,255,.06)',
            color: active ? '#00FF41' : '#fff'
          }}>
            <Icon style={{ width: 22, height: 22 }} />
          </div>
          {active && (
            <motion.div layoutId="activeDot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF41', boxShadow: '0 0 10px #00FF41' }} />
          )}
        </div>
        <div>
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, display: 'block', color: active ? '#fff' : 'rgba(255,255,255,.9)' }}>{label}</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.45)', marginTop: '0.2rem', display: 'block' }}>{description}</span>
        </div>
      </button>
    );
  };

  /* Helper percentage bar component */
  const PctBar = ({ pct }: { pct: number }) => {
    const color = pct >= 75 ? '#00FF41' : pct >= 50 ? '#ffa502' : '#ff4757';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 120 }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,.08)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color, borderRadius: 999, height: '100%', boxShadow: `0 0 8px ${color}80`, transition: 'width 0.5s ease' }} />
        </div>
        <span style={{ fontSize: '0.78125rem', fontWeight: 800, color, minWidth: 42, textAlign: 'right' }}>{pct.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <>
      {/* Dynamic CSS Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            color: #000 !important;
            background: #fff !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            color: #000 !important;
          }
          th, td {
            border: 1px solid #ccc !important;
            padding: 8px !important;
            color: #000 !important;
          }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>

        {/* Page Header with Global Refresh & Print controls */}
        <AdminPageHeader
          title="Uchambuzi na Ripoti Shuleni"
          subtitle="Ripoti kamili za Wanafunzi, Mahudhurio, na Maombi ya Udahili kwa Muundo wa Kisasa"
          actions={
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }} className="no-print">
              <button
                onClick={loadAllStats}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.625rem 1.125rem', borderRadius: '0.875rem',
                  background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)',
                  color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s'
                }}
              >
                <RefreshCw style={{ width: 15, height: 15 }} /> Anzisha Upya (Refresh)
              </button>
              <button
                onClick={() => setPrintModalOpen(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.625rem 1.125rem', borderRadius: '0.875rem',
                  background: 'rgba(0, 255, 65, 0.15)', border: '1px solid rgba(0, 255, 65, 0.3)',
                  color: '#00FF41', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s'
                }}
              >
                <Printer style={{ width: 15, height: 15 }} /> Hakikisha Ripoti za Kuchapa (Print / PDF)
              </button>
            </div>
          }
        />

        {/* Category Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }} className="no-print">
          <ReportTypeCard id="summary" label="Muhtasari Mkuu" icon={BarChart2} description="Overview ya takwimu zote za shule" />
          <ReportTypeCard id="students" label="Wanafunzi" icon={GraduationCap} description="Mgawanyo kwa darasa, jinsia na hali" />
          <ReportTypeCard id="attendance" label="Mahudhurio" icon={Users} description="Mahudhurio kwa darasa na tarehe" />
          <ReportTypeCard id="admissions" label="Maombi ya Udahili" icon={ClipboardList} description="Hali ya maombi mapya shuleni" />
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">

          {/* ── 1. SUMMARY OVERVIEW TAB ── */}
          {reportType === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {/* Quick Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div style={{ ...cardStyle, padding: '1.5rem', background: 'linear-gradient(135deg, rgba(0,255,65,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Wanafunzi Wanaosoma</p>
                    <GraduationCap style={{ color: '#00FF41', width: 22, height: 22 }} />
                  </div>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: '0.5rem 0 0' }}>{stuData?.total || 0}</h2>
                  <p style={{ fontSize: '0.75rem', color: '#00FF41', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <TrendingUp style={{ width: 14, height: 14 }} /> Wanafunzi Hai katika mfumo
                  </p>
                </div>

                <div style={{ ...cardStyle, padding: '1.5rem', background: 'linear-gradient(135deg, rgba(61,142,248,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Wastani wa Mahudhurio</p>
                    <Users style={{ color: '#3d8ef8', width: 22, height: 22 }} />
                  </div>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3d8ef8', margin: '0.5rem 0 0' }}>{attPresenceRate ? `${attPresenceRate}%` : 'N/A'}</h2>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem' }}>
                    Kigezo cha darasa: {FORM_LABELS[attForm]}
                  </p>
                </div>

                <div style={{ ...cardStyle, padding: '1.5rem', background: 'linear-gradient(135deg, rgba(255,165,2,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Maombi Yasiyoshughulikiwa</p>
                    <ClipboardList style={{ color: '#ffa502', width: 22, height: 22 }} />
                  </div>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffa502', margin: '0.5rem 0 0' }}>{admData?.pending || 0}</h2>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem' }}>
                    Jumla ya maombi yote: {admData?.total || 0}
                  </p>
                </div>
              </div>

              {/* Charts grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                <div style={{ ...cardStyle, padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart2 style={{ width: 18, height: 18, color: '#00FF41' }} /> Wanafunzi Kwa Kila Darasa
                  </h4>
                  {formChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={formChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
                        <XAxis dataKey="form" tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 12 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="Wanafunzi" fill="#00FF41" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>Hakuna data</div>
                  )}
                </div>

                <div style={{ ...cardStyle, padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ClipboardList style={{ width: 18, height: 18, color: '#3d8ef8' }} /> Mgawanyo wa Maombi ya Udahili
                  </h4>
                  {admPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={admPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                          {admPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend formatter={(v) => <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>Hakuna data ya maombi</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── 2. STUDENTS TAB ── */}
          {reportType === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <GraduationCap style={{ width: 22, height: 22, color: '#00FF41' }} /> Uchambuzi wa Takwimu za Wanafunzi
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={exportStudentsCSV}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.6rem 1rem', borderRadius: '0.75rem',
                      background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
                      color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    <Download style={{ width: 14, height: 14 }} /> Pakua CSV
                  </button>
                  <BtnPrimary onClick={loadStudentsReport} disabled={stuLoading}>
                    {stuLoading ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Inapakia...</> : <><RefreshCw style={{ width: 15, height: 15 }} /> Sasisha Takwimu</>}
                  </BtnPrimary>
                </div>
              </div>

              {stuData ? (
                <>
                  <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                    {/* Form Chart */}
                    <div style={{ ...cardStyle, padding: '1.5rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,.8)', marginBottom: '1rem' }}>Wanafunzi kwa Darasa</p>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={formChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
                          <XAxis dataKey="form" tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 11 }} />
                          <YAxis tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 11 }} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="Wanafunzi" fill="#00FF41" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Gender Chart */}
                    <div style={{ ...cardStyle, padding: '1.5rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,.8)', marginBottom: '1rem' }}>Wanafunzi kwa Jinsia</p>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                            {genderData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                          <Legend formatter={(v) => <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>{v}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Status Breakdown Grid */}
                  <div style={{ ...cardStyle, padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,.8)', marginBottom: '1rem' }}>Mgawanyo wa Wanafunzi kwa Hali (Status)</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                      {(stuData.byStatus || []).map((d, i) => (
                        <div
                          key={d.status}
                          style={{
                            background: 'rgba(255,255,255,.03)',
                            borderRadius: '1rem',
                            padding: '1.25rem',
                            textAlign: 'center',
                            border: '1px solid rgba(255,255,255,.08)',
                          }}
                        >
                          <p style={{ fontSize: '2.25rem', fontWeight: 800, color: CHART_COLORS[i % CHART_COLORS.length], lineHeight: 1 }}>{d._count?.id || 0}</p>
                          <p style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'rgba(255,255,255,.5)', marginTop: '0.5rem' }}>
                            {STATUS_LABELS[d.status] || d.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                !stuLoading && (
                  <div style={{ ...cardStyle, padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,.3)' }}>
                    <BarChart2 style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.4 }} />
                    <p>Bonyeza 'Sasisha Takwimu' kupakia taarifa za hivi karibuni.</p>
                  </div>
                )
              )}
            </motion.div>
          )}

          {/* ── 3. ATTENDANCE TAB ── */}
          {reportType === 'attendance' && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {/* Filter Controls Bar */}
              <div style={{ ...cardStyle, padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 140px', minWidth: 130 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: '0.4rem' }}>Chagua Darasa</p>
                  <AdminSelect value={attForm} onChange={(e) => setAttForm(e.target.value as Form)}>
                    {FORMS.map((f) => <option key={f} value={f}>{FORM_LABELS[f]}</option>)}
                  </AdminSelect>
                </div>
                <div style={{ flex: '1 1 150px', minWidth: 140 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: '0.4rem' }}>Kuanzia Tarehe</p>
                  <AdminInput type="date" value={attStart} onChange={(e) => setAttStart(e.target.value)} />
                </div>
                <div style={{ flex: '1 1 150px', minWidth: 140 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: '0.4rem' }}>Hadi Tarehe</p>
                  <AdminInput type="date" value={attEnd} onChange={(e) => setAttEnd(e.target.value)} />
                </div>
                <BtnPrimary onClick={loadAttReport} disabled={attLoading}>
                  {attLoading ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Inapakia...</> : <><TrendingUp style={{ width: 15, height: 15 }} /> Toa Ripoti</>}
                </BtnPrimary>
              </div>

              {attData.length > 0 && (
                <>
                  {/* Summary Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ ...cardStyle, padding: '1.25rem', textAlign: 'center', background: 'rgba(0,255,65,.06)' }}>
                      <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#00FF41', lineHeight: 1 }}>{attPresenceRate}%</p>
                      <p style={{ fontSize: '0.78125rem', color: 'rgba(255,255,255,.5)', marginTop: '0.35rem' }}>Wastani wa Mahudhurio</p>
                    </div>
                    <div style={{ ...cardStyle, padding: '1.25rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{attData.length}</p>
                      <p style={{ fontSize: '0.78125rem', color: 'rgba(255,255,255,.5)', marginTop: '0.35rem' }}>Jumla ya Wanafunzi</p>
                    </div>
                    <div style={{ ...cardStyle, padding: '1.25rem', textAlign: 'center', background: 'rgba(255,71,87,.08)' }}>
                      <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ff4757', lineHeight: 1 }}>
                        {attData.filter((r) => r.percentage < 75).length}
                      </p>
                      <p style={{ fontSize: '0.78125rem', color: 'rgba(255,255,255,.5)', marginTop: '0.35rem' }}>Mahudhurio Chini ya 75%</p>
                    </div>
                  </div>

                  {/* Search and Table Container */}
                  <div style={cardStyle}>
                    <div style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid rgba(255,255,255,.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}>
                      {/* Search box */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'rgba(255,255,255,.05)', padding: '0.4rem 0.875rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,.1)' }}>
                        <Search style={{ width: 14, height: 14, color: 'rgba(255,255,255,.4)' }} />
                        <input
                          type="text"
                          placeholder="Tafuta mwanafunzi..."
                          value={attSearch}
                          onChange={(e) => setAttSearch(e.target.value)}
                          style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.8125rem', width: 160 }}
                        />
                      </div>

                      {/* Quick filter buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setAttFilterRate('all')}
                          style={{
                            padding: '0.35rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600,
                            background: attFilterRate === 'all' ? '#00FF41' : 'rgba(255,255,255,.05)',
                            color: attFilterRate === 'all' ? '#000' : 'rgba(255,255,255,.6)', border: 'none', cursor: 'pointer'
                          }}
                        >
                          Wote ({attData.length})
                        </button>
                        <button
                          onClick={() => setAttFilterRate('low')}
                          style={{
                            padding: '0.35rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600,
                            background: attFilterRate === 'low' ? '#ff4757' : 'rgba(255,255,255,.05)',
                            color: attFilterRate === 'low' ? '#fff' : 'rgba(255,255,255,.6)', border: 'none', cursor: 'pointer'
                          }}
                        >
                          Chini ya 75%
                        </button>
                      </div>

                      {/* Export CSV button */}
                      <button
                        onClick={exportAttendanceCSV}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.45rem 0.875rem', borderRadius: '0.625rem', fontSize: '0.78125rem', fontWeight: 700,
                          background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)',
                          color: 'rgba(255,255,255,.8)', cursor: 'pointer'
                        }}
                      >
                        <Download style={{ width: 14, height: 14 }} /> Pakua CSV
                      </button>
                    </div>

                    {/* Data Table */}
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table" style={{ width: '100%' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '1rem' }}>Mwanafunzi</th>
                            <th style={{ textAlign: 'left', padding: '1rem' }}>Reg. No</th>
                            <th style={{ textAlign: 'center', padding: '1rem' }}>Siku Zote</th>
                            <th style={{ textAlign: 'center', padding: '1rem' }}>Aliyepo</th>
                            <th style={{ textAlign: 'center', padding: '1rem' }}>Hakuwepo</th>
                            <th style={{ textAlign: 'center', padding: '1rem' }}>Chelewa</th>
                            <th style={{ textAlign: 'center', padding: '1rem' }}>Ruhusu</th>
                            <th style={{ textAlign: 'left', padding: '1rem' }}>% Mahudhurio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAttData.sort((a, b) => b.percentage - a.percentage).map((r, idx) => (
                            <tr key={r.id || r.studentId || idx}>
                              <td style={{ fontWeight: 600, color: '#fff', padding: '0.875rem 1rem' }}>{r.name || r.studentName}</td>
                              <td style={{ color: 'rgba(255,255,255,.4)', padding: '0.875rem 1rem' }}>{r.regNumber}</td>
                              <td style={{ textAlign: 'center', padding: '0.875rem 1rem' }}>{r.total}</td>
                              <td style={{ textAlign: 'center', padding: '0.875rem 1rem' }}><span className="badge badge-success">{r.present}</span></td>
                              <td style={{ textAlign: 'center', padding: '0.875rem 1rem' }}><span className="badge badge-danger">{r.absent}</span></td>
                              <td style={{ textAlign: 'center', padding: '0.875rem 1rem' }}><span className="badge badge-warning">{r.late}</span></td>
                              <td style={{ textAlign: 'center', padding: '0.875rem 1rem' }}><span className="badge badge-info">{r.excused}</span></td>
                              <td style={{ padding: '0.875rem 1rem' }}><PctBar pct={r.percentage} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {attData.length === 0 && !attLoading && (
                <div style={{ ...cardStyle, padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,.3)' }}>
                  <Users style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.4 }} />
                  <p>Chagua darasa na tarehe, kisha bonyeza 'Toa Ripoti' kuona taarifa za mahudhurio.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── 4. ADMISSIONS TAB ── */}
          {reportType === 'admissions' && (
            <motion.div
              key="admissions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <ClipboardList style={{ width: 22, height: 22, color: '#ffa502' }} /> Ripoti ya Maombi ya Udahili
                </h3>
                <BtnPrimary onClick={loadAdmReport} disabled={admLoading}>
                  {admLoading ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Inapakia...</> : <><RefreshCw style={{ width: 15, height: 15 }} /> Sasisha Takwimu</>}
                </BtnPrimary>
              </div>

              {admData ? (
                <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[
                      { label: 'Maombi Yote', value: admData.total, color: '#fff', bg: 'rgba(255,255,255,.05)' },
                      { label: 'Yanayosubiri', value: admData.pending, color: '#ffa502', bg: 'rgba(255,165,2,.08)' },
                      { label: 'Yaliyokubaliwa', value: admData.approved, color: '#00FF41', bg: 'rgba(0,255,65,.08)' },
                      { label: 'Yaliyokataliwa', value: admData.rejected, color: '#ff4757', bg: 'rgba(255,71,87,.08)' },
                    ].map((s) => (
                      <div key={s.label} style={{ background: s.bg, border: '1px solid rgba(255,255,255,.08)', borderRadius: '1rem', padding: '1.25rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '2.25rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.5)', marginTop: '0.4rem' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ ...cardStyle, padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,.8)', marginBottom: '1rem' }}>Mgawanyo wa Hali za Maombi</p>
                    {admPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={admPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                            {admPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                          <Legend formatter={(v) => <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>{v}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.3)' }}>Hakuna data</div>
                    )}
                  </div>
                </div>
              ) : (
                !admLoading && (
                  <div style={{ ...cardStyle, padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,.3)' }}>
                    <ClipboardList style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.4 }} />
                    <p>Bonyeza 'Sasisha Takwimu' kupakia taarifa za maombi.</p>
                  </div>
                )
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── PRINT & PDF PREVIEW MODAL ── */}
      {printModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem'
        }}>
          <div style={{
            background: '#fff', color: '#000', borderRadius: '1.25rem', width: '100%', maxWidth: 850,
            maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <button
              onClick={() => setPrintModalOpen(false)}
              className="no-print"
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: '#f1f5f9', border: 'none', width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <X style={{ width: 18, height: 18, color: '#334155' }} />
            </button>

            {/* Printable Content */}
            <div id="printable-area">
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', color: '#0f172a' }}>
                  SHULE YA SEKONDARI MPENDAE
                </h1>
                <p style={{ margin: '0.2rem 0', fontSize: '0.875rem', color: '#475569' }}>
                  S.L.P 1234, Zanzibar • Barua Pepe: info@mpendae.ac.tz
                </p>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.75rem 0 0', textDecoration: 'underline' }}>
                  RIPOTI RASMI YA UCHAMBUZI WA SHULE
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Tarehe ya Kutolewa: {format(new Date(), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>

              {/* Summary Stats Table */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>1. Muhtasari wa Takwimu Kuu</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left' }}>Kipengele</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right' }}>Idadi / Kiwango</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>Jumla ya Wanafunzi Wanaosoma (Active)</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{stuData?.total || 0}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>Wastani wa Mahudhurio ({FORM_LABELS[attForm]})</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{attPresenceRate ? `${attPresenceRate}%` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>Maombi Mapya Yaliyopokelewa</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{admData?.total || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Form breakdown */}
              {formChartData.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>2. Idadi ya Wanafunzi kwa Darasa</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left' }}>Darasa</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right' }}>Idadi ya Wanafunzi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formChartData.map((f) => (
                        <tr key={f.form}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>{f.form}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right' }}>{f.Wanafunzi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signatures */}
              <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px dashed #94a3b8' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>Imetayarishwa na:</p>
                  <p style={{ margin: '2.5rem 0 0', fontSize: '0.85rem' }}>Sahihi: ______________________</p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Msimamizi wa Mfumo / Mwalimu Mkuu</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>Imethibitishwa na:</p>
                  <p style={{ margin: '2.5rem 0 0', fontSize: '0.85rem' }}>Sahihi: ______________________</p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Mkuu wa Shule</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }} className="no-print">
              <button
                onClick={() => setPrintModalOpen(false)}
                style={{
                  padding: '0.625rem 1.25rem', borderRadius: '0.75rem', background: '#e2e8f0',
                  border: 'none', color: '#334155', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Funga
              </button>
              <button
                onClick={handlePrint}
                style={{
                  padding: '0.625rem 1.25rem', borderRadius: '0.75rem', background: '#00FF41',
                  border: 'none', color: '#000', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                <Printer style={{ width: 16, height: 16 }} /> Chapa / Hifadhi PDF
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
