import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { BadgeCheck, CheckCircle2, CircleX, ClipboardList, Search, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { informeService } from "@maximilian/services/informe.service";
import type { InformeListEntry } from "@maximilian/shared/types/informe.type";
import type { TarjetaResumenAnalista } from "@maximilian/shared/types/investigacion.type";
import { obtenerColorEstadoAnalista } from "@maximilian/shared/utils/investigacion.util";

function obtenerIconoTarjeta(id: string) {
  if (id === "pendiente") return <ClipboardList size={18} className="text-orange-500" />;
  if (id === "aprobado") return <CheckCircle2 size={18} className="text-emerald-500" />;
  if (id === "rechazado") return <CircleX size={18} className="text-rose-500" />;
  if (id === "vigente") return <BadgeCheck size={18} className="text-slate-600" />;
  return <TriangleAlert size={18} className="text-red-400" />;
}

function obtenerBadgeVigencia(registro: InformeListEntry) {
  const texto = registro.vigencia || "-";
  const textoNormalizado = texto.toLowerCase();
  const esVencido = textoNormalizado.includes("venc");
  const dias = texto.match(/\d+/)?.[0];
  const esVencimientoInmediato = !esVencido && dias != null && Number(dias) <= 1;
  const color = registro.vigenciaColor
    || (esVencido ? "#dc2626" : esVencimientoInmediato ? "#b45309" : "#166534");
  const fondo = registro.vigenciaFondo
    || (esVencido ? "#fef2f2" : esVencimientoInmediato ? "#fffbeb" : "#ecfdf5");

  return (
    <span
      className="inline-flex min-w-24 flex-col rounded-xl px-3 py-2 text-center text-xs font-semibold"
      style={{ color, backgroundColor: fondo }}
    >
      <span>{esVencido ? "Vencido" : texto}</span>
      {esVencido && dias ? (
        <span className="text-[11px] font-medium opacity-80">
          {dias} {dias === "1" ? "dia" : "dias"}
        </span>
      ) : null}
    </span>
  );
}

export default function GestionRevisionAprobacion() {
  const navigate = useNavigate();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const terminoBusquedaConRetardo = useRetardo(terminoBusqueda);

  const {
    data: respuestaInformes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["informes-bandeja-coordinador-revision", paginaActual, terminoBusquedaConRetardo],
    queryFn: () =>
      informeService.list({
        numPag: paginaActual,
        busqueda: terminoBusquedaConRetardo.trim() || undefined,
      }),
    enabled: terminoBusqueda === terminoBusquedaConRetardo,
    retry: false,
    refetchOnMount: "always",
  });

  const registros = useMemo<InformeListEntry[]>(
    () => respuestaInformes?.lstInforme ?? [],
    [respuestaInformes?.lstInforme],
  );

  const resumenTarjetas = useMemo<TarjetaResumenAnalista[]>(() => {
    return [
      { id: "pendiente", titulo: "Pendiente", valor: respuestaInformes?.pendienteAprobacion ?? 0, colorIcono: "text-orange-500" },
      { id: "aprobado", titulo: "Aprobado", valor: respuestaInformes?.aprobado ?? 0, colorIcono: "text-emerald-500" },
      { id: "rechazado", titulo: "Rechazado", valor: respuestaInformes?.rechazado ?? 0, colorIcono: "text-rose-500" },
      { id: "vigente", titulo: "Vigentes", valor: respuestaInformes?.vigente ?? 0, colorIcono: "text-slate-600" },
      { id: "vencido", titulo: "Vencidos", valor: respuestaInformes?.vencido ?? 0, colorIcono: "text-red-400" },
    ];
  }, [respuestaInformes]);

  const abrirRevision = (registro: InformeListEntry) => {
    const parametros = new URLSearchParams();
    parametros.set("idInforme", String(registro.idInforme));
    if (registro.idIdioma != null) {
      parametros.set("idIdioma", String(registro.idIdioma));
    }
    if (registro.idInformeOriginal != null && registro.idInformeOriginal > 0) {
      parametros.set("idInformeOriginal", String(registro.idInformeOriginal));
    }
    navigate(`/coordinador/revision/${registro.idPedido}?${parametros.toString()}`);
  };

  const columnas = [
    { label: "ID Pedido", width: "10%" },
    { label: "Investigado", width: "30%" },
    { label: "Vigencia", width: "14%" },
    { label: "Tipo", width: "18%" },
    { label: "Estado", className: "text-center", width: "16%" },
    { label: "Acción", className: "text-right", width: "12%" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {resumenTarjetas.map((tarjeta) => (
          <article
            key={tarjeta.id}
            className="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50">
                {obtenerIconoTarjeta(tarjeta.id)}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {tarjeta.titulo}
              </span>
            </div>
            <p className={`text-3xl font-bold ${tarjeta.id === "vencido" ? "text-red-500" : "text-brand-black"}`}>
              {tarjeta.valor}
            </p>
          </article>
        ))}
      </div>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-black">Informes</h1>
            <p className="mt-2 text-sm text-gray-500">
              Control de aprobaciones de informes asignados.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <label className="relative min-w-[320px]">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                value={terminoBusqueda}
                onChange={(event) => setTerminoBusqueda(event.target.value)}
                placeholder="Buscar por ID o Empresa..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
              />
            </label>

            <CustomButton
              variant="secondary"
              size="md"
              className="h-12 min-w-28 text-sm font-semibold"
            >
              <SlidersHorizontal size={16} />
              Filtros
            </CustomButton>

          </div>
        </div>

        <CustomTabla
          columns={columnas}
          data={registros}
          getId={(registro) => registro.idInforme}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          errorMessage="No se pudo cargar la bandeja de revision."
          paginaActual={paginaActual}
          totalPages={respuestaInformes?.totalPaginas ?? 1}
          totalRecords={respuestaInformes?.totalRegistros ?? 0}
          entityLabel="informes"
          onPageChange={setPaginaActual}
          emptyMessage="No se encontraron informes para revisión."
          renderRow={(registro) => (
            <>
              <td className="px-6 py-4 text-sm font-medium text-slate-400">
                #{registro.idPedido}
              </td>
              <td className="max-w-48 px-6 py-4 text-sm font-semibold text-slate-700">
                <span className="line-clamp-1">{registro.investigado}</span>
              </td>
              <td className="px-6 py-4">{obtenerBadgeVigencia(registro)}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{registro.tipo}</td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-flex rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wide ${obtenerColorEstadoAnalista(registro.estado)}`}
                >
                  {registro.estadoInforme}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end">
                  <CustomButton
                    size="sm"
                    className="h-10 w-36 justify-center px-3 text-[11px] uppercase tracking-[0.12em]"
                    onClick={() => abrirRevision(registro)}
                  >
                    {registro.estado === "pendiente-aprobacion" ? "Revisar" : "Ver Informe"}
                  </CustomButton>
                </div>
              </td>
            </>
          )}
        />
      </section>
    </div>
  );
}

