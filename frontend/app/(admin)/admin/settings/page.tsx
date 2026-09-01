'use client';

import { useEffect, useState } from 'react';
import { settingsApi, authApi, milestonesApi } from '@/lib/api';
import { SchoolSettings, Milestone } from '@/types';
import { useToast } from '@/components/ui/Toast';
import {
  Loader2, Save, School, Phone, Mail, Globe, MapPin, Users,
  Link2, MessageCircle, Lock, Eye, EyeOff, Shield, AtSign,
  Award, Plus, Trash2, Pencil, X, Clock,
} from 'lucide-react';
import Image from 'next/image';
import {
  AdminField, AdminInput, AdminTextarea, AdminSelect,
  BtnPrimary, BtnSecondary, BtnDanger, IconBtn, AdminPageHeader,
} from '@/components/admin/AdminForm';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'general',  label: 'Jumla',            icon: School },
  { id: 'contact',  label: 'Mawasiliano',       icon: Phone },
  { id: 'social',   label: 'Mitandao',          icon: Globe },
  { id: 'history',  label: 'Historia',          icon: Clock },
  { id: 'security', label: 'Usalama',           icon: Shield },
] as const;
type TabId = typeof TABS[number]['id'];

/* ── Shared section card ── */
const Section = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '1rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
    {children}
  </div>
);

