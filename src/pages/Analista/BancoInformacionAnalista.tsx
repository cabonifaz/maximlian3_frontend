import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { CustomBancoNoticias } from "@maximilian/components/common/CustomBancoNoticias";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomModalDetalleCuentasAnalista } from "@maximilian/components/investigacion/CustomModalDetalleCuentasInforme";
import { servicioCompaniaNoticiaBalance } from "@maximilian/services/companiaNoticiaBalance.service";
import { servicioCompaniaNoticiaDetalle } from "@maximilian/services/companiaNoticiaDetalle.service";
import type { CompaniaNoticiaBalanceListaItem } from "@maximilian/shared/types/companiaNoticiaBalance.type";
import type { CompaniaNoticiaDetalleListaItem } from "@maximilian/shared/types/companiaNoticiaDetalle.type";

type PestanaBancoInformacion = "noticias" | "credito" | "empresas";

const etiquetasPestanas: Record<PestanaBancoInformacion, string> = {
  noticias: "Noticias",
  credito: "Inf. Crediticio",
  empresas: "Empresas",
};

export default function BancoInformacionAnalista() {
  const [pestanaActiva, setPestanaActiva] = useState<PestanaBancoInformacion>("noticias");
  const [busqueda, setBusqueda] = useState("");
  const [paginaEmpresas, setPaginaEmpresas] = useState(1);
  const [reporteDetalle, setReporteDetalle] = useState<CompaniaNoticiaBalanceListaItem | null>(null);
  const [idReporteCargandoDetalle, setIdReporteCargandoDetalle] = useState<number | null>(null);

  const {
    data: respuestaCredito,
    isLoading: estaCargandoCredito,
    isError: hayErrorCredito,
    refetch: recargarCredito,
  } = useQuery({
    queryKey: ["companiaNoticiaBalance", { busqueda, numPag: 1 }],
    queryFn: () => servicioCompaniaNoticiaBalance.list({ busqueda, numPag: 1 }),
    enabled: pestanaActiva === "credito",
  });

  const reportesCredito = respuestaCredito?.lstCompaniaNoticiaBalance ?? [];
  const {
    data: respuestaEmpresas,
    isLoading: estaCargandoEmpresas,
    isError: hayErrorEmpresas,
    refetch: recargarEmpresas,
  } = useQuery({
    queryKey: ["companiaNoticiaDetalle", { busqueda, numPag: paginaEmpresas }],
    queryFn: () =>
      servicioCompaniaNoticiaDetalle.list({
        busqueda,
        numPag: paginaEmpresas,
      }),
    enabled: pestanaActiva === "empresas",
  });
  const empresas = respuestaEmpresas?.lstCompaniaNoticiaDetalle ?? [];

  const exportarEmpresasMutation = useMutation({
    mutationFn: () =>
      servicioCompaniaNoticiaDetalle.exportar({
        busqueda,
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

  const verDetalleCredito = async (reporte: CompaniaNoticiaBalanceListaItem) => {
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
        <h1 className="text-2xl font-bold text-slate-950">Banco de Informacion</h1>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={busqueda}
            onChange={(event) => {
              setBusqueda(event.target.value);
              setPaginaEmpresas(1);
            }}
            className="h-12 w-full rounded-xl border border-slate-100 bg-white pl-11 pr-4 text-sm text-slate-600 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            placeholder={pestanaActiva === "empresas" ? "Buscar por Razon Social o RUC..." : "Buscar noticias, reportes o articulos..."}
          />
        </label>
        <CustomButton variant="secondary" size="sm" className="h-12 rounded-xl bg-white text-slate-600">
          <Filter size={14} />
          {pestanaActiva === "empresas" ? "Filtros Avanzados" : "Filtros"}
        </CustomButton>
      </div>

      <div className="border-b border-slate-100">
        <div className="flex gap-8">
          {(Object.keys(etiquetasPestanas) as PestanaBancoInformacion[]).map((pestana) => (
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
          ))}
        </div>
      </div>

      {pestanaActiva === "noticias" ? <CustomBancoNoticias busqueda={busqueda} /> : null}
      {pestanaActiva === "credito" ? (
        <SeccionCredito
          reportes={reportesCredito}
          estaCargando={estaCargandoCredito}
          hayError={hayErrorCredito}
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
          texto={obtenerTextoPaginacion(
            pestanaActiva,
            reportesCredito.length,
            respuestaCredito?.totalRegistros,
          )}
        />
      ) : null}

      <CustomModalDetalleCredito reporte={reporteDetalle} onCerrar={() => setReporteDetalle(null)} />
    </div>
  );
}

function SeccionCredito({
  reportes,
  estaCargando,
  hayError,
  idReporteCargandoDetalle,
  onReintentar,
  onVerDetalle,
}: {
  reportes: CompaniaNoticiaBalanceListaItem[];
  estaCargando: boolean;
  hayError: boolean;
  idReporteCargandoDetalle: number | null;
  onReintentar: () => void;
  onVerDetalle: (reporte: CompaniaNoticiaBalanceListaItem) => void;
}) {
  return (
    <section className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">Reportes de credito actualizados</p>
      {estaCargando ? (
        <EstadoBancoInformacion texto="Cargando informacion crediticia..." />
      ) : hayError ? (
        <EstadoBancoInformacion
          texto="No se pudo cargar la informacion crediticia."
          accion={(
            <CustomButton variant="secondary" size="sm" onClick={onReintentar}>
              Reintentar
            </CustomButton>
          )}
        />
      ) : reportes.length === 0 ? (
        <EstadoBancoInformacion texto="No hay informacion crediticia registrada." />
      ) : (
      <div className="grid gap-5 lg:grid-cols-2">
        {reportes.map((reporte) => (
          <article key={reporte.idInformeBalance} className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <IndicadorPais pais={reporte.pais} />
                  <h2 className="text-base font-bold text-slate-950">{reporte.compania}</h2>
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
                  <span className={reporte.estado === "Vigente" ? "text-emerald-500" : "text-slate-400"}>
                    {reporte.estado}
                  </span>
                </p>
              </div>
              <CustomButton
                size="sm"
                onClick={() => onVerDetalle(reporte)}
                className="shrink-0"
                loading={idReporteCargandoDetalle === reporte.idInformeBalance}
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
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">Listado de empresas registradas</p>
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
          { label: "Razon Social" },
          { label: "Documento" },
          { label: "Pais" },
          { label: "Direccion" },
          { label: "Telefono" },
          { label: "Actividad Comercial" },
          { label: "Trab.", className: "text-right" },
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
            <td className="px-6 py-4 text-sm font-bold text-slate-800">{empresa.razonSocial}</td>
            <td className="px-6 py-4 text-sm font-semibold text-slate-500">{empresa.numeroDocumento}</td>
            <td className="px-6 py-4">
              <IndicadorPais pais={empresa.pais} />
            </td>
            <td className="max-w-[220px] px-6 py-4 text-sm text-slate-500">{empresa.direccion}</td>
            <td className="px-6 py-4 text-sm text-slate-500">{empresa.telefono}</td>
            <td className="max-w-[300px] px-6 py-4 text-sm text-slate-500">{empresa.actividadComercial}</td>
            <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700">{empresa.trabajadores}</td>
          </>
        )}
      />
    </section>
  );
}

function EstadoBancoInformacion({ texto, accion }: { texto: string; accion?: ReactNode }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-slate-100 bg-white p-6 text-center text-sm font-semibold text-slate-400">
      <p>{texto}</p>
      {accion}
    </div>
  );
}

function crearDetalleCuentasVacio() {
  return {
    balanceGeneral: {
      totalCorrientes: "",
      totalNoCorrientes: "",
      otrosActivos: "",
      totalActivos: "",
      totalPasivosCorrientes: "",
      totalPasivosNoCorrientes: "",
      otrosPasivos: "",
      totalPasivos: "",
      patrimonio: "",
      totalPasivoPatrimonio: "",
    },
    estadoGananciasPerdidas: {
      ventasNetas: "",
      utilidadGanancia: "",
    },
    ratios: {
      liquidez: "",
      capitalTrabajo: "",
      endeudamiento: "",
      rentabilidad: "",
    },
    registrosHabilitados: true,
    totalesHabilitados: true,
    registrosEstadoFinanciero: {},
  };
}

function CustomModalDetalleCredito({
  reporte,
  onCerrar,
}: {
  reporte: CompaniaNoticiaBalanceListaItem | null;
  onCerrar: () => void;
}) {
  if (!reporte) return null;

  return (
    <CustomModalDetalleCuentasAnalista
      estaAbierto={Boolean(reporte)}
      onCerrar={onCerrar}
      onGuardar={() => {}}
      detalleInicial={reporte.detalleCuentas ?? crearDetalleCuentasVacio()}
      tipoEstadoFinanciero={reporte.tipo}
      soloLectura
    />
  );
}

function IndicadorPais({ pais, compacto = false }: { pais: string; compacto?: boolean }) {
  const iniciales = pais.slice(0, 3).toUpperCase();

  return (
    <span className={`inline-flex items-center gap-2 ${compacto ? "align-middle" : ""}`}>
      <span className="inline-flex h-3.5 w-5 items-center justify-center rounded-[3px] bg-slate-900 text-[7px] font-bold text-white">
        {iniciales}
      </span>
      {!compacto ? <span className="text-sm font-semibold text-slate-600">{pais}</span> : null}
    </span>
  );
}

function CustomPaginacion({ texto }: { texto: string }) {
  return (
    <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
      <p>{texto}</p>
      <div className="flex items-center gap-2">
        <button type="button" className="rounded-lg p-2 text-slate-300 hover:bg-slate-100">
          <ChevronLeft size={14} />
        </button>
        {[1, 2, 3].map((pagina) => (
          <button
            key={pagina}
            type="button"
            className={`h-8 w-8 rounded-lg text-xs font-bold ${pagina === 1 ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:bg-slate-100"}`}
          >
            {pagina}
          </button>
        ))}
        <button type="button" className="rounded-lg p-2 text-slate-300 hover:bg-slate-100">
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

function obtenerTextoPaginacion(
  pestana: PestanaBancoInformacion,
  totalReportes: number,
  totalRegistrosReportes: number | undefined,
) {
  if (pestana === "credito") return `Mostrando ${totalReportes} de ${totalRegistrosReportes ?? totalReportes} reportes`;

  return "";
}
