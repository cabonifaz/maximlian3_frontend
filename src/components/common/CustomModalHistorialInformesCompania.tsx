import { AlertCircle, Eye, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import { CustomModalVistaPreviaInforme } from "@maximilian/components/common/CustomModalVistaPreviaInforme";
import { CustomSelectorFecha } from "@maximilian/components/common/CustomSelectorFecha";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { useHistorialInformesCompania } from "@maximilian/hooks/useHistorialInformesCompania";
import type { CompaniaNoticiaDetalleListaItem } from "@maximilian/shared/types/compania-noticia-detalle.type";

interface PropsCustomModalHistorialInformesCompania {
  empresa: CompaniaNoticiaDetalleListaItem | null;
  onCerrar: () => void;
}

export function CustomModalHistorialInformesCompania({
  empresa,
  onCerrar,
}: PropsCustomModalHistorialInformesCompania) {
  const {
    paginaActual,
    setPaginaActual,
    informeVistaPrevia,
    setInformeVistaPrevia,
    idsIdiomaFiltro,
    fechaInicioFiltro,
    fechaFinFiltro,
    fechasInvalidas,
    datosInvestigacionVacios,
    opcionesIdioma,
    respuestaHistorial,
    estaCargandoHistorial,
    hayErrorHistorial,
    recargarHistorial,
    informes,
    cambiarIdiomaFiltro,
    cambiarFechaInicioFiltro,
    cambiarFechaFinFiltro,
    limpiarFechaInicioFiltro,
    limpiarFechaFinFiltro,
    formatearFechaHistorial,
  } = useHistorialInformesCompania(empresa);

  if (!empresa) return null;

  return (
    <div className="fixed left-0 top-0 z-[70] flex h-[100dvh] w-[100dvw] items-center justify-center overflow-hidden bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-brand-white shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-8 py-6">
          <div className="min-w-0 space-y-1">
            <h2 className="text-xl font-bold text-brand-black">
              Historial de informes
            </h2>
            <p className="truncate text-sm font-semibold text-gray-500">
              {empresa.razonSocial}
            </p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={20} className="text-gray-400" />
          </CustomButton>
        </div>

        <div className="min-h-0 overflow-y-auto px-8 py-6">
          <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex items-end gap-1.5">
                <div className="w-40">
                  <CustomSelectorFecha
                    label="Fecha inicio"
                    value={fechaInicioFiltro}
                    onChange={cambiarFechaInicioFiltro}
                    placeholder="Desde"
                  />
                </div>
                {fechaInicioFiltro ? (
                  <CustomButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={limpiarFechaInicioFiltro}
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
                    value={fechaFinFiltro}
                    onChange={cambiarFechaFinFiltro}
                    placeholder="Hasta"
                  />
                </div>
                {fechaFinFiltro ? (
                  <CustomButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={limpiarFechaFinFiltro}
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
          </div>
          <CustomTabla
            columns={[
              { label: "ID Informe", width: "12%" },
              { label: "Pedido", width: "10%" },
              { label: "Nombre", width: "25%" },
              { label: "Fecha", width: "17%" },
              {
                label: (
                  <CustomEncabezadoFiltroTabla
                    titulo="Idioma"
                    opciones={opcionesIdioma}
                    valores={idsIdiomaFiltro}
                    onChange={cambiarIdiomaFiltro}
                  />
                ),
                width: "18%",
              },
              { label: "Ver informe", className: "text-center", width: "18%" },
            ]}
            data={informes}
            getId={(informe) => informe.idInforme}
            isLoading={estaCargandoHistorial}
            isError={hayErrorHistorial}
            onRetry={() => void recargarHistorial()}
            emptyMessage="No hay informes registrados para esta empresa."
            errorMessage="No se pudo cargar el historial de informes."
            paginaActual={paginaActual}
            totalPages={Math.max(respuestaHistorial?.totalPaginas ?? 1, 1)}
            totalRecords={respuestaHistorial?.totalRegistros ?? 0}
            onPageChange={setPaginaActual}
            entityLabel="informes"
            renderRow={(informe) => (
              <>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">
                  {informe.idInforme}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                  {informe.idPedido}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                  <span className="block truncate" title={informe.nombre}>
                    {informe.nombre}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                  {formatearFechaHistorial(informe.fecha)}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                  <span className="block truncate" title={informe.idioma}>
                    {informe.idioma}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <CustomButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setInformeVistaPrevia(informe)}
                  >
                    <Eye size={14} />
                    Ver
                  </CustomButton>
                </td>
              </>
            )}
          />
        </div>
      </div>
      <CustomModalVistaPreviaInforme
        estaAbierto={Boolean(informeVistaPrevia)}
        datosInvestigacion={datosInvestigacionVacios}
        encabezado={{
          pais: empresa.pais || "-",
          fecha: "-",
          tipoSolicitud: informeVistaPrevia?.nombre ?? "-",
          analista: "-",
          traductor: "-",
        }}
        idInforme={informeVistaPrevia?.idInforme}
        idPedido={informeVistaPrevia?.idPedido}
        mostrarInformeTraducido
        onCerrar={() => setInformeVistaPrevia(null)}
      />
    </div>
  );
}