/* ── Input with icon prefix ── */
function IconInput({ icon: Icon, type = 'text', value, onValueChange, placeholder, password, ...rest }: {
  icon?: React.ElementType; type?: string; value: string;
  onValueChange: (v: string) => void; placeholder?: string; password?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      {Icon && (
        <Icon style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,.3)', pointerEvents: 'none' }} />
      )}
      <input
        type={password ? (show ? 'text' : 'password') : type}
        value={value}
        onChange={e => onValueChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: 'rgba(255,255,255,.05)',
          border: `1px solid ${focused ? 'rgba(0,255,65,.45)' : 'rgba(255,255,255,.1)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(0,255,65,.08)' : 'none',
          borderRadius: '.875rem', padding: `.7rem ${password ? '2.75rem' : '1rem'} .7rem ${Icon ? '2.75rem' : '1rem'}`,
          color: '#fff', fontSize: '.875rem', outline: 'none', transition: 'border-color .2s, box-shadow .2s',
          fontFamily: 'var(--f-body)',
        }}
        {...rest}
      />
      {password && (
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: '.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.35)', cursor: 'pointer', display: 'flex', padding: 0 }}
        >
          {show ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
        </button>
      )}
    </div>
  );
}

export default function SettingsAdminPage() {
  const [tab, setTab] = useState<TabId>('general');
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [form, setForm] = useState<Partial<SchoolSettings>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  /* Password */
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSavingPass, setIsSavingPass] = useState(false);

  /* Historia */
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(true);
  const [milestoneForm, setMilestoneForm] = useState({ year: '', event: '' });
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [isSavingMilestone, setIsSavingMilestone] = useState(false);

  const loadMilestones = () => {
    setIsLoadingMilestones(true);
    milestonesApi.getAll().then(r => setMilestones(r.data)).catch(() => {}).finally(() => setIsLoadingMilestones(false));
  };
  useEffect(() => { loadMilestones(); }, []);

  useEffect(() => {
    settingsApi.getSettings().then(res => { setSettings(res.data); setForm(res.data); })
      .catch(() => toast('Hitilafu ya kupakia mipangilio', 'error'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let updatedLogoUrl = form.logoUrl;
      if (logoFile) {
        const fd = new FormData(); fd.append('logo', logoFile);
        const logoRes = await settingsApi.uploadLogo(fd);
        updatedLogoUrl = logoRes.data.logoUrl;
      }

      // Merge: original settings + form edits + new logoUrl, then strip 'id'
      const payload = { ...settings, ...form, ...(updatedLogoUrl ? { logoUrl: updatedLogoUrl } : {}) };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...payloadWithoutId } = payload as SchoolSettings & { id?: string };

      await settingsApi.updateSettings(payloadWithoutId);
      // Update local state so future saves are consistent
      setSettings(s => ({ ...s, ...payloadWithoutId } as SchoolSettings));
      if (updatedLogoUrl) setForm(p => ({ ...p, logoUrl: updatedLogoUrl }));
      toast('Mipangilio imehifadhiwa ✓', 'success');
    } catch (e: unknown) {
      const errMsg = (e as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error
        || (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Hitilafu imetokea. Hakikisha sehemu zote za lazima zimejazwa.';
      toast(errMsg, 'error');
    } finally { setIsSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) { toast('Jaza nyanja zote', 'warning'); return; }
    if (passForm.newPassword !== passForm.confirmPassword) { toast('Nywila mpya hazifanani', 'error'); return; }
    if (passForm.newPassword.length < 8) { toast('Nywila iwe na herufi 8 au zaidi', 'warning'); return; }
    setIsSavingPass(true);
    try {
      await authApi.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast('Nywila imebadilishwa ✓', 'success');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: unknown) {
      toast((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Hitilafu imetokea', 'error');
    } finally { setIsSavingPass(false); }
  };

  const handleSaveMilestone = async () => {
    if (!milestoneForm.year.trim() || !milestoneForm.event.trim()) { toast('Jaza mwaka na tukio', 'warning'); return; }
    setIsSavingMilestone(true);
    try {
      if (editingMilestoneId) {
        await milestonesApi.update(editingMilestoneId, milestoneForm);
        toast('Tukio limesasishwa ✓', 'success');
      } else {
        await milestonesApi.create({ ...milestoneForm, order: milestones.length });
        toast('Tukio limeongezwa ✓', 'success');
      }
      setMilestoneForm({ year: '', event: '' }); setEditingMilestoneId(null); loadMilestones();
    } catch (e: unknown) {
      toast((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Hitilafu imetokea', 'error');
    } finally { setIsSavingMilestone(false); }
  };

  const f = (key: keyof SchoolSettings) => (v: string) => setForm(p => ({ ...p, [key]: v }));

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem', padding: '5rem', color: 'rgba(255,255,255,.4)' }}>
      <Loader2 style={{ width: 22, height: 22, animation: 'spin 1s linear infinite' }} />
      <span>Inapakia mipangilio...</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <AdminPageHeader
        title="Mipangilio"
        subtitle="Simamia taarifa za shule na mfumo"
        actions={tab !== 'security' && tab !== 'history' ? (
          <BtnPrimary onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Inahifadhi...</> : <><Save style={{ width: 15, height: 15 }} />Hifadhi</>}
          </BtnPrimary>
        ) : undefined}
      />

      {/* Layout: sidebar + content on desktop */}
      <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: '1fr', alignItems: 'start' }}>
        {/* Tab navigation — horizontal on mobile, left sidebar on desktop */}
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '1rem', padding: '.5rem', display: 'flex', gap: '.25rem', flexWrap: 'wrap' }}>
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={active ? 'settings-tab active' : 'settings-tab'}
                style={{ flex: '1 1 auto', justifyContent: 'center' }}
              >
                <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: .2 }}
          >
            {/* ── Jumla ── */}
            {tab === 'general' && (
              <Section>
                {/* Logo */}
                <div>
                  <p style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', marginBottom: '.875rem' }}>Logo ya Shule</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '1rem', border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {(logoPreview || settings?.logoUrl)
                        ? <Image src={logoPreview || settings!.logoUrl!} alt="Logo" width={80} height={80} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                        : <School style={{ width: 32, height: 32, color: 'rgba(255,255,255,.2)' }} />
                      }
                    </div>
                    <div>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.5rem 1rem', background: 'rgba(0,255,65,.08)', border: '1px solid rgba(0,255,65,.25)', borderRadius: '.75rem', fontSize: '.8125rem', fontWeight: 700, color: '#00FF41', transition: 'all .2s' }}>
                        <Plus style={{ width: 14, height: 14 }} />Chagua Picha
                        <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                      </label>
                      <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.35)', marginTop: '.4rem' }}>PNG, JPG, SVG — 200×200px inayopendekezwa</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
                  <AdminField label="Jina la Shule"><IconInput icon={School} value={form.schoolName || ''} onValueChange={f('schoolName')} placeholder="Jina la Shule yako" /></AdminField>
                  <AdminField label="Kauli Mbiu (Motto)"><AdminInput value={form.motto || ''} onChange={e => setForm(p => ({ ...p, motto: e.target.value }))} placeholder="Mfano: Elimu ni Ufunguo..." /></AdminField>
                  <AdminField label="Mkurugenzi/Mwalimu Mkuu"><IconInput icon={Users} value={form.principal || ''} onValueChange={f('principal')} placeholder="Jina kamili" /></AdminField>
                  <AdminField label="Mwaka wa Kuanzishwa"><AdminInput value={form.founded || ''} onChange={e => setForm(p => ({ ...p, founded: e.target.value }))} placeholder="Mfano: 1990" /></AdminField>
                  <AdminField label="Kiwango cha Ufaulu (NECTA)"><IconInput icon={Award} value={form.nectaPassRate || ''} onValueChange={f('nectaPassRate')} placeholder="Mfano: 95%" /></AdminField>
                </div>
                <AdminField label="Kuhusu Shule">
                  <AdminTextarea value={form.about || ''} onChange={e => setForm(p => ({ ...p, about: e.target.value }))} rows={4} placeholder="Maelezo kuhusu shule yako..." />
                </AdminField>
              </Section>
            )}

            {/* ── Mawasiliano ── */}
            {tab === 'contact' && (
              <Section>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
                  <AdminField label="Simu"><IconInput icon={Phone} type="tel" value={form.phone || ''} onValueChange={f('phone')} placeholder="+255 777 000 000" /></AdminField>
                  <AdminField label="Barua Pepe"><IconInput icon={Mail} type="email" value={form.email || ''} onValueChange={f('email')} placeholder="info@shule.ac.tz" /></AdminField>
                  <AdminField label="Tovuti"><IconInput icon={Globe} type="url" value={form.website || ''} onValueChange={f('website')} placeholder="https://shule.ac.tz" /></AdminField>
                  <AdminField label="WhatsApp"><IconInput icon={MessageCircle} type="tel" value={form.whatsapp || ''} onValueChange={f('whatsapp')} placeholder="+255 777 000 000" /></AdminField>
                </div>
                <AdminField label="Anwani">
                  <div style={{ position: 'relative' }}>
                    <MapPin style={{ position: 'absolute', left: '1rem', top: '1rem', width: 16, height: 16, color: 'rgba(255,255,255,.3)', pointerEvents: 'none' }} />
                    <AdminTextarea
                      value={form.address || ''}
                      onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                      rows={3}
                      placeholder="Anwani kamili ya shule..."
                      style={{ paddingLeft: '2.75rem' }}
                    />
                  </div>
                </AdminField>
              </Section>
            )}

            {/* ── Mitandao ── */}
            {tab === 'social' && (
              <Section>
                <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.4)' }}>Ongeza viungo vya mitandao ya kijamii (inayoanza na https://)</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
                  <AdminField label="Facebook"><IconInput icon={Link2} type="url" value={form.facebook || ''} onValueChange={f('facebook')} placeholder="https://facebook.com/shule" /></AdminField>
                  <AdminField label="Twitter / X"><IconInput icon={AtSign} type="url" value={form.twitter || ''} onValueChange={f('twitter')} placeholder="https://twitter.com/shule" /></AdminField>
                  <AdminField label="Instagram"><IconInput icon={AtSign} type="url" value={form.instagram || ''} onValueChange={f('instagram')} placeholder="https://instagram.com/shule" /></AdminField>
                  <AdminField label="YouTube"><IconInput icon={Globe} type="url" value={form.youtube || ''} onValueChange={f('youtube')} placeholder="https://youtube.com/@shule" /></AdminField>
                </div>
              </Section>
            )}

            {/* ── Historia ── */}
            {tab === 'history' && (
              <Section>
                <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.4)' }}>Matukio haya yanaonekana kwenye ukurasa wa &quot;Kuhusu Sisi&quot;. Yataonekana kwa mpangilio wa mwaka.</p>

                {/* Add / Edit form */}
                <div style={{ background: 'rgba(0,255,65,.04)', border: '1px solid rgba(0,255,65,.15)', borderRadius: '.875rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontSize: '.8125rem', fontWeight: 700, color: '#00FF41' }}>
                    {editingMilestoneId ? 'Hariri Tukio' : 'Ongeza Tukio Jipya'}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '.875rem' }}>
                    <AdminInput
                      value={milestoneForm.year}
                      onChange={e => setMilestoneForm(p => ({ ...p, year: e.target.value }))}
                      placeholder="Mwaka (1990)"
                    />
                    <AdminInput
                      value={milestoneForm.event}
                      onChange={e => setMilestoneForm(p => ({ ...p, event: e.target.value }))}
                      placeholder="Maelezo ya tukio..."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '.625rem' }}>
                    <BtnPrimary onClick={handleSaveMilestone} disabled={isSavingMilestone}>
                      {isSavingMilestone ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> : editingMilestoneId ? <Pencil style={{ width: 14, height: 14 }} /> : <Plus style={{ width: 14, height: 14 }} />}
                      {editingMilestoneId ? 'Hifadhi Mabadiliko' : 'Ongeza'}
                    </BtnPrimary>
                    {editingMilestoneId && (
                      <BtnSecondary onClick={() => { setEditingMilestoneId(null); setMilestoneForm({ year: '', event: '' }); }}>
                        <X style={{ width: 14, height: 14 }} />Ghairi
                      </BtnSecondary>
                    )}
                  </div>
                </div>

                {/* List */}
                {isLoadingMilestones ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.625rem', padding: '2rem', color: 'rgba(255,255,255,.35)' }}>
                    <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />Inapakia...
                  </div>
                ) : milestones.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '.875rem', textAlign: 'center', padding: '2rem' }}>Hakuna matukio bado. Ongeza la kwanza hapo juu.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
                    {milestones.map(m => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '.875rem', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '.875rem', padding: '.875rem' }}>
                        <span className="badge badge-success" style={{ flexShrink: 0, marginTop: '.1rem' }}>{m.year}</span>
                        <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.7)', flex: 1 }}>{m.event}</p>
                        <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
                          <IconBtn onClick={() => { setEditingMilestoneId(m.id); setMilestoneForm({ year: m.year, event: m.event }); }} title="Hariri" aria-label="Hariri">
                            <Pencil style={{ width: 12, height: 12 }} />
                          </IconBtn>
                          <IconBtn color="danger" onClick={() => milestonesApi.delete(m.id).then(loadMilestones).catch(() => toast('Hitilafu', 'error'))} title="Futa" aria-label="Futa">
                            <Trash2 style={{ width: 12, height: 12 }} />
                          </IconBtn>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {/* ── Usalama ── */}
            {tab === 'security' && (
              <Section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', color: 'rgba(255,255,255,.55)', marginBottom: '.5rem' }}>
                  <Lock style={{ width: 16, height: 16, color: '#00FF41' }} />
                  <p style={{ fontSize: '.875rem', fontWeight: 600 }}>Badilisha nywila ya akaunti yako</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 440 }}>
                  <AdminField label="Nywila ya Sasa">
                    <IconInput icon={Lock} password value={passForm.currentPassword} onValueChange={v => setPassForm(p => ({ ...p, currentPassword: v }))} placeholder="••••••••" />
                  </AdminField>
                  <AdminField label="Nywila Mpya">
                    <IconInput icon={Lock} password value={passForm.newPassword} onValueChange={v => setPassForm(p => ({ ...p, newPassword: v }))} placeholder="Angalau herufi 8" />
                  </AdminField>
                  <AdminField label="Thibitisha Nywila Mpya">
                    <IconInput icon={Lock} password value={passForm.confirmPassword} onValueChange={v => setPassForm(p => ({ ...p, confirmPassword: v }))} placeholder="••••••••" />
                  </AdminField>
                  <BtnPrimary onClick={handlePasswordChange} disabled={isSavingPass} style={{ width: '100%', justifyContent: 'center' }}>
                    {isSavingPass ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Inabadilisha...</> : <><Lock style={{ width: 15, height: 15 }} />Badilisha Nywila</>}
                  </BtnPrimary>
                </div>
              </Section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
