'use client';

import { useEffect, useState, useCallback } from 'react';
import { admissionsApi } from '@/lib/api';
import { Admission } from '@/types';
import DataTable from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  AdminField, AdminPageHeader, BtnPrimary, BtnSecondary, BtnDanger, IconBtn,
} from '@/components/admin/AdminForm';
import { Eye, CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Admission | null>(null);
  const [detailModal, setDetailModal] = useState(false);
  const [statusModal, setStatusModal] = useState<{ open: boolean; newStatus: string }>({ open: false, newStatus: '' });
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetch = useCallback(async (page = 1, q = search, s = statusFilter) => {
    setIsLoading(true);
    try {
      const res = await admissionsApi.getAll({ page, limit: 20, search: q, status: s });
      setAdmissions(res.data.admissions);
      setPagination(res.data.pagination);
    } catch { toast('Hitilafu ya kupakia maombi', 'error'); }
    setIsLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetch(); }, []);

  const handleStatusUpdate = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await admissionsApi.updateStatus(selected.id, { status: statusModal.newStatus, notes });
      toast(`Hali imebadilishwa ✓`, 'success');
      setStatusModal({ open: false, newStatus: '' });
      setDetailModal(false);
      fetch();
    } catch { toast('Hitilafu imetokea', 'error'); }
    setIsSaving(false);
  };

  const STATUS_CONFIG = {
    PENDING:  { label: 'Inasubiri',   badge: 'badge badge-warning' },
    APPROVED: { label: 'Imekubaliwa', badge: 'badge badge-success' },
    REJECTED: { label: 'Imekataliwa', badge: 'badge badge-danger' },
  } as const;

  const columns = [
    { key: 'referenceNo', label: 'Rejeleo', render: (a: Admission) => <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.8rem', color: '#00FF41' }}>{a.referenceNo}</span> },
    { key: 'firstName', label: 'Jina', render: (a: Admission) => <span style={{ fontWeight: 600, color: '#fff' }}>{a.firstName} {a.lastName}</span> },
    { key: 'gender', label: 'Jinsia', render: (a: Admission) => <span style={{ color: 'rgba(255,255,255,.6)' }}>{a.gender === 'MALE' ? 'Me' : 'Ke'}</span> },
    { key: 'kcpeScore', label: 'Alama PSLE', render: (a: Admission) => <span style={{ fontWeight: 700, color: '#fff' }}>{a.kcpeScore}</span> },
    { key: 'parentPhone', label: 'Simu' },
    {
      key: 'status', label: 'Hali',
      render: (a: Admission) => <span className={STATUS_CONFIG[a.status as keyof typeof STATUS_CONFIG]?.badge || 'badge badge-neutral'}>{STATUS_CONFIG[a.status as keyof typeof STATUS_CONFIG]?.label || a.status}</span>,
    },
    { key: 'createdAt', label: 'Tarehe', render: (a: Admission) => <span style={{ color: 'rgba(255,255,255,.4)', fontSize: '.8rem' }}>{format(new Date(a.createdAt), 'dd/MM/yy')}</span> },
  ];

  const filterButtons = [
    { label: 'Yote',          value: '',         icon: null },
    { label: 'Inasubiri',    value: 'PENDING',  icon: Clock },
    { label: 'Imekubaliwa',  value: 'APPROVED', icon: CheckCircle },
    { label: 'Imekataliwa',  value: 'REJECTED', icon: XCircle },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <AdminPageHeader
        title="Maombi ya Usajili"
        subtitle={`Jumla maombi: ${pagination.total}`}
        actions={
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {filterButtons.map(({ label, value, icon: Icon }) => {
              const active = statusFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => { setStatusFilter(value); fetch(1, search, value); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.35rem',
                    padding: '.4rem .875rem', borderRadius: 999,
                    fontSize: '.72rem', fontWeight: 700, letterSpacing: '.04em',
                    border: `1px solid ${active ? 'rgba(0,255,65,.4)' : 'rgba(255,255,255,.12)'}`,
                    background: active ? 'rgba(0,255,65,.12)' : 'rgba(255,255,255,.05)',
                    color: active ? '#00FF41' : 'rgba(255,255,255,.55)',
                    cursor: 'pointer', transition: 'all .2s', fontFamily: 'var(--f-body)',
                  }}
                >
                  {Icon && <Icon style={{ width: 11, height: 11 }} />}{label}
                </button>
              );
            })}
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={admissions}
        isLoading={isLoading}
        totalPages={pagination.pages}
        currentPage={pagination.page}
        total={pagination.total}
        onPageChange={p => fetch(p)}
        onSearch={q => { setSearch(q); fetch(1, q, statusFilter); }}
        searchPlaceholder="Tafuta kwa jina au nambari..."
        emptyMessage="Hakuna maombi yaliyopatikana"
        actions={(a: Admission) => (
          <IconBtn color="lime" onClick={() => { setSelected(a); setNotes(a.notes || ''); setDetailModal(true); }} aria-label="Tazama" title="Tazama maelezo">
            <Eye style={{ width: 13, height: 13 }} />
          </IconBtn>
        )}
      />

      {/* Detail Modal */}
      <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title="Maelezo ya Ombi" size="lg">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '1.1rem', fontWeight: 800, color: '#00FF41' }}>{selected.referenceNo}</span>
              <span className={STATUS_CONFIG[selected.status as keyof typeof STATUS_CONFIG]?.badge || 'badge badge-neutral'}>
                {STATUS_CONFIG[selected.status as keyof typeof STATUS_CONFIG]?.label || selected.status}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '.75rem' }}>
              {[
                ['Jina Kamili', `${selected.firstName} ${selected.lastName}`],
                ['Jinsia', selected.gender === 'MALE' ? 'Mume' : 'Mke'],
                ['Tarehe ya Kuzaliwa', format(new Date(selected.dateOfBirth), 'dd/MM/yyyy')],
                ['Mzazi/Mlezi', selected.parentName],
                ['Simu', selected.parentPhone],
                ['Barua Pepe', selected.parentEmail],
                ['Shule ya Msingi', selected.primarySchool],
                ['Alama za PSLE', String(selected.kcpeScore)],
                ['Combination', selected.combination || '—'],
                ['Anwani', selected.address],
              ].map(([label, value]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '.75rem', padding: '.875rem' }}>
                  <p style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.35)', marginBottom: '.3rem' }}>{label}</p>
                  <p style={{ fontSize: '.875rem', fontWeight: 600, color: '#fff' }}>{value}</p>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div style={{ background: 'rgba(255,165,2,.06)', border: '1px solid rgba(255,165,2,.2)', borderRadius: '.75rem', padding: '.875rem' }}>
                <p style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,165,2,.7)', marginBottom: '.3rem' }}>Maelezo ya Awali</p>
                <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.7)' }}>{selected.notes}</p>
              </div>
            )}
            <AdminField label="Maelezo / Sababu (Admin)">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Andika maelezo hapa..."
                rows={3}
                style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '.875rem', padding: '.7rem 1rem', color: '#fff', fontSize: '.875rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--f-body)' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,255,65,.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,255,65,.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </AdminField>
            {selected.status === 'PENDING' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.875rem' }}>
                <button
                  onClick={() => setStatusModal({ open: true, newStatus: 'APPROVED' })}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', padding: '.875rem', background: 'rgba(0,255,65,.08)', border: '1px solid rgba(0,255,65,.25)', borderRadius: '.875rem', color: '#00FF41', fontWeight: 700, fontSize: '.875rem', cursor: 'pointer', transition: 'all .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.15)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.08)'; }}
                >
                  <CheckCircle style={{ width: 16, height: 16 }} /> Kubali Ombi
                </button>
                <button
                  onClick={() => setStatusModal({ open: true, newStatus: 'REJECTED' })}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', padding: '.875rem', background: 'rgba(255,71,87,.08)', border: '1px solid rgba(255,71,87,.25)', borderRadius: '.875rem', color: '#ff4757', fontWeight: 700, fontSize: '.875rem', cursor: 'pointer', transition: 'all .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,71,87,.15)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,71,87,.08)'; }}
                >
                  <XCircle style={{ width: 16, height: 16 }} /> Kataa Ombi
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Status Modal */}
      <Modal isOpen={statusModal.open} onClose={() => setStatusModal({ open: false, newStatus: '' })} title="Thibitisha Hatua" size="sm">
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: statusModal.newStatus === 'APPROVED' ? 'rgba(0,255,65,.1)' : 'rgba(255,71,87,.1)',
            border: `1px solid ${statusModal.newStatus === 'APPROVED' ? 'rgba(0,255,65,.3)' : 'rgba(255,71,87,.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
          }}>
            {statusModal.newStatus === 'APPROVED'
              ? <CheckCircle style={{ width: 26, height: 26, color: '#00FF41' }} />
              : <XCircle style={{ width: 26, height: 26, color: '#ff4757' }} />
            }
          </div>
          <p style={{ color: '#fff', marginBottom: '1.5rem', fontWeight: 600 }}>
            Una uhakika wa {statusModal.newStatus === 'APPROVED' ? 'kukubali' : 'kukataa'} ombi hili?
          </p>
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
            <BtnSecondary onClick={() => setStatusModal({ open: false, newStatus: '' })}>Ghairi</BtnSecondary>
            {statusModal.newStatus === 'APPROVED'
              ? <BtnPrimary onClick={handleStatusUpdate} disabled={isSaving}>
                  {isSaving ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> : <><CheckCircle style={{ width: 14, height: 14 }} />Kubali</>}
                </BtnPrimary>
              : <BtnDanger onClick={handleStatusUpdate} disabled={isSaving}>
                  {isSaving ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> : <><XCircle style={{ width: 14, height: 14 }} />Kataa</>}
                </BtnDanger>
            }
          </div>
        </div>
      </Modal>
    </div>
  );
}
