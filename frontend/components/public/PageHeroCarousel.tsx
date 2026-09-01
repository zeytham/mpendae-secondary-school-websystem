'use client';

import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useRef, ReactNode } from 'react';

interface PageHeroCarouselProps {
  images: string[];
  children: ReactNode;
  className?: string;
}

export default function PageHeroCarousel({ images, children, className = '' }: PageHeroCarouselProps) {
  const autoplay = useRef(Autoplay({ delay: 4500, stopOnInteraction: false }));
  const [emblaRef] = useEmblaCarousel({ loop: true }, [autoplay.current]);
  const hasImages = images.length > 0;

  return (
    <div className={`media-hero page-hero ${className}`}>
      {hasImages ? (
        <div className="absolute inset-0" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((src, i) => (
              <div key={i} className="relative h-full min-w-0 flex-[0_0_100%]">
                <Image src={src} alt="" fill priority={i === 0} className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#071A0E] via-[rgba(13,50,32,0.7)] to-[#071A0E]" />
      )}
      <div className="media-hero__overlay" />
      {!hasImages && <div className="pattern-waves pointer-events-none absolute inset-0 opacity-60" />}
      <div className="site-container relative z-10 text-center">
        {children}
      </div>
    </div>
  );
}