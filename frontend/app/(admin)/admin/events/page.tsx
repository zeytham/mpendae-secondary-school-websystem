'use client';

import { useEffect, useState, useCallback } from 'react';
import { eventsApi } from '@/lib/api';
import { Event, EVENT_CATEGORIES } from '@/types';
import DataTable from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  AdminField, AdminInput, AdminSelect, AdminTextarea,
  BtnPrimary, BtnSecondary, BtnDanger, IconBtn, AdminPageHeader,
} from '@/components/admin/AdminForm';
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface EventForm {
  title: string; description: string; location: string;
  startDate: string; endDate: string; category: string; status: string;
}
const emptyForm: EventForm = {
  title: '', description: '', location: '', startDate: '', endDate: '',
  category: EVENT_CATEGORIES[0], status: 'UPCOMING',
};

const STATUS_LABELS: Record<string, string> = { UPCOMING: 'Inakuja', ONGOING: 'Inaendelea', PAST: 'Imepita' };
const STATUS_BADGE: Record<string, string>  = { UPCOMING: 'badge badge-info', ONGOING: 'badge badge-success', PAST: 'badge badge-neutral' };

export default function EventsAdminPage() {
  const [events, setEvents]       = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Event | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [formData, setFormData]   = useState<EventForm>(emptyForm);
  const [isSaving, setIsSaving]   = useState(false);
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await eventsApi.getAll();
      setEvents(res.data.events || res.data);
    } catch {
      toast('Hitilafu ya kupakia matukio', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const openAdd = () => { setEditEvent(null); setFormData(emptyForm); setModalOpen(true); };
  const openEdit = (e: Event) => {
    setEditEvent(e);
    setFormData({ title: e.title, description: e.description, location: e.location, startDate: e.startDate ? e.startDate.slice(0, 16) : '', endDate: e.endDate ? e.endDate.slice(0, 16) : '', category: e.category, status: e.status });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.location || !formData.startDate) {
      toast('Tafadhali jaza nyanja zote zinazohitajika', 'warning'); return;
    }
    setIsSaving(true);
    try {
      const payload = { ...formData, startDate: new Date(formData.startDate).toISOString(), endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined };
      if (editEvent) {
        await eventsApi.update(editEvent.id, payload);
        toast('Tukio limesasishwa ✓', 'success');
      } else {
        await eventsApi.create(payload);
        toast('Tukio limeongezwa ✓', 'success');
      }
      setModalOpen(false); fetchEvents();
    } catch (e: unknown) {
      toast((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Hitilafu imetokea', 'error');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (event: Event) => {
    try {
      await eventsApi.delete(event.id);
      toast('Tukio limefutwa', 'success');
      setDeleteModal(null); fetchEvents();
    } catch { toast('Hitilafu ya kufuta', 'error'); }
  };

  const columns = [
    {
      key: 'title', label: 'Tukio',
      render: (e: Event) => (
        <div>
          <p style={{ fontWeight: 600, color: '#fff', marginBottom: '.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{e.title}</p>
          <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
            <MapPin style={{ width: 11, height: 11 }} />{e.location}
          </p>
        </div>
      ),
    },
    { key: 'category', label: 'Aina', render: (e: Event) => <span className="badge badge-info">{e.category}</span> },
    {
      key: 'startDate', label: 'Tarehe ya Kuanza',
      render: (e: Event) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: 'rgba(255,255,255,.65)' }}>
          <Calendar style={{ width: 13, height: 13, color: '#00FF41', flexShrink: 0 }} />
          {format(new Date(e.startDate), 'dd/MM/yyyy HH:mm')}
        </span>
      ),
    },
    { key: 'endDate', label: 'Tarehe ya Kumaliza', render: (e: Event) => e.endDate ? format(new Date(e.endDate), 'dd/MM/yyyy HH:mm') : <span style={{ color: 'rgba(255,255,255,.25)' }}>—</span> },
    { key: 'status', label: 'Hali', render: (e: Event) => <span className={STATUS_BADGE[e.status]}>{STATUS_LABELS[e.status]}</span> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <AdminPageHeader
        title="Matukio"
        subtitle={`Matukio ${events.length} yamerekodiwa`}
        actions={<BtnPrimary onClick={openAdd}><Plus style={{ width: 15, height: 15 }} />Ongeza Tukio</BtnPrimary>}
      />

      <DataTable
        columns={columns}
        data={events}
        isLoading={isLoading}
        totalPages={1}
        currentPage={1}
        onPageChange={() => {}}
        onSearch={() => {}}
        searchPlaceholder="Tafuta tukio..."
        emptyMessage="Hakuna matukio bado. Ongeza tukio jipya."
        actions={(e: Event) => (
          <>
            <IconBtn onClick={() => openEdit(e)} aria-label="Hariri" title="Hariri"><Pencil style={{ width: 13, height: 13 }} /></IconBtn>
            <IconBtn color="danger" onClick={() => setDeleteModal(e)} aria-label="Futa" title="Futa"><Trash2 style={{ width: 13, height: 13 }} /></IconBtn>
          </>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editEvent ? 'Hariri Tukio' : 'Ongeza Tukio Jipya'} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AdminField label="Jina la Tukio" required>
            <AdminInput value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="Jina la tukio..." />
          </AdminField>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
            <AdminField label="Aina ya Tukio">
              <AdminSelect value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </AdminSelect>
            </AdminField>
            <AdminField label="Hali">
              <AdminSelect value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                <option value="UPCOMING">Inakuja</option>
                <option value="ONGOING">Inaendelea</option>
                <option value="PAST">Imepita</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Tarehe ya Kuanza" required>
              <AdminInput type="datetime-local" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} />
            </AdminField>
            <AdminField label="Tarehe ya Kumaliza">
              <AdminInput type="datetime-local" value={formData.endDate} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} />
            </AdminField>
          </div>
          <AdminField label="Mahali" required>
            <AdminInput value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="Mahali pa tukio..." />
          </AdminField>
          <AdminField label="Maelezo" required>
            <AdminTextarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Elezea tukio..." />
          </AdminField>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <BtnSecondary onClick={() => setModalOpen(false)}>Ghairi</BtnSecondary>
          <BtnPrimary onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Inahifadhi...</> : 'Hifadhi'}
          </BtnPrimary>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Thibitisha Kufuta" size="sm">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,71,87,.12)', border: '1px solid rgba(255,71,87,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <AlertTriangle style={{ width: 24, height: 24, color: '#ff4757' }} />
          </div>
          <p style={{ color: '#fff', marginBottom: '.5rem', fontWeight: 600 }}>Una uhakika wa kufuta tukio?</p>
          <p style={{ color: '#00FF41', fontWeight: 700, fontSize: '1rem', marginBottom: '.5rem' }}>{deleteModal?.title}</p>
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
