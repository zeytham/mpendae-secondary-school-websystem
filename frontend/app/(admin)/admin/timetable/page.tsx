'use client';

import { useEffect, useState, useCallback } from 'react';
import { timetableApi } from '@/lib/api';
import { Timetable, FORM_LABELS, Form } from '@/types';
import Modal from '@/components/admin/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  AdminField, AdminInput, AdminSelect,
  BtnPrimary, BtnSecondary, BtnDanger, IconBtn, AdminPageHeader,
} from '@/components/admin/AdminForm';
import { Plus, Trash2, Loader2, AlertTriangle, FileText, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface TimetableForm {
  title: string; form: Form; stream: string; term: string; academicYear: string;
}
const FORMS: Form[] = ['FORM_1', 'FORM_2', 'FORM_3', 'FORM_4', 'FORM_5', 'FORM_6'];
const TERMS = ['Term 1', 'Term 2', 'Term 3'];
const currentYear = new Date().getFullYear();
const YEARS = [`${currentYear - 1}/${currentYear}`, `${currentYear}/${currentYear + 1}`, `${currentYear + 1}/${currentYear + 2}`];
const emptyForm: TimetableForm = { title: '', form: 'FORM_1', stream: '', term: TERMS[0], academicYear: YEARS[0] };

export default function TimetableAdminPage() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [filterForm, setFilterForm]   = useState<string>('');
  const [isLoading, setIsLoading]     = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Timetable | null>(null);
  const [form, setForm]   = useState<TimetableForm>(emptyForm);
  const [file, setFile]   = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const fetchTimetables = useCallback(async (f = filterForm) => {
    setIsLoading(true);
    try {
      const res = await timetableApi.getAll(f ? { form: f } : {});
      setTimetables(res.data.timetables || res.data);
    } catch {
      toast('Hitilafu ya kupakia ratiba', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filterForm]);

  useEffect(() => { fetchTimetables(); }, []);

  const handleUpload = async () => {
    if (!form.title || !file) { toast('Jaza jina na chagua faili', 'warning'); return; }
    setIsUploading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('file', file);
      await timetableApi.upload(fd);
      toast('Ratiba imepakiwa ✓', 'success');
      setUploadModal(false); setFile(null); setForm(emptyForm);
      fetchTimetables();
    } catch (e: unknown) {
      toast((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Hitilafu ya kupakia', 'error');
    } finally { setIsUploading(false); }
  };

  const handleDelete = async (t: Timetable) => {
    try {
      await timetableApi.delete(t.id);
      toast('Ratiba imefutwa', 'success');
      setDeleteModal(null); fetchTimetables();
    } catch { toast('Hitilafu ya kufuta', 'error'); }
  };

  const filtered = filterForm ? timetables.filter(t => t.form === filterForm) : timetables;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <AdminPageHeader
        title="Ratiba za Masomo"
        subtitle={`Ratiba ${timetables.length} zimepakiwa`}
        actions={<BtnPrimary onClick={() => setUploadModal(true)}><Plus style={{ width: 15, height: 15 }} />Pakia Ratiba</BtnPrimary>}
      />

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        {[{ label: 'Zote', value: '' }, ...FORMS.map(f => ({ label: FORM_LABELS[f], value: f }))].map(({ label, value }) => {
          const active = filterForm === value;
          return (
            <button
              key={value}
              onClick={() => { setFilterForm(value); fetchTimetables(value); }}
              style={{
                padding: '.4rem .875rem', borderRadius: 999,
                fontSize: '.75rem', fontWeight: 700, letterSpacing: '.04em',
                border: `1px solid ${active ? 'rgba(0,255,65,.4)' : 'rgba(255,255,255,.1)'}`,
                background: active ? 'rgba(0,255,65,.12)' : 'rgba(255,255,255,.04)',
                color: active ? '#00FF41' : 'rgba(255,255,255,.5)',
                cursor: 'pointer', transition: 'all .2s', fontFamily: 'var(--f-body)',
                boxShadow: active ? '0 0 12px rgba(0,255,65,.15)' : 'none',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer" style={{ height: 80, borderRadius: '1rem' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '1rem', padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,.25)' }}>
          <Calendar style={{ width: 48, height: 48 }} />
          <p style={{ fontSize: '.875rem' }}>Hakuna ratiba bado. Pakia ratiba mpya.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {filtered.map((t, idx) => {
            const isPDF = t.fileType === 'PDF';
            return (
              <motion.div
                key={t.id}
                className="timetable-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: .22 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                {/* File icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: '.875rem', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isPDF ? 'rgba(255,71,87,.12)' : 'rgba(61,142,248,.12)',
                  border: `1px solid ${isPDF ? 'rgba(255,71,87,.25)' : 'rgba(61,142,248,.25)'}`,
                }}>
                  <FileText style={{ width: 22, height: 22, color: isPDF ? '#ff4757' : '#3d8ef8' }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#fff', marginBottom: '.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="badge badge-info">{FORM_LABELS[t.form]}</span>
                    {t.stream && <span className="badge badge-warning">{t.stream}</span>}
                    <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.35)' }}>{t.term} • {t.academicYear}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.28)', display: 'none' }} className="hide-mobile">
                    {format(new Date(t.createdAt), 'dd/MM/yyyy')}
                  </span>
                  <a
                    href={t.fileUrl ? (t.fileUrl.includes('/upload/') && !t.fileUrl.includes('fl_attachment') ? t.fileUrl.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(t.title.replace(/[^a-zA-Z0-9_-]/g, '_'))}/`) : t.fileUrl) : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', padding: '.4rem .875rem', borderRadius: '.625rem', fontSize: '.75rem', fontWeight: 700, background: 'rgba(0,255,65,.1)', border: '1px solid rgba(0,255,65,.25)', color: '#00FF41', textDecoration: 'none', transition: 'all .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.1)'; }}
                  >
                    <Download style={{ width: 13, height: 13 }} /> Pakua
                  </a>
                  <IconBtn color="danger" onClick={() => setDeleteModal(t)} aria-label="Futa" title="Futa ratiba">
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </IconBtn>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={uploadModal} onClose={() => { setUploadModal(false); setFile(null); }} title="Pakia Ratiba ya Masomo" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AdminField label="Jina la Ratiba" required>
            <AdminInput value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Mfano: Ratiba ya Form I — Term 1 2025" />
          </AdminField>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
            <AdminField label="Darasa">
              <AdminSelect value={form.form} onChange={e => setForm(p => ({ ...p, form: e.target.value as Form }))}>
                {FORMS.map(f => <option key={f} value={f}>{FORM_LABELS[f]}</option>)}
              </AdminSelect>
            </AdminField>
            <AdminField label="Mkondo (Stream)">
              <AdminInput value={form.stream} onChange={e => setForm(p => ({ ...p, stream: e.target.value }))} placeholder="A, Sayansi... (si lazima)" />
            </AdminField>
            <AdminField label="Muhula">
              <AdminSelect value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))}>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </AdminSelect>
            </AdminField>
            <AdminField label="Mwaka wa Masomo">
              <AdminSelect value={form.academicYear} onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </AdminSelect>
            </AdminField>
          </div>

          {/* File drop zone */}
          <AdminField label="Faili (PDF au Picha)" required>
            <label style={{ cursor: 'pointer', display: 'block' }}>
              <div
                className="upload-zone"
                style={{ padding: '2rem' }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '.875rem', background: 'rgba(0,255,65,.1)', border: '1px solid rgba(0,255,65,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText style={{ width: 22, height: 22, color: '#00FF41' }} />
                </div>
                {file ? (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '.875rem', fontWeight: 600, color: '#00FF41' }}>{file.name}</p>
                    <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.4)', marginTop: '.25rem' }}>{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'rgba(255,255,255,.6)' }}>Bonyeza au buruta faili hapa</p>
                    <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.3)', marginTop: '.25rem' }}>PDF, PNG, JPG zinakubaliwa</p>
                  </div>
                )}
              </div>
              <input type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </label>
          </AdminField>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <BtnSecondary onClick={() => { setUploadModal(false); setFile(null); }}>Ghairi</BtnSecondary>
          <BtnPrimary onClick={handleUpload} disabled={isUploading}>
            {isUploading ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Inapakia...</> : 'Pakia Ratiba'}
          </BtnPrimary>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Thibitisha Kufuta" size="sm">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,71,87,.12)', border: '1px solid rgba(255,71,87,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <AlertTriangle style={{ width: 24, height: 24, color: '#ff4757' }} />
          </div>
          <p style={{ color: '#fff', marginBottom: '.5rem', fontWeight: 600 }}>Una uhakika wa kufuta ratiba?</p>
          <p style={{ color: '#00FF41', fontWeight: 700, marginBottom: '.5rem' }}>{deleteModal?.title}</p>
          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '.8rem', marginBottom: '1.5rem' }}>Hatua hii haiwezi kurudishwa.</p>
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
            <BtnSecondary onClick={() => setDeleteModal(null)}>Ghairi</BtnSecondary>
            <BtnDanger onClick={() => deleteModal && handleDelete(deleteModal)}><Trash2 style={{ width: 14, height: 14 }} />Futa</BtnDanger>
          </div>
        </div>
      </Modal>
    </div>
  );
}
