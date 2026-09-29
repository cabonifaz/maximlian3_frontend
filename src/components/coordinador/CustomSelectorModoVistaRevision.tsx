import { OPCIONES_MODO_VISTA_REVISION_MIGRACION } from "@maximilian/shared/constants/pages/Coordinador/aprobacion-migraciones.constants";
import type { ModoVistaRevisionMigracion } from "@maximilian/shared/types/informe-aprobacion.type";

interface PropsCustomSelectorModoVistaRevision {
  modoVista: ModoVistaRevisionMigracion;
  onModoVistaChange: (modo: ModoVistaRevisionMigracion) => void;
}

export function CustomSelectorModoVistaRevision({
  modoVista,
  onModoVistaChange,
}: PropsCustomSelectorModoVistaRevision) {
  return (
    <div role="radiogroup" aria-label="Modo de vista" className="flex gap-1 rounded-2xl bg-gray-50 p-1">
      {OPCIONES_MODO_VISTA_REVISION_MIGRACION.map(({ id, etiqueta, icono: Icono }) => {
        const estaActivo = modoVista === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={estaActivo}
            onClick={() => onModoVistaChange(id)}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              estaActivo
                ? "bg-brand-white text-brand-black shadow-sm"
                : "cursor-pointer text-gray-600 hover:bg-gray-100/50 hover:text-gray-800"
            }`}
          >
            <Icono size={14} />
            {etiqueta}
          </button>
        );
      })}
    </div>
  );
}
