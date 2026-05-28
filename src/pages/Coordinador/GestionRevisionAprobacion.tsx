import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { BadgeCheck, CheckCircle2, CircleX, ClipboardList, FileSearch, Search, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioAsignacion } from "@maximilian/services/asignacion.service";
import type { AssignmentOrderEntry } from "@maximilian/shared/types/asignacion.type";
import type { EstadoInvestigacionAnalista, TarjetaResumenAnalista } from "@maximilian/shared/types/investigacion.type";
import {
  obtenerColorEstadoAnalista,
  obtenerTextoEstadoAnalista,
} from "@maximilian/shared/utils/datos-simulados-investigacion";

interface RegistroRevisionCoordinador {
  idRegistro: number;
  idPedido: number;
  idInforme: number;
  idIdioma?: number;
  investigado: string;
  vigencia: string;
  vigenciaColor: string;
  tipo: string;
  estado: EstadoInvestigacionAnalista;
  esEjemplo?: boolean;
}

const REGISTRO_EJEMPLO: RegistroRevisionCoordinador = {
  idRegistro: -1,
  idPedido: 2024001,
  idInforme: 2024001,
  investigado: "Generation & Power SA",
  vigencia: "3 dias",
  vigenciaColor: "#334155",
  tipo: "Normal",
  estado: "pendiente-aprobacion",
  esEjemplo: true,
};

function formatearEstadoRevision(registro: AssignmentOrderEntry): EstadoInvestigacionAnalista {
  const estado = (registro.estado ?? "").trim().toLowerCase();
  if (estado.includes("rechaz")) return "rechazado";
  if (estado.includes("aprob")) return "aprobado";
  if (estado.includes("pend")) return "pendiente-aprobacion";
  if (estado.includes("proceso") || estado.includes("curso")) return "en-proceso";
  return (registro.idInforme ?? 0) > 0 ? "pendiente-aprobacion" : "asignado";
}

function obtenerIconoTarjeta(id: string) {
  if (id === "pendiente") return <ClipboardList size={18} className="text-orange-500" />;
  if (id === "aprobado") return <CheckCircle2 size={18} className="text-emerald-500" />;
  if (id === "rechazado") return <CircleX size={18} className="text-rose-500" />;
  if (id === "vigente") return <BadgeCheck size={18} className="text-slate-600" />;
  return <TriangleAlert size={18} className="text-red-400" />;
}

export default function GestionRevisionAprobacion() {
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
    queryKey: ["asignaciones-bandeja-coordinador-revision", paginaActual, terminoBusquedaConRetardo],
    queryFn: () =>
      servicioAsignacion.bandeja({
        numPag: paginaActual,
        busqueda: terminoBusquedaConRetardo.trim() || undefined,
      }),
    enabled: terminoBusqueda === terminoBusquedaConRetardo,
    retry: false,
  });

  const registros = useMemo<RegistroRevisionCoordinador[]>(() => {
    const registrosApi = (respuestaAsignaciones?.lstPedido ?? [])
      .filter((registro) => (registro.idInforme ?? 0) > 0)
      .map((registro) => ({
        idRegistro: registro.idPedido,
        idPedido: registro.idPedido,
        idInforme: registro.idInforme ?? 0,
        idIdioma: registro.idIdioma,
        investigado: registro.investigado,
        vigencia: registro.porVencerTexto || "-",
        vigenciaColor: registro.porVencerColor || "#64748b",
        tipo: registro.tipoTramite || "-",
        estado: formatearEstadoRevision(registro),
        esEjemplo: false,
      }));

    return [REGISTRO_EJEMPLO, ...registrosApi];
  }, [respuestaAsignaciones?.lstPedido]);

  const resumenTarjetas = useMemo<TarjetaResumenAnalista[]>(() => {
    const pendientes = registros.filter((registro) => registro.estado === "pendiente-aprobacion").length;
    const aprobados = registros.filter((registro) => registro.estado === "aprobado").length;
    const rechazados = registros.filter((registro) => registro.estado === "rechazado").length;
    const vigentes = registros.filter((registro) => !registro.vigencia.toLowerCase().includes("venc")).length;
    const vencidos = registros.length - vigentes;

    return [
      { id: "pendiente", titulo: "Pendiente", valor: pendientes, colorIcono: "text-orange-500" },
      { id: "aprobado", titulo: "Aprobado", valor: aprobados, colorIcono: "text-emerald-500" },
      { id: "rechazado", titulo: "Rechazado", valor: rechazados, colorIcono: "text-rose-500" },
      { id: "vigente", titulo: "Vigentes", valor: vigentes, colorIcono: "text-slate-600" },
      { id: "vencido", titulo: "Vencidos", valor: vencidos, colorIcono: "text-red-400" },
    ];
  }, [registros]);

  const abrirRevision = (registro: RegistroRevisionCoordinador) => {
    const parametros = new URLSearchParams();
    parametros.set("idInforme", String(registro.idInforme));
    if (registro.idIdioma != null) {
      parametros.set("idIdioma", String(registro.idIdioma));
    }
    if (registro.esEjemplo) {
      parametros.set("ejemplo", "1");
    }

    navigate(`/coordinador/revision/${registro.idPedido}?${parametros.toString()}`);
  };

  const abrirEjemploInforme = () => abrirRevision(REGISTRO_EJEMPLO);

  const columnas = [
    { label: "ID Pedido" },
    { label: "Investigado" },
    { label: "Vigencia" },
    { label: "Tipo" },
    { label: "Estado", className: "text-center" },
    { label: "Acción", className: "text-right" },
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

            <CustomButton
              variant="wine"
              size="md"
              className="h-12 min-w-40 text-sm font-semibold"
              onClick={abrirEjemploInforme}
            >
              <FileSearch size={16} />
              Ver ejemplo
            </CustomButton>
          </div>
        </div>

        {isError ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            No se pudo cargar la bandeja del backend. Se muestra el informe de ejemplo para revisión.
          </div>
        ) : null}

        <CustomTabla
          columns={columnas}
          data={registros}
          getId={(registro) => registro.idRegistro}
          isLoading={isLoading}
          isError={false}
          onRetry={() => void refetch()}
          paginaActual={paginaActual}
          totalPages={respuestaAsignaciones?.totalPaginas ?? 1}
          totalRecords={(respuestaAsignaciones?.totalRegistros ?? 0) + 1}
          entityLabel="informes"
          onPageChange={setPaginaActual}
          emptyMessage="No se encontraron informes para revisión."
          renderRow={(registro) => (
            <>
              <td className="px-6 py-4 text-sm font-medium text-slate-400">
                #{registro.esEjemplo ? "SR-2024-001" : registro.idPedido}
              </td>
              <td className="max-w-48 px-6 py-4 text-sm font-semibold text-slate-700">
                <span className="line-clamp-1">{registro.investigado}</span>
              </td>
              <td className="px-6 py-4 text-sm" style={{ color: registro.vigenciaColor }}>
                {registro.vigencia}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">{registro.tipo}</td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-flex rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wide ${obtenerColorEstadoAnalista(registro.estado)}`}
                >
                  {registro.estado === "pendiente-aprobacion" ? "Pendiente" : obtenerTextoEstadoAnalista(registro.estado)}
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
