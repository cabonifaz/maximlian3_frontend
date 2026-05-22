import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { CheckCircle2, CircleX, Clock3, Search, SlidersHorizontal, ClipboardList } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioAsignacion } from "@maximilian/services/asignacion.service";
import {
  obtenerColorEstadoAnalista,
  obtenerTextoEstadoAnalista,
} from "@maximilian/shared/utils/datos-simulados-investigacion";
import type { AccionBandejaAnalista, RegistroBandejaAnalista, TarjetaResumenAnalista } from "@maximilian/shared/types/investigacion.type";
import type { AssignmentOrderEntry } from "@maximilian/shared/types/asignacion.type";

function obtenerIconoTarjeta(id: string) {
  if (id === "aprobado") return <CheckCircle2 size={18} className="text-green-500" />;
  if (id === "rechazado") return <CircleX size={18} className="text-red-500" />;
  if (id === "en-proceso") return <Clock3 size={18} className="text-blue-500" />;
  return <ClipboardList size={18} className="text-slate-500" />;
}

function obtenerEtiquetaAccion(accion: AccionBandejaAnalista) {
  if (accion === "iniciar") return "Iniciar Traducción";
  if (accion === "continuar") return "Continuar";
  return "Ver Detalles";
}

function obtenerModoPorAccion(accion: AccionBandejaAnalista) {
  if (accion === "iniciar") return "iniciar";
  if (accion === "continuar") return "continuar";
  return "detalle";
}

function formatearFechaAsignacion(valor?: string) {
  const texto = valor?.trim() ?? "";
  if (!texto || texto.startsWith("0001-01-01")) return "-";

  const coincidenciaIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (coincidenciaIso) {
    const [, ano, mes, dia] = coincidenciaIso;
    return `${dia}/${mes}/${ano.slice(-2)}`;
  }

  return texto;
}

function normalizarEstadoDesdeAsignacion(registro: AssignmentOrderEntry): RegistroBandejaAnalista["estado"] {
  const estado = (registro.estado ?? "").trim().toLowerCase();
  if (estado.includes("rechaz")) return "rechazado";
  if (estado.includes("aprob")) return "aprobado";
  if (estado.includes("pend")) return "pendiente-aprobacion";
  if (estado.includes("proceso") || estado.includes("curso") || (registro.idInforme ?? 0) > 0) return "en-proceso";
  return "asignado";
}

function obtenerAccionDesdeAsignacion(registro: AssignmentOrderEntry): AccionBandejaAnalista {
  if ((registro.idInforme ?? 0) > 0) return "continuar";

  const estado = normalizarEstadoDesdeAsignacion(registro);
  if (estado === "asignado") return "iniciar";
  if (estado === "en-proceso" || estado === "rechazado") return "continuar";
  return "detalle";
}

