import { FilePlus2 } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { COLUMNAS_REPOSITORIO_INFORMES } from "@maximilian/shared/constants/pages/Traductor/informes-traductor.constants";
import type { InformeRepositorio } from "@maximilian/shared/types/flujo-informe.type";
import { formatearFechaHoraCorta } from "@maximilian/shared/utils/flujo-informe.util";

interface PropsCustomTablaRepositorioInformes {
  informes?: InformeRepositorio[];
  estaCargando: boolean;
  hayError: boolean;
  onReintentar: () => void;
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  onCambiarPagina: (pagina: number) => void;
  onCrearComplemento: (informe: InformeRepositorio) => void;
}

export function CustomTablaRepositorioInformes({
  informes,
  estaCargando,
  hayError,
  onReintentar,
  paginaActual,
  totalPaginas,
  totalRegistros,
  onCambiarPagina,
  onCrearComplemento,
}: PropsCustomTablaRepositorioInformes) {
  const renderizarFila = (informe: InformeRepositorio) => (
    <>
      <td className="px-4 py-4 text-sm font-semibold text-brand-black">
        <span className="block truncate" title={informe.investigado}>{informe.investigado}</span>
        <span className="text-xs font-normal text-slate-400">{informe.pais}</span>
      </td>
      <td className="px-4 py-4">
        <span className="flex flex-wrap gap-1">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            informe.tipo === "complemento" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
          }`}
          >
            {informe.tipo === "complemento" ? "Complemento" : "Informe"}
          </span>
          {informe.esUltimaVersion ? (
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">Última versión</span>
          ) : null}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">{informe.cliente}</td>
      <td className="px-4 py-4 text-sm text-slate-600">{informe.idioma}</td>
      <td className="px-4 py-4 text-sm text-slate-600">{informe.traductor}</td>
      <td className="px-4 py-4 text-xs text-slate-500">{formatearFechaHoraCorta(informe.fechaAprobacion)}</td>
      <td className="px-4 py-4">
        <div className="flex justify-end">
          <CustomButton variant="wine" size="sm" onClick={() => onCrearComplemento(informe)}>
            <FilePlus2 size={14} />
            Crear complemento
          </CustomButton>
        </div>
      </td>
    </>
  );

  return (
    <CustomTabla
      columns={COLUMNAS_REPOSITORIO_INFORMES}
      data={informes}
      getId={(informe) => informe.idInforme}
      renderRow={renderizarFila}
      isLoading={estaCargando}
      isError={hayError}
      onRetry={onReintentar}
      emptyMessage="No se encontraron informes."
      errorMessage="Error al cargar el repositorio de informes"
      paginaActual={paginaActual}
      totalPages={totalPaginas}
      totalRecords={totalRegistros}
      onPageChange={onCambiarPagina}
      entityLabel="informes"
    />
  );
}
