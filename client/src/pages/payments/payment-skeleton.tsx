export const PaymentsSkeleton = () => (
  <div className="space-y-4">
    {/* Summary cards skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 dark:border-white/10 p-4"
        >
          <div className="h-3 w-20 rounded bg-gray-200 dark:bg-white/10 animate-pulse mb-3" />
          <div className="h-7 w-28 rounded bg-gray-200 dark:bg-white/10 animate-pulse mb-1" />
          <div className="h-2.5 w-16 rounded bg-gray-100 dark:bg-white/5 animate-pulse" />
        </div>
      ))}
    </div>
    {/* Table skeleton */}
    <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 dark:border-white/5 last:border-0"
        >
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            <div className="h-3 w-20 rounded bg-gray-100 dark:bg-white/5 animate-pulse" />
          </div>
          <div className="h-5 w-24 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);
