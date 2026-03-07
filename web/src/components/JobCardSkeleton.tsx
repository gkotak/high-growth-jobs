const JobCardSkeleton = () => (
  <div className="animate-pulse rounded-lg border border-border bg-card p-4 sm:p-5">
    <div className="flex gap-3 sm:gap-4">
      <div className="h-10 w-10 shrink-0 rounded-lg bg-muted sm:h-12 sm:w-12" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-16 rounded-full bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  </div>
);

export default JobCardSkeleton;
