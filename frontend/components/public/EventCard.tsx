import { Event } from '@/types';
import { format } from 'date-fns';
import { MapPin, Clock } from 'lucide-react';

export default function EventCard({ event }: { event: Event }) {
  const start = new Date(event.startDate);

  const statusLabel =
    event.status === 'UPCOMING' ? 'Inakuja'
    : event.status === 'ONGOING' ? 'Inaendelea'
    : 'Ilipita';

  const statusClass =
    event.status === 'UPCOMING' ? 'badge-warning'
    : event.status === 'ONGOING' ? 'badge-success'
    : 'badge-neutral';

  return (
    <div className="timeline-item">
      {/* Date block */}
      <div className="timeline-date flex-shrink-0">
        <span className="text-xl font-bold leading-none" style={{ color: 'var(--lime-500)' }}>
          {format(start, 'dd')}
        </span>
        <span className="text-[0.6rem] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {format(start, 'MMM')}
        </span>
      </div>

      {/* Content — uses CSS class for hover (server component safe) */}
      <div className="event-card-body">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <h4 className="line-clamp-2 text-sm font-semibold leading-snug" style={{ color: 'var(--white)' }}>
            {event.title}
          </h4>
          <span className={`badge ${statusClass} flex-shrink-0 text-[0.65rem]`}>
            {statusLabel}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4">
          {event.location && (
            <p className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <MapPin className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--lime-500)' }} />
              {event.location}
            </p>
          )}
          <p className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <Clock className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--lime-500)' }} />
            {format(start, 'HH:mm')}
          </p>
        </div>
      </div>
    </div>
  );
}