// Skeleton shown while the catalogue page is being server-rendered.
export default function CatalogLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <div>
        <div className="h-8 w-52 animate-pulse rounded-lg bg-white/5" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-white/5" />
      </div>
      <div className="glass h-[60px] animate-pulse rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="panel overflow-hidden rounded-2xl">
            <div className="aspect-square animate-pulse bg-white/5" />
            <div className="h-[52px] animate-pulse bg-white/[0.03]" />
          </div>
        ))}
      </div>
    </div>
  );
}
