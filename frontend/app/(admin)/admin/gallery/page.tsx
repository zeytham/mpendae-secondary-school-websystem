'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryApi } from '@/lib/api';
import { GalleryPhoto } from '@/types';
import Modal from '@/components/admin/Modal';
import { AdminField, AdminInput, AdminSelect, AdminTextarea, BtnPrimary, BtnSecondary, BtnDanger } from '@/components/admin/AdminForm';
import { useToast } from '@/components/ui/Toast';
import { Plus, Trash2, Loader2, AlertTriangle, ImageIcon, FolderOpen, X, Upload, Grid3X3 } from 'lucide-react';

const ALBUMS = ['Shule', 'Michezo', 'Sherehe', 'Maabara', 'Mazingira', 'Mengine'];

export default function GalleryAdminPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);
  const [activeAlbum, setActiveAlbum] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<GalleryPhoto | null>(null);
  const [form, setForm] = useState({ title: '', album: ALBUMS[0], description: '' });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const fetchPhotos = useCallback(async (album = activeAlbum) => {
    setIsLoading(true);
    try {
      const [photoRes, albumRes] = await Promise.all([galleryApi.getAll(album ? { album } : {}), galleryApi.getAlbums()]);
      setPhotos(photoRes.data.photos || photoRes.data);
      const raw = albumRes.data.albums || albumRes.data;
      setAlbums(raw.map((item: unknown) => typeof item === 'string' ? item : (item as { album: string }).album));
    } catch { toast('Hitilafu ya kupakia picha', 'error'); }
    finally { setIsLoading(false); }
  }, [activeAlbum, toast]);

  useEffect(() => { fetchPhotos(); }, []);

  const addFiles = (newFiles: File[]) => {
    const valid = newFiles.filter(f => f.type.startsWith('image/'));
    setFiles(p => [...p, ...valid]);
    valid.forEach(f => { const url = URL.createObjectURL(f); setPreviews(p => [...p, url]); });
  };

  const handleUpload = async () => {
    if (!form.title || files.length === 0) { toast('Jaza jina na chagua picha angalau moja', 'warning'); return; }
    setIsUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('title', form.title); fd.append('album', form.album);
        if (form.description) fd.append('description', form.description);
        fd.append('photos', file);
        await galleryApi.upload(fd);
      }
      toast(`Picha ${files.length} zimepakiwa ✓`, 'success');
      setUploadModal(false); setFiles([]); setPreviews([]);
      setForm({ title: '', album: ALBUMS[0], description: '' }); fetchPhotos();
    } catch (e: unknown) { toast((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Hitilafu ya kupakia', 'error'); }
    finally { setIsUploading(false); }
  };

  const handleDelete = async (p: GalleryPhoto) => {
    try { await galleryApi.delete(p.id); toast('Picha imefutwa', 'success'); setDeleteModal(null); fetchPhotos(); }
    catch { toast('Hitilafu ya kufuta', 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>Picha za Shule</h1>
          <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.4)', margin: '.3rem 0 0' }}>{photos.length} picha · {albums.length} albamu</p>
        </div>
        <BtnPrimary onClick={() => setUploadModal(true)}><Upload style={{ width: 15, height: 15 }} /> Pakia Picha</BtnPrimary>
      </div>

      {/* Album filter tabs */}
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        {['', ...albums].map(a => (
          <button key={a || '__all'} onClick={() => { setActiveAlbum(a); fetchPhotos(a); }}
            style={{
              padding: '.45rem 1rem', borderRadius: '2rem', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer',
              border: 'none', display: 'flex', alignItems: 'center', gap: '.4rem', transition: 'all .2s',
              background: activeAlbum === a ? 'var(--c-lime)' : 'rgba(255,255,255,.06)',
              color: activeAlbum === a ? '#050805' : 'rgba(255,255,255,.6)',
              boxShadow: activeAlbum === a ? '0 4px 16px rgba(0,255,65,.25)' : 'none',
            }}
          >
            {a ? <><FolderOpen style={{ width: 12, height: 12 }} />{a}</> : <><Grid3X3 style={{ width: 12, height: 12 }} />Zote</>}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '1rem' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer" style={{ aspectRatio: '1', borderRadius: '1rem' }} />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
          <ImageIcon style={{ width: 56, height: 56, color: 'rgba(255,255,255,.07)' }} />
          <p style={{ color: 'rgba(255,255,255,.3)', fontWeight: 600, fontSize: '.9rem' }}>Hakuna picha bado</p>
          <BtnPrimary onClick={() => setUploadModal(true)}><Plus style={{ width: 14, height: 14 }} /> Pakia Picha za Kwanza</BtnPrimary>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '1rem' }}>
          <AnimatePresence>
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: .9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: .3, delay: i * .03 }}
                style={{ position: 'relative', aspectRatio: '1', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.04)', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.querySelector('.overlay') as HTMLElement).style.opacity = '1'}
                onMouseLeave={e => (e.currentTarget.querySelector('.overlay') as HTMLElement).style.opacity = '0'}
              >
                <Image src={photo.imageUrl} alt={photo.title} fill style={{ objectFit: 'cover', transition: 'transform .3s' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.transform = 'scale(1.08)'}
                  onMouseLeave={e => (e.target as HTMLElement).style.transform = 'scale(1)'}
                  sizes="160px" />
                <div className="overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.85), transparent 50%)', opacity: 0, transition: 'opacity .25s', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '.75rem' }}>
                  <p style={{ color: '#fff', fontSize: '.72rem', fontWeight: 700, marginBottom: '.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.5)' }}>{photo.album}</span>
                    <button onClick={() => setDeleteModal(photo)} style={{ width: 26, height: 26, borderRadius: '.5rem', background: 'rgba(255,71,87,.8)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Trash2 style={{ width: 11, height: 11 }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={uploadModal} onClose={() => { setUploadModal(false); setFiles([]); setPreviews([]); }}
        title="Pakia Picha Mpya" subtitle="Chagua picha moja au nyingi kupakia" size="lg"
        headerIcon={<Upload style={{ width: 20, height: 20 }} />}
        footer={
          <>
            <BtnSecondary onClick={() => { setUploadModal(false); setFiles([]); setPreviews([]); }}>Ghairi</BtnSecondary>
            <BtnPrimary onClick={handleUpload} disabled={isUploading || files.length === 0}>
              {isUploading ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Inapakia...</> : `Pakia Picha (${files.length})`}
            </BtnPrimary>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
            <AdminField label="Jina la Picha/Albamu" required>
              <AdminInput value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Mfano: Siku ya Uhuru 2024" />
            </AdminField>
            <AdminField label="Albamu">
              <AdminSelect value={form.album} onChange={e => setForm(p => ({ ...p, album: e.target.value }))}>
                {ALBUMS.map(a => <option key={a} value={a}>{a}</option>)}
              </AdminSelect>
            </AdminField>
          </div>
          <AdminField label="Maelezo">
            <AdminInput value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Maelezo mafupi (si lazima)" />
          </AdminField>

          {/* Drag & drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files)); }}
            style={{
              border: `2px dashed ${isDragging ? 'var(--c-lime)' : 'rgba(255,255,255,.15)'}`,
              borderRadius: '1rem', padding: '2rem', textAlign: 'center', cursor: 'pointer',
              background: isDragging ? 'rgba(0,255,65,.04)' : 'rgba(255,255,255,.02)', transition: 'all .2s',
            }}
            onClick={() => document.getElementById('gallery-file-input')?.click()}
          >
            <Upload style={{ width: 28, height: 28, color: isDragging ? 'var(--c-lime)' : 'rgba(255,255,255,.2)', margin: '0 auto .75rem' }} />
            <p style={{ fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: '.3rem', fontSize: '.875rem' }}>Buruta picha hapa, au <span style={{ color: 'var(--c-lime)' }}>bonyeza kuchagua</span></p>
            <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)' }}>PNG, JPG, WEBP · Picha nyingi kwa wakati mmoja</p>
            <input id="gallery-file-input" type="file" accept="image/*" multiple onChange={e => addFiles(Array.from(e.target.files || []))} style={{ display: 'none' }} />
          </div>

          {previews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(72px,1fr))', gap: '.625rem' }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,.1)' }}>
                  <Image src={src} alt={`Preview ${i+1}`} fill style={{ objectFit: 'cover' }} sizes="80px" />
                  <button onClick={() => { setFiles(f => f.filter((_, fi) => fi !== i)); setPreviews(p => p.filter((_, pi) => pi !== i)); }}
                    style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,71,87,.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <X style={{ width: 10, height: 10 }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Thibitisha Kufuta" size="sm"
        footer={<><BtnSecondary onClick={() => setDeleteModal(null)}>Ghairi</BtnSecondary><BtnDanger onClick={() => deleteModal && handleDelete(deleteModal)}><Trash2 style={{ width: 14, height: 14 }} /> Futa</BtnDanger></>}
      >
        <motion.div initial={{ scale: .95 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: '.5rem 0' }}>
          {deleteModal && (
            <div style={{ position: 'relative', width: 100, height: 100, borderRadius: '1rem', overflow: 'hidden', margin: '0 auto 1.25rem', border: '2px solid rgba(255,71,87,.3)' }}>
              <Image src={deleteModal.imageUrl} alt={deleteModal.title} fill style={{ objectFit: 'cover' }} sizes="100px" />
            </div>
          )}
          <p style={{ color: 'rgba(255,255,255,.6)', marginBottom: '.625rem', fontSize: '.9rem' }}>Futa picha hii?</p>
          <p style={{ color: 'var(--c-lime)', fontWeight: 800 }}>{deleteModal?.title}</p>
          <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '.75rem', marginTop: '.5rem' }}>Hatua hii haiwezi kurudishwa.</p>
        </motion.div>
      </Modal>
    </div>
  );
}
