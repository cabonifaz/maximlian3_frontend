import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomFiltroRangoFechas } from "@maximilian/components/common/CustomFiltroRangoFechas";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import {
  OPCIONES_COLABORADOR_DESEMPENO_DASHBOARD,
  OPCIONES_ROL_COLABORADOR_DESEMPENO_DASHBOARD,
} from "@maximilian/shared/constants/components/gerente/desempeno-colaboradores-dashboard.constants";
import type {
  FiltrosDesempenoColaboradoresDashboard,
  RolColaboradorDesempenoDashboard,
} from "@maximilian/shared/types/dashboard.type";

interface PropsCustomFiltrosDesempenoColaboradoresGerente {
  filtros: FiltrosDesempenoColaboradoresDashboard;
  fechasInvalidas: boolean;
  onActualizarFiltros: (patch: Partial<FiltrosDesempenoColaboradoresDashboard>) => void;
  onLimpiarFiltros: () => void;
}

const CLASE_SELECT_FILTRO =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-brand-wine/40 focus:ring-2 focus:ring-brand-wine/10";

export function CustomFiltrosDesempenoColaboradoresGerente({
  filtros,
  fechasInvalidas,
  onActualizarFiltros,
  onLimpiarFiltros,
}: PropsCustomFiltrosDesempenoColaboradoresGerente) {
  const hayFiltrosActivos = Object.values(filtros).some((valor) => valor !== undefined);

  return (
    <div className="mb-5 space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <CustomFiltroRangoFechas
          fechaInicio={filtros.fechaDesde}
          fechaFin={filtros.fechaHasta}
          fechasInvalidas={fechasInvalidas}
          onFechaInicioChange={(fecha) => onActualizarFiltros({ fechaDesde: fecha })}
          onFechaFinChange={(fecha) => onActualizarFiltros({ fechaHasta: fecha })}
          onLimpiarFechaInicio={() => onActualizarFiltros({ fechaDesde: undefined })}
          onLimpiarFechaFin={() => onActualizarFiltros({ fechaHasta: undefined })}
        />
        {hayFiltrosActivos ? (
          <CustomButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLimpiarFiltros}
            className="text-slate-500 hover:text-slate-800"
          >
            <X size={14} />
            Limpiar filtros
          </CustomButton>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <CustomLabel className="mb-1.5 block text-xs">Colaborador</CustomLabel>
          <select
            className={CLASE_SELECT_FILTRO}
            value={filtros.idColaborador ?? ""}
            onChange={(evento) =>
              onActualizarFiltros({
                idColaborador: evento.target.value ? Number(evento.target.value) : undefined,
              })
            }
          >
            <option value="">Todos</option>
            {OPCIONES_COLABORADOR_DESEMPENO_DASHBOARD.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div>
          <CustomLabel className="mb-1.5 block text-xs">Rol</CustomLabel>
          <select
            className={CLASE_SELECT_FILTRO}
            value={filtros.rol ?? ""}
            onChange={(evento) =>
              onActualizarFiltros({
                rol: (evento.target.value || undefined) as RolColaboradorDesempenoDashboard | undefined,
              })
            }
          >
            <option value="">Todos</option>
            {OPCIONES_ROL_COLABORADOR_DESEMPENO_DASHBOARD.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
