import { etiquetasPestanas } from "@maximilian/shared/constants/pages/Analista/banco-informacion-analista.constants";
import type { PestanaBancoInformacion } from "@maximilian/shared/constants/pages/Analista/banco-informacion-analista.constants";
import { ID_MAESTRO_ESTADO_CREDITO, ID_MAESTRO_ACTIVIDAD_ECONOMICA_EMPRESA } from "@maximilian/shared/constants/pages/Analista/banco-informacion-analista.constants";
import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Search,
} from "lucide-react";
import { CustomBancoNoticias } from "@maximilian/components/common/CustomBancoNoticias";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { MultiCustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscableMultiple";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomModalDetalleCredito } from "@maximilian/components/analista/CustomModalDetalleCredito";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioCompaniaNoticiaBalance } from "@maximilian/services/compania-noticia-balance.service";
import { servicioCompaniaNoticiaDetalle } from "@maximilian/services/compania-noticia-detalle.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { CompaniaNoticiaBalanceListaItem } from "@maximilian/shared/types/compania-noticia-balance.type";
import type { CompaniaNoticiaDetalleListaItem } from "@maximilian/shared/types/compania-noticia-detalle.type";
import {
  TablaMaestraId,
  type EntradaTablaMaestra,
} from "@maximilian/shared/types/tabla-maestra.type";

function serializarIdsFiltro(ids: number[]) {
  return ids.length > 0 ? ids.join(",") : undefined;
}

export default function BancoInformacionAnalista() {
  const [pestanaActiva, setPestanaActiva] =
    useState<PestanaBancoInformacion>("noticias");
  const [busqueda, setBusqueda] = useState("");
  const [paginaCredito, setPaginaCredito] = useState(1);
  const [paginaEmpresas, setPaginaEmpresas] = useState(1);
  const [idsEstadoFinancieroFiltro, setIdsEstadoFinancieroFiltro] = useState<
    number[]
  >([]);
  const [idEstadoCreditoFiltro, setIdEstadoCreditoFiltro] = useState<
    number | undefined
  >(undefined);
  const [idsPaisEmpresaFiltro, setIdsPaisEmpresaFiltro] = useState<number[]>(
    [],
  );
  const [
    idsActividadEconomicaEmpresaFiltro,
    setIdsActividadEconomicaEmpresaFiltro,
  ] = useState<number[]>([]);
  const [reporteDetalle, setReporteDetalle] =
    useState<CompaniaNoticiaBalanceListaItem | null>(null);
  const [idReporteCargandoDetalle, setIdReporteCargandoDetalle] = useState<
    number | null
  >(null);
  const busquedaConRetardo = useRetardo(busqueda);

  useEffect(() => {
    setPaginaCredito(1);
    setPaginaEmpresas(1);
  }, [busquedaConRetardo]);

  const { data: opcionesEstadoFinanciero } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ESTADO_FINANCIERO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ESTADO_FINANCIERO),
    staleTime: Infinity,
  });

  const { data: opcionesEstadoCredito } = useQuery({
    queryKey: ["masterTable", ID_MAESTRO_ESTADO_CREDITO],
    queryFn: () => servicioTablaMaestra.list(ID_MAESTRO_ESTADO_CREDITO),
    staleTime: Infinity,
  });
  const tipoEstadoFinancieroFiltro = serializarIdsFiltro(
    idsEstadoFinancieroFiltro,
  );
  const estadoCreditoFiltro =
    idEstadoCreditoFiltro != null ? String(idEstadoCreditoFiltro) : undefined;

  const {
    data: respuestaCredito,
    isLoading: estaCargandoCredito,
    isError: hayErrorCredito,
    refetch: recargarCredito,
  } = useQuery({
    queryKey: [
      "companiaNoticiaBalance",
      {
        busqueda: busquedaConRetardo,
        estado: estadoCreditoFiltro,
        tipoEstadoFinanciero: tipoEstadoFinancieroFiltro,
        numPag: paginaCredito,
      },
    ],
    queryFn: () =>
      servicioCompaniaNoticiaBalance.list({
        busqueda: busquedaConRetardo,
        estado: estadoCreditoFiltro,
        tipoEstadoFinanciero: tipoEstadoFinancieroFiltro,
        numPag: paginaCredito,
      }),
    enabled: pestanaActiva === "credito",
  });

  const reportesCredito = respuestaCredito?.lstCompaniaNoticiaBalance ?? [];
  const {
    data: respuestaEmpresas,
    isLoading: estaCargandoEmpresas,
    isError: hayErrorEmpresas,
    refetch: recargarEmpresas,
  } = useQuery({
    queryKey: [
      "companiaNoticiaDetalle",
      {
        busqueda: busquedaConRetardo,
        actividades: serializarIdsFiltro(idsActividadEconomicaEmpresaFiltro),
        paises: serializarIdsFiltro(idsPaisEmpresaFiltro),
        numPag: paginaEmpresas,
      },
    ],
    queryFn: () =>
      servicioCompaniaNoticiaDetalle.list({
        busqueda: busquedaConRetardo,
        actividades: serializarIdsFiltro(idsActividadEconomicaEmpresaFiltro),
        paises: serializarIdsFiltro(idsPaisEmpresaFiltro),
        numPag: paginaEmpresas,
      }),
    enabled: pestanaActiva === "empresas",
  });
  const empresas = respuestaEmpresas?.lstCompaniaNoticiaDetalle ?? [];
  const { data: opcionesPaisEmpresa } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    staleTime: Infinity,
  });
  const { data: opcionesActividadEconomicaEmpresa } = useQuery({
    queryKey: ["masterTable", ID_MAESTRO_ACTIVIDAD_ECONOMICA_EMPRESA],
    queryFn: () =>
      servicioTablaMaestra.list(ID_MAESTRO_ACTIVIDAD_ECONOMICA_EMPRESA),
    staleTime: Infinity,
  });

  const exportarEmpresasMutation = useMutation({
    mutationFn: () =>
      servicioCompaniaNoticiaDetalle.exportar({
        busqueda: busquedaConRetardo,
        actividades: serializarIdsFiltro(idsActividadEconomicaEmpresaFiltro),
        paises: serializarIdsFiltro(idsPaisEmpresaFiltro),
        numPag: paginaEmpresas,
      }),
    onSuccess: (respuesta) => {
      if (respuesta.downloadUrl) {
        window.open(respuesta.downloadUrl, "_blank", "noopener,noreferrer");
        return;
      }

      if (!respuesta.archivo) return;

      const url = URL.createObjectURL(respuesta.archivo);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.target = "_blank";
      enlace.rel = "noopener noreferrer";
      enlace.download = respuesta.nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
  });

  const verDetalleCredito = async (
    reporte: CompaniaNoticiaBalanceListaItem,
  ) => {
    setIdReporteCargandoDetalle(reporte.idInformeBalance);
    try {
      const detalle = await servicioCompaniaNoticiaBalance.obtener({
        idInformeBalance: reporte.idInformeBalance,
        idCompania: reporte.idCompania,
      });
      setReporteDetalle(detalle ?? reporte);
    } catch {
      setReporteDetalle(reporte);
    } finally {
      setIdReporteCargandoDetalle(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">
          Banco de Informacion
        </h1>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
          />
          <input
            value={busqueda}
            onChange={(event) => {
              setBusqueda(event.target.value);
              setPaginaEmpresas(1);
            }}
            className="h-12 w-full rounded-xl border border-slate-100 bg-white pl-11 pr-4 text-sm text-slate-600 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            placeholder={
              pestanaActiva === "empresas"
                ? "Buscar por Razon Social o Número de Documento..."
                : pestanaActiva === "credito"
                  ? "Buscar por Investigado o pais..."
                  : "Buscar noticias, reportes o articulos..."
            }
          />
        </label>
      </div>

      <div className="border-b border-slate-100">
        <div className="flex gap-8">
          {(Object.keys(etiquetasPestanas) as PestanaBancoInformacion[]).map(
            (pestana) => (
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
                {etiquetasPestanas[pestana]}
              </button>
            ),
          )}
        </div>
      </div>

      {pestanaActiva === "noticias" ? (
        <CustomBancoNoticias busqueda={busquedaConRetardo} />
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
          onEstadoFinancieroFiltroChange={(ids) => {
            setIdsEstadoFinancieroFiltro(ids);
            setPaginaCredito(1);
          }}
          onEstadoFiltroChange={(ids) => {
            setIdEstadoCreditoFiltro(ids[ids.length - 1]);
            setPaginaCredito(1);
          }}
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
          onPaisFiltroChange={(ids) => {
            setIdsPaisEmpresaFiltro(ids);
            setPaginaEmpresas(1);
          }}
          onActividadEconomicaFiltroChange={(ids) => {
            setIdsActividadEconomicaEmpresaFiltro(ids);
            setPaginaEmpresas(1);
          }}
          paginaActual={paginaEmpresas}
          totalPaginas={respuestaEmpresas?.totalPaginas ?? 1}
          totalRegistros={respuestaEmpresas?.totalRegistros ?? 0}
          onCambiarPagina={setPaginaEmpresas}
          onReintentar={() => void recargarEmpresas()}
          exportando={exportarEmpresasMutation.isPending}
          onExportar={() => exportarEmpresasMutation.mutate()}
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
  onEstadoFinancieroFiltroChange,
  onEstadoFiltroChange,
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
  onEstadoFinancieroFiltroChange: (ids: number[]) => void;
  onEstadoFiltroChange: (ids: number[]) => void;
  idReporteCargandoDetalle: number | null;
  onReintentar: () => void;
  onVerDetalle: (reporte: CompaniaNoticiaBalanceListaItem) => void;
}) {
  return (
    <section className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
        Reportes de credito actualizados
      </p>
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
          <div className="min-w-0">
            <MultiCustomSelectorBuscable
              label="Tipo de Estado Financiero"
              options={opcionesEstadoFinanciero}
              value={idsEstadoFinancieroFiltro}
              onChange={onEstadoFinancieroFiltroChange}
              optional
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
      {estaCargando ? (
        <EstadoCargandoBancoInformacion />
      ) : hayError ? (
        <EstadoBancoInformacion
          texto="No se pudo cargar la informacion crediticia."
          accion={
            <CustomButton variant="secondary" size="sm" onClick={onReintentar}>
              Reintentar
            </CustomButton>
          }
        />
      ) : reportes.length === 0 ? (
        <EstadoBancoInformacion texto="No hay informacion crediticia registrada." />
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
}) {
  return (
    <section className="space-y-4">
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
          { label: "Razon Social", width: "20%" },
          { label: "Documento", width: "12%" },
          {
            label: (
              <CustomEncabezadoFiltroTabla
                titulo="Pais"
                opciones={opcionesPais}
                valores={idsPaisFiltro}
                onChange={onPaisFiltroChange}
              />
            ),
            width: "10%",
          },
          { label: "Direccion", width: "20%" },
          { label: "Telefono", width: "12%" },
          {
            label: (
              <CustomEncabezadoFiltroTabla
                titulo="Actividad Economica"
                opciones={opcionesActividadEconomica}
                valores={idsActividadEconomicaFiltro}
                onChange={onActividadEconomicaFiltroChange}
              />
            ),
            width: "16%",
          },
          { label: "N° de Empleados", className: "text-right", width: "10%" },
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
              <span className="text-sm font-semibold text-slate-600">
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
            <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
              <span
                className="block max-w-24 truncate"
                title={String(empresa.trabajadores)}
              >
                {empresa.trabajadores}
              </span>
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

function formatearFecha(fecha: string | undefined) {
  if (!fecha) return "-";

  const fechaParseada = new Date(fecha);
  if (Number.isNaN(fechaParseada.getTime())) return fecha;

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fechaParseada);
}

function formatearRangoFecha(fechaInicio: string, fechaFin?: string) {
  const inicio = formatearFecha(fechaInicio);
  if (!fechaFin) return inicio;

  return `${inicio} - ${formatearFecha(fechaFin)}`;
}

function obtenerEtiquetaBalance(tipoEstadoFinanciero: string) {
  const tipo = tipoEstadoFinanciero.trim();
  if (!tipo) return "Balance";
  if (tipo.toLowerCase().startsWith("balance")) return tipo;

  return `Balance ${tipo}`;
}
