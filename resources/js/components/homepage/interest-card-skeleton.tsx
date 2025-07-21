export function InterestCardSkeleton() {
  return (
    <div className="group cursor-pointer animate-pulse">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="h-[200px] sm:h-[300px] md:h-[400px] w-full bg-gray-200"></div>
        <div className="p-6 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
}
