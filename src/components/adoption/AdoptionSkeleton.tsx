export function AdoptionSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-3xl overflow-hidden bg-white/5 animate-pulse">
          <div className="aspect-[3/4] bg-white/10" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-white/10 rounded-full w-2/3" />
            <div className="h-3 bg-white/5 rounded-full w-1/2" />
            <div className="flex gap-1 mt-2">
              <div className="h-5 w-14 bg-white/5 rounded-full" />
              <div className="h-5 w-14 bg-white/5 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function AdoptionDetailSkeleton() {
  return (
    <div className="animate-pulse pb-32">
      <div className="w-full aspect-square bg-white/10" />
      <div className="px-4 py-6 space-y-4">
        <div className="h-8 bg-white/10 rounded-full w-1/2" />
        <div className="h-4 bg-white/5 rounded-full w-full" />
        <div className="h-4 bg-white/5 rounded-full w-3/4" />
        <div className="h-32 bg-white/5 rounded-2xl" />
      </div>
    </div>
  )
}
