export default function PlanLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-4">
        {/* Back link skeleton */}
        <div className="w-20 h-3 rounded bg-gray-100 animate-pulse mb-8" />

        {/* Logo skeleton */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse" />
          <div className="w-32 h-5 rounded bg-gray-100 animate-pulse" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-16">
        {/* Description skeleton */}
        <div className="w-full h-3 rounded bg-gray-100 animate-pulse mb-2" />
        <div className="w-3/4 h-3 rounded bg-gray-100 animate-pulse mb-8" />

        {/* Plan cards */}
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="w-20 h-4 rounded bg-gray-100 animate-pulse" />
                  <div className="w-28 h-3 rounded bg-gray-50 animate-pulse" />
                </div>
                <div className="w-14 h-7 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Features skeleton */}
        <div className="pt-8 space-y-2.5">
          <div className="w-24 h-2.5 rounded bg-gray-100 animate-pulse mb-4" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="h-3 rounded bg-gray-100 animate-pulse" style={{ width: `${50 + Math.random() * 30}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
