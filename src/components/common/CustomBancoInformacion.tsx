import { type ReactNode, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  History,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { CustomBancoNoticias } from "@maximilian/components/common/CustomBancoNoticias";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomFiltroRangoFechas } from "@maximilian/components/common/CustomFiltroRangoFechas";
import { CustomModalHistorialInformesCompania } from "@maximilian/components/common/CustomModalHistorialInformesCompania";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { MultiCustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscableMultiple";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomModalDetalleCredito } from "@maximilian/components/common/CustomModalDetalleCredito";
import { useBancoInformacion } from "@maximilian/hooks/useBancoInformacion";
import {
  etiquetasPestanasBancoInformacion,
  type PestanaBancoInformacion,
} from "@maximilian/shared/constants/components/common/custom-banco-informacion.constants";
import type { CompaniaNoticiaBalanceListaItem } from "@maximilian/shared/types/compania-noticia-balance.type";
import type { CompaniaNoticiaDetalleListaItem } from "@maximilian/shared/types/compania-noticia-detalle.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

interface PropsCustomBancoInformacion {
  puedeAgregarNoticias?: boolean;
}

export function CustomBancoInformacion({
  puedeAgregarNoticias = false,
}: PropsCustomBancoInformacion) {
  const [empresaHistorial, setEmpresaHistorial] =
    useState<CompaniaNoticiaDetalleListaItem | null>(null);
  const {
    busqueda,
    busquedaConRetardo,
    cambiarActividadEconomicaEmpresaFiltro,
    cambiarBusqueda,
    cambiarEstadoCreditoFiltro,
    cambiarEstadoFinancieroFiltro,
    cambiarFechaFinCreditoFiltro,
    cambiarFechaInicioCreditoFiltro,
    cambiarPaisEmpresaFiltro,
    claveAgregarNoticia,
    empresas,
    estaCargandoCredito,
    estaCargandoEmpresas,
    exportarEmpresasMutation,
    fechaFinCreditoFiltro,
    fechaInicioCreditoFiltro,
    fechasCreditoInvalidas,
    hayErrorCredito,
    hayErrorEmpresas,
    idEstadoCreditoFiltro,
    idReporteCargandoDetalle,
    idsActividadEconomicaEmpresaFiltro,
    idsEstadoFinancieroFiltro,
    idsPaisEmpresaFiltro,
    limpiarFechaFinCreditoFiltro,
    limpiarFechaInicioCreditoFiltro,
    opcionesActividadEconomicaEmpresa,
    opcionesEstadoCredito,
    opcionesEstadoFinanciero,
    opcionesPaisEmpresa,
    paginaCredito,
    paginaEmpresas,
    pestanaActiva,
    recargarCredito,
    recargarEmpresas,
    reporteDetalle,
    reportesCredito,
    respuestaCredito,
    respuestaEmpresas,
    setClaveAgregarNoticia,
    setPaginaCredito,
    setPaginaEmpresas,
    setPestanaActiva,
    setReporteDetalle,
    verDetalleCredito,
  } = useBancoInformacion();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-950">
          Banco de Información
        </h1>
        {puedeAgregarNoticias ? (
          <CustomButton
            size="sm"
            onClick={() => setClaveAgregarNoticia((valor) => valor + 1)}
          >
            <Plus size={14} />
            Agregar Noticia
          </CustomButton>
        ) : null}
      </div>

      <div className="border-b border-slate-100">
        <div className="flex gap-8">
          {(
            Object.keys(
              etiquetasPestanasBancoInformacion,
            ) as PestanaBancoInformacion[]
          ).map((pestana) => (
            <button
              key={pestana}
              type="button"
              onClick={() => setPestanaActiva(pestana)}
              className={`border-b-2 px-1 pb-4 text-[11px] font-bold uppercase tracking-[0.16em] transition ${
                pestanaActiva === pestana
                  ? "border-slate-950 text-slate-950"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              {etiquetasPestanasBancoInformacion[pestana]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
          />
          <input
            value={busqueda}
            onChange={(event) => cambiarBusqueda(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-100 bg-white pl-11 pr-4 text-sm text-slate-600 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            placeholder={
              pestanaActiva === "empresas"
                ? "Buscar por razón social del pedido, informe, nombre comercial o documento..."
                : pestanaActiva === "credito"
                  ? "Buscar por investigado o país..."
                  : "Buscar noticias, reportes o artículos..."
            }
          />
        </label>
      </div>

      {pestanaActiva === "noticias" ? (
        <CustomBancoNoticias
          busqueda={busquedaConRetardo}
          mostrarBotonAgregar={!puedeAgregarNoticias}
          senalApertura={claveAgregarNoticia}
        />
      ) : null}
      {pestanaActiva === "credito" ? (
        <SeccionCredito
          reportes={reportesCredito}
          estaCargando={estaCargandoCredito}
          hayError={hayErrorCredito}
          opcionesEstadoFinanciero={opcionesEstadoFinanciero}
          opcionesEstado={opcionesEstadoCredito}
          idsEstadoFinancieroFiltro={idsEstadoFinancieroFiltro}
          idEstadoFiltro={idEstadoCreditoFiltro}
          fechaInicioFiltro={fechaInicioCreditoFiltro}
          fechaFinFiltro={fechaFinCreditoFiltro}
          fechasInvalidas={fechasCreditoInvalidas}
          onEstadoFinancieroFiltroChange={cambiarEstadoFinancieroFiltro}
          onEstadoFiltroChange={cambiarEstadoCreditoFiltro}
          onFechaInicioFiltroChange={cambiarFechaInicioCreditoFiltro}
          onFechaFinFiltroChange={cambiarFechaFinCreditoFiltro}
          onLimpiarFechaInicio={limpiarFechaInicioCreditoFiltro}
          onLimpiarFechaFin={limpiarFechaFinCreditoFiltro}
          idReporteCargandoDetalle={idReporteCargandoDetalle}
          onReintentar={() => void recargarCredito()}
          onVerDetalle={(reporte) => void verDetalleCredito(reporte)}
        />
      ) : null}
      {pestanaActiva === "empresas" ? (
        <SeccionEmpresas
          empresas={empresas}
          estaCargando={estaCargandoEmpresas}
          hayError={hayErrorEmpresas}
          opcionesPais={opcionesPaisEmpresa}
          opcionesActividadEconomica={opcionesActividadEconomicaEmpresa}
          idsPaisFiltro={idsPaisEmpresaFiltro}
          idsActividadEconomicaFiltro={idsActividadEconomicaEmpresaFiltro}
          onPaisFiltroChange={cambiarPaisEmpresaFiltro}
          onActividadEconomicaFiltroChange={
            cambiarActividadEconomicaEmpresaFiltro
          }
          paginaActual={paginaEmpresas}
          totalPaginas={respuestaEmpresas?.totalPaginas ?? 1}
          totalRegistros={respuestaEmpresas?.totalRegistros ?? 0}
          onCambiarPagina={setPaginaEmpresas}
          onReintentar={() => void recargarEmpresas()}
          exportando={exportarEmpresasMutation.isPending}
          onExportar={() => exportarEmpresasMutation.mutate()}
          onVerHistorial={setEmpresaHistorial}
        />
      ) : null}

      {pestanaActiva === "credito" ? (
        <CustomPaginacion
          paginaActual={paginaCredito}
          totalPaginas={Math.max(respuestaCredito?.totalPaginas ?? 1, 1)}
          totalRegistros={
            respuestaCredito?.totalRegistros ?? reportesCredito.length
          }
          totalPaginaActual={reportesCredito.length}
          etiqueta="reportes"
          deshabilitado={estaCargandoCredito || hayErrorCredito}
          onCambiarPagina={setPaginaCredito}
        />
      ) : null}

      <CustomModalDetalleCredito
        reporte={reporteDetalle}
        onCerrar={() => setReporteDetalle(null)}
      />
      <CustomModalHistorialInformesCompania
        key={empresaHistorial?.idCompania ?? "historial-cerrado"}
        empresa={empresaHistorial}
        onCerrar={() => setEmpresaHistorial(null)}
      />
    </div>
  );
}

function SeccionCredito({
  reportes,
  estaCargando,
  hayError,
  opcionesEstadoFinanciero,
  opcionesEstado,
  idsEstadoFinancieroFiltro,
  idEstadoFiltro,
  fechaInicioFiltro,
  fechaFinFiltro,
  fechasInvalidas,
  onEstadoFinancieroFiltroChange,
  onEstadoFiltroChange,
  onFechaInicioFiltroChange,
  onFechaFinFiltroChange,
  onLimpiarFechaInicio,
  onLimpiarFechaFin,
  idReporteCargandoDetalle,
  onReintentar,
  onVerDetalle,
}: {
  reportes: CompaniaNoticiaBalanceListaItem[];
  estaCargando: boolean;
  hayError: boolean;
  opcionesEstadoFinanciero?: EntradaTablaMaestra[];
  opcionesEstado?: EntradaTablaMaestra[];
  idsEstadoFinancieroFiltro: number[];
  idEstadoFiltro?: number;
  fechaInicioFiltro?: Date;
  fechaFinFiltro?: Date;
  fechasInvalidas: boolean;
  onEstadoFinancieroFiltroChange: (ids: number[]) => void;
  onEstadoFiltroChange: (ids: number[]) => void;
  onFechaInicioFiltroChange: (fecha: Date | undefined) => void;
  onFechaFinFiltroChange: (fecha: Date | undefined) => void;
  onLimpiarFechaInicio: () => void;
  onLimpiarFechaFin: () => void;
  idReporteCargandoDetalle: number | null;
  onReintentar: () => void;
  onVerDetalle: (reporte: CompaniaNoticiaBalanceListaItem) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <CustomFiltroRangoFechas
          fechaInicio={fechaInicioFiltro}
          fechaFin={fechaFinFiltro}
          fechasInvalidas={fechasInvalidas}
          onFechaInicioChange={onFechaInicioFiltroChange}
          onFechaFinChange={onFechaFinFiltroChange}
          onLimpiarFechaInicio={onLimpiarFechaInicio}
          onLimpiarFechaFin={onLimpiarFechaFin}
        />
        <div className="grid gap-4 sm:grid-cols-[minmax(0,15rem)_minmax(0,12rem)]">
          <div className="min-w-0">
            <MultiCustomSelectorBuscable
              label="Tipo de Estado Financiero"
              options={opcionesEstadoFinanciero}
              value={idsEstadoFinancieroFiltro}
              onChange={onEstadoFinancieroFiltroChange}
              placeholder="Todos"
              resumirSelecciones
            />
          </div>
          <div className="min-w-0">
            <CustomSelectorBuscable
              label="Estado"
              options={opcionesEstado}
              value={idEstadoFiltro}
              onChange={(id) => onEstadoFiltroChange([id])}
              onClear={() => onEstadoFiltroChange([])}
              optional
              mostrarTextoOpcionalEnLabel={false}
              etiquetaOpcionVacia="Todos"
              placeholder="Todos"
            />
          </div>
        </div>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
        Reportes de crédito actualizados
      </p>
      {estaCargando ? (
        <EstadoCargandoBancoInformacion />
      ) : hayError ? (
        <EstadoBancoInformacion
          texto="No se pudo cargar la información crediticia."
          accion={
            <CustomButton variant="secondary" size="sm" onClick={onReintentar}>
              Reintentar
            </CustomButton>
          }
        />
      ) : reportes.length === 0 ? (
        <EstadoBancoInformacion texto="No hay información crediticia registrada." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {reportes.map((reporte) => (
            <article
              key={reporte.idInformeBalance}
              className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-slate-600">
                      {reporte.pais}
                    </span>
                    <h2 className="text-base font-bold text-slate-950">
                      {reporte.compania}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                      <CalendarDays size={12} />
                      {formatearRangoFecha(reporte.fecha, reporte.fechaFin)}
                    </span>
                  </div>
                  <span className="inline-flex rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {obtenerEtiquetaBalance(reporte.tipo)}
                  </span>
                  <p className="text-xs font-semibold text-slate-400">
                    Estado:{" "}
                    <span
                      className={
                        reporte.estado === "Vigente"
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    >
                      {reporte.estado}
                    </span>
                  </p>
                </div>
                <CustomButton
                  size="sm"
                  onClick={() => onVerDetalle(reporte)}
                  className="shrink-0"
                  loading={
                    idReporteCargandoDetalle === reporte.idInformeBalance
                  }
                  loadingText="Cargando..."
                >
                  Ver Detalle
                </CustomButton>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function SeccionEmpresas({
  empresas,
  estaCargando,
  hayError,
  opcionesPais,
  opcionesActividadEconomica,
  idsPaisFiltro,
  idsActividadEconomicaFiltro,
  onPaisFiltroChange,
  onActividadEconomicaFiltroChange,
  paginaActual,
  totalPaginas,
  totalRegistros,
  onCambiarPagina,
  onReintentar,
  exportando,
  onExportar,
  onVerHistorial,
}: {
  empresas: CompaniaNoticiaDetalleListaItem[];
  estaCargando: boolean;
  hayError: boolean;
  opcionesPais?: EntradaTablaMaestra[];
  opcionesActividadEconomica?: EntradaTablaMaestra[];
  idsPaisFiltro: number[];
  idsActividadEconomicaFiltro: number[];
  onPaisFiltroChange: (ids: number[]) => void;
  onActividadEconomicaFiltroChange: (ids: number[]) => void;
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  onCambiarPagina: (pagina: number) => void;
  onReintentar: () => void;
  exportando: boolean;
  onExportar: () => void;
  onVerHistorial: (empresa: CompaniaNoticiaDetalleListaItem) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,18rem)]">
        <div className="min-w-0">
          <MultiCustomSelectorBuscable
            label="País"
            options={opcionesPais}
            value={idsPaisFiltro}
            onChange={onPaisFiltroChange}
            placeholder="Todos"
            resumirSelecciones
          />
        </div>
        <div className="min-w-0">
          <MultiCustomSelectorBuscable
            label="Actividad Económica"
            options={opcionesActividadEconomica}
            value={idsActividadEconomicaFiltro}
            onChange={onActividadEconomicaFiltroChange}
            placeholder="Todas"
            resumirSelecciones
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
          Listado de empresas registradas
        </p>
        <button
          type="button"
          onClick={onExportar}
          disabled={exportando}
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={14} />
          {exportando ? "Exportando..." : "Exportar Excel"}
        </button>
      </div>

      <CustomTabla
        columns={[
          { label: "Razón social", width: "20%" },
          { label: "Documento", width: "12%" },
          { label: "País", width: "10%" },
          { label: "Dirección", width: "20%" },
          { label: "Teléfono", width: "10%" },
          { label: "Actividad Económica", width: "18%" },
          { label: "Historial", width: "10%" },
        ]}
        data={empresas}
        getId={(empresa) => empresa.idCompania}
        isLoading={estaCargando}
        isError={hayError}
        onRetry={onReintentar}
        emptyMessage="No hay empresas registradas."
        errorMessage="No se pudo cargar el listado de empresas."
        paginaActual={paginaActual}
        totalPages={Math.max(totalPaginas, 1)}
        totalRecords={totalRegistros}
        onPageChange={onCambiarPagina}
        entityLabel="empresas"
        renderRow={(empresa) => (
          <>
            <td className="px-6 py-4 text-sm font-bold text-slate-800">
              <span className="block truncate" title={empresa.razonSocial}>
                {empresa.razonSocial}
              </span>
            </td>
            <td className="px-6 py-4 text-sm font-semibold text-slate-500">
              <span className="block truncate" title={empresa.numeroDocumento}>
                {empresa.numeroDocumento}
              </span>
            </td>
            <td className="px-6 py-4">
              <span
                className="block truncate text-sm font-semibold text-slate-600"
                title={empresa.pais}
              >
                {empresa.pais}
              </span>
            </td>
            <td className="max-w-[220px] px-6 py-4 text-sm text-slate-500">
              <span className="block truncate" title={empresa.direccion}>
                {empresa.direccion}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-slate-500">
              <span className="block truncate" title={empresa.telefono}>
                {empresa.telefono}
              </span>
            </td>
            <td className="max-w-[300px] px-6 py-4 text-sm text-slate-500">
              <span
                className="block truncate"
                title={empresa.actividadComercial}
              >
                {empresa.actividadComercial}
              </span>
            </td>
            <td className="px-6 py-4">
              <CustomButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onVerHistorial(empresa)}
              >
                <History size={14} />
                Ver
              </CustomButton>
            </td>
          </>
        )}
      />
    </section>
  );
}

function EstadoBancoInformacion({
  texto,
  accion,
}: {
  texto: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-slate-100 bg-white p-6 text-center text-sm font-semibold text-slate-400">
      <p>{texto}</p>
      {accion}
    </div>
  );
}

function EstadoCargandoBancoInformacion() {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-slate-100 bg-white p-6 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-brand-wine" />
      <p className="text-sm font-medium text-gray-500">Cargando...</p>
    </div>
  );
}

function obtenerPaginasPaginacion(
  paginaActual: number,
  totalPaginas: number,
): (number | "...")[] {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, indice) => indice + 1);
  }

  const paginas: (number | "...")[] = [1];
  if (paginaActual > 3) paginas.push("...");

  for (
    let pagina = Math.max(2, paginaActual - 1);
    pagina <= Math.min(totalPaginas - 1, paginaActual + 1);
    pagina++
  ) {
    paginas.push(pagina);
  }

  if (paginaActual < totalPaginas - 2) paginas.push("...");
  paginas.push(totalPaginas);

  return paginas;
}

function CustomPaginacion({
  paginaActual,
  totalPaginas,
  totalRegistros,
  totalPaginaActual,
  etiqueta,
  deshabilitado = false,
  onCambiarPagina,
}: {
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  totalPaginaActual: number;
  etiqueta: string;
  deshabilitado?: boolean;
  onCambiarPagina: (pagina: number) => void;
}) {
  const paginas = obtenerPaginasPaginacion(paginaActual, totalPaginas);

  return (
    <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
      <p>
        Mostrando {totalPaginaActual} de {totalRegistros} {etiqueta}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={deshabilitado || paginaActual <= 1}
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-100"
        >
          <ChevronLeft size={14} />
        </button>
        {paginas.map((pagina, indice) =>
          pagina === "..." ? (
            <span
              key={`ellipsis-${indice}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-slate-400"
            >
              ...
            </span>
          ) : (
            <button
              key={pagina}
              type="button"
              onClick={() => onCambiarPagina(pagina)}
              disabled={deshabilitado}
              className={`h-8 w-8 rounded-lg text-xs font-bold ${pagina === paginaActual ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:bg-slate-100"}`}
            >
              {pagina}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={deshabilitado || paginaActual >= totalPaginas}
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-100"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function formatearRangoFecha(fechaInicio: string, fechaFin?: string) {
  const inicio = fechaInicio || "-";
  if (!fechaFin) return inicio;

  return `${inicio} - ${fechaFin}`;
}

function obtenerEtiquetaBalance(tipoEstadoFinanciero: string) {
  const tipo = tipoEstadoFinanciero.trim();
  return tipo || "-";
}
