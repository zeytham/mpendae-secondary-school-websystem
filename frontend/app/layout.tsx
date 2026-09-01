import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/Toast';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mpendaesecondary.ac.tz'),
  title: {
    default: 'Mpendae Secondary School — Zanzibar',
    template: '%s | Mpendae Secondary School',
  },
  description:
    'Mpendae Secondary School ni shule ya sekondari inayotoa elimu bora katika Zanzibar, Tanzania. Jiandikishe leo.',
  keywords: ['Mpendae', 'Secondary School', 'Zanzibar', 'Tanzania', 'Elimu', 'School'],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'sw_TZ',
    title: 'Mpendae Secondary School — Zanzibar',
    description: 'Shule ya sekondari inayotoa elimu bora tangu 1990',
    siteName: 'Mpendae Secondary School',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sw" className={`${plusJakarta.variable} ${inter.variable} ${fraunces.variable}`}>
      <body style={{ background: '#050805', color: '#ffffff', WebkitFontSmoothing: 'antialiased' }}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}