import {
  TABS_FLUJO_ASIGNACION,
  TABS_FLUJO_CON_ALERTA,
} from "@maximilian/shared/constants/pages/Coordinador/flujo-asignaciones.constants";
import type { ConteoTabsFlujoAsignacion, TabFlujoAsignacion } from "@maximilian/shared/types/flujo-informe.type";

interface PropsCustomTabsFlujoAsignacion {
  tabActiva: TabFlujoAsignacion;
  conteos?: ConteoTabsFlujoAsignacion;
  onCambiarTab: (tab: TabFlujoAsignacion) => void;
}

export function CustomTabsFlujoAsignacion({ tabActiva, conteos, onCambiarTab }: PropsCustomTabsFlujoAsignacion) {
  const descripcionActiva = TABS_FLUJO_ASIGNACION.find((tab) => tab.id === tabActiva)?.descripcion;

  return (
    <div className="space-y-2">
      {/* La línea base va como sombra interior y no como border-b + -mb-px: con overflow-x-auto ese 1px
          desbordaba en vertical y aparecía un scroll. En móvil las tabs se desplazan sin barra visible. */}
      <div className="flex gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain shadow-[inset_0_-1px_0_0_var(--color-gray-200)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS_FLUJO_ASIGNACION.map((tab) => {
          const estaActiva = tab.id === tabActiva;
          const cantidad = conteos?.[tab.id] ?? 0;
          const resaltarAlerta = TABS_FLUJO_CON_ALERTA.includes(tab.id) && cantidad > 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onCambiarTab(tab.id)}
              className={`flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition-all hover:text-brand-wine sm:px-4 ${
                estaActiva ? "border-brand-wine text-brand-wine" : "border-transparent text-slate-500"
              }`}
            >
              {tab.etiqueta}
              <span
                className={`min-w-6 rounded-full px-2 py-0.5 text-xs ${
                  resaltarAlerta
                    ? "bg-brand-wine text-brand-white"
                    : estaActiva
                      ? "bg-brand-wine/10 text-brand-wine"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {cantidad}
              </span>
            </button>
          );
        })}
      </div>
      {descripcionActiva ? <p className="text-sm text-slate-500">{descripcionActiva}</p> : null}
    </div>
  );
}
