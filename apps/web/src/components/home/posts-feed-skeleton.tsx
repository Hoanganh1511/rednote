export function PostsFeedSkeleton() {
  return (
    <section aria-hidden>
      <div className="mb-2 h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-0 max-sm:-mx-3 sm:mx-0 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border bg-card max-sm:rounded-none max-sm:border-x-0">
            <div className="flex items-start gap-2 px-2.5 pt-2">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
                <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-6 w-14 shrink-0 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="space-y-1.5 px-2.5 py-1.5">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
            </div>
            <div className="mx-2.5 mb-2 h-[132px] animate-pulse rounded-md bg-muted sm:mx-3 sm:h-[120px] sm:rounded-lg" />
            <div className="flex justify-end gap-3 px-2 pb-2">
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
