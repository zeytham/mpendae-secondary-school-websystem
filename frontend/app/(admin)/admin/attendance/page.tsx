'use client';

import { useEffect, useState, useCallback } from 'react';
import { studentsApi, attendanceApi } from '@/lib/api';
import { Student, AttendanceRecord, FORM_LABELS, Form } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { format } from 'date-fns';
import {
  CheckCircle, XCircle, Clock, AlertCircle, Save,
  Loader2, Users, TrendingUp, CalendarDays,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminPageHeader, BtnPrimary, AdminInput, AdminSelect } from '@/components/admin/AdminForm';

/* ── Status config aligned to palette ── */
const STATUS_CONFIG = {
  PRESENT: {
    label: 'Aliyopo', icon: CheckCircle,
    color: '#00FF41', bg: 'rgba(0,255,65,.1)', border: 'rgba(0,255,65,.3)',
    activeBg: 'rgba(0,255,65,.2)', activeBorder: 'rgba(0,255,65,.5)',
    glow: 'rgba(0,255,65,.2)',
    cls: 'present',
  },
  ABSENT: {
    label: 'Hakuwepo', icon: XCircle,
    color: '#ff4757', bg: 'rgba(255,71,87,.1)', border: 'rgba(255,71,87,.3)',
    activeBg: 'rgba(255,71,87,.2)', activeBorder: 'rgba(255,71,87,.5)',
    glow: 'rgba(255,71,87,.2)',
    cls: 'absent',
  },
  LATE: {
    label: 'Amechelewa', icon: Clock,
    color: '#ffa502', bg: 'rgba(255,165,2,.1)', border: 'rgba(255,165,2,.3)',
    activeBg: 'rgba(255,165,2,.2)', activeBorder: 'rgba(255,165,2,.5)',
    glow: 'rgba(255,165,2,.2)',
    cls: 'late',
  },
  EXCUSED: {
    label: 'Ruhusiwa', icon: AlertCircle,
    color: '#3d8ef8', bg: 'rgba(61,142,248,.1)', border: 'rgba(61,142,248,.3)',
    activeBg: 'rgba(61,142,248,.2)', activeBorder: 'rgba(61,142,248,.5)',
    glow: 'rgba(61,142,248,.2)',
    cls: 'excused',
  },
} as const;

type AttendanceStatus = keyof typeof STATUS_CONFIG;
const FORMS: Form[] = ['FORM_1', 'FORM_2', 'FORM_3', 'FORM_4', 'FORM_5', 'FORM_6'];

/* ── Reusable section card ── */
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1rem', overflow: 'hidden', ...style,
  }}>{children}</div>
);

export default function AttendancePage() {
  const [tab, setTab] = useState<'mark' | 'report'>('mark');
  const [form, setForm] = useState<Form>('FORM_1');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [students, setStudents] = useState<Student[]>([]);
  const [existing, setExisting] = useState<AttendanceRecord[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /* Report state */
  const [reportForm, setReportForm] = useState<Form>('FORM_1');
  const [reportStart, setReportStart] = useState(format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'));
  const [reportEnd, setReportEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [report, setReport] = useState<{ studentId: string; studentName: string; regNumber: string; total: number; present: number; absent: number; late: number; excused: number; percentage: number }[]>([]);
  const [isReportLoading, setIsReportLoading] = useState(false);

  const { toast } = useToast();

  const loadAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stuRes, attRes] = await Promise.all([
        studentsApi.getAll({ form, status: 'ACTIVE', limit: 200 }),
        attendanceApi.getByDate({ date, form }),
      ]);
      const stuList: Student[] = stuRes.data.students || stuRes.data;
      const attList: AttendanceRecord[] = attRes.data.records || attRes.data;
      setStudents(stuList);
      setExisting(attList);
      const initAtt: Record<string, AttendanceStatus> = {};
      const initNotes: Record<string, string> = {};
      stuList.forEach(s => {
        const rec = attList.find(a => a.studentId === s.id);
        initAtt[s.id] = (rec?.status as AttendanceStatus) || 'PRESENT';
        initNotes[s.id] = rec?.notes || '';
      });
      setAttendance(initAtt);
      setNotes(initNotes);
    } catch {
      toast('Hitilafu ya kupakia wanafunzi', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [form, date]);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const records = students.map(s => ({
        studentId: s.id,
        status: attendance[s.id] || 'PRESENT',
        notes: notes[s.id] || undefined,
      }));
      await attendanceApi.mark({ records, date });
      toast('Mahudhurio yamehifadhiwa ✓', 'success');
      loadAttendance();
    } catch (e: unknown) {
      toast((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Hitilafu imetokea', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const loadReport = async () => {
    setIsReportLoading(true);
    try {
      const res = await attendanceApi.getReport({ form: reportForm, startDate: reportStart, endDate: reportEnd });
      setReport(res.data.report || res.data);
    } catch {
      toast('Hitilafu ya kupakia ripoti', 'error');
    } finally {
      setIsReportLoading(false);
    }
  };

  const present = Object.values(attendance).filter(v => v === 'PRESENT').length;
  const absent  = Object.values(attendance).filter(v => v === 'ABSENT').length;
  const late    = Object.values(attendance).filter(v => v === 'LATE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <AdminPageHeader
        title="Mahudhurio"
        subtitle="Fuatilia mahudhurio ya wanafunzi kwa kila darasa"
        actions={
          <div style={{ display: 'flex', gap: '.375rem', background: 'rgba(255,255,255,.05)', borderRadius: '.875rem', padding: '.3rem' }}>
            {(['mark', 'report'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '.45rem 1.125rem', borderRadius: '.625rem', fontSize: '.8125rem', fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all .2s',
                  background: tab === t ? 'var(--c-lime)' : 'none',
                  color: tab === t ? '#050805' : 'rgba(255,255,255,.55)',
                  boxShadow: tab === t ? '0 4px 12px rgba(0,255,65,.25)' : 'none',
                }}
              >
                {t === 'mark' ? 'Weka Mahudhurio' : 'Ripoti'}
              </button>
            ))}
          </div>
        }
      />

      <AnimatePresence mode="wait">
        {tab === 'mark' && (
          <motion.div key="mark"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: .2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {/* Controls */}
            <Card>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.875rem', padding: '1.25rem', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <p style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', marginBottom: '.45rem' }}>Darasa</p>
                  <AdminSelect value={form} onChange={e => setForm(e.target.value as Form)}>
                    {FORMS.map(f => <option key={f} value={f}>{FORM_LABELS[f]}</option>)}
                  </AdminSelect>
                </div>
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <p style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', marginBottom: '.45rem' }}>Tarehe</p>
                  <AdminInput type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                {existing.length > 0 && (
                  <span className="badge badge-info">✓ Imerekodiwa tayari</span>
                )}
              </div>
            </Card>

            {/* Summary stats */}
            {!isLoading && students.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                {[
                  { label: 'Waliyopo', value: present, icon: CheckCircle, color: '#00FF41', bg: 'rgba(0,255,65,.08)' },
                  { label: 'Hawakuwepo', value: absent,  icon: XCircle,     color: '#ff4757', bg: 'rgba(255,71,87,.08)' },
                  { label: 'Wamechelewa', value: late,   icon: Clock,        color: '#ffa502', bg: 'rgba(255,165,2,.08)' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: s.bg, border: `1px solid ${s.color.replace(')', ',.2)')}`,
                    borderRadius: '.875rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '.875rem',
                  }}>
                    <s.icon style={{ width: 28, height: 28, color: s.color, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.5)', marginTop: '.2rem', fontWeight: 600 }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Student list */}
            <Card>
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem', padding: '4rem', color: 'rgba(255,255,255,.4)' }}>
                  <Loader2 style={{ width: 22, height: 22, animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '.875rem' }}>Inapakia...</span>
                </div>
              ) : students.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem', color: 'rgba(255,255,255,.25)' }}>
                  <Users style={{ width: 48, height: 48 }} />
                  <p style={{ fontSize: '.875rem' }}>Hakuna wanafunzi katika {FORM_LABELS[form]}</p>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
                    <p style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>
                      {students.length} Wanafunzi — {FORM_LABELS[form]}
                    </p>
                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                      {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(s => (
                        <button
                          key={s}
                          onClick={() => {
                            const all: Record<string, AttendanceStatus> = {};
                            students.forEach(st => { all[st.id] = s; });
                            setAttendance(all);
                          }}
                          style={{
                            padding: '.3rem .75rem', borderRadius: '999px', fontSize: '.7rem', fontWeight: 700,
                            border: `1px solid ${STATUS_CONFIG[s].border}`, background: STATUS_CONFIG[s].bg,
                            color: STATUS_CONFIG[s].color, cursor: 'pointer', transition: 'all .2s',
                            letterSpacing: '.04em',
                          }}
                        >
                          Wote: {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Students */}
                  <div>
                    {students.map((s, idx) => {
                      const status = attendance[s.id] || 'PRESENT';
                      const cfg = STATUS_CONFIG[status];
                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02, duration: .2 }}
                          style={{
                            padding: '.875rem 1.25rem',
                            borderBottom: '1px solid rgba(255,255,255,.05)',
                            display: 'flex', alignItems: 'center', gap: '.875rem',
                            transition: 'background .15s',
                            borderLeft: `3px solid ${cfg.color}`,
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.025)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                        >
                          {/* Avatar */}
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'rgba(0,255,65,.12)',
                            border: '1px solid rgba(0,255,65,.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, fontWeight: 800, fontSize: '.875rem', color: '#00FF41',
                          }}>
                            {s.firstName[0]}
                          </div>

                          {/* Name */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '.875rem', fontWeight: 600, color: '#fff', margin: 0 }}>{s.firstName} {s.lastName}</p>
                            <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.35)', margin: 0 }}>{s.regNumber}</p>
                          </div>

                          {/* Status buttons */}
                          <div style={{ display: 'flex', gap: '.4rem', flexShrink: 0, flexWrap: 'wrap' }}>
                            {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(st => {
                              const c = STATUS_CONFIG[st];
                              const isActive = status === st;
                              const Icon = c.icon;
                              return (
                                <button
                                  key={st}
                                  onClick={() => setAttendance(p => ({ ...p, [s.id]: st }))}
                                  title={c.label}
                                  style={{
                                    padding: '.35rem .7rem', borderRadius: '.5rem',
                                    fontSize: '.72rem', fontWeight: 700,
                                    border: `1px solid ${isActive ? c.activeBorder : 'rgba(255,255,255,.1)'}`,
                                    background: isActive ? c.activeBg : 'rgba(255,255,255,.04)',
                                    color: isActive ? c.color : 'rgba(255,255,255,.3)',
                                    cursor: 'pointer', transition: 'all .18s',
                                    display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                                    boxShadow: isActive ? `0 0 12px ${c.glow}` : 'none',
                                  }}
                                >
                                  <Icon style={{ width: 12, height: 12 }} />
                                  <span className="hide-mobile">{c.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Notes input */}
                          <input
                            type="text"
                            value={notes[s.id] || ''}
                            onChange={e => setNotes(p => ({ ...p, [s.id]: e.target.value }))}
                            placeholder="Maelezo..."
                            className="hide-mobile"
                            style={{
                              width: 120, fontSize: '.75rem', background: 'rgba(255,255,255,.05)',
                              border: '1px solid rgba(255,255,255,.1)', borderRadius: '.5rem',
                              padding: '.3rem .625rem', color: 'rgba(255,255,255,.7)', outline: 'none',
                              transition: 'border-color .2s',
                            }}
                            onFocus={e => (e.target.style.borderColor = 'rgba(0,255,65,.4)')}
                            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,.1)')}
                          />
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Save footer */}
                  <div style={{ padding: '1.125rem 1.25rem', borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', justifyContent: 'flex-end' }}>
                    <BtnPrimary onClick={handleSave} disabled={isSaving}>
                      {isSaving
                        ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Inahifadhi...</>
                        : <><Save style={{ width: 15, height: 15 }} />Hifadhi Mahudhurio</>
                      }
                    </BtnPrimary>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}

        {tab === 'report' && (
          <motion.div key="report"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: .2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {/* Filter bar */}
            <Card>
              <div style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '.875rem', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <p style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', marginBottom: '.45rem' }}>Darasa</p>
                  <AdminSelect value={reportForm} onChange={e => setReportForm(e.target.value as Form)}>
                    {FORMS.map(f => <option key={f} value={f}>{FORM_LABELS[f]}</option>)}
                  </AdminSelect>
                </div>
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <p style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', marginBottom: '.45rem' }}>Kuanzia</p>
                  <AdminInput type="date" value={reportStart} onChange={e => setReportStart(e.target.value)} />
                </div>
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <p style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', marginBottom: '.45rem' }}>Hadi</p>
                  <AdminInput type="date" value={reportEnd} onChange={e => setReportEnd(e.target.value)} />
                </div>
                <BtnPrimary onClick={loadReport} disabled={isReportLoading}>
                  {isReportLoading
                    ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Inapakia...</>
                    : <><TrendingUp style={{ width: 15, height: 15 }} />Toa Ripoti</>
                  }
                </BtnPrimary>
              </div>
            </Card>

            {/* Report table */}
            {report.length > 0 ? (
              <Card>
                <div style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: '.5rem', color: 'rgba(255,255,255,.5)' }}>
                  <CalendarDays style={{ width: 15, height: 15 }} />
                  <p style={{ fontSize: '.8125rem' }}>
                    Ripoti: {FORM_LABELS[reportForm]} | {format(new Date(reportStart), 'dd/MM/yyyy')} — {format(new Date(reportEnd), 'dd/MM/yyyy')}
                  </p>
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
                      {report.map(r => {
                        const pct = r.percentage;
                        const pctColor = pct >= 75 ? '#00FF41' : pct >= 50 ? '#ffa502' : '#ff4757';
                        return (
                          <tr key={r.studentId}>
                            <td style={{ fontWeight: 600, color: '#fff' }}>{r.studentName}</td>
                            <td style={{ color: 'rgba(255,255,255,.4)' }}>{r.regNumber}</td>
                            <td>{r.total}</td>
                            <td><span className="badge badge-success">{r.present}</span></td>
                            <td><span className="badge badge-danger">{r.absent}</span></td>
                            <td><span className="badge badge-warning">{r.late}</span></td>
                            <td><span className="badge badge-info">{r.excused}</span></td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 100 }}>
                                <div style={{ flex: 1, background: 'rgba(255,255,255,.1)', borderRadius: 999, height: 4 }}>
                                  <div style={{ width: `${pct}%`, background: pctColor, borderRadius: 999, height: 4, transition: 'width .4s', boxShadow: `0 0 6px ${pctColor}60` }} />
                                </div>
                                <span style={{ fontSize: '.72rem', fontWeight: 700, color: pctColor, minWidth: 36, textAlign: 'right' }}>{pct.toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <Card>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem', color: 'rgba(255,255,255,.25)' }}>
                  <TrendingUp style={{ width: 48, height: 48 }} />
                  <p style={{ fontSize: '.875rem' }}>Chagua darasa na tarehe, kisha bonyeza &ldquo;Toa Ripoti&rdquo;</p>
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
