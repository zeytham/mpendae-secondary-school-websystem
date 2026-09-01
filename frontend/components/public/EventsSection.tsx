import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { eventsApi } from '@/lib/api';
import EventCard from './EventCard';
import { Event } from '@/types';

export const revalidate = 60; // sekunde 60

export default async function EventsSection() {
  let events: Event[] = [];
  let hasError = false;
  try {
    // Onyesha UPCOMING na ONGOING — zote mbili zinahusika
    const [upcomingRes, ongoingRes] = await Promise.all([
      eventsApi.getAll({ status: 'UPCOMING' }),
      eventsApi.getAll({ status: 'ONGOING' }),
    ]);
    events = [...(ongoingRes.data || []), ...(upcomingRes.data || [])].slice(0, 4);
  } catch {
    hasError = true;
  }

  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, rgba(10,15,8,0.5) 0%, rgba(17,26,13,0.4) 50%, rgba(10,15,8,0.5) 100%)' }}
    >
      {/* Side accent line */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-px"
        style={{ background: 'linear-gradient(180deg, transparent, var(--lime-500), transparent)' }}
      />

      <div className="site-container relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-label">Matukio</span>
            <h2 className="section-title">
              Matukio{' '}
              <em style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--lime-500)' }}>
                Yanayokuja
              </em>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-loose" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Shughuli, hafla na maadhimisho ya shule yetu.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-bold no-underline transition-opacity hover:opacity-70"
            style={{ color: 'var(--lime-500)' }}
          >
            Yote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Content */}
        {hasError ? (
          <div
            className="rounded-2xl py-12 text-center"
            style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>Imeshindikana kupakia matukio. Jaribu tena baadaye.</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Timeline list */}
            <div className="timeline-list">
              {events.map((event, i) => (
                <div key={event.id}>
                  <EventCard event={event} />
                  {i < events.length - 1 && (
                    <div className="timeline-connector" />
                  )}
                </div>
              ))}
            </div>

            {/* Side visual — calendar decoration */}
            <div
              className="hidden items-center justify-center rounded-3xl lg:flex"
              style={{ background: 'rgba(0,255,0,0.04)', border: '1px solid rgba(0,255,0,0.08)', minHeight: 320 }}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(0,255,0,0.1)', border: '1px solid rgba(0,255,0,0.2)' }}
                >
                  <Calendar className="h-10 w-10" style={{ color: 'var(--lime-500)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--white)' }}>Matukio {events.length} Yanayokuja</p>
                  <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Angalia ratiba kamili</p>
                </div>
                <Link href="/events" className="btn-secondary text-xs px-5 py-2.5 rounded-full">
                  Tazama Kalenda
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center">
            <div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(0,255,0,0.06)', border: '1px solid rgba(0,255,0,0.12)' }}
            >
              <Calendar className="h-9 w-9" style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)' }}>Matukio yataongezwa hivi karibuni</p>
          </div>
        )}
      </div>
    </section>
  );
}