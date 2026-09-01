import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle } from '@/types';
import { format } from 'date-fns';
import { ArrowUpRight, Clock, Newspaper } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
  size?: 'featured' | 'compact';
}

export default function NewsCard({ article, size = 'compact' }: NewsCardProps) {
  const isFeatured = size === 'featured';

  return (
    <Link
      href={`/news/${article.slug}`}
      className={`media-card group block h-full no-underline ${isFeatured ? 'flex flex-col lg:flex-row' : 'flex flex-col'}`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden ${
          isFeatured
            ? 'h-56 lg:h-auto lg:min-h-[300px] lg:w-[45%] flex-shrink-0'
            : 'h-44'
        }`}
        style={{ background: 'linear-gradient(135deg, rgba(17,26,13,1), rgba(0,255,0,0.08))' }}
      >
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-600 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Newspaper
              className="text-white/10"
              style={{ width: isFeatured ? 56 : 32, height: isFeatured ? 56 : 32 }}
            />
          </div>
        )}
        <div className="media-hero__overlay" />
        {article.category && <span className="photo-badge">{article.category}</span>}
      </div>

      {/* Content */}
      <div
        className={`flex flex-1 flex-col ${isFeatured ? 'p-7 lg:p-9' : 'p-5'}`}
        style={{ background: 'rgba(10,15,8,0.95)' }}
      >
        {/* Date */}
        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <Clock className="h-3 w-3" />
          {article.publishedAt ? format(new Date(article.publishedAt), 'dd MMM yyyy') : ''}
        </p>

        {/* Title */}
        <h3
          className={`mb-3 flex-1 font-bold leading-snug text-white ${
            isFeatured ? 'line-clamp-3 text-xl lg:text-2xl' : 'line-clamp-2 text-sm'
          }`}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {article.title}
        </h3>

        {/* Excerpt (featured only) */}
        {isFeatured && article.excerpt && (
          <p
            className="mb-5 line-clamp-3 text-sm leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {article.excerpt}
          </p>
        )}

        {/* Divider */}
        <div className="mb-4 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,255,0,0.15), transparent)' }} />

        {/* CTA */}
        <span
          className={`inline-flex items-center gap-1.5 font-bold transition-all duration-300 group-hover:gap-2.5 ${isFeatured ? 'text-sm' : 'text-xs'}`}
          style={{ color: 'var(--lime-500)' }}
        >
          Soma Zaidi
          <ArrowUpRight
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            style={{ width: isFeatured ? 15 : 13, height: isFeatured ? 15 : 13 }}
          />
        </span>
      </div>
    </Link>
  );
}