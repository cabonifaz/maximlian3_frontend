import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, Loader2, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomPedidoDetalleModal } from "@maximilian/components/coordinator/CustomPedidoDetalleModal";
import { CustomTabbedModal } from "@maximilian/components/common/CustomTabbedModal";
import { CustomTable } from "@maximilian/components/common/CustomTable";
import { useDebounce } from "@maximilian/hooks/useDebounce";
import { assignmentService } from "@maximilian/services/assignment.service";
import { pedidoService } from "@maximilian/services/pedido.service";
import type {
  AssignmentCandidate,
  AssignmentRole,
  AssignmentRoleSelection,
} from "@maximilian/shared/types/assignment.type";
import type { PedidoListEntry } from "@maximilian/shared/types/pedido.type";

type TabAsignacion = "pedidos" | "asignacion";

interface AssignmentWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  pedidosIniciales?: PedidoListEntry[];
  asignacionesIniciales?: AssignmentRoleSelection[];
  modo?: "crear" | "editar";
  tabInicial?: TabAsignacion;
  titulo?: string;
}

const PEDIDO_COLUMNS = [
  { label: "Cliente" },
  { label: "Investigado" },
  { label: "Idioma del informe" },
  { label: "Tipo de tramite" },
  { label: "Vencimiento" },
  { label: "Ver detalle", className: "text-center" },
];

const ASIGNACIONES_INICIALES: AssignmentRoleSelection[] = [
  { role: "analyst", assignee: null },
  { role: "translator", assignee: null },
];

const ID_ESTADO_ASIGNACION_SIN_ASIGNACION_PENDIENTE = 4;

const ETIQUETAS_ROL: Record<AssignmentRole, string> = {
  analyst: "Analista",
  translator: "Traductor(a)",
};

function IndicadorErrorTab() {
  return <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />;
}

