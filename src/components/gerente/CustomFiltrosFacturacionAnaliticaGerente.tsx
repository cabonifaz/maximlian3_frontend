import { useMemo } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomFiltroRangoFechas } from "@maximilian/components/common/CustomFiltroRangoFechas";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { servicioCliente } from "@maximilian/services/cliente.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import {
  OPCIONES_ESTADO_BUCKET_FACTURACION_ANALITICA_DASHBOARD,
  OPCIONES_TIPO_DOCUMENTO_MAESTRO_FACTURACION_ANALITICA_DASHBOARD,
} from "@maximilian/shared/constants/components/gerente/facturacion-analitica-dashboard.constants";
import type { FiltrosFacturacionAnaliticaDashboard } from "@maximilian/shared/types/dashboard.type";

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

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes", "listaCorta"],
    queryFn: () => servicioCliente.listaCorta(),
    staleTime: Infinity,
  });

  const opcionesCliente = useMemo(
    () =>
      clientes.map((cliente) => ({
        idEmpresa: 0,
        idTablaMaestra: null,
        idMaestro: 0,
        descripcion: "",
        num1: cliente.idCliente,
        num2: null,
        num3: null,
        string1: cliente.nombreCliente,
        string2: null,
        string3: null,
        date1: null,
        date2: null,
        date3: null,
      })),
    [clientes],
  );

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
        <CustomSelectorBuscable
          label="Cliente"
          options={opcionesCliente}
          value={filtros.idCliente}
          onChange={(idCliente) => onActualizarFiltros({ idCliente })}
          onClear={() => onActualizarFiltros({ idCliente: undefined })}
          optional
          mostrarTextoOpcionalEnLabel={false}
          etiquetaOpcionVacia="Todos"
          placeholder="Todos"
        />

        <CustomSelectorBuscable
          label="País"
          idMaster={TablaMaestraId.PAIS}
          value={filtros.idPais}
          onChange={(idPais) => onActualizarFiltros({ idPais })}
          onClear={() => onActualizarFiltros({ idPais: undefined })}
          optional
          mostrarTextoOpcionalEnLabel={false}
          etiquetaOpcionVacia="Todos"
          placeholder="Todos"
        />

        <CustomSelectorBuscable
          label="Trámite"
          idMaster={TablaMaestraId.TIPO_TRAMITE}
          value={filtros.idTipoTramite}
          onChange={(idTipoTramite) => onActualizarFiltros({ idTipoTramite })}
          onClear={() => onActualizarFiltros({ idTipoTramite: undefined })}
          optional
          mostrarTextoOpcionalEnLabel={false}
          etiquetaOpcionVacia="Todos"
          placeholder="Todos"
        />

        <div>
          <CustomLabel className="mb-1.5 block text-xs">Estado</CustomLabel>
          <select
            className={CLASE_SELECT_FILTRO}
            value={filtros.idEstadoBucket ?? ""}
            onChange={(evento) =>
              onActualizarFiltros({
                idEstadoBucket: evento.target.value ? Number(evento.target.value) : undefined,
              })
            }
          >
            <option value="">Todos</option>
            {OPCIONES_ESTADO_BUCKET_FACTURACION_ANALITICA_DASHBOARD.map((opcion) => (
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
            value={filtros.idTipoDocumentoMaestro ?? ""}
            onChange={(evento) =>
              onActualizarFiltros({
                idTipoDocumentoMaestro: evento.target.value ? Number(evento.target.value) : undefined,
              })
            }
          >
            <option value="">Todos</option>
            {OPCIONES_TIPO_DOCUMENTO_MAESTRO_FACTURACION_ANALITICA_DASHBOARD.map((opcion) => (
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
