import { useMemo } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomFiltroRangoFechas } from "@maximilian/components/common/CustomFiltroRangoFechas";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { servicioCliente } from "@maximilian/services/cliente.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import type { FiltrosFacturacionAnaliticaDashboard } from "@maximilian/shared/types/dashboard.type";

interface PropsCustomFiltrosFacturacionAnaliticaGerente {
  filtros: FiltrosFacturacionAnaliticaDashboard;
  fechasInvalidas: boolean;
  onActualizarFiltros: (patch: Partial<FiltrosFacturacionAnaliticaDashboard>) => void;
  onLimpiarFiltros: () => void;
}

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

        <CustomSelectorBuscable
          label="Estado"
          idMaster={TablaMaestraId.ESTADO_DOCUMENTO_ELECTRONICO}
          value={filtros.idEstadoBucket}
          onChange={(idEstadoBucket) => onActualizarFiltros({ idEstadoBucket })}
          onClear={() => onActualizarFiltros({ idEstadoBucket: undefined })}
          optional
          mostrarTextoOpcionalEnLabel={false}
          etiquetaOpcionVacia="Todos"
          placeholder="Todos"
        />

        <CustomSelectorBuscable
          label="Comprobante"
          idMaster={TablaMaestraId.TIPO_DOCUMENTO_COMPROBANTE}
          value={filtros.idTipoDocumentoMaestro}
          onChange={(idTipoDocumentoMaestro) => onActualizarFiltros({ idTipoDocumentoMaestro })}
          onClear={() => onActualizarFiltros({ idTipoDocumentoMaestro: undefined })}
          optional
          mostrarTextoOpcionalEnLabel={false}
          etiquetaOpcionVacia="Todos"
          placeholder="Todos"
          obtenerEtiquetaOpcion={(opcion) => opcion.string2 ?? opcion.string1 ?? ""}
        />
      </div>
    </div>
  );
}
