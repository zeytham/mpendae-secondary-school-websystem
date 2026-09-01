import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { settingsApi } from '@/lib/api';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon fill="#030705" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);

export default async function Footer() {
  const currentYear = new Date().getFullYear();

  let settings: {
    phone?: string; email?: string; address?: string; whatsapp?: string;
    facebook?: string; twitter?: string; instagram?: string; youtube?: string;
  } = {};
  try {
    const res = await settingsApi.getSettings();
    settings = res.data;
  } catch {
    // Mawasiliano hayataonyeshwa kama settings hazipo
  }

  const socialLinks = [
    { href: settings.facebook, label: 'Facebook',  Icon: FacebookIcon },
    { href: settings.twitter,  label: 'Twitter',   Icon: TwitterIcon },
    { href: settings.instagram,label: 'Instagram', Icon: InstagramIcon },
    { href: settings.youtube,  label: 'YouTube',   Icon: YoutubeIcon },
  ].filter((s) => !!s.href);

  const footerLinks = [
    { group: 'Viungo', items: [
      { label: 'Kuhusu Sisi',  href: '/about' },
      { label: 'Masomo',       href: '/academics' },
      { label: 'Walimu Wetu', href: '/staff' },
      { label: 'Habari',       href: '/news' },
      { label: 'Matukio',      href: '/events' },
      { label: 'Picha',        href: '/gallery' },
    ]},
    { group: 'Usajili', items: [
      { label: 'Omba Usajili',   href: '/admissions' },
      { label: 'Masharti',       href: '/admissions#requirements' },
      { label: 'Tarehe',         href: '/admissions#dates' },
      { label: 'Maswali',        href: '/admissions#faq' },
      { label: 'Wasiliana Nasi', href: '/contact' },
    ]},
  ];

  return (
    <footer className="footer-root">
      {/* Top lime accent line */}
      <div className="footer-accent-line" />

      <div className="site-container py-16" style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* ── Branding ── */}
          <div className="lg:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <div className="footer-logo-badge">
                <svg viewBox="0 0 44 44" fill="none" style={{ width: 28, height: 28 }}>
                  <path d="M22 3L6 10V22C6 31 13 38.5 22 41C31 38.5 38 31 38 22V10L22 3Z" fill="#00FF41" />
                  <text x="22" y="28" textAnchor="middle" fontFamily="var(--f-head)" fontWeight="900" fontSize="15" fill="#050805">M</text>
                </svg>
              </div>
              <div>
                <p className="footer-school-name">Mpendae Secondary</p>
                <p className="footer-school-sub">School — Zanzibar</p>
              </div>
            </div>

            <p className="footer-desc">
              Shule ya sekondari inayotoa elimu bora tangu 1990. Elimu yetu inabadilisha maisha na kujenga taifa.
            </p>

            <p className="footer-motto">
              &quot;Elimu ni Ufunguo wa Maisha&quot;
            </p>

            {/* Newsletter */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: 'rgba(255,255,255,.35)', marginBottom: '.625rem' }}>
                Pata Habari Zetu
              </p>
              <div className="footer-newsletter">
                <input type="email" placeholder="barua@pepe.com" aria-label="Barua pepe" />
                <button type="button" aria-label="Jiandikishe">Jiandikishe →</button>
              </div>
            </div>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2.5">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="footer-social-icon"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ── Link Groups ── */}
          {footerLinks.map(({ group, items }) => (
            <div key={group}>
              <h3 className="footer-group-heading">{group}</h3>
              <ul className="space-y-3">
                {items.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      <span className="footer-link-dot" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* ── Contact ── */}
          <div>
            <h3 className="footer-group-heading">Mawasiliano</h3>
            <ul className="space-y-4">
              {settings.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 footer-icon" />
                  <span className="footer-contact-text">{settings.address}</span>
                </li>
              )}
              {settings.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0 footer-icon" />
                  <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="footer-contact-link">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 flex-shrink-0 footer-icon" />
                  <a href={`mailto:${settings.email}`} className="footer-contact-link break-all">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.whatsapp && (
                <li className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 flex-shrink-0 footer-icon" />
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-contact-link"
                  >
                    WhatsApp Sasa
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Mpendae Secondary School. Haki zote zimehifadhiwa.{' '}
            <span style={{ color: 'rgba(255,255,255,.18)' }}>· Built with ❤️ in Zanzibar, Tanzania</span>
          </p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="footer-admin-link">
              Mlango wa Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative watermark */}
      <div className="footer-watermark">MPENDAE</div>
    </footer>
  );
}
