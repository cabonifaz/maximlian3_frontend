import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { ESTADO_COMPLEMENTO_VISUAL } from "@maximilian/shared/constants/components/common/estado-complemento.constants";
import { COLUMNAS_COMPLEMENTOS_COORDINADOR } from "@maximilian/shared/constants/pages/Coordinador/flujo-asignaciones.constants";
import type { Complemento } from "@maximilian/shared/types/flujo-informe.type";
import { formatearFechaHoraCorta } from "@maximilian/shared/utils/flujo-informe.util";

interface PropsCustomTablaComplementosCoordinador {
  complementos?: Complemento[];
  estaCargando: boolean;
  hayError: boolean;
  onReintentar: () => void;
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  onCambiarPagina: (pagina: number) => void;
}

export function CustomTablaComplementosCoordinador({
  complementos,
  estaCargando,
  hayError,
  onReintentar,
  paginaActual,
  totalPaginas,
  totalRegistros,
  onCambiarPagina,
}: PropsCustomTablaComplementosCoordinador) {
  const renderizarFila = (complemento: Complemento) => {
    const estado = ESTADO_COMPLEMENTO_VISUAL[complemento.estado];

    return (
      <>
        <td className="px-4 py-4 text-sm font-semibold text-brand-black">
          <span className="block truncate" title={complemento.investigado}>{complemento.investigado}</span>
          <span className="text-xs font-normal text-slate-400">{complemento.pais} · {complemento.idioma}</span>
        </td>
        <td className="px-4 py-4 text-sm text-slate-600">
          <span className="block">{complemento.tipoInformeBase === "complemento" ? "Complemento" : "Informe"} #{complemento.idInformeBase}</span>
          <span className="text-xs text-slate-400">{complemento.clienteBase}</span>
        </td>
        <td className="px-4 py-4 text-sm text-slate-600">{complemento.clienteDestino}</td>
        <td className="px-4 py-4 text-sm text-slate-600">{complemento.traductor}</td>
        <td className="px-4 py-4 text-center">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estado.clase}`}>{estado.etiqueta}</span>
        </td>
        <td className="px-4 py-4 text-xs text-slate-500">{formatearFechaHoraCorta(complemento.fechaCreacion)}</td>
        <td className="px-4 py-4 text-xs text-slate-500">{formatearFechaHoraCorta(complemento.fechaModificacion)}</td>
      </>
    );
  };

  return (
    <CustomTabla
      columns={COLUMNAS_COMPLEMENTOS_COORDINADOR}
      data={complementos}
      getId={(complemento) => complemento.idComplemento}
      renderRow={renderizarFila}
      isLoading={estaCargando}
      isError={hayError}
      onRetry={onReintentar}
      emptyMessage="No hay complementos registrados."
      errorMessage="Error al cargar los complementos"
      paginaActual={paginaActual}
      totalPages={totalPaginas}
      totalRecords={totalRegistros}
      onPageChange={onCambiarPagina}
      entityLabel="complementos"
    />
  );
}
