'use client';

import { useState } from 'react';
import { studentsApi, attendanceApi, admissionsApi } from '@/lib/api';
import { FORM_LABELS, Form } from '@/types';
import { useToast } from '@/components/ui/Toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Loader2, TrendingUp, Users, GraduationCap, ClipboardList, BarChart2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminPageHeader, BtnPrimary, AdminInput, AdminSelect } from '@/components/admin/AdminForm';

/* ── Colors: palette-aligned ── */
const CHART_COLORS = ['#00FF41', 'rgba(0,255,65,.6)', '#ffa502', '#ff4757', '#3d8ef8', 'rgba(0,255,65,.35)'];
const FORMS: Form[] = ['FORM_1', 'FORM_2', 'FORM_3', 'FORM_4', 'FORM_5', 'FORM_6'];
type ReportType = 'students' | 'attendance' | 'admissions';

const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Anasoma', INACTIVE: 'Hayuko', GRADUATED: 'Amehitimu', TRANSFERRED: 'Amehamia' };
const GENDER_LABELS: Record<string, string>  = { MALE: 'Wanaume', FEMALE: 'Wanawake' };

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
  borderRadius: '1rem', overflow: 'hidden',
};

const tooltipStyle = { background: '#030604', border: '1px solid rgba(0,255,65,.2)', borderRadius: 12, color: '#fff', fontSize: 13 };

