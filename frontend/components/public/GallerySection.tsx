import Link from 'next/link';
import { ArrowRight, Images } from 'lucide-react';
import { galleryApi } from '@/lib/api';
import GalleryGrid from './GalleryGrid';
import { GalleryPhoto } from '@/types';

export default async function GallerySection() {
  let gallery: GalleryPhoto[] = [];
  try {
    const res = await galleryApi.getAll();
    gallery = res.data;
  } catch {
    return null;
  }

  if (gallery.length === 0) return null;

  return (
    <section className="section-padding relative overflow-hidden">
      {/* BG decoration */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,0,0.04) 0%, transparent 55%)' }}
      />

      <div className="site-container relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-label">Picha</span>
            <h2 className="section-title">
              Mazingira ya{' '}
              <em style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--lime-500)' }}>
                Shuleni
              </em>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-loose" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Glimpse ya maisha ya kila siku katika kampasi yetu nzuri.
            </p>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm font-bold no-underline transition-opacity hover:opacity-70"
            style={{ color: 'var(--lime-500)' }}
          >
            <Images className="h-4 w-4" /> Picha Zote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <GalleryGrid photos={gallery} />

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <Link href="/gallery" className="btn-secondary inline-flex rounded-full px-8">
            Tazama Picha Zote
          </Link>
        </div>
      </div>
    </section>
  );
}