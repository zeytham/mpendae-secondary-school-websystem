export function NewsSkeleton() {
  return (
    <div className="grid-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="h-48 animate-pulse bg-white/5" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
            <div className="h-4 w-full animate-pulse rounded bg-white/5" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EventsSkeleton() {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-[rgba(34,197,94,0.12)] bg-white/[0.03] p-4">
          <div className="h-14 w-14 flex-shrink-0 animate-pulse rounded-xl bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white/5" />
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="stat-card">
          <div className="mx-auto mb-3 h-12 w-12 animate-pulse rounded-xl bg-white/5" />
          <div className="mx-auto mb-2 h-7 w-16 animate-pulse rounded bg-white/5" />
          <div className="mx-auto h-3.5 w-20 animate-pulse rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}