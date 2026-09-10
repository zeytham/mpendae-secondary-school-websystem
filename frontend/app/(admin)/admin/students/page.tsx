'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { studentsApi, teachersApi, formatApiError } from '@/lib/api';
import { FORM_LABELS, Form } from '@/types';
import {
  AdminPageHeader, BtnPrimary, AdminInput, AdminField,
} from '@/components/admin/AdminForm';
import { useToast } from '@/components/ui/Toast';
import {
  GraduationCap, Users, Award, Save, RefreshCw, Loader2,
  TrendingUp, CheckCircle2, BarChart2, Plus, Minus
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const FORMS: { key: string; label: string; formEnum: Form }[] = [
  { key: 'form1', label: 'Kidato cha Kwanza (Form 1)', formEnum: 'FORM_1' },
  { key: 'form2', label: 'Kidato cha Pili (Form 2)', formEnum: 'FORM_2' },
  { key: 'form3', label: 'Kidato cha Tatu (Form 3)', formEnum: 'FORM_3' },
  { key: 'form4', label: 'Kidato cha Nne (Form 4)', formEnum: 'FORM_4' },
  { key: 'form5', label: 'Kidato cha Tano (Form 5)', formEnum: 'FORM_5' },
  { key: 'form6', label: 'Kidato cha Sura (Form 6)', formEnum: 'FORM_6' },
];

const CHART_COLORS = ['#00FF41', '#3d8ef8', '#ffa502', '#ff4757', '#9b59b6', '#00e5ff'];

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
};

export default function StudentStatsAdminPage() {
  const { toast } = useToast();

  const [formCounts, setFormCounts] = useState({
    form1: 0,
    form2: 0,
    form3: 0,
    form4: 0,
    form5: 0,
    form6: 0,
  });

  const [graduateCounts, setGraduateCounts] = useState({
    form4Graduates: 0,
    form6Graduates: 0,
  });

  const [teacherTotal, setTeacherTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [statsRes, teachersRes] = await Promise.all([
        studentsApi.getStats(),
        teachersApi.getAll(),
      ]);

      const data = statsRes.data;
      if (data.formCounts) {
        setFormCounts({
          form1: Number(data.formCounts.form1) || 0,
          form2: Number(data.formCounts.form2) || 0,
          form3: Number(data.formCounts.form3) || 0,
          form4: Number(data.formCounts.form4) || 0,
          form5: Number(data.formCounts.form5) || 0,
          form6: Number(data.formCounts.form6) || 0,
        });
      }

      setGraduateCounts({
        form4Graduates: Number(data.form4Graduates) || 0,
        form6Graduates: Number(data.form6Graduates) || 0,
      });

      const teacherData = teachersRes.data.teachers || teachersRes.data;
      setTeacherTotal(Array.isArray(teacherData) ? teacherData.length : 0);
    } catch (err) {
      toast(formatApiError(err, 'Hitilafu ya kupakia takwimu'), 'error');
    } finally {
      setLoading(false);
    }
  };

  /* Calculated Totals */
  const totalStudents = useMemo(() => {
    return Object.values(formCounts).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  }, [formCounts]);

  const totalGraduates = useMemo(() => {
    return (Number(graduateCounts.form4Graduates) || 0) + (Number(graduateCounts.form6Graduates) || 0);
  }, [graduateCounts]);

  /* Form Chart Data */
  const chartData = useMemo(() => {
    return FORMS.map((f) => ({
      name: FORM_LABELS[f.formEnum] || f.key,
      Wanafunzi: formCounts[f.key as keyof typeof formCounts] || 0,
    }));
  }, [formCounts]);

  const graduatePieData = useMemo(() => {
    return [
      { name: 'Wahitimu Form 4', value: Number(graduateCounts.form4Graduates) || 0 },
      { name: 'Wahitimu Form 6', value: Number(graduateCounts.form6Graduates) || 0 },
    ].filter((d) => d.value > 0);
  }, [graduateCounts]);

  const handleFormCountChange = (key: keyof typeof formCounts, val: number) => {
    setFormCounts((prev) => ({ ...prev, [key]: Math.max(0, val) }));
  };

  const handleGradCountChange = (key: keyof typeof graduateCounts, val: number) => {
    setGraduateCounts((prev) => ({ ...prev, [key]: Math.max(0, val) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        form1Count: Number(formCounts.form1) || 0,
        form2Count: Number(formCounts.form2) || 0,
        form3Count: Number(formCounts.form3) || 0,
        form4Count: Number(formCounts.form4) || 0,
        form5Count: Number(formCounts.form5) || 0,
        form6Count: Number(formCounts.form6) || 0,
        form4Graduates: Number(graduateCounts.form4Graduates) || 0,
        form6Graduates: Number(graduateCounts.form6Graduates) || 0,
      };

      await studentsApi.updateStats(payload);
      toast('Takwimu za Wanafunzi na Wahitimu zimesasishwa vyema! ✓', 'success');
    } catch (err) {
      toast(formatApiError(err, 'Imefeli kuhifadhi takwimu'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <AdminPageHeader
        title="Usimamizi wa Takwimu za Wanafunzi na Wahitimu"
        subtitle="Weka na usasishe idadi ya wanafunzi kwa kila darasa (Form 1 - Form 6) na wahitimu watakaotokea mtandaoni."
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={fetchStats}
              disabled={loading || saving}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 1.125rem', borderRadius: '0.875rem',
                background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)',
                color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <RefreshCw style={{ width: 15, height: 15 }} /> Refresh
            </button>
            <BtnPrimary onClick={handleSave} disabled={saving || loading}>
              {saving ? (
                <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Inahifadhi...</>
              ) : (
                <><Save style={{ width: 15, height: 15 }} /> Hifadhi Mabadiliko</>
              )}
            </BtnPrimary>
          </div>
        }
      />

      {/* Top Stat Overview Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        
        <div style={{ ...cardStyle, padding: '1.5rem', background: 'linear-gradient(135deg, rgba(0,255,65,0.09) 0%, rgba(255,255,255,0.02) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Jumla ya Wanafunzi</p>
            <GraduationCap style={{ color: '#00FF41', width: 24, height: 24 }} />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: '0.5rem 0 0' }}>{totalStudents}</h2>
          <p style={{ fontSize: '0.75rem', color: '#00FF41', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <TrendingUp style={{ width: 14, height: 14 }} /> Form 1 hanga Form 6 kwa jumla
          </p>
        </div>

        <div style={{ ...cardStyle, padding: '1.5rem', background: 'linear-gradient(135deg, rgba(61,142,248,0.09) 0%, rgba(255,255,255,0.02) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Jumla ya Wahitimu</p>
            <Award style={{ color: '#3d8ef8', width: 24, height: 24 }} />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3d8ef8', margin: '0.5rem 0 0' }}>{totalGraduates}</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.35rem' }}>
            Form 4 ({graduateCounts.form4Graduates}) na Form 6 ({graduateCounts.form6Graduates})
          </p>
        </div>

        <div style={{ ...cardStyle, padding: '1.5rem', background: 'linear-gradient(135deg, rgba(255,165,2,0.09) 0%, rgba(255,255,255,0.02) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Walimu Waliosajiliwa</p>
            <Users style={{ color: '#ffa502', width: 24, height: 24 }} />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffa502', margin: '0.5rem 0 0' }}>{teacherTotal}</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.35rem' }}>
            Inatokana na walimu waliosajiliwa
          </p>
        </div>

      </div>

      {/* Main Form & Graduate Input Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* 1. Student Counts By Form */}
        <div style={{ ...cardStyle, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.625rem', margin: 0 }}>
              <GraduationCap style={{ color: '#00FF41', width: 20, height: 20 }} />
              Idadi ya Wanafunzi kwa Darasa (Form 1 - Form 6)
            </h3>
            <p style={{ fontSize: '0.78125rem', color: 'rgba(255,255,255,.45)', marginTop: '0.25rem' }}>
              Badilisha idadi ya wanafunzi waliopo shuleni hapa. Jumla itahesabiwa mara moja.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FORMS.map((f, idx) => {
              const currentVal = formCounts[f.key as keyof typeof formCounts] || 0;
              const pct = totalStudents > 0 ? ((currentVal / totalStudents) * 100).toFixed(1) : '0.0';

              return (
                <div
                  key={f.key}
                  style={{
                    background: 'rgba(255,255,255,.025)',
                    border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: '1rem',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'rgba(0,255,65,0.1)', color: '#00FF41',
                        fontSize: '0.75rem', fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>{f.label}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{pct}% ya wanafunzi</span>
                  </div>

                  {/* Input and Increment Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => handleFormCountChange(f.key as keyof typeof formCounts, currentVal - 1)}
                      style={{
                        width: 38, height: 38, borderRadius: '0.625rem',
                        background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0
                      }}
                    >
                      <Minus style={{ width: 16, height: 16 }} />
                    </button>
                    <AdminInput
                      type="number"
                      min={0}
                      value={currentVal}
                      onChange={(e) => handleFormCountChange(f.key as keyof typeof formCounts, parseInt(e.target.value) || 0)}
                      style={{ textAlign: 'center', fontSize: '1.125rem', fontWeight: 800, color: '#00FF41' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleFormCountChange(f.key as keyof typeof formCounts, currentVal + 1)}
                      style={{
                        width: 38, height: 38, borderRadius: '0.625rem',
                        background: 'rgba(0,255,65,.15)', border: '1px solid rgba(0,255,65,.3)',
                        color: '#00FF41', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0
                      }}
                    >
                      <Plus style={{ width: 16, height: 16 }} />
                    </button>
                  </div>

                  {/* Mini Progress Bar */}
                  <div style={{ background: 'rgba(255,255,255,.08)', height: 4, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, Math.max(0, parseFloat(pct)))}%`,
                      background: CHART_COLORS[idx % CHART_COLORS.length],
                      height: '100%', borderRadius: 999, transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Graduate Counts Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ ...cardStyle, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.625rem', margin: 0 }}>
                <Award style={{ color: '#3d8ef8', width: 20, height: 20 }} />
                Idadi ya Wahitimu (Form 4 & Form 6)
              </h3>
              <p style={{ fontSize: '0.78125rem', color: 'rgba(255,255,255,.45)', marginTop: '0.25rem' }}>
                Weka idadi ya wahitimu waliofaulu masomo yao kwa Form 4 na Form 6.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Form 4 Graduates */}
              <div style={{
                background: 'rgba(61,142,248,.05)', border: '1px solid rgba(61,142,248,.15)',
                borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>Wahitimu wa Form 4</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => handleGradCountChange('form4Graduates', graduateCounts.form4Graduates - 1)}
                    style={{
                      width: 38, height: 38, borderRadius: '0.625rem',
                      background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                  >
                    <Minus style={{ width: 16, height: 16 }} />
                  </button>
                  <AdminInput
                    type="number"
                    min={0}
                    value={graduateCounts.form4Graduates}
                    onChange={(e) => handleGradCountChange('form4Graduates', parseInt(e.target.value) || 0)}
                    style={{ textAlign: 'center', fontSize: '1.125rem', fontWeight: 800, color: '#3d8ef8' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleGradCountChange('form4Graduates', graduateCounts.form4Graduates + 1)}
                    style={{
                      width: 38, height: 38, borderRadius: '0.625rem',
                      background: 'rgba(61,142,248,.2)', border: '1px solid rgba(61,142,248,.4)',
                      color: '#3d8ef8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                  >
                    <Plus style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>

              {/* Form 6 Graduates */}
              <div style={{
                background: 'rgba(155,89,182,.05)', border: '1px solid rgba(155,89,182,.15)',
                borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>Wahitimu wa Form 6</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => handleGradCountChange('form6Graduates', graduateCounts.form6Graduates - 1)}
                    style={{
                      width: 38, height: 38, borderRadius: '0.625rem',
                      background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                  >
                    <Minus style={{ width: 16, height: 16 }} />
                  </button>
                  <AdminInput
                    type="number"
                    min={0}
                    value={graduateCounts.form6Graduates}
                    onChange={(e) => handleGradCountChange('form6Graduates', parseInt(e.target.value) || 0)}
                    style={{ textAlign: 'center', fontSize: '1.125rem', fontWeight: 800, color: '#9b59b6' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleGradCountChange('form6Graduates', graduateCounts.form6Graduates + 1)}
                    style={{
                      width: 38, height: 38, borderRadius: '0.625rem',
                      background: 'rgba(155,89,182,.2)', border: '1px solid rgba(155,89,182,.4)',
                      color: '#9b59b6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                  >
                    <Plus style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Realtime Preview Chart */}
          <div style={{ ...cardStyle, padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 style={{ width: 16, height: 16, color: '#00FF41' }} /> Chati ya Mgawanyo wa Madarasa
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Wanafunzi" fill="#00FF41" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>

      {/* Bottom Save Action Bar */}
      <div style={{
        ...cardStyle, padding: '1.25rem 1.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
        border: '1px solid rgba(0, 255, 65, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 style={{ color: '#00FF41', width: 22, height: 22 }} />
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', margin: 0 }}>Uko Tayari Kuhifadhi?</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.45)', margin: 0 }}>Mabadiliko ya idadi hii yatatumika moja kwa moja kwenye kurasa za Umma (Home & Academics).</p>
          </div>
        </div>

        <BtnPrimary onClick={handleSave} disabled={saving || loading}>
          {saving ? (
            <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Inahifadhi Mabadiliko...</>
          ) : (
            <><Save style={{ width: 15, height: 15 }} /> Hifadhi Sasa</>
          )}
        </BtnPrimary>
      </div>

    </div>
  );
}
