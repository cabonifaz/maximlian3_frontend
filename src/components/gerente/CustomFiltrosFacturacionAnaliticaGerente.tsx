import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomFiltroRangoFechas } from "@maximilian/components/common/CustomFiltroRangoFechas";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import {
  OPCIONES_CLIENTE_FACTURACION_ANALITICA_DASHBOARD,
  OPCIONES_ESTADO_FACTURACION_ANALITICA_DASHBOARD,
  OPCIONES_PAIS_FACTURACION_ANALITICA_DASHBOARD,
  OPCIONES_TIPO_COMPROBANTE_FACTURACION_ANALITICA_DASHBOARD,
  OPCIONES_TRAMITE_FACTURACION_ANALITICA_DASHBOARD,
} from "@maximilian/shared/constants/components/gerente/facturacion-analitica-dashboard.constants";
import type {
  EstadoFacturaAnaliticaDashboard,
  FiltrosFacturacionAnaliticaDashboard,
  TramiteFacturacionAnaliticaDashboard,
} from "@maximilian/shared/types/dashboard.type";

interface PropsCustomFiltrosFacturacionAnaliticaGerente {
  filtros: FiltrosFacturacionAnaliticaDashboard;
  fechasInvalidas: boolean;
  onActualizarFiltros: (patch: Partial<FiltrosFacturacionAnaliticaDashboard>) => void;
  onLimpiarFiltros: () => void;
}

const CLASE_SELECT_FILTRO =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-brand-wine/40 focus:ring-2 focus:ring-brand-wine/10";

export function CustomFiltrosFacturacionAnaliticaGerente({
  filtros,
  fechasInvalidas,
  onActualizarFiltros,
  onLimpiarFiltros,
}: PropsCustomFiltrosFacturacionAnaliticaGerente) {
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

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <div>
          <CustomLabel className="mb-1.5 block text-xs">Cliente</CustomLabel>
          <select
            className={CLASE_SELECT_FILTRO}
            value={filtros.idCliente ?? ""}
            onChange={(evento) =>
              onActualizarFiltros({
                idCliente: evento.target.value ? Number(evento.target.value) : undefined,
              })
            }
          >
            <option value="">Todos</option>
            {OPCIONES_CLIENTE_FACTURACION_ANALITICA_DASHBOARD.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div>
          <CustomLabel className="mb-1.5 block text-xs">Estado</CustomLabel>
          <select
            className={CLASE_SELECT_FILTRO}
            value={filtros.estado ?? ""}
            onChange={(evento) =>
              onActualizarFiltros({
                estado: (evento.target.value || undefined) as
                  | EstadoFacturaAnaliticaDashboard
                  | undefined,
              })
            }
          >
            <option value="">Todos</option>
            {OPCIONES_ESTADO_FACTURACION_ANALITICA_DASHBOARD.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div>
          <CustomLabel className="mb-1.5 block text-xs">País</CustomLabel>
          <select
            className={CLASE_SELECT_FILTRO}
            value={filtros.pais ?? ""}
            onChange={(evento) => onActualizarFiltros({ pais: evento.target.value || undefined })}
          >
            <option value="">Todos</option>
            {OPCIONES_PAIS_FACTURACION_ANALITICA_DASHBOARD.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div>
          <CustomLabel className="mb-1.5 block text-xs">Trámite</CustomLabel>
          <select
            className={CLASE_SELECT_FILTRO}
            value={filtros.tramite ?? ""}
            onChange={(evento) =>
              onActualizarFiltros({
                tramite: (evento.target.value || undefined) as
                  | TramiteFacturacionAnaliticaDashboard
                  | undefined,
              })
            }
          >
            <option value="">Todos</option>
            {OPCIONES_TRAMITE_FACTURACION_ANALITICA_DASHBOARD.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div>
          <CustomLabel className="mb-1.5 block text-xs">Comprobante</CustomLabel>
          <select
            className={CLASE_SELECT_FILTRO}
            value={filtros.tipoComprobante ?? ""}
            onChange={(evento) =>
              onActualizarFiltros({
                tipoComprobante: (evento.target.value || undefined) as
                  FiltrosFacturacionAnaliticaDashboard["tipoComprobante"],
              })
            }
          >
            <option value="">Todos</option>
            {OPCIONES_TIPO_COMPROBANTE_FACTURACION_ANALITICA_DASHBOARD.map((opcion) => (
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
