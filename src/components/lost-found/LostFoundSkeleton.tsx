export function LostFoundSkeleton() {
  return (
    <div className="space-y-4 px-4 py-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden bg-white/5 border border-white/10 animate-pulse"
        >
          {/* Image skeleton */}
          <div className="aspect-square bg-white/10" />

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-5 bg-white/10 rounded-lg w-3/4" />
            <div className="h-4 bg-white/10 rounded-lg w-1/2" />

            <div className="space-y-2 pt-2">
              <div className="h-3 bg-white/10 rounded-lg w-full" />
              <div className="h-3 bg-white/10 rounded-lg w-2/3" />
              <div className="h-3 bg-white/10 rounded-lg w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
