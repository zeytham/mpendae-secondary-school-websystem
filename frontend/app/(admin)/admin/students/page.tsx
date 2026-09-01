'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { studentsApi } from '@/lib/api';
import { Student, FORM_LABELS, Form } from '@/types';
import DataTable from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import {
  AdminField, AdminInput, AdminSelect, BtnPrimary, BtnSecondary, BtnDanger,
  IconBtn, AdminPageHeader,
} from '@/components/admin/AdminForm';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, GraduationCap, Loader2, AlertTriangle, UserCircle } from 'lucide-react';

const FORMS: Form[] = ['FORM_1', 'FORM_2', 'FORM_3', 'FORM_4', 'FORM_5', 'FORM_6'];

interface StudentForm {
  firstName: string; lastName: string; gender: string; dateOfBirth: string; form: string;
  stream: string; parentName: string; parentPhone: string; parentEmail: string; address: string; status: string;
}

const emptyForm: StudentForm = {
  firstName: '', lastName: '', gender: 'MALE', dateOfBirth: '', form: 'FORM_1',
  stream: 'A', parentName: '', parentPhone: '', parentEmail: '', address: '', status: 'ACTIVE',
};

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    ACTIVE:      { label: 'Anasoma',    bg: 'rgba(0,255,65,.1)',    color: '#00FF41', border: 'rgba(0,255,65,.3)' },
    INACTIVE:    { label: 'Hayasomi',  bg: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)', border: 'rgba(255,255,255,.12)' },
    GRADUATED:   { label: 'Amehitimu', bg: 'rgba(61,142,248,.1)',  color: '#3d8ef8', border: 'rgba(61,142,248,.3)' },
    TRANSFERRED: { label: 'Amehamia',  bg: 'rgba(255,165,2,.1)',   color: '#ffa502', border: 'rgba(255,165,2,.3)' },
  };
  const s = map[status] || map.INACTIVE;
  return (
    <span style={{ padding: '.18rem .65rem', borderRadius: 999, fontSize: '.65rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [search, setSearch] = useState('');
  const [formFilter, setFormFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentForm>(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const set = (k: keyof StudentForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(p => ({ ...p, [k]: e.target.value }));

  const fetchStudents = useCallback(async (page = 1, q = search, f = formFilter) => {
    setIsLoading(true);
    try {
      const res = await studentsApi.getAll({ page, limit: 20, search: q, form: f });
      setStudents(res.data.students);
      setPagination(res.data.pagination);
    } catch { toast('Hitilafu ya kupakia wanafunzi', 'error'); }
    setIsLoading(false);
  }, [search, formFilter, toast]);

  useEffect(() => { fetchStudents(); }, []);

  const openAdd = () => { setEditStudent(null); setFormData(emptyForm); setPhotoFile(null); setModalOpen(true); };
  const openEdit = (s: Student) => {
    setEditStudent(s);
    setFormData({
      firstName: s.firstName, lastName: s.lastName, gender: s.gender,
      dateOfBirth: s.dateOfBirth.split('T')[0], form: s.form, stream: s.stream || 'A',
      parentName: s.parentName, parentPhone: s.parentPhone, parentEmail: s.parentEmail || '',
      address: s.address || '', status: s.status,
    });
    setPhotoFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.parentName || !formData.parentPhone) {
      toast('Tafadhali jaza nyanja zote zinazohitajika', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);
      if (editStudent) {
        await studentsApi.update(editStudent.id, fd);
        toast('Mwanafunzi amesasishwa ✓', 'success');
      } else {
        await studentsApi.create(fd);
        toast('Mwanafunzi ameongezwa ✓', 'success');
      }
      setModalOpen(false);
      fetchStudents();
    } catch (e: unknown) {
      toast((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Hitilafu imetokea', 'error');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (student: Student) => {
    try {
      await studentsApi.delete(student.id);
      toast('Mwanafunzi amefutwa', 'success');
      setDeleteModal(null);
      fetchStudents();
    } catch { toast('Hitilafu ya kufuta', 'error'); }
  };

  const columns = [
    {
      key: 'photo', label: 'Picha', width: '52px',
      render: (s: Student) => (
        <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(0,255,65,.2)', background: 'rgba(0,255,65,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {s.photo
            ? <Image src={s.photo} alt={s.firstName} width={36} height={36} style={{ objectFit: 'cover' }} />
            : <span style={{ color: 'var(--c-lime)', fontWeight: 800, fontSize: '.875rem' }}>{s.firstName[0]}</span>
          }
        </div>
      ),
    },
    { key: 'regNumber', label: 'Nambari',
      render: (s: Student) => <span style={{ fontFamily: 'monospace', fontSize: '.8rem', color: 'rgba(255,255,255,.55)', letterSpacing: '.04em' }}>{s.regNumber}</span>
    },
    { key: 'firstName', label: 'Jina Kamili',
      render: (s: Student) => <span style={{ fontWeight: 700, color: '#fff' }}>{s.firstName} {s.lastName}</span>
    },
    { key: 'form', label: 'Darasa',
      render: (s: Student) => (
        <span style={{ padding: '.18rem .65rem', borderRadius: 999, fontSize: '.65rem', fontWeight: 800, background: 'rgba(96,165,250,.1)', color: '#60A5FA', border: '1px solid rgba(96,165,250,.25)', letterSpacing: '.06em' }}>
          {FORM_LABELS[s.form]}{s.stream ? ` ${s.stream}` : ''}
        </span>
      ),
    },
    { key: 'gender', label: 'Jinsia', render: (s: Student) => <span style={{ color: 'rgba(255,255,255,.55)', fontSize: '.82rem' }}>{s.gender === 'MALE' ? 'Mume' : 'Mke'}</span> },
    { key: 'parentPhone', label: 'Simu ya Mzazi', render: (s: Student) => <span style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.6)', fontFamily: 'monospace' }}>{s.parentPhone}</span> },
    { key: 'status', label: 'Hali', render: (s: Student) => statusBadge(s.status) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <AdminPageHeader
        title="Wanafunzi"
        subtitle={`Jumla ya wanafunzi: ${pagination.total}`}
        actions={
          <BtnPrimary onClick={openAdd}>
            <Plus style={{ width: 16, height: 16 }} /> Ongeza Mwanafunzi
          </BtnPrimary>
        }
      />

      <DataTable
        columns={columns}
        data={students}
        isLoading={isLoading}
        totalPages={pagination.pages}
        currentPage={pagination.page}
        total={pagination.total}
        onPageChange={p => fetchStudents(p)}
        onSearch={q => { setSearch(q); fetchStudents(1, q, formFilter); }}
        onRefresh={() => fetchStudents()}
        searchPlaceholder="Tafuta kwa jina au nambari..."
        emptyMessage="Hakuna wanafunzi. Ongeza wanafunzi wapya."
        emptyIcon={<GraduationCap style={{ width: 40, height: 40, color: 'rgba(255,255,255,.08)' }} />}
        filters={
          <AdminSelect
            value={formFilter}
            onChange={e => { setFormFilter(e.target.value); fetchStudents(1, search, e.target.value); }}
            style={{ padding: '.5rem .875rem', minWidth: 130, fontSize: '.82rem', borderRadius: '.75rem' }}
          >
            <option value="">Madarasa Yote</option>
            {FORMS.map(f => <option key={f} value={f}>{FORM_LABELS[f]}</option>)}
          </AdminSelect>
        }
        actions={(s: Student) => (
          <>
            <IconBtn color="lime" onClick={() => openEdit(s)} title="Hariri">
              <Pencil style={{ width: 13, height: 13 }} />
            </IconBtn>
            <IconBtn color="danger" onClick={() => setDeleteModal(s)} title="Futa">
              <Trash2 style={{ width: 13, height: 13 }} />
            </IconBtn>
          </>
        )}
      />

      {/* ── Add/Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editStudent ? 'Hariri Mwanafunzi' : 'Ongeza Mwanafunzi Mpya'}
        subtitle={editStudent ? `${editStudent.firstName} ${editStudent.lastName}` : 'Jaza taarifa zote za mwanafunzi mpya'}
        size="lg"
        headerIcon={<GraduationCap style={{ width: 20, height: 20 }} />}
        footer={
          <>
            <BtnSecondary onClick={() => setModalOpen(false)}>Ghairi</BtnSecondary>
            <BtnPrimary onClick={handleSave} disabled={isSaving}>
              {isSaving ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Inahifadhi...</> : 'Hifadhi'}
            </BtnPrimary>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.1rem' }}>
          <AdminField label="Jina la Kwanza" required>
            <AdminInput value={formData.firstName} onChange={set('firstName')} placeholder="Jina la kwanza" />
          </AdminField>
          <AdminField label="Jina la Pili" required>
            <AdminInput value={formData.lastName} onChange={set('lastName')} placeholder="Jina la ukoo" />
          </AdminField>
          <AdminField label="Jinsia">
            <AdminSelect value={formData.gender} onChange={set('gender')}>
              <option value="MALE">Mume</option>
              <option value="FEMALE">Mke</option>
            </AdminSelect>
          </AdminField>
          <AdminField label="Tarehe ya Kuzaliwa" required>
            <AdminInput type="date" value={formData.dateOfBirth} onChange={set('dateOfBirth')} />
          </AdminField>
          <AdminField label="Darasa">
            <AdminSelect value={formData.form} onChange={set('form')}>
              {FORMS.map(f => <option key={f} value={f}>{FORM_LABELS[f]}</option>)}
            </AdminSelect>
          </AdminField>
          <AdminField label="Stream">
            <AdminInput value={formData.stream} onChange={set('stream')} placeholder="Mfano: A, B" />
          </AdminField>
          <AdminField label="Jina la Mzazi/Mlezi" required>
            <AdminInput value={formData.parentName} onChange={set('parentName')} placeholder="Jina kamili" />
          </AdminField>
          <AdminField label="Simu ya Mzazi" required>
            <AdminInput value={formData.parentPhone} onChange={set('parentPhone')} placeholder="+255 7XX XXX XXX" />
          </AdminField>
          <AdminField label="Barua Pepe ya Mzazi">
            <AdminInput type="email" value={formData.parentEmail} onChange={set('parentEmail')} placeholder="barua@pepe.com" />
          </AdminField>
          <AdminField label="Anwani">
            <AdminInput value={formData.address} onChange={set('address')} placeholder="Mtaa, Wilaya" />
          </AdminField>
          <AdminField label="Hali">
            <AdminSelect value={formData.status} onChange={set('status')}>
              <option value="ACTIVE">Anasoma</option>
              <option value="INACTIVE">Hayasomi</option>
              <option value="GRADUATED">Amehitimu</option>
              <option value="TRANSFERRED">Amehamia</option>
            </AdminSelect>
          </AdminField>
          <AdminField label="Picha ya Mwanafunzi">
            <input
              type="file" accept="image/*"
              onChange={e => setPhotoFile(e.target.files?.[0] || null)}
              style={{ width: '100%', fontSize: '.82rem', color: 'rgba(255,255,255,.6)', cursor: 'pointer' }}
            />
          </AdminField>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Thibitisha Kufuta"
        size="sm"
        footer={
          <>
            <BtnSecondary onClick={() => setDeleteModal(null)}>Ghairi</BtnSecondary>
            <BtnDanger onClick={() => deleteModal && handleDelete(deleteModal)}>
              <Trash2 style={{ width: 14, height: 14 }} /> Futa
            </BtnDanger>
          </>
        }
      >
        <motion.div
          initial={{ scale: .95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: 'center', padding: '1rem 0' }}
        >
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,71,87,.1)', border: '1px solid rgba(255,71,87,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <AlertTriangle style={{ width: 28, height: 28, color: '#ff4757' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,.6)', marginBottom: '.75rem', fontSize: '.9rem', lineHeight: 1.6 }}>
            Una uhakika wa kufuta mwanafunzi:
          </p>
          <p style={{ color: 'var(--c-lime)', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>
            {deleteModal?.firstName} {deleteModal?.lastName}
          </p>
          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '.78rem', marginTop: '.5rem' }}>Hatua hii haiwezi kurudishwa.</p>
        </motion.div>
      </Modal>
    </div>
  );
}
