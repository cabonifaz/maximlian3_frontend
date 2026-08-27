import { CustomChipEstado } from "@maximilian/components/common/CustomChipEstado";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import {
  COLUMNAS_TABLA_DESEMPENO_COLABORADORES_DASHBOARD,
  PALETA_AVATAR_DESEMPENO_COLABORADORES_DASHBOARD,
} from "@maximilian/shared/constants/components/gerente/desempeno-colaboradores-dashboard.constants";
import type { ResumenColaboradorDesempenoDashboard } from "@maximilian/shared/types/dashboard.type";
import { obtenerCantidadDecimales } from "@maximilian/shared/utils/numero.util";

interface PropsCustomTablaDesempenoColaboradoresGerente {
  resumenColaboradores: ResumenColaboradorDesempenoDashboard[];
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  onCambiarPagina: (pagina: number) => void;
  estaCargando: boolean;
  hayError: boolean;
  onReintentar: () => void;
}

function obtenerColorAvatarPorIndice(indice: number) {
  return (
    PALETA_AVATAR_DESEMPENO_COLABORADORES_DASHBOARD[
      indice % PALETA_AVATAR_DESEMPENO_COLABORADORES_DASHBOARD.length
    ] ?? PALETA_AVATAR_DESEMPENO_COLABORADORES_DASHBOARD[0]
  );
}

export function CustomTablaDesempenoColaboradoresGerente({
  resumenColaboradores,
  paginaActual,
  totalPaginas,
  totalRegistros,
  onCambiarPagina,
  estaCargando,
  hayError,
  onReintentar,
}: PropsCustomTablaDesempenoColaboradoresGerente) {
  return (
    <CustomTabla
      columns={COLUMNAS_TABLA_DESEMPENO_COLABORADORES_DASHBOARD}
      data={resumenColaboradores}
      getId={(colaborador) => colaborador.idColaborador}
      isLoading={estaCargando}
      isError={hayError}
      onRetry={onReintentar}
      emptyMessage="No hay colaboradores en el período seleccionado."
      errorMessage="No se pudo cargar el desempeño de los colaboradores."
      paginaActual={paginaActual}
      totalPages={Math.max(totalPaginas, 1)}
      totalRecords={totalRegistros}
      onPageChange={onCambiarPagina}
      entityLabel="colaboradores"
      cantidadFilasVisibles={Math.min(6, Math.max(resumenColaboradores.length, 1))}
      renderRow={(colaborador, indice) => {
        const color = obtenerColorAvatarPorIndice(indice);

        return (
          <>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ color: color.colorLetra, backgroundColor: color.colorFondo }}
                >
                  {colaborador.iniciales}
                </span>
                <strong className="text-xs text-slate-700">{colaborador.colaborador}</strong>
              </div>
            </td>
            <td className="px-6 py-4 text-center">
              <CustomChipEstado
                claseColor={
                  colaborador.rol === "Analista"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }
              >
                {colaborador.rol}
              </CustomChipEstado>
            </td>
            <td className="px-6 py-4 text-center text-xs font-bold text-slate-700">
              <NumberTicker value={colaborador.cantidadOrdenes} className="tracking-normal text-inherit" />
            </td>
            <td
              className="px-6 py-4 text-center text-xs font-bold"
              style={{ color: colaborador.porcentajeCumplimiento >= 80 ? "#059669" : "#dc2626" }}
            >
              <NumberTicker
                value={colaborador.porcentajeCumplimiento}
                decimalPlaces={obtenerCantidadDecimales(colaborador.porcentajeCumplimiento)}
                className="tracking-normal text-inherit"
              />
              %
            </td>
            <td className="px-6 py-4 text-center text-xs text-slate-600">
              <NumberTicker value={colaborador.cantidadInformes} className="tracking-normal text-inherit" />
            </td>
            <td className="px-6 py-4 text-center text-xs text-slate-600">
              <NumberTicker value={colaborador.cantidadTardios} className="tracking-normal text-inherit" />
            </td>
            <td className="px-6 py-4 text-center text-xs text-slate-600">
              <NumberTicker value={colaborador.cantidadObservados} className="tracking-normal text-inherit" />
            </td>
            <td className="px-6 py-4 text-center text-xs text-slate-600">
              <NumberTicker
                value={colaborador.cantidadConInformacionFinanciera}
                className="tracking-normal text-inherit"
              />
            </td>
          </>
        );
      }}
    />
  );
}