export default function ReportsAdminPage() {
  const [reportType, setReportType] = useState<ReportType>('students');

  /* Students */
  const [stuData, setStuData] = useState<{
    byForm: { form: string; _count: { id: number } }[];
    byGender: { gender: string; _count: { id: number } }[];
    byStatus: { status: string; _count: { id: number } }[];
  } | null>(null);
  const [stuLoading, setStuLoading] = useState(false);

  /* Attendance */
  const [attForm, setAttForm]   = useState<Form>('FORM_1');
  const [attStart, setAttStart] = useState(format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'));
  const [attEnd, setAttEnd]     = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attData, setAttData]   = useState<{ studentId: string; studentName: string; regNumber: string; total: number; present: number; absent: number; late: number; excused: number; percentage: number }[]>([]);
  const [attLoading, setAttLoading] = useState(false);

  /* Admissions */
  const [admData, setAdmData]     = useState<{ total: number; pending: number; approved: number; rejected: number } | null>(null);
  const [admLoading, setAdmLoading] = useState(false);

  const { toast } = useToast();

  const loadStudentsReport = async () => {
    setStuLoading(true);
    try { const res = await studentsApi.getStats(); setStuData(res.data); }
    catch { toast('Hitilafu ya kupakia ripoti', 'error'); }
    finally { setStuLoading(false); }
  };

  const loadAttReport = async () => {
    setAttLoading(true);
    try { const res = await attendanceApi.getReport({ form: attForm, startDate: attStart, endDate: attEnd }); setAttData(res.data.report || res.data); }
    catch { toast('Hitilafu ya kupakia ripoti', 'error'); }
    finally { setAttLoading(false); }
  };

  const loadAdmReport = async () => {
    setAdmLoading(true);
    try { const res = await admissionsApi.getStats(); setAdmData(res.data); }
    catch { toast('Hitilafu ya kupakia ripoti', 'error'); }
    finally { setAdmLoading(false); }
  };

  const formChartData  = stuData?.byForm.map(d => ({ form: FORM_LABELS[d.form as Form] || d.form, Wanafunzi: d._count.id })) || [];
  const genderData     = stuData?.byGender.map(d => ({ name: GENDER_LABELS[d.gender] || d.gender, value: d._count.id })) || [];
  const attPresenceRate = attData.length > 0 ? (attData.reduce((s, r) => s + r.percentage, 0) / attData.length).toFixed(1) : null;
  const admPieData     = admData ? [
    { name: 'Inasubiri',   value: admData.pending },
    { name: 'Imekubaliwa', value: admData.approved },
    { name: 'Imekataliwa', value: admData.rejected },
  ].filter(d => d.value > 0) : [];

  /* ── Helper: report type selector card ── */
  const ReportTypeCard = ({ id, label, icon: Icon }: { id: ReportType; label: string; icon: React.ElementType }) => {
    const active = reportType === id;
    return (
      <button
        onClick={() => setReportType(id)}
        style={{
          padding: '1rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.625rem',
          border: `1px solid ${active ? 'rgba(0,255,65,.4)' : 'rgba(255,255,255,.08)'}`,
          background: active ? 'rgba(0,255,65,.08)' : 'rgba(255,255,255,.04)',
          color: active ? '#00FF41' : 'rgba(255,255,255,.55)',
          cursor: 'pointer', transition: 'all .2s', fontFamily: 'var(--f-body)',
          boxShadow: active ? '0 0 20px rgba(0,255,65,.12)' : 'none',
        }}
      >
        <Icon style={{ width: 22, height: 22 }} />
        <span style={{ fontSize: '.8125rem', fontWeight: 700 }}>{label}</span>
      </button>
    );
  };

  /* ── shared empty state ── */
  const Empty = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem', color: 'rgba(255,255,255,.25)' }}>
      <Icon style={{ width: 48, height: 48 }} />
      <p style={{ fontSize: '.875rem' }}>{text}</p>
    </div>
  );

  /* ── percentage bar ── */
  const PctBar = ({ pct }: { pct: number }) => {
    const color = pct >= 75 ? '#00FF41' : pct >= 50 ? '#ffa502' : '#ff4757';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 100 }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,.1)', borderRadius: 999, height: 4 }}>
          <div style={{ width: `${pct}%`, background: color, borderRadius: 999, height: 4, boxShadow: `0 0 6px ${color}60` }} />
        </div>
        <span style={{ fontSize: '.72rem', fontWeight: 700, color, minWidth: 38, textAlign: 'right' }}>{pct.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <AdminPageHeader title="Ripoti" subtitle="Takwimu na uchambuzi wa shule" />

      {/* Report type selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
        <ReportTypeCard id="students"   label="Wanafunzi" icon={GraduationCap} />
        <ReportTypeCard id="attendance" label="Mahudhurio" icon={Users} />
        <ReportTypeCard id="admissions" label="Maombi"    icon={ClipboardList} />
      </div>

      <AnimatePresence mode="wait">

        {/* ── Students Report ── */}
        {reportType === 'students' && (
          <motion.div key="students"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: .22 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '.5rem', margin: 0 }}>
                <BarChart2 style={{ width: 18, height: 18, color: '#00FF41' }} /> Ripoti ya Wanafunzi
              </h3>
              <BtnPrimary onClick={loadStudentsReport} disabled={stuLoading}>
                {stuLoading ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Inapakia...</> : <><TrendingUp style={{ width: 15, height: 15 }} />Toa Ripoti</>}
              </BtnPrimary>
            </div>

            {stuData ? (
              <>
                <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
                  {/* By Form */}
                  <div style={{ ...cardStyle, padding: '1.5rem' }}>
                    <p style={{ fontSize: '.8125rem', fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: '1rem' }}>Wanafunzi kwa Darasa</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={formChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
                        <XAxis dataKey="form" tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 11 }} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="Wanafunzi" fill="#00FF41" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* By Gender */}
                  <div style={{ ...cardStyle, padding: '1.5rem' }}>
                    <p style={{ fontSize: '.8125rem', fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: '1rem' }}>Wanafunzi kwa Jinsia</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                          {genderData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend formatter={v => <span style={{ color: 'rgba(255,255,255,.65)', fontSize: 12 }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* By Status */}
                <div style={{ ...cardStyle, padding: '1.5rem' }}>
                  <p style={{ fontSize: '.8125rem', fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: '1rem' }}>Wanafunzi kwa Hali</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '1rem' }}>
                    {stuData.byStatus.map((d, i) => (
                      <div key={d.status} style={{ background: 'rgba(255,255,255,.04)', borderRadius: '.875rem', padding: '1rem', textAlign: 'center', border: '1px solid rgba(255,255,255,.07)' }}>
                        <p style={{ fontSize: '2rem', fontWeight: 800, color: CHART_COLORS[i % CHART_COLORS.length], lineHeight: 1 }}>{d._count.id}</p>
                        <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.45)', marginTop: '.4rem' }}>{STATUS_LABELS[d.status] || d.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              !stuLoading && <div style={cardStyle}><Empty icon={BarChart2} text="Bonyeza 'Toa Ripoti' kuangalia takwimu za wanafunzi" /></div>
            )}
          </motion.div>
        )}

        {/* ── Attendance Report ── */}
        {reportType === 'attendance' && (
          <motion.div key="attendance"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: .22 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {/* Filters */}
            <div style={{ ...cardStyle, padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '.875rem', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 140px', minWidth: 0 }}>
                <p style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', marginBottom: '.45rem' }}>Darasa</p>
                <AdminSelect value={attForm} onChange={e => setAttForm(e.target.value as Form)}>
                  {FORMS.map(f => <option key={f} value={f}>{FORM_LABELS[f]}</option>)}
                </AdminSelect>
              </div>
              <div style={{ flex: '1 1 150px', minWidth: 0 }}>
                <p style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', marginBottom: '.45rem' }}>Kuanzia</p>
                <AdminInput type="date" value={attStart} onChange={e => setAttStart(e.target.value)} />
              </div>
              <div style={{ flex: '1 1 150px', minWidth: 0 }}>
                <p style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', marginBottom: '.45rem' }}>Hadi</p>
                <AdminInput type="date" value={attEnd} onChange={e => setAttEnd(e.target.value)} />
              </div>
              <BtnPrimary onClick={loadAttReport} disabled={attLoading}>
                {attLoading ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Inapakia...</> : <><TrendingUp style={{ width: 15, height: 15 }} />Toa Ripoti</>}
              </BtnPrimary>
            </div>

            {attData.length > 0 && (
              <>
                {attPresenceRate && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                    {[
                      { label: 'Wastani wa Mahudhurio', value: `${attPresenceRate}%`, color: '#00FF41', bg: 'rgba(0,255,65,.08)' },
                      { label: 'Wanafunzi',             value: attData.length,         color: '#fff',    bg: 'rgba(255,255,255,.05)' },
                      { label: 'Chini ya 75%',          value: attData.filter(r => r.percentage < 75).length, color: '#ff4757', bg: 'rgba(255,71,87,.08)' },
                    ].map(s => (
                      <div key={s.label} style={{ ...cardStyle, padding: '1.25rem', textAlign: 'center', background: s.bg }}>
                        <p style={{ fontSize: '2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                        <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.45)', marginTop: '.4rem' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div style={cardStyle}>
                  <div style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
                    <p style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.5)' }}>
                      {FORM_LABELS[attForm]} • {format(new Date(attStart), 'dd/MM/yyyy')} — {format(new Date(attEnd), 'dd/MM/yyyy')}
                    </p>
                    <button
                      onClick={() => {
                        const csv = ['Mwanafunzi,Reg.No,Siku,Aliyopo,Hakuwepo,Amechelewa,Ruhusiwa,%'].concat(
                          attData.map(r => `${r.studentName},${r.regNumber},${r.total},${r.present},${r.absent},${r.late},${r.excused},${r.percentage.toFixed(1)}`)
                        ).join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = `attendance-${attForm}-${attStart}.csv`; a.click();
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.4rem .875rem', borderRadius: '.625rem', fontSize: '.75rem', fontWeight: 700, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)', cursor: 'pointer', transition: 'all .2s' }}
                    >
                      <Download style={{ width: 13, height: 13 }} /> CSV
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          {['Mwanafunzi', 'Reg. No', 'Siku Zote', 'Aliyopo', 'Hakuwepo', 'Amechelewa', 'Ruhusiwa', '% Mahudhurio'].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {attData.sort((a, b) => b.percentage - a.percentage).map(r => (
                          <tr key={r.studentId}>
                            <td style={{ fontWeight: 600, color: '#fff' }}>{r.studentName}</td>
                            <td style={{ color: 'rgba(255,255,255,.4)' }}>{r.regNumber}</td>
                            <td>{r.total}</td>
                            <td><span className="badge badge-success">{r.present}</span></td>
                            <td><span className="badge badge-danger">{r.absent}</span></td>
                            <td><span className="badge badge-warning">{r.late}</span></td>
                            <td><span className="badge badge-info">{r.excused}</span></td>
                            <td><PctBar pct={r.percentage} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
            {attData.length === 0 && !attLoading && (
              <div style={cardStyle}><Empty icon={Users} text="Chagua darasa na tarehe, kisha bonyeza 'Toa Ripoti'" /></div>
            )}
          </motion.div>
        )}

        {/* ── Admissions Report ── */}
        {reportType === 'admissions' && (
          <motion.div key="admissions"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: .22 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '.5rem', margin: 0 }}>
                <ClipboardList style={{ width: 18, height: 18, color: '#00FF41' }} /> Ripoti ya Maombi
              </h3>
              <BtnPrimary onClick={loadAdmReport} disabled={admLoading}>
                {admLoading ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Inapakia...</> : <><TrendingUp style={{ width: 15, height: 15 }} />Toa Ripoti</>}
              </BtnPrimary>
            </div>
            {admData ? (
              <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { label: 'Maombi Yote',    value: admData.total,    color: '#fff',    bg: 'rgba(255,255,255,.05)' },
                    { label: 'Yanayosubiri',   value: admData.pending,  color: '#ffa502', bg: 'rgba(255,165,2,.08)' },
                    { label: 'Yaliyokubaliwa', value: admData.approved, color: '#00FF41', bg: 'rgba(0,255,65,.08)' },
                    { label: 'Yaliyokataliwa', value: admData.rejected, color: '#ff4757', bg: 'rgba(255,71,87,.08)' },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, border: '1px solid rgba(255,255,255,.07)', borderRadius: '.875rem', padding: '1rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.45)', marginTop: '.35rem' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ ...cardStyle, padding: '1.5rem' }}>
                  <p style={{ fontSize: '.8125rem', fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: '1rem' }}>Mgawanyiko wa Maombi</p>
                  {admPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={admPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {admPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend formatter={v => <span style={{ color: 'rgba(255,255,255,.65)', fontSize: 12 }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140, color: 'rgba(255,255,255,.25)' }}>
                      <ClipboardList style={{ width: 40, height: 40 }} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              !admLoading && <div style={cardStyle}><Empty icon={ClipboardList} text="Bonyeza 'Toa Ripoti' kuangalia takwimu za maombi" /></div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
