function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[20px] bg-border/50 ${className}`}
    />
  );
}

export default function SkeletonLoader() {
  return (
    <div className="mx-auto w-full max-w-[1200px]" aria-busy="true" aria-label="Loading dashboard">
      {/* Greeting skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 rounded-[8px]" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Skeleton className="h-[140px]" />
        <Skeleton className="h-[140px]" />
        <Skeleton className="h-[140px]" />
        <Skeleton className="h-[140px]" />
      </div>

      {/* Charts row */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-[280px] md:col-span-2" />
        <Skeleton className="h-[280px]" />
      </div>

      {/* Heatmap + badges row */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-[200px] md:col-span-2" />
        <Skeleton className="h-[200px]" />
      </div>
    </div>
  );
}

export { Skeleton };
