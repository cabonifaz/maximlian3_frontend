import { UserPlus, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { ETIQUETA_ROL_FLUJO } from "@maximilian/shared/constants/pages/Coordinador/flujo-asignaciones.constants";
import type { RolFlujoAsignacion } from "@maximilian/shared/types/flujo-informe.type";

interface PropsCustomBarraAsignacionMasivaFlujo {
  cantidadSeleccionados: number;
  rol: RolFlujoAsignacion;
  onAsignar: () => void;
  onLimpiar: () => void;
}

export function CustomBarraAsignacionMasivaFlujo({
  cantidadSeleccionados,
  rol,
  onAsignar,
  onLimpiar,
}: PropsCustomBarraAsignacionMasivaFlujo) {
  if (cantidadSeleccionados === 0) return null;

  return (
    <div className="sticky top-2 z-20 flex flex-col gap-3 rounded-2xl border border-brand-wine/20 bg-brand-white px-4 py-3 shadow-lg shadow-brand-wine/10 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-700">
        <span className="font-bold text-brand-wine">{cantidadSeleccionados}</span>
        {cantidadSeleccionados === 1 ? " pedido seleccionado" : " pedidos seleccionados"}
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <CustomButton type="button" variant="secondary" size="sm" onClick={onLimpiar}>
          <X size={14} />
          Quitar selección
        </CustomButton>
        <CustomButton type="button" variant="wine" size="sm" onClick={onAsignar}>
          <UserPlus size={14} />
          {`Asignar ${ETIQUETA_ROL_FLUJO[rol]}`}
        </CustomButton>
      </div>
    </div>
  );
}
