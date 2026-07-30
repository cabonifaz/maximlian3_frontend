import { AlertCircle, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomSelectorFecha } from "@maximilian/components/common/CustomSelectorFecha";

interface PropsCustomFiltroRangoFechas {
  fechaInicio?: Date;
  fechaFin?: Date;
  fechasInvalidas?: boolean;
  className?: string;
  onFechaInicioChange: (fecha: Date | undefined) => void;
  onFechaFinChange: (fecha: Date | undefined) => void;
  onLimpiarFechaInicio: () => void;
  onLimpiarFechaFin: () => void;
}

export function CustomFiltroRangoFechas({
  fechaInicio,
  fechaFin,
  fechasInvalidas = false,
  className,
  onFechaInicioChange,
  onFechaFinChange,
  onLimpiarFechaInicio,
  onLimpiarFechaFin,
}: PropsCustomFiltroRangoFechas) {
  return (
    <div
      className={`flex flex-col gap-2 sm:flex-row sm:items-end ${className ?? ""}`}
    >
      <div className="flex items-end gap-1.5">
        <div className="w-40">
          <CustomSelectorFecha
            label="Fecha inicio"
            value={fechaInicio}
            onChange={onFechaInicioChange}
            placeholder="Desde"
          />
        </div>
        {fechaInicio ? (
          <CustomButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={onLimpiarFechaInicio}
            className="mb-0.5 h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
            aria-label="Limpiar fecha inicio"
            title="Limpiar fecha inicio"
          >
            <X size={14} />
          </CustomButton>
        ) : null}
      </div>
      <div className="flex items-end gap-1.5">
        <div className="w-40">
          <CustomSelectorFecha
            label="Fecha fin"
            value={fechaFin}
            onChange={onFechaFinChange}
            placeholder="Hasta"
          />
        </div>
        {fechaFin ? (
          <CustomButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={onLimpiarFechaFin}
            className="mb-0.5 h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
            aria-label="Limpiar fecha fin"
            title="Limpiar fecha fin"
          >
            <X size={14} />
          </CustomButton>
        ) : null}
      </div>
      {fechasInvalidas ? (
        <div className="flex min-h-8 items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 sm:ml-auto">
          <AlertCircle size={14} className="shrink-0" />
          <span>La fecha inicio no puede ser mayor que la fecha fin.</span>
        </div>
      ) : null}
    </div>
  );
}
