export const Skeleton = () => (
  <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 dark:border-white/5 last:border-0"
      >
        <div className="h-6 w-12 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
        </div>
        <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
        <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
      </div>
    ))}
  </div>
);