export default function BandejaTraductor() {
  const navigate = useNavigate();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const terminoBusquedaConRetardo = useRetardo(terminoBusqueda);

  const {
    data: respuestaAsignaciones,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["asignaciones-bandeja-traductor", paginaActual, terminoBusquedaConRetardo],
    queryFn: () =>
      servicioAsignacion.bandeja({
        numPag: paginaActual,
        busqueda: terminoBusquedaConRetardo.trim() || undefined,
      }),
    enabled: terminoBusqueda === terminoBusquedaConRetardo,
    retry: false,
  });

  const registrosFiltrados = useMemo<RegistroBandejaAnalista[]>(
    () =>
      (respuestaAsignaciones?.lstPedido ?? []).map((registro) => ({
        idInforme: registro.idInforme ?? 0,
        idPedido: registro.idPedido,
        idPlantilla: registro.idPlantilla,
        codigo: String(registro.idPedido),
        investigado: registro.investigado,
        pais: registro.pais || "-",
        fecha: formatearFechaAsignacion(registro.fechaAsignacion),
        tipo: registro.tipoTramite || "-",
        estado: normalizarEstadoDesdeAsignacion(registro),
        accion: obtenerAccionDesdeAsignacion(registro),
      })),
    [respuestaAsignaciones?.lstPedido],
  );

  const tarjetasResumen = useMemo<TarjetaResumenAnalista[]>(() => {
    const resumen = respuestaAsignaciones?.resumen;

    return [
      { id: "asignados", titulo: "Asignados", valor: resumen?.total ?? registrosFiltrados.filter((registro) => registro.estado === "asignado").length, colorIcono: "text-slate-500" },
      { id: "en-proceso", titulo: "En Proceso", valor: resumen?.enProceso ?? registrosFiltrados.filter((registro) => registro.estado === "en-proceso").length, colorIcono: "text-blue-500" },
      { id: "aprobado", titulo: "Aprobado", valor: resumen?.aprobadas ?? registrosFiltrados.filter((registro) => registro.estado === "aprobado").length, colorIcono: "text-green-500" },
      { id: "rechazado", titulo: "Rechazado", valor: resumen?.rechazadas ?? registrosFiltrados.filter((registro) => registro.estado === "rechazado").length, colorIcono: "text-red-500" },
    ];
  }, [registrosFiltrados, respuestaAsignaciones?.resumen]);

  const irADetalle = (registro: RegistroBandejaAnalista) => {
    const modo = obtenerModoPorAccion(registro.accion);
    const parametros = new URLSearchParams({ modo });

    if (registro.idInforme > 0) {
      parametros.set("idInforme", String(registro.idInforme));
    }

    navigate(`/traductor/traduccion/${registro.idPedido}?${parametros.toString()}`, {
      state: {
        datosPedidoInvestigacion: {
          idPedido: registro.idPedido,
          idPlantilla: registro.idPlantilla,
          investigado: registro.investigado,
          pais: registro.pais,
          tipoTramite: registro.tipo,
        },
      },
    });
  };

  const columnas = [
    { label: "ID Pedido" },
    { label: "Investigado" },
    { label: "País" },
    { label: "Fecha" },
    { label: "Tipo" },
    { label: "Estado", className: "text-center" },
    { label: "Acción", className: "text-right" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        {tarjetasResumen.map((tarjeta) => (
          <article
            key={tarjeta.id}
            className="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              {obtenerIconoTarjeta(tarjeta.id)}
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                {tarjeta.titulo}
              </span>
            </div>
            <p className="text-3xl font-bold text-brand-black">{tarjeta.valor}</p>
          </article>
        ))}
      </div>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-black">Traducciones</h1>
            <p className="mt-2 text-sm text-gray-500">
              Gestión y control de las solicitudes de traducción asignadas.
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
          data={registrosFiltrados}
          getId={(registro) => registro.idPedido}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          paginaActual={paginaActual}
          totalPages={respuestaAsignaciones?.totalPaginas ?? 1}
          totalRecords={respuestaAsignaciones?.totalRegistros ?? 0}
          entityLabel="pedidos"
          onPageChange={setPaginaActual}
          emptyMessage="No se encontraron pedidos en la bandeja."
          renderRow={(registro) => (
            <>
              <td className="px-6 py-4 text-sm font-medium text-slate-400">{registro.idPedido}</td>
              <td className="max-w-48 px-6 py-4 text-sm font-semibold text-slate-700">
                <span className="line-clamp-1">{registro.investigado}</span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">{registro.pais}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{registro.fecha}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{registro.tipo}</td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-flex rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wide ${obtenerColorEstadoAnalista(registro.estado)}`}
                >
                  {obtenerTextoEstadoAnalista(registro.estado)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end">
                  <CustomButton
                    size="sm"
                    className="h-10 w-36 justify-center px-3 text-[11px] uppercase tracking-[0.12em]"
                    onClick={() => irADetalle(registro)}
                  >
                    {obtenerEtiquetaAccion(registro.accion)}
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
