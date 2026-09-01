'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { newsApi } from '@/lib/api';
import { NewsArticle, NEWS_CATEGORIES } from '@/types';
import DataTable from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import {
  AdminField, AdminInput, AdminSelect, AdminTextarea,
  BtnPrimary, BtnSecondary, BtnDanger, IconBtn, AdminPageHeader,
} from '@/components/admin/AdminForm';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, Eye, EyeOff, Newspaper } from 'lucide-react';
import { format } from 'date-fns';

interface NewsForm { title: string; content: string; excerpt: string; author: string; category: string; status: string; }
const emptyForm: NewsForm = { title: '', content: '', excerpt: '', author: '', category: NEWS_CATEGORIES[0], status: 'PUBLISHED' };

const StatusBadge = ({ status }: { status: string }) => (
  <span style={{
    padding: '.18rem .65rem', borderRadius: 999, fontSize: '.63rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase',
    background: status === 'PUBLISHED' ? 'rgba(0,255,65,.1)' : 'rgba(255,165,2,.08)',
    color: status === 'PUBLISHED' ? '#00FF41' : '#ffa502',
    border: `1px solid ${status === 'PUBLISHED' ? 'rgba(0,255,65,.3)' : 'rgba(255,165,2,.25)'}`,
  }}>{status === 'PUBLISHED' ? 'Imechapishwa' : 'Rasimu'}</span>
);

