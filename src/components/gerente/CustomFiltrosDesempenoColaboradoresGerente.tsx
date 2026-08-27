import { useMemo } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomFiltroRangoFechas } from "@maximilian/components/common/CustomFiltroRangoFechas";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { servicioUsuario } from "@maximilian/services/usuario.service";
import {
  ID_ROL_ANALISTA_DESEMPENO_DASHBOARD,
  ID_ROL_TRADUCTOR_DESEMPENO_DASHBOARD,
  OPCIONES_ROL_COLABORADOR_DESEMPENO_DASHBOARD,
} from "@maximilian/shared/constants/components/gerente/desempeno-colaboradores-dashboard.constants";
import type { FiltrosDesempenoColaboradoresDashboard } from "@maximilian/shared/types/dashboard.type";

interface PropsCustomFiltrosDesempenoColaboradoresGerente {
  filtros: FiltrosDesempenoColaboradoresDashboard;
  fechasInvalidas: boolean;
  onActualizarFiltros: (patch: Partial<FiltrosDesempenoColaboradoresDashboard>) => void;
  onLimpiarFiltros: () => void;
}

export function CustomFiltrosDesempenoColaboradoresGerente({
  filtros,
  fechasInvalidas,
  onActualizarFiltros,
  onLimpiarFiltros,
}: PropsCustomFiltrosDesempenoColaboradoresGerente) {
  const hayFiltrosActivos = Object.values(filtros).some((valor) => valor !== undefined);

  const { data: colaboradores = [] } = useQuery({
    queryKey: [
      "usuarios",
      "listaCortaDashboard",
      ID_ROL_ANALISTA_DESEMPENO_DASHBOARD,
      ID_ROL_TRADUCTOR_DESEMPENO_DASHBOARD,
    ],
    queryFn: () =>
      servicioUsuario.listaCortaDashboard({
        idsRolFiltro: [ID_ROL_ANALISTA_DESEMPENO_DASHBOARD, ID_ROL_TRADUCTOR_DESEMPENO_DASHBOARD],
      }),
    staleTime: Infinity,
  });

  const opcionesColaborador = useMemo(
    () =>
      colaboradores.map((colaborador) => ({
        idEmpresa: 0,
        idTablaMaestra: null,
        idMaestro: 0,
        descripcion: "",
        num1: colaborador.idUsuario,
        num2: null,
        num3: null,
        string1: colaborador.nombreCompleto,
        string2: null,
        string3: null,
        date1: null,
        date2: null,
        date3: null,
      })),
    [colaboradores],
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

      <div className="grid gap-3 sm:grid-cols-2">
        <CustomSelectorBuscable
          label="Colaborador"
          options={opcionesColaborador}
          value={filtros.idColaborador}
          onChange={(idColaborador) => onActualizarFiltros({ idColaborador })}
          onClear={() => onActualizarFiltros({ idColaborador: undefined })}
          optional
          mostrarTextoOpcionalEnLabel={false}
          etiquetaOpcionVacia="Todos"
          placeholder="Todos"
        />

        <CustomSelectorBuscable
          label="Rol"
          options={OPCIONES_ROL_COLABORADOR_DESEMPENO_DASHBOARD}
          value={filtros.idRol}
          onChange={(idRol) => onActualizarFiltros({ idRol })}
          onClear={() => onActualizarFiltros({ idRol: undefined })}
          optional
          mostrarTextoOpcionalEnLabel={false}
          etiquetaOpcionVacia="Todos"
          placeholder="Todos"
        />
      </div>
    </div>
  );
}