function getBadgeVigencia(vigencia: string | number) {
  const texto = String(vigencia || "-").trim();
  const textoNormalizado = normalizarBusqueda(texto);
  const dias = Number(texto.match(/\d+/)?.[0] ?? Number.NaN);

  let clases = "bg-green-50 text-green-700";

  if (textoNormalizado.includes("vencido")) {
    clases = "bg-red-50 text-red-700";
  } else if (Number.isFinite(dias) && dias <= 1) {
    clases = "bg-amber-50 text-amber-700";
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${clases}`}>
      {texto}
    </span>
  );
}

function getBadgeAsignaciones(cantidadAsignaciones: number) {
  if (cantidadAsignaciones <= 2) return "bg-green-50 text-green-600";
  if (cantidadAsignaciones <= 4) return "bg-slate-100 text-slate-500";
  if (cantidadAsignaciones <= 5) return "bg-amber-50 text-amber-500";
  return "bg-orange-50 text-orange-500";
}

function getEtiquetaAsignaciones(cantidadAsignaciones: number) {
  return cantidadAsignaciones <= 1 ? "asignación" : "asignaciones";
}

function getEtiquetaIdiomas(cantidadIdiomas: number) {
  return `${cantidadIdiomas} ${cantidadIdiomas === 1 ? "idioma" : "idiomas"}`;
}

function normalizarBusqueda(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizarPedidoInicial(pedido: PedidoListEntry): PedidoListEntry {
  return {
    ...pedido,
    cliente: pedido.cliente || "-",
    investigado: pedido.investigado || "-",
    idioma: pedido.idioma || "-",
    tipoTramite: pedido.tipoTramite || "-",
    descripcionEstado: pedido.descripcionEstado || "-",
    colorLetra: pedido.colorLetra || "#64748b",
    colorFondo: pedido.colorFondo || "#f1f5f9",
    vigencia: pedido.vigencia || "-",
  };
}

function obtenerInicialesAsignado(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("") || "?";
}

function tieneAsignado(nombre?: string) {
  return !!nombre && nombre !== "-" && nombre !== "Sin Asignacion";
}

function convertirPedidoAAsignacionesIniciales(pedido: PedidoListEntry): AssignmentRoleSelection[] {
  return [
    {
      role: "analyst",
      assignee: tieneAsignado(pedido.analista)
        ? {
            idUsuario: 0,
            nombre: pedido.analista!,
            iniciales: obtenerInicialesAsignado(pedido.analista!),
            rol: "analyst",
            cantidadAsignaciones: 0,
          }
        : null,
    },
    {
      role: "translator",
      assignee: tieneAsignado(pedido.traductor)
        ? {
            idUsuario: 0,
            nombre: pedido.traductor!,
            iniciales: obtenerInicialesAsignado(pedido.traductor!),
            rol: "translator",
            cantidadAsignaciones: 0,
          }
        : null,
    },
  ];
}

function tieneAsignacionesEnPedido(pedido: PedidoListEntry) {
  return tieneAsignado(pedido.analista) || tieneAsignado(pedido.traductor) || !!pedido.idAsignacion;
}

export function AssignmentWorkflowModal({
  isOpen,
  onClose,
  onSuccess,
  pedidosIniciales = [],
  asignacionesIniciales = ASIGNACIONES_INICIALES,
  modo = "crear",
  tabInicial = "pedidos",
  titulo = "Nueva Asignación",
}: AssignmentWorkflowModalProps) {
  const queryClient = useQueryClient();
  const [tabActiva, setTabActiva] = useState<TabAsignacion>(tabInicial);
  const [terminoBusquedaPedido, setTerminoBusquedaPedido] = useState("");
  const [terminoBusquedaUsuario, setTerminoBusquedaUsuario] = useState("");
  const [paginaPedido, setPaginaPedido] = useState(1);
  const [pedidoDetalleId, setPedidoDetalleId] = useState<number | null>(null);
  const [idsSeleccionados, setIdsSeleccionados] = useState<Set<number>>(
    () => new Set(pedidosIniciales.map((pedido) => pedido.idPedido)),
  );
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState<Record<number, PedidoListEntry>>(
    () =>
      pedidosIniciales.reduce<Record<number, PedidoListEntry>>((acumulado, pedido) => {
        acumulado[pedido.idPedido] = normalizarPedidoInicial(pedido);
        return acumulado;
      }, {}),
  );
  const [asignacionesBorrador, setAsignacionesBorrador] = useState<AssignmentRoleSelection[]>(asignacionesIniciales);
  const [rolActivo, setRolActivo] = useState<AssignmentRole | null>(null);
  const [asignacionesDerivadasDePedido, setAsignacionesDerivadasDePedido] = useState(false);
  const esModoEdicion = modo === "editar";
  const idPedidoEdicion = pedidosIniciales[0]?.idPedido;

  const busquedaPedidoDebounced = useDebounce(terminoBusquedaPedido);
  const busquedaUsuarioDebounced = useDebounce(terminoBusquedaUsuario, 250);

  const {
    data: pedidosData,
    isLoading: isLoadingPedidos,
    isFetching: isFetchingPedidos,
    isError: isErrorPedidos,
    refetch: refetchPedidos,
  } = useQuery({
    queryKey: [
      "pedidos-asignacion-modal",
      "listarAsignacion",
      modo,
      idPedidoEdicion,
      paginaPedido,
      busquedaPedidoDebounced,
      ID_ESTADO_ASIGNACION_SIN_ASIGNACION_PENDIENTE,
    ],
    queryFn: () =>
      pedidoService.listAsignacion({
        numPag: esModoEdicion ? 1 : paginaPedido,
        busqueda: !esModoEdicion ? busquedaPedidoDebounced || undefined : undefined,
        idPedido: esModoEdicion ? idPedidoEdicion : undefined,
        idEstadoAsignacion: !esModoEdicion ? ID_ESTADO_ASIGNACION_SIN_ASIGNACION_PENDIENTE : undefined,
      }),
    enabled: isOpen && (!esModoEdicion || !!idPedidoEdicion),
  });

  const pedidoEdicion = useMemo(
    () => pedidosData?.lstPedido.find((pedido) => pedido.idPedido === idPedidoEdicion),
    [idPedidoEdicion, pedidosData?.lstPedido],
  );

  const pedidosInicialesNormalizados = useMemo(
    () => pedidosIniciales.map(normalizarPedidoInicial),
    [pedidosIniciales],
  );

  const pedidosActivos = esModoEdicion
    ? pedidoEdicion
      ? [pedidoEdicion]
      : pedidosInicialesNormalizados
    : pedidosData?.lstPedido ?? [];

  const pedidosElegidos = useMemo(
    () =>
      Array.from(idsSeleccionados)
        .map((idPedido) => pedidosSeleccionados[idPedido])
        .filter((pedido): pedido is PedidoListEntry => Boolean(pedido)),
    [idsSeleccionados, pedidosSeleccionados],
  );

  const idiomasPedido = useMemo(
    () =>
      Array.from(
        new Set(
          pedidosElegidos
            .map((pedido) => pedido.idIdioma)
            .filter((idIdioma): idIdioma is number => typeof idIdioma === "number"),
        ),
      ),
    [pedidosElegidos],
  );

  const { data: candidatos, isLoading: isLoadingCandidatos, isFetching: isFetchingCandidatos } = useQuery({
    queryKey: ["assignment-candidates-inline", rolActivo, idiomasPedido],
    queryFn: () =>
      assignmentService.listCandidates({
        role: rolActivo!,
        idiomasPedido,
      }),
    enabled: isOpen && tabActiva === "asignacion" && rolActivo !== null,
  });

  const candidatosFiltrados = useMemo(() => {
    const terminoNormalizado = normalizarBusqueda(busquedaUsuarioDebounced);
    if (!terminoNormalizado) return candidatos ?? [];

    return (candidatos ?? []).filter((candidato) => {
      const nombreCompleto = normalizarBusqueda(candidato.nombre);
      const nombres = normalizarBusqueda(candidato.nombres ?? "");
      const apellidos = normalizarBusqueda(candidato.apellidos ?? "");

      return (
        nombreCompleto.includes(terminoNormalizado)
        || nombres.includes(terminoNormalizado)
        || apellidos.includes(terminoNormalizado)
      );
    });
  }, [busquedaUsuarioDebounced, candidatos]);

  const { data: candidatosAnalista } = useQuery({
    queryKey: ["assignment-candidates-iniciales", "analyst", idiomasPedido],
    queryFn: () =>
      assignmentService.listCandidates({
        role: "analyst",
        idiomasPedido,
      }),
    enabled: isOpen && asignacionesIniciales.some((asignacion) => asignacion.role === "analyst" && !!asignacion.assignee),
  });

  const { data: candidatosTraductor } = useQuery({
    queryKey: ["assignment-candidates-iniciales", "translator", idiomasPedido],
    queryFn: () =>
      assignmentService.listCandidates({
        role: "translator",
        idiomasPedido,
      }),
    enabled: isOpen && asignacionesIniciales.some((asignacion) => asignacion.role === "translator" && !!asignacion.assignee),
  });

  useEffect(() => {
    setAsignacionesBorrador(asignacionesIniciales);
  }, [asignacionesIniciales]);

  useEffect(() => {
    if (!esModoEdicion || !pedidoEdicion) return;

    setPedidosSeleccionados({
      [pedidoEdicion.idPedido]: normalizarPedidoInicial(pedidoEdicion),
    });
  }, [esModoEdicion, pedidoEdicion]);

  useEffect(() => {
    setAsignacionesBorrador((actual) =>
      actual.map((asignacion) => {
        const asignadoActual = asignacion.assignee;
        if (!asignadoActual || asignadoActual.idUsuario > 0) return asignacion;

        const candidatosRol = asignacion.role === "analyst" ? (candidatosAnalista ?? []) : (candidatosTraductor ?? []);
        const nombreBuscado = normalizarBusqueda(asignadoActual.nombre);
        const candidatoCoincidente = candidatosRol.find(
          (candidato) => normalizarBusqueda(candidato.nombre) === nombreBuscado,
        );

        return candidatoCoincidente
          ? { ...asignacion, assignee: candidatoCoincidente }
          : asignacion;
      }),
    );
  }, [candidatosAnalista, candidatosTraductor]);

  const guardarAsignacionesMutation = useMutation({
    mutationFn: () =>
      assignmentService.saveAssignments({
        idPedidos: pedidosElegidos.map((pedido) => pedido.idPedido),
        assignments: asignacionesBorrador,
        modo: modo === "editar" || pedidosElegidos.some(tieneAsignacionesEnPedido) ? "editar" : "crear",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assignment-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      await queryClient.invalidateQueries({ queryKey: ["pedidos-asignacion-modal"] });
      onSuccess?.();
      onClose();
    },
  });

  const cantidadSeleccionados = idsSeleccionados.size;
  const puedeGuardar = cantidadSeleccionados > 0 && asignacionesBorrador.some((asignacion) => (asignacion.assignee?.idUsuario ?? 0) > 0);
  const hayErroresPedidos = cantidadSeleccionados === 0;
  const hayErroresAsignacion = cantidadSeleccionados > 0 && !puedeGuardar;

  const handleSeleccionPedidos = (ids: Set<number>) => {
    setIdsSeleccionados(ids);
    setPedidosSeleccionados((actual) => {
      const siguiente: Record<number, PedidoListEntry> = {};

      for (const idPedido of ids) {
        const pedidoActual = pedidosActivos.find((pedido) => pedido.idPedido === idPedido);
        const pedidoGuardado = pedidoActual ?? actual[idPedido];

        if (pedidoGuardado) {
          siguiente[idPedido] = normalizarPedidoInicial(pedidoGuardado);
        }
      }

      return siguiente;
    });

    const pedidosActualizados = Array.from(ids)
      .map((idPedido) => pedidosActivos.find((pedido) => pedido.idPedido === idPedido) ?? pedidosSeleccionados[idPedido])
      .filter((pedido): pedido is PedidoListEntry => Boolean(pedido));

    if (pedidosActualizados.length === 1 && tieneAsignacionesEnPedido(pedidosActualizados[0])) {
      setAsignacionesBorrador(convertirPedidoAAsignacionesIniciales(pedidosActualizados[0]));
      setAsignacionesDerivadasDePedido(true);
    } else if (asignacionesDerivadasDePedido) {
      setAsignacionesBorrador(asignacionesIniciales);
      setAsignacionesDerivadasDePedido(false);
    }
  };

  const handleElegirCandidato = (candidate: AssignmentCandidate) => {
    setAsignacionesBorrador((actual) =>
      actual.map((asignacion) =>
        asignacion.role === rolActivo
          ? { ...asignacion, assignee: candidate }
          : asignacion,
      ),
    );
    setRolActivo(null);
    setTerminoBusquedaUsuario("");
  };

  const handleCambiarTab = (tab: string) => {
    if (tab === "asignacion" && cantidadSeleccionados === 0) return;
    setTabActiva(tab as TabAsignacion);
    setRolActivo(null);
  };

  const renderPedidoRow = (pedido: PedidoListEntry) => (
    <>
      <td className="px-6 py-4 text-sm font-semibold text-brand-black">{pedido.cliente}</td>
      <td className="px-6 py-4 text-sm text-slate-600">{pedido.investigado}</td>
      <td className="px-6 py-4 text-sm text-slate-600">{pedido.idioma}</td>
      <td className="px-6 py-4 text-sm text-slate-600">{pedido.tipoTramite || "-"}</td>
      <td className="px-6 py-4">{getBadgeVigencia(pedido.vigencia)}</td>
      <td className="px-6 py-4 text-center">
        <button
          type="button"
          onClick={() => setPedidoDetalleId(pedido.idPedido)}
          className="inline-flex items-center rounded-lg p-2 text-slate-400 transition-all hover:bg-gray-100 hover:text-brand-black"
        >
          <Eye size={16} />
        </button>
      </td>
    </>
  );

  const contenidoPedidos = (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-brand-black">Pedidos seleccionados: {cantidadSeleccionados}</p>
          <p className="mt-1 text-sm text-slate-500">
            {esModoEdicion
              ? "Pedido seleccionado para reasignación."
              : "Seleccione uno o varios pedidos para continuar con la asignación."}
          </p>
        </div>
        {!esModoEdicion ? (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente o investigado"
              value={terminoBusquedaPedido}
              onChange={(e) => {
                setTerminoBusquedaPedido(e.target.value);
                setPaginaPedido(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-brand-white py-2.5 pl-10 pr-10 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
            />
            {isFetchingPedidos ? (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
            ) : null}
          </div>
        ) : null}
      </div>

      <CustomTable
        columns={PEDIDO_COLUMNS}
        data={pedidosActivos}
        getId={(pedido) => pedido.idPedido}
        renderRow={renderPedidoRow}
        isLoading={isLoadingPedidos || (!esModoEdicion && isFetchingPedidos)}
        isError={isErrorPedidos}
        onRetry={() => refetchPedidos()}
        emptyMessage="No se encontraron pedidos."
        errorMessage="Error al cargar los pedidos"
        currentPage={esModoEdicion ? 1 : paginaPedido}
        totalPages={esModoEdicion ? 1 : pedidosData?.totalPaginas ?? 1}
        totalRecords={esModoEdicion ? pedidosActivos.length : pedidosData?.totalRegistros ?? 0}
        onPageChange={setPaginaPedido}
        entityLabel="pedidos"
        selectable={!esModoEdicion}
        selectedIds={idsSeleccionados}
        onSelectionChange={handleSeleccionPedidos}
      />
    </div>
  );

  const contenidoSelector = (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setRolActivo(null);
            setTerminoBusquedaUsuario("");
          }}
          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-gray-100 hover:text-brand-black"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-3xl font-bold text-brand-black">
          {rolActivo === "analyst" ? "Asignar analista" : "Asignar traductor(a)"}
        </h3>
      </div>

      <div className="px-8 md:px-14">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={terminoBusquedaUsuario}
            onChange={(e) => setTerminoBusquedaUsuario(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-brand-black outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
          />
          {isFetchingCandidatos ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          ) : null}
        </div>
      </div>

      <div className="space-y-3 px-8 md:px-14">
        {isLoadingCandidatos ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-brand-wine" />
          </div>
        ) : candidatosFiltrados.length ? (
          candidatosFiltrados.map((candidate) => (
            <div
              key={candidate.idUsuario}
              className="flex w-full items-center justify-between gap-6 rounded-2xl border border-gray-100 px-6 py-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex min-w-0 flex-[1.4] items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                  {candidate.iniciales}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-brand-black">
                    {candidate.nombres || candidate.nombre}
                  </p>
                  {candidate.apellidos ? (
                    <p className="truncate text-sm text-slate-500">{candidate.apellidos}</p>
                  ) : null}
                </div>
              </div>

              {rolActivo === "translator" ? (
                <div className="flex flex-1 justify-center">
                  <span className="inline-flex whitespace-nowrap rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                    {getEtiquetaIdiomas(candidate.cantidadIdiomas ?? 0)}
                  </span>
                </div>
              ) : null}

              <div className="flex flex-1 justify-center">
                <span
                  className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${getBadgeAsignaciones(
                    candidate.cantidadAsignaciones,
                  )}`}
                >
                  {candidate.cantidadAsignaciones} {getEtiquetaAsignaciones(candidate.cantidadAsignaciones)}
                </span>
              </div>

              <div className="flex flex-1 justify-end">
                <CustomButton
                  size="sm"
                  variant="wine"
                  className="min-w-24"
                  onClick={() => handleElegirCandidato(candidate)}
                >
                  Asignar
                </CustomButton>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-sm text-gray-400">No se encontraron usuarios.</div>
        )}
      </div>
    </div>
  );

  const contenidoAsignacion = rolActivo ? (
    contenidoSelector
  ) : (
    <div className="space-y-8">
      <p className="text-2xl font-bold text-brand-black">Pedidos seleccionados: {cantidadSeleccionados}</p>

      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">Nro.</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Rol</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Asignado</th>
              <th className="pr-3 pl-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {asignacionesBorrador.map((assignment, index) => {
              const isAssigned = !!assignment.assignee;

              return (
                <tr key={assignment.role}>
                  <td className="px-6 py-5 text-center text-sm text-slate-500">{index + 1}</td>
                  <td className="px-6 py-5 text-xl font-bold text-brand-black">{ETIQUETAS_ROL[assignment.role]}</td>
                  <td className="px-6 py-5">
                    {isAssigned ? (
                      <span className="text-sm text-slate-600">{assignment.assignee?.nombre}</span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">Sin asignar</span>
                    )}
                  </td>
                  <td className="pr-3 pl-4 py-5">
                    <div className="flex w-full justify-end">
                      <CustomButton
                        variant="wine"
                        size="compact"
                        className="min-w-28"
                        onClick={() => setRolActivo(assignment.role)}
                      >
                        {isAssigned ? "Reasignar" : "Asignar"}
                      </CustomButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <CustomTabbedModal
        isOpen={isOpen}
        onClose={onClose}
        title={titulo}
        tabs={[
          {
            id: "pedidos",
            label: "Pedidos",
            content: contenidoPedidos,
            indicator: hayErroresPedidos
              ? <IndicadorErrorTab />
              : <span className="rounded-full bg-brand-wine/10 px-2 py-0.5 text-xs text-brand-wine">{cantidadSeleccionados}</span>,
          },
          {
            id: "asignacion",
            label: "Asignación",
            content: contenidoAsignacion,
            indicator: hayErroresAsignacion ? <IndicadorErrorTab /> : undefined,
            disabled: cantidadSeleccionados === 0,
            tooltip: cantidadSeleccionados === 0 ? "Seleccione al menos 1 pedido" : undefined,
          },
        ]}
        activeTab={tabActiva}
        onTabChange={handleCambiarTab}
        tabVariant="underline"
        maxWidth="max-w-6xl"
        zIndex="z-[90]"
        footer={
          <div className="flex justify-end gap-4">
            <CustomButton variant="secondary" size="compact" onClick={onClose} disabled={guardarAsignacionesMutation.isPending}>
              Cancelar
            </CustomButton>
            {tabActiva === "pedidos" ? (
              <CustomButton
                variant="wine"
                size="compact"
                onClick={() => setTabActiva("asignacion")}
                disabled={cantidadSeleccionados === 0}
              >
                Continuar
              </CustomButton>
            ) : (
              <CustomButton
                variant="wine"
                size="compact"
                onClick={() => guardarAsignacionesMutation.mutate()}
                loading={guardarAsignacionesMutation.isPending}
                loadingText="Guardando..."
                disabled={!puedeGuardar}
              >
                Guardar Cambios
              </CustomButton>
            )}
          </div>
        }
      />
      <CustomPedidoDetalleModal
        isOpen={pedidoDetalleId !== null}
        onClose={() => setPedidoDetalleId(null)}
        pedidoId={pedidoDetalleId}
        zIndex="z-[110]"
      />
    </>
  );
}
