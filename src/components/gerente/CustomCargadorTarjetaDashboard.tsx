import type { PropsCargadorTarjetaDashboard } from "@maximilian/shared/types/dashboard.type";

export function CustomCargadorTarjetaDashboard({
  titulo,
  variante,
}: PropsCargadorTarjetaDashboard) {
  const esTabla = variante === "tabla";
  const esResumen = variante === "resumen";

  return (
    <section
      className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-busy="true"
      role="status"
    >
      <div className="mb-5 h-4 w-44 animate-pulse rounded bg-slate-200" />
      <span className="sr-only">Cargando {titulo}</span>

      {esTabla ? (
        <div className="space-y-3">
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          {[1, 2, 3].map((fila) => (
            <div key={fila} className="grid grid-cols-4 gap-4 border-t border-slate-100 py-3">
              {[1, 2, 3, 4].map((columna) => (
                <div key={columna} className="h-5 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid gap-5 ${esResumen ? "sm:grid-cols-4" : "sm:grid-cols-2"}`}>
          {(esResumen ? [1, 2, 3, 4] : [1, 2]).map((bloque) => (
            <div key={bloque} className="space-y-3">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-8 w-28 animate-pulse rounded bg-slate-200" />
              {!esResumen ? <div className="h-20 animate-pulse rounded bg-slate-100" /> : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
