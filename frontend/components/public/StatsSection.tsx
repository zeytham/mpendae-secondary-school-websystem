import { studentsApi, teachersApi, settingsApi } from '@/lib/api';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { GraduationCap, Users, Clock, Star } from 'lucide-react';

export default async function StatsSection() {
  let studentTotal = 0, graduated = 0, teacherCount = 0, years = 0;

  try {
    const [studentsRes, teachersRes, settingsRes] = await Promise.all([
      studentsApi.getStats(),
      teachersApi.getAll(),
      settingsApi.getSettings(),
    ]);
    studentTotal = studentsRes.data.total ?? 0;
    graduated    = studentsRes.data.graduated ?? 0;
    const td = teachersRes.data.teachers || teachersRes.data;
    teacherCount = Array.isArray(td) ? td.length : 0;
    const founded = parseInt(settingsRes.data.founded, 10);
    years = !isNaN(founded) ? new Date().getFullYear() - founded : 0;
  } catch { /* 0 is better than fake numbers */ }

  const stats = [
    { value: studentTotal, suffix: '+', label: 'Wanafunzi Wanaosoma', icon: Users,          desc: 'Jumla ya wanafunzi' },
    { value: teacherCount, suffix: '',  label: 'Walimu Wataalamu',    icon: Star,          desc: 'Wasomi waliofunzwa' },
    { value: years,        suffix: '',  label: 'Miaka ya Uzoefu',     icon: Clock,         desc: 'Tangu tulipoanzishwa' },
    { value: graduated,    suffix: '+', label: 'Wahitimu Waliofaulu', icon: GraduationCap, desc: 'Waliohitimu kwa ufaulu' },
  ];

  return (
    <div className="relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg,rgba(15,26,11,0.5) 0%,rgba(5,8,5,0.35) 100%)' }}>

      {/* Top glow line */}
      <div className="divider-lime" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />

      {/* Decorative year watermark */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        fontFamily: 'var(--f-display)', fontSize: 'clamp(6rem,18vw,14rem)',
        fontWeight: 900, color: 'rgba(0,255,65,.018)', pointerEvents: 'none',
        lineHeight: 1, userSelect: 'none', letterSpacing: '-.04em', whiteSpace: 'nowrap',
      }}>
        1990
      </div>

      <div className="site-container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }} className="stats-grid-4">
          <style>{`
            @media(min-width:1024px){ .stats-grid-4 { grid-template-columns:repeat(4,1fr) !important; } }
          `}</style>
          {stats.map(({ value, suffix, label, icon: Icon, desc }, i) => (
            <div
              key={label}
              className="stats-cell group"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '1rem',
                padding: 'clamp(2.5rem,5vw,5rem) 1.5rem',
                textAlign: 'center',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Hover lime flash */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,255,65,.04) 0%, transparent 70%)', opacity: 0, transition: 'opacity .35s' }} className="stat-hover-glow" />

              {/* Icon with ring */}
              <div style={{ position: 'relative' }}>
                {/* Animated ring on hover */}
                <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '1.5px solid rgba(0,255,65,0)', transition: 'border-color .3s, transform .3s' }} className="stat-ring" />
                <div
                  style={{
                    width: 44, height: 44, borderRadius: '.875rem',
                    background: 'rgba(0,255,65,.08)', border: '1px solid rgba(0,255,65,.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .3s ease',
                  }}
                >
                  <Icon style={{ color: 'var(--c-lime)', width: 20, height: 20 }} />
                </div>
              </div>

              {/* Number — editorial large */}
              <div style={{
                fontFamily: 'var(--f-display)',
                fontSize: 'clamp(3rem,6.5vw,5rem)',
                fontWeight: 700,
                lineHeight: 1,
                color: '#fff',
                letterSpacing: '-0.03em',
                fontStyle: 'italic',
              }}>
                <AnimatedCounter target={value} suffix={suffix} duration={2000} />
              </div>

              {/* Label */}
              <div>
                <p style={{ fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.2em', color: 'var(--c-lime)', marginBottom: '.25rem' }}>
                  {label}
                </p>
                <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.28)' }}>
                  {desc}
                </p>
              </div>

              {/* Decorative corner accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderTop: '1px solid rgba(0,255,65,.15)', borderLeft: '1px solid rgba(0,255,65,.15)' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="divider-lime" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />

      <style>{`
        .stats-cell:hover .stat-hover-glow { opacity:1 !important; }
        .stats-cell:hover .stat-ring { border-color:rgba(0,255,65,.25) !important; transform:scale(1.2); }
      `}</style>
    </div>
  );
}