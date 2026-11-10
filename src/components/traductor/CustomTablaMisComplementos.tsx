import { FileText, Send } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import {
  ACCION_EDITOR_COMPLEMENTO,
  ESTADO_COMPLEMENTO_VISUAL,
  ESTADOS_COMPLEMENTO_ENVIABLES,
} from "@maximilian/shared/constants/components/common/estado-complemento.constants";
import { COLUMNAS_MIS_COMPLEMENTOS } from "@maximilian/shared/constants/pages/Traductor/informes-traductor.constants";
import type { Complemento } from "@maximilian/shared/types/flujo-informe.type";
import { formatearFechaHoraCorta } from "@maximilian/shared/utils/flujo-informe.util";

interface PropsCustomTablaMisComplementos {
  complementos?: Complemento[];
  estaCargando: boolean;
  hayError: boolean;
  onReintentar: () => void;
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  onCambiarPagina: (pagina: number) => void;
  idComplementoEnviando?: number;
  onEnviarAprobacion: (idComplemento: number) => void;
  onAbrir: (complemento: Complemento) => void;
}

export function CustomTablaMisComplementos({
  complementos,
  estaCargando,
  hayError,
  onReintentar,
  paginaActual,
  totalPaginas,
  totalRegistros,
  onCambiarPagina,
  idComplementoEnviando,
  onEnviarAprobacion,
  onAbrir,
}: PropsCustomTablaMisComplementos) {
  const renderizarFila = (complemento: Complemento) => {
    const estado = ESTADO_COMPLEMENTO_VISUAL[complemento.estado];
    const accionEditor = ACCION_EDITOR_COMPLEMENTO[complemento.estado];

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
        <td className="px-4 py-4 text-center">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estado.clase}`}>{estado.etiqueta}</span>
        </td>
        <td className="px-4 py-4 text-xs text-slate-500">{formatearFechaHoraCorta(complemento.fechaModificacion)}</td>
        <td className="px-4 py-4">
          <div className="flex flex-wrap justify-end gap-2">
            <CustomButton variant="wine" size="sm" onClick={() => onAbrir(complemento)}>
              <FileText size={14} />
              {accionEditor.etiqueta}
            </CustomButton>
            {ESTADOS_COMPLEMENTO_ENVIABLES.includes(complemento.estado) ? (
              <CustomButton
                variant="secondary"
                size="sm"
                onClick={() => onEnviarAprobacion(complemento.idComplemento)}
                loading={idComplementoEnviando === complemento.idComplemento}
                loadingText="Enviando..."
              >
                <Send size={14} />
                Enviar a aprobación
              </CustomButton>
            ) : null}
          </div>
        </td>
      </>
    );
  };

  return (
    <CustomTabla
      columns={COLUMNAS_MIS_COMPLEMENTOS}
      data={complementos}
      getId={(complemento) => complemento.idComplemento}
      renderRow={renderizarFila}
      isLoading={estaCargando}
      isError={hayError}
      onRetry={onReintentar}
      emptyMessage="Aún no has creado complementos."
      errorMessage="Error al cargar tus complementos"
      paginaActual={paginaActual}
      totalPages={totalPaginas}
      totalRecords={totalRegistros}
      onPageChange={onCambiarPagina}
      entityLabel="complementos"
    />
  );
}
