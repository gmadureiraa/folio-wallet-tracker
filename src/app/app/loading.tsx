export default function AppLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Sidebar skeleton */}
      <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-200 p-5 hidden md:block">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse" />
          <div className="space-y-1.5">
            <div className="w-12 h-3 rounded bg-gray-100 animate-pulse" />
            <div className="w-16 h-2 rounded bg-gray-50 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-4 h-4 rounded bg-gray-100 animate-pulse" />
              <div className="h-3 rounded bg-gray-100 animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
            </div>
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header skeleton */}
        <header className="flex items-center gap-3 px-6 py-2.5 bg-white border-b border-gray-200">
          <div className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse" />
          <div className="w-px h-5 bg-gray-200" />
          <div className="space-y-1">
            <div className="w-16 h-2 rounded bg-gray-50 animate-pulse" />
            <div className="w-24 h-4 rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="flex-1" />
          <div className="w-20 h-7 rounded-lg bg-gray-100 animate-pulse" />
          <div className="w-24 h-7 rounded-lg bg-gray-900/10 animate-pulse" />
        </header>

        {/* Dashboard skeleton */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="w-20 h-2.5 rounded bg-gray-100 animate-pulse mb-3" />
                <div className="w-28 h-6 rounded bg-gray-100 animate-pulse mb-2" />
                <div className="w-16 h-3 rounded bg-gray-50 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-6">
            <div className="w-24 h-3 rounded bg-gray-100 animate-pulse mb-4" />
            <div className="h-48 rounded-xl bg-gray-50 animate-pulse" />
          </div>

          {/* Table placeholder */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="w-20 h-3 rounded bg-gray-100 animate-pulse mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                  <div className="flex-1 h-3 rounded bg-gray-100 animate-pulse" />
                  <div className="w-16 h-3 rounded bg-gray-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