export default function NewsAdminPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<NewsArticle | null>(null);
  const [editArticle, setEditArticle] = useState<NewsArticle | null>(null);
  const [formData, setFormData] = useState<NewsForm>(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const set = (k: keyof NewsForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(p => ({ ...p, [k]: e.target.value }));

  const fetchArticles = useCallback(async (page = 1, q = search) => {
    setIsLoading(true);
    try {
      const res = await newsApi.getAll({ page, limit: 20, search: q });
      setArticles(res.data.news || res.data);
      if (res.data.pagination) setPagination(res.data.pagination);
    } catch { toast('Hitilafu ya kupakia habari', 'error'); }
    setIsLoading(false);
  }, [search, toast]);

  useEffect(() => { fetchArticles(); }, []);

  const openAdd = () => { setEditArticle(null); setFormData(emptyForm); setCoverFile(null); setModalOpen(true); };
  const openEdit = (a: NewsArticle) => {
    setEditArticle(a);
    setFormData({ title: a.title, content: a.content, excerpt: a.excerpt || '', author: a.author, category: a.category, status: a.status });
    setCoverFile(null); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.author) { toast('Jaza nyanja zote *', 'warning'); return; }
    setIsSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (coverFile) fd.append('coverImage', coverFile);
      if (editArticle) { await newsApi.update(editArticle.id, fd); toast('Habari imesasishwa ✓', 'success'); }
      else { await newsApi.create(fd); toast('Habari imeandikwa ✓', 'success'); }
      setModalOpen(false); fetchArticles();
    } catch (e: unknown) { toast((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Hitilafu imetokea', 'error'); }
    finally { setIsSaving(false); }
  };

  const handleTogglePublish = async (a: NewsArticle) => {
    try { await newsApi.togglePublish(a.id); toast(a.status === 'PUBLISHED' ? 'Imefichwa' : 'Imechapishwa ✓', 'success'); fetchArticles(); }
    catch { toast('Hitilafu imetokea', 'error'); }
  };
  const handleDelete = async (a: NewsArticle) => {
    try { await newsApi.delete(a.id); toast('Imefutwa', 'success'); setDeleteModal(null); fetchArticles(); }
    catch { toast('Hitilafu ya kufuta', 'error'); }
  };

  const columns = [
    {
      key: 'coverImage', label: 'Picha', width: '64px',
      render: (a: NewsArticle) => (
        <div style={{ width: 48, height: 36, borderRadius: '.625rem', overflow: 'hidden', background: 'rgba(0,255,65,.06)', border: '1px solid rgba(0,255,65,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {a.coverImage ? <Image src={a.coverImage} alt={a.title} width={48} height={36} style={{ objectFit: 'cover', width: '100%', height: '100%' }} /> : <Newspaper style={{ width: 16, height: 16, color: 'rgba(0,255,65,.3)' }} />}
        </div>
      ),
    },
    { key: 'title', label: 'Kichwa cha Habari', render: (a: NewsArticle) => <span style={{ fontWeight: 700, color: '#fff', display: 'block', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span> },
    {
      key: 'category', label: 'Aina',
      render: (a: NewsArticle) => <span style={{ padding: '.18rem .65rem', borderRadius: 999, fontSize: '.63rem', fontWeight: 700, background: 'rgba(96,165,250,.1)', color: '#60A5FA', border: '1px solid rgba(96,165,250,.25)', letterSpacing: '.06em' }}>{a.category}</span>,
    },
    { key: 'author', label: 'Mwandishi', render: (a: NewsArticle) => <span style={{ color: 'rgba(255,255,255,.55)', fontSize: '.82rem' }}>{a.author}</span> },
    { key: 'publishedAt', label: 'Tarehe', render: (a: NewsArticle) => <span style={{ color: 'rgba(255,255,255,.45)', fontSize: '.8rem', fontFamily: 'monospace' }}>{a.publishedAt ? format(new Date(a.publishedAt), 'dd/MM/yyyy') : '—'}</span> },
    { key: 'status', label: 'Hali', render: (a: NewsArticle) => <StatusBadge status={a.status} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <AdminPageHeader
        title="Habari & Matangazo"
        subtitle={`Makala ${pagination.total} yote`}
        actions={<BtnPrimary onClick={openAdd}><Plus style={{ width: 16, height: 16 }} /> Andika Habari</BtnPrimary>}
      />

      <DataTable
        columns={columns} data={articles} isLoading={isLoading}
        totalPages={pagination.pages} currentPage={pagination.page} total={pagination.total}
        onPageChange={p => fetchArticles(p)}
        onSearch={q => { setSearch(q); fetchArticles(1, q); }}
        onRefresh={() => fetchArticles()}
        searchPlaceholder="Tafuta habari..."
        emptyMessage="Hakuna habari bado. Andika habari mpya."
        emptyIcon={<Newspaper style={{ width: 40, height: 40, color: 'rgba(255,255,255,.08)' }} />}
        actions={(a: NewsArticle) => (
          <>
            <IconBtn color="lime" onClick={() => handleTogglePublish(a)} title={a.status === 'PUBLISHED' ? 'Ficha' : 'Chapisha'}>
              {a.status === 'PUBLISHED' ? <EyeOff style={{ width: 13, height: 13 }} /> : <Eye style={{ width: 13, height: 13 }} />}
            </IconBtn>
            <IconBtn color="default" onClick={() => openEdit(a)} title="Hariri"><Pencil style={{ width: 13, height: 13 }} /></IconBtn>
            <IconBtn color="danger" onClick={() => setDeleteModal(a)} title="Futa"><Trash2 style={{ width: 13, height: 13 }} /></IconBtn>
          </>
        )}
      />

      {/* ── Edit/Add Modal ── */}
      <Modal
        isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editArticle ? 'Hariri Habari' : 'Andika Habari Mpya'}
        subtitle={editArticle ? editArticle.title.slice(0, 50) + '…' : 'Jaza taarifa za makala mpya'}
        size="xl" headerIcon={<Newspaper style={{ width: 20, height: 20 }} />}
        footer={
          <>
            <BtnSecondary onClick={() => setModalOpen(false)}>Ghairi</BtnSecondary>
            <BtnPrimary onClick={handleSave} disabled={isSaving}>
              {isSaving ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Inahifadhi...</> : 'Hifadhi Makala'}
            </BtnPrimary>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <AdminField label="Kichwa cha Habari" required>
            <AdminInput value={formData.title} onChange={set('title')} placeholder="Andika kichwa cha habari..." />
          </AdminField>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
            <AdminField label="Mwandishi" required>
              <AdminInput value={formData.author} onChange={set('author')} placeholder="Jina la mwandishi" />
            </AdminField>
            <AdminField label="Aina ya Habari">
              <AdminSelect value={formData.category} onChange={set('category')}>
                {NEWS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </AdminSelect>
            </AdminField>
            <AdminField label="Hali ya Uchapishaji">
              <AdminSelect value={formData.status} onChange={set('status')}>
                <option value="DRAFT">Rasimu (Draft)</option>
                <option value="PUBLISHED">Chapisha Sasa</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Picha ya Habari">
              <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)}
                style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.5)', cursor: 'pointer', width: '100%' }} />
            </AdminField>
          </div>
          <AdminField label="Muhtasari (Excerpt)">
            <AdminTextarea value={formData.excerpt} onChange={set('excerpt')} placeholder="Maelezo mafupi ya habari..." style={{ minHeight: 70 }} />
          </AdminField>
          <AdminField label="Maudhui ya Habari" required>
            <AdminTextarea value={formData.content} onChange={set('content')} placeholder="Andika habari kamili hapa..." style={{ minHeight: 220 }} />
          </AdminField>
          <div style={{ padding: '.75rem 1rem', borderRadius: '.875rem', background: 'rgba(96,165,250,.06)', border: '1px solid rgba(96,165,250,.18)' }}>
            <p style={{ fontSize: '.72rem', color: 'rgba(96,165,250,.8)', fontWeight: 600 }}>💡 Acha mstari mmoja wazi kati ya aya (paragraphs) — kila aya itaonekana vizuri kwenye ukurasa wa habari.</p>
          </div>
        </div>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Thibitisha Kufuta" size="sm"
        footer={<><BtnSecondary onClick={() => setDeleteModal(null)}>Ghairi</BtnSecondary><BtnDanger onClick={() => deleteModal && handleDelete(deleteModal)}><Trash2 style={{ width: 14, height: 14 }} /> Futa</BtnDanger></>}
      >
        <motion.div initial={{ scale: .95 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,71,87,.1)', border: '1px solid rgba(255,71,87,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <AlertTriangle style={{ width: 28, height: 28, color: '#ff4757' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,.6)', marginBottom: '.75rem', fontSize: '.9rem' }}>Futa habari hii?</p>
          <p style={{ color: 'var(--c-lime)', fontWeight: 800, fontSize: '.95rem', maxWidth: 280, margin: '0 auto', lineHeight: 1.5 }}>{deleteModal?.title}</p>
          <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '.75rem', marginTop: '.5rem' }}>Hatua hii haiwezi kurudishwa.</p>
        </motion.div>
      </Modal>
    </div>
  );
}
