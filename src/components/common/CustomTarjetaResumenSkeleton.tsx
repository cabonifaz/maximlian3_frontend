export function CustomTarjetaResumenSkeleton() {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-3 w-16 animate-pulse rounded-full bg-slate-100" />
      </div>
      <div className="h-8 w-12 animate-pulse rounded-full bg-slate-100" />
    </article>
  );
}
