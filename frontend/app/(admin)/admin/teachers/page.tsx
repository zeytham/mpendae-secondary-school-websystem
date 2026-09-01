'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { teachersApi } from '@/lib/api';
import { Teacher, DEPARTMENTS } from '@/types';
import DataTable from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import {
  AdminField, AdminInput, AdminSelect, AdminTextarea,
  BtnPrimary, BtnSecondary, BtnDanger, IconBtn, AdminPageHeader,
} from '@/components/admin/AdminForm';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, Users } from 'lucide-react';

interface TeacherForm {
  firstName: string; lastName: string; gender: string; email: string;
  phone: string; department: string; subjects: string; qualification: string; status: string;
}
const emptyForm: TeacherForm = {
  firstName: '', lastName: '', gender: 'MALE', email: '', phone: '',
  department: DEPARTMENTS[0], subjects: '', qualification: '', status: 'ACTIVE',
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Teacher | null>(null);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<TeacherForm>(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const set = (k: keyof TeacherForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(p => ({ ...p, [k]: e.target.value }));

  const fetchTeachers = useCallback(async (q = search) => {
    setIsLoading(true);
    try {
      const res = await teachersApi.getAll({ search: q });
      setTeachers(res.data.teachers || res.data);
    } catch { toast('Hitilafu ya kupakia walimu', 'error'); }
    setIsLoading(false);
  }, [search, toast]);

  useEffect(() => { fetchTeachers(); }, []);

  const openAdd = () => { setEditTeacher(null); setFormData(emptyForm); setPhotoFile(null); setModalOpen(true); };
  const openEdit = (t: Teacher) => {
    setEditTeacher(t);
    setFormData({
      firstName: t.firstName, lastName: t.lastName, gender: t.gender,
      email: t.email, phone: t.phone, department: t.department,
      subjects: t.subjects.join(', '), qualification: t.qualification, status: t.status,
    });
    setPhotoFile(null); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast('Jaza nyanja zote *', 'warning'); return;
    }
    setIsSaving(true);
    try {
      const fd = new FormData();
      const subjects = formData.subjects.split(',').map(s => s.trim()).filter(Boolean);
      Object.entries(formData).forEach(([k, v]) => { if (k !== 'subjects') fd.append(k, v); });
      subjects.forEach(s => fd.append('subjects[]', s));
      if (photoFile) fd.append('photo', photoFile);
      if (editTeacher) { await teachersApi.update(editTeacher.id, fd); toast('Mwalimu amesasishwa ✓', 'success'); }
      else { await teachersApi.create(fd); toast('Mwalimu ameongezwa ✓', 'success'); }
      setModalOpen(false); fetchTeachers();
    } catch (e: unknown) { toast((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Hitilafu imetokea', 'error'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (t: Teacher) => {
    try { await teachersApi.delete(t.id); toast('Mwalimu amefutwa', 'success'); setDeleteModal(null); fetchTeachers(); }
    catch { toast('Hitilafu ya kufuta', 'error'); }
  };

  const columns = [
    {
      key: 'photo', label: 'Picha', width: '52px',
      render: (t: Teacher) => (
        <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(0,255,65,.2)', background: 'rgba(0,255,65,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {t.photo ? <Image src={t.photo} alt={t.firstName} width={36} height={36} style={{ objectFit: 'cover' }} /> : <span style={{ color: '#00FF41', fontWeight: 800, fontSize: '.875rem' }}>{t.firstName[0]}</span>}
        </div>
      ),
    },
    { key: 'staffId', label: 'Nambari', render: (t: Teacher) => <span style={{ fontFamily: 'monospace', fontSize: '.78rem', color: 'rgba(255,255,255,.45)' }}>{t.staffId}</span> },
    { key: 'firstName', label: 'Jina Kamili', render: (t: Teacher) => <span style={{ fontWeight: 700, color: '#fff' }}>{t.firstName} {t.lastName}</span> },
    { key: 'department', label: 'Idara', render: (t: Teacher) => <span style={{ padding: '.18rem .65rem', borderRadius: 999, fontSize: '.63rem', fontWeight: 700, background: 'rgba(61,142,248,.1)', color: '#3d8ef8', border: '1px solid rgba(61,142,248,.25)' }}>{t.department}</span> },
    { key: 'phone', label: 'Simu', render: (t: Teacher) => <span style={{ color: 'rgba(255,255,255,.55)', fontSize: '.82rem', fontFamily: 'monospace' }}>{t.phone}</span> },
    { key: 'qualification', label: 'Sifa', render: (t: Teacher) => <span style={{ color: 'rgba(255,255,255,.45)', fontSize: '.8rem' }}>{t.qualification || '—'}</span> },
    {
      key: 'status', label: 'Hali',
      render: (t: Teacher) => {
        const m: Record<string, [string, string, string]> = {
          ACTIVE:   ['Anafanya Kazi', 'rgba(0,255,65,.1)', 'var(--c-lime)'],
          INACTIVE: ['Hayafanyi', 'rgba(255,255,255,.06)', 'rgba(255,255,255,.4)'],
          ON_LEAVE: ['Likizoni', 'rgba(255,165,2,.08)', '#ffa502'],
        };
        const [label, bg, color] = m[t.status] || m.INACTIVE;
        return <span style={{ padding: '.18rem .65rem', borderRadius: 999, fontSize: '.63rem', fontWeight: 700, background: bg, color }}>{label}</span>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <AdminPageHeader
        title="Walimu" subtitle={`Walimu ${teachers.length} wote`}
        actions={<BtnPrimary onClick={openAdd}><Plus style={{ width: 16, height: 16 }} /> Ongeza Mwalimu</BtnPrimary>}
      />

      <DataTable
        columns={columns} data={teachers} isLoading={isLoading}
        total={teachers.length}
        onSearch={q => { setSearch(q); fetchTeachers(q); }}
        onRefresh={() => fetchTeachers()}
        searchPlaceholder="Tafuta kwa jina au idara..."
        emptyMessage="Hakuna walimu. Ongeza walimu wapya."
        emptyIcon={<Users style={{ width: 40, height: 40, color: 'rgba(255,255,255,.08)' }} />}
        actions={(t: Teacher) => (
          <>
            <IconBtn color="default" onClick={() => openEdit(t)} title="Hariri"><Pencil style={{ width: 13, height: 13 }} /></IconBtn>
            <IconBtn color="danger" onClick={() => setDeleteModal(t)} title="Futa"><Trash2 style={{ width: 13, height: 13 }} /></IconBtn>
          </>
        )}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editTeacher ? 'Hariri Mwalimu' : 'Ongeza Mwalimu Mpya'}
        subtitle={editTeacher ? `${editTeacher.firstName} ${editTeacher.lastName}` : 'Jaza taarifa za mwalimu mpya'}
        size="lg" headerIcon={<Users style={{ width: 20, height: 20 }} />}
        footer={<><BtnSecondary onClick={() => setModalOpen(false)}>Ghairi</BtnSecondary><BtnPrimary onClick={handleSave} disabled={isSaving}>{isSaving ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Inahifadhi...</> : 'Hifadhi'}</BtnPrimary></>}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(185px,1fr))', gap: '1rem' }}>
          <AdminField label="Jina la Kwanza" required><AdminInput value={formData.firstName} onChange={set('firstName')} placeholder="Jina la kwanza" /></AdminField>
          <AdminField label="Jina la Pili" required><AdminInput value={formData.lastName} onChange={set('lastName')} placeholder="Jina la ukoo" /></AdminField>
          <AdminField label="Jinsia"><AdminSelect value={formData.gender} onChange={set('gender')}><option value="MALE">Mume</option><option value="FEMALE">Mke</option></AdminSelect></AdminField>
          <AdminField label="Barua Pepe" required><AdminInput type="email" value={formData.email} onChange={set('email')} placeholder="barua@pepe.com" /></AdminField>
          <AdminField label="Simu" required><AdminInput type="tel" value={formData.phone} onChange={set('phone')} placeholder="+255 7XX XXX XXX" /></AdminField>
          <AdminField label="Idara"><AdminSelect value={formData.department} onChange={set('department')}>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</AdminSelect></AdminField>
          <AdminField label="Masomo (tenganisha kwa koma)"><AdminInput value={formData.subjects} onChange={set('subjects')} placeholder="Hisabati, Fizikia, ..." /></AdminField>
          <AdminField label="Sifa za Elimu"><AdminInput value={formData.qualification} onChange={set('qualification')} placeholder="Mfano: BSc Education" /></AdminField>
          <AdminField label="Hali"><AdminSelect value={formData.status} onChange={set('status')}><option value="ACTIVE">Anafanya Kazi</option><option value="INACTIVE">Hayafanyi Kazi</option><option value="ON_LEAVE">Likizoni</option></AdminSelect></AdminField>
          <AdminField label="Picha ya Mwalimu"><input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.5)', cursor: 'pointer', width: '100%' }} /></AdminField>
        </div>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Thibitisha Kufuta" size="sm"
        footer={<><BtnSecondary onClick={() => setDeleteModal(null)}>Ghairi</BtnSecondary><BtnDanger onClick={() => deleteModal && handleDelete(deleteModal)}><Trash2 style={{ width: 14, height: 14 }} /> Futa</BtnDanger></>}
      >
        <motion.div initial={{ scale: .95 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,71,87,.1)', border: '1px solid rgba(255,71,87,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <AlertTriangle style={{ width: 28, height: 28, color: '#ff4757' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,.6)', marginBottom: '.75rem', fontSize: '.9rem' }}>Futa mwalimu huyu?</p>
          <p style={{ color: 'var(--c-lime)', fontWeight: 800, fontSize: '1.05rem' }}>{deleteModal?.firstName} {deleteModal?.lastName}</p>
          <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '.75rem', marginTop: '.5rem' }}>Hatua hii haiwezi kurudishwa.</p>
        </motion.div>
      </Modal>
    </div>
  );
}
