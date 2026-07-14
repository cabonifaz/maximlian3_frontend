import { PEDIDO_COLUMNS, ESTADO_OPTIONS, TARJETAS_ESTADO_PEDIDO, FASE_ASIGNACION } from "@maximilian/shared/constants/pages/Coordinador/GestionPedidos.constants";
import { useMemo, useState } from "react";
import {
  Edit,
  Eye,
  FileSearch,
  Languages,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  UserPlus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomModalConfirmacionEliminacion } from "@maximilian/components/common/CustomModalConfirmacionEliminacion";
import { ModalPedido } from "@maximilian/components/coordinador/ModalPedido";
import { ModalFlujoAsignacion } from "@maximilian/components/coordinador/ModalFlujoAsignacion";
import { CustomModalDetallePedido } from "@maximilian/components/coordinador/CustomModalDetallePedido";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { pedidoService } from "@maximilian/services/pedido.service";
import { type PedidoListEntry } from "@maximilian/shared/types/pedido.type";
import { obtenerColorEstadoAnalista } from "@maximilian/shared/utils/investigacion.util";

function getEstadoBadge(descripcion: string, colorLetra: string, colorFondo: string) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: colorFondo, color: colorLetra }}
    >
      {descripcion}
    </span>
  );
}

function esPedidoCancelado(pedido: PedidoListEntry) {
  return pedido.estado === 5;
}

function obtenerEstadosAsignacionPedido(pedido: PedidoListEntry) {
  return new Set(pedido.asignaciones.map((asignacion) => asignacion.idEstadoAsignacion));
}

function obtenerEstadoPipelinePedido(pedido: PedidoListEntry) {
  if (esPedidoCancelado(pedido)) return "sin-asignacion";

  const estadosAsignacion = obtenerEstadosAsignacionPedido(pedido);
  const tieneEstado = (...estados: number[]) =>
    estados.some((estado) => estadosAsignacion.has(estado));

  if (
    estadosAsignacion.size === 0 ||
    [...estadosAsignacion].every((estado) => estado === FASE_ASIGNACION.ASIGNACION_ANULADA)
  ) {
    return "sin-asignacion";
  }

  const tieneAsignacionAnalista = tieneEstado(
    FASE_ASIGNACION.ASIGNADO_ANALISTA,
    FASE_ASIGNACION.REASIGNADO_ANALISTA,
  );
  const tieneAsignacionTraduccion = tieneEstado(
    FASE_ASIGNACION.ASIGNADO_TRADUCCION,
    FASE_ASIGNACION.REASIGNADO_TRADUCCION,
  );

  if (tieneEstado(FASE_ASIGNACION.TRADUCCION_COMPLETA)) return "completo";
  if (tieneAsignacionAnalista && tieneAsignacionTraduccion) return "ambos-asignados";
  if (tieneAsignacionTraduccion) {
    return "traduccion-activa";
  }
  if (tieneEstado(FASE_ASIGNACION.ANALISIS_COMPLETO)) return "analista-completo";
  if (tieneAsignacionAnalista) return "analista-activo";

  return "sin-asignacion";
}

function obtenerAsignacionFasePedido(pedido: PedidoListEntry, estados: number[]) {
  return pedido.asignaciones.find((asignacion) =>
    estados.includes(asignacion.idEstadoAsignacion),
  );
}

function obtenerEstadoInformeAsignacion(idEstado?: number | null, descripcion?: string | null) {
  if (idEstado === 1) return "asignado";
  if (idEstado === 2) return "rechazado";
  if (idEstado === 3) return "en-proceso";
  if (idEstado === 4) return "aprobado";
  if (idEstado === 5) return "pendiente-aprobacion";

  const texto = descripcion?.trim().toLowerCase() ?? "";

  if (!texto) return null;
  if (texto.includes("rechaz")) return "rechazado";
  if (texto.includes("pend")) return "pendiente-aprobacion";
  if (texto.includes("aprob")) return "aprobado";
  if (texto.includes("proceso") || texto.includes("borrador")) return "en-proceso";

  return "asignado";
}

function obtenerClaseFasePorAsignacion(
  pedido: PedidoListEntry,
  estados: number[],
  claseFaseVacia: string,
  claseFasePendiente: string,
) {
  const asignacion = obtenerAsignacionFasePedido(pedido, estados);
  const estadoInforme = obtenerEstadoInformeAsignacion(
    asignacion?.idEstadoInforme,
    asignacion?.descripcionEstadoInforme,
  );

  if (!asignacion) return claseFaseVacia;
  if (!estadoInforme) return claseFasePendiente;

  return `${obtenerColorEstadoAnalista(estadoInforme)} border-transparent`;
}

function obtenerTituloFasePedido(
  pedido: PedidoListEntry,
  estados: number[],
  textoFallback: string,
) {
  const asignacion = obtenerAsignacionFasePedido(pedido, estados);

  if (!asignacion) return textoFallback;

  const descripcionAsignacion = asignacion.descripcion || textoFallback;
  const descripcionEstadoInforme = asignacion.descripcionEstadoInforme?.trim();

  return descripcionEstadoInforme
    ? `${descripcionAsignacion} - ${descripcionEstadoInforme}`
    : `${descripcionAsignacion} - Sin iniciar`;
}

function obtenerIndicadorFasePedido(pedido: PedidoListEntry) {
  const requiereTraduccion = pedido.requiereTraduccion === 1;
  const estadoPipeline = obtenerEstadoPipelinePedido(pedido);
  const claseFaseVacia = "border-slate-200 bg-white text-slate-300";
  const claseFasePendiente = "border-slate-300 bg-slate-100 text-slate-500";
  const claseFaseCompletada = "border-green-200 bg-green-50 text-green-600";
  const estadosAnalista = [
    FASE_ASIGNACION.ASIGNADO_ANALISTA,
    FASE_ASIGNACION.ANALISIS_COMPLETO,
    FASE_ASIGNACION.REASIGNADO_ANALISTA,
  ];
  const estadosTraduccion = [
    FASE_ASIGNACION.ASIGNADO_TRADUCCION,
    FASE_ASIGNACION.REASIGNADO_TRADUCCION,
    FASE_ASIGNACION.TRADUCCION_COMPLETA,
  ];
  const analistaCompletado = [
    "analista-completo",
    "traduccion-activa",
    "completo",
  ].includes(estadoPipeline);
  const traduccionCompletada = estadoPipeline === "completo";
  const analistaActivo = estadoPipeline === "analista-activo" || estadoPipeline === "ambos-asignados";
  const traduccionActiva = estadoPipeline === "traduccion-activa";
  const claseAnalistaCalculada = obtenerClaseFasePorAsignacion(
    pedido,
    estadosAnalista,
    claseFaseVacia,
    claseFasePendiente,
  );
  const claseAnalista = claseAnalistaCalculada !== claseFaseVacia
    ? claseAnalistaCalculada
    : analistaCompletado
    ? claseFaseCompletada
    : analistaActivo
      ? claseFasePendiente
      : claseFaseVacia;
  const descripcionAnalista = obtenerTituloFasePedido(
    pedido,
    estadosAnalista,
    "Sin asignacion",
  );

  if (!requiereTraduccion) {
    return (
      <div className="mx-auto flex w-16 items-center justify-center" title="No requiere traduccion">
        <span
          className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm ${claseAnalista}`}
          title={descripcionAnalista}
        >
          <FileSearch size={14} />
        </span>
      </div>
    );
  }

  const claseTraduccionCalculada = obtenerClaseFasePorAsignacion(
    pedido,
    estadosTraduccion,
    claseFaseVacia,
    claseFasePendiente,
  );
  const claseTraduccion = claseTraduccionCalculada !== claseFaseVacia
    ? claseTraduccionCalculada
    : traduccionCompletada
    ? claseFaseCompletada
    : traduccionActiva
      ? claseFasePendiente
      : estadoPipeline === "ambos-asignados"
        ? claseFasePendiente
      : claseFaseVacia;
  const claseLinea = traduccionCompletada || traduccionActiva ? "bg-green-200" : "bg-slate-200";
  const descripcionTraduccion = obtenerTituloFasePedido(
    pedido,
    estadosTraduccion,
    "Sin asignacion",
  );

  return (
    <div className="relative mx-auto flex w-16 items-center justify-between" title="Analista / Traduccion">
      <span className={`absolute left-4 right-4 top-1/2 h-1 -translate-y-1/2 rounded-full ${claseLinea}`} />
      <span
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm ${claseAnalista}`}
        title={descripcionAnalista}
      >
        <FileSearch size={14} />
      </span>
      <span
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm ${claseTraduccion}`}
        title={descripcionTraduccion}
      >
        <Languages size={14} />
      </span>
    </div>
  );
}

export default function PedidoManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [terminoBusqueda, setSearchTerm] = useState("");
  const [paginaActual, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [idPedidoSeleccionado, setSelectedPedidoId] = useState<number | null>(null);
  const [idMenuActivo, setActiveMenuId] = useState<number | null>(null);
  const [menuDropdownStyle, setMenuDropdownStyle] = useState<React.CSSProperties>({});
  const [pedidoACancelar, setPedidoACancelar] = useState<PedidoListEntry | null>(null);
  const [pedidoAEliminar, setPedidoAEliminar] = useState<PedidoListEntry | null>(null);
  const [modalAsignacion, setModalAsignacion] = useState<{ key: number; pedidosIniciales: PedidoListEntry[] } | null>(null);

  const cancelarPedidoMutation = useMutation({
    mutationFn: (idPedido: number) => pedidoService.cancelar({ idPedido }),
    onSuccess: () => {
      setPedidoACancelar(null);
      queryClient.removeQueries({ queryKey: ["pedidos"], type: "inactive" });
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });

  const eliminarPedidoMutation = useMutation({
    mutationFn: (idPedido: number) => pedidoService.eliminar({ idPedido }),
    onSuccess: () => {
      setPedidoAEliminar(null);
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
  const [filtroEstados, setFilterEstados] = useState<number[]>([]);
  const [versionFiltroEstados, setVersionFiltroEstados] = useState(0);

  const busquedaConRetardo = useRetardo(terminoBusqueda);
  const estadosFiltroOrdenados = useMemo(
    () => [...filtroEstados].sort((a, b) => a - b),
    [filtroEstados],
  );
  const estadosFiltroClave = estadosFiltroOrdenados.join(",");

  const {
    data: pedidosData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["pedidos", paginaActual, busquedaConRetardo, estadosFiltroClave, versionFiltroEstados],
    queryFn: () =>
      pedidoService.list({
        numPag: paginaActual,
        busqueda: busquedaConRetardo || undefined,
        idEstado: estadosFiltroClave || undefined,
      }),
    gcTime: 0,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEstadosChange = (ids: number[]) => {
    setFilterEstados(ids);
    setVersionFiltroEstados((version) => version + 1);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (pedidosData?.totalPaginas || 1)) {
      setCurrentPage(page);
    }
  };

  const pedidosFiltrados = useMemo(() => {
    const pedidos = pedidosData?.lstPedido;
    if (!pedidos || estadosFiltroOrdenados.length === 0) return pedidos;

    const estadosSeleccionados = new Set(estadosFiltroOrdenados);
    return pedidos.filter((pedido) => estadosSeleccionados.has(pedido.estado));
  }, [estadosFiltroOrdenados, pedidosData?.lstPedido]);

  const columnas = PEDIDO_COLUMNS.map((columna, indice) => {
    if (indice !== 4) return columna;

    return {
      ...columna,
      label: (
        <CustomEncabezadoFiltroTabla
          titulo="Estado"
          opciones={ESTADO_OPTIONS}
          valores={filtroEstados}
          onChange={handleEstadosChange}
        />
      ),
    };
  });

  const tieneAsignaciones = (pedido: PedidoListEntry) => pedido.asignaciones.length > 0;

  const renderRow = (pedido: PedidoListEntry) => (
    <>
      <td className="px-6 py-4">
        <span className="block truncate text-sm font-bold text-brand-black" title={pedido.cliente}>
          {pedido.cliente}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="block truncate text-sm text-gray-600" title={pedido.investigado}>
          {pedido.investigado}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-sm text-gray-600">{pedido.idioma}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-sm text-gray-600">{pedido.logoImprimible ? "Sí" : "No"}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center">
          {getEstadoBadge(pedido.descripcionEstado, pedido.colorLetra, pedido.colorFondo)}
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        {obtenerIndicadorFasePedido(pedido)}
      </td>
      <td className="px-6 py-4 text-center">
        {pedido.fechaMod ? (
          <div className="relative inline-flex group">
            <span
              className="inline-flex items-center text-amber-500 cursor-help"
              aria-label={`Fecha de modificacion: ${pedido.fechaMod}`}
            >
              <TriangleAlert size={16} />
            </span>
            <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-brand-black px-3 py-2 text-xs font-medium text-brand-white shadow-lg group-hover:block">
              {pedido.fechaMod}
            </div>
          </div>
        ) : null}
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={(e) => {
            if (idMenuActivo === pedido.idPedido) {
              setActiveMenuId(null);
            } else {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const menuHeight = 196;
              const spaceBelow = window.innerHeight - rect.bottom;
              const top = spaceBelow < menuHeight ? rect.top - menuHeight - 4 : rect.bottom + 4;
              setMenuDropdownStyle({ top, right: window.innerWidth - rect.right });
              setActiveMenuId(pedido.idPedido);
            }
          }}
          className="p-2 text-gray-400 hover:text-brand-black hover:bg-gray-100 rounded-lg transition-all cursor-pointer hover:scale-110 active:scale-90"
        >
          <MoreHorizontal size={18} />
        </button>

        {idMenuActivo === pedido.idPedido && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
            <div
              className="fixed w-52 bg-brand-white rounded-xl shadow-2xl border border-gray-200/50 py-1 z-20 animate-in fade-in zoom-in-95 duration-100"
              style={menuDropdownStyle}
            >
              <button
                onClick={() => {
                  setSelectedPedidoId(pedido.idPedido);
                  setIsDetailModalOpen(true);
                  setActiveMenuId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Eye size={14} />
                <span>Ver detalle</span>
              </button>
              {!esPedidoCancelado(pedido) ? (
                <>
                  <button
                    onClick={() => {
                      setSelectedPedidoId(pedido.idPedido);
                      setIsEditModalOpen(true);
                      setActiveMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Edit size={14} />
                    <span>Modificar pedido</span>
                  </button>
                  <button
                    onClick={() => {
                      if (tieneAsignaciones(pedido)) {
                        navigate("/coordinador/asignaciones", {
                          state: {
                            busquedaInicial: pedido.investigado,
                          },
                        });
                      } else {
                        setModalAsignacion({
                          key: Date.now(),
                          pedidosIniciales: [pedido],
                        });
                      }
                      setActiveMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <UserPlus size={14} />
                    <span>{tieneAsignaciones(pedido) ? "Ver asignacion" : "Asignar"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setPedidoACancelar(pedido);
                      setActiveMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <X size={14} />
                    <span>Cancelar pedido</span>
                  </button>
                </>
              ) : null}
              <button
                onClick={() => {
                  setPedidoAEliminar(pedido);
                  setActiveMenuId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 size={14} />
                <span>Eliminar pedido</span>
              </button>
            </div>
          </>
        )}
      </td>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {TARJETAS_ESTADO_PEDIDO.map((tarjeta) => {
          const Icono = tarjeta.Icono;
          const total = pedidosData?.[tarjeta.clave] ?? 0;

          return (
            <article
              key={tarjeta.clave}
              className="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50">
                  <Icono size={18} className={tarjeta.colorIcono} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {tarjeta.titulo}
                </span>
              </div>
              <p className="text-3xl font-bold text-brand-black">{total}</p>
            </article>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Pedidos</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Busca por cliente o investigado"
              className="w-full pl-10 pr-4 py-2 bg-brand-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
              value={terminoBusqueda}
              onChange={handleSearchChange}
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-wine text-brand-white rounded-lg text-sm font-medium hover:bg-brand-wine/90 transition-all shadow-sm shadow-brand-wine/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Agregar Pedido</span>
          </button>
        </div>
      </div>

      <CustomTabla
        columns={columnas}
        data={pedidosFiltrados}
        getId={(p) => p.idPedido}
        renderRow={renderRow}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="No se encontraron pedidos."
        errorMessage="Error al cargar los pedidos"
        paginaActual={paginaActual}
        totalPages={pedidosData?.totalPaginas ?? 1}
        totalRecords={pedidosData?.totalRegistros ?? 0}
        onPageChange={handlePageChange}
        entityLabel="pedidos"
      />
      <ModalPedido
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        modo="crear"
      />
      <ModalPedido
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedPedidoId(null); }}
        pedidoId={idPedidoSeleccionado}
        modo="editar"
      />
      <CustomModalDetallePedido
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPedidoId(null);
        }}
        pedidoId={idPedidoSeleccionado}
      />
      {modalAsignacion ? (
        <ModalFlujoAsignacion
          key={modalAsignacion.key}
          isOpen
          onClose={() => setModalAsignacion(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["assignment-orders"] });
            queryClient.invalidateQueries({ queryKey: ["pedidos"] });
          }}
          pedidosIniciales={modalAsignacion.pedidosIniciales}
          tabInicial="asignacion"
          titulo="Nueva Asignación"
        />
      ) : null}
      <CustomModalConfirmacionEliminacion
        isOpen={pedidoACancelar !== null}
        onClose={() => setPedidoACancelar(null)}
        onConfirm={() => cancelarPedidoMutation.mutate(pedidoACancelar!.idPedido)}
        title="Cancelar pedido"
        isSubmitting={cancelarPedidoMutation.isPending}
      >
        <p className="text-sm text-gray-600">
          Pedido de <span className="font-semibold">{pedidoACancelar?.cliente}</span> —{" "}
          {pedidoACancelar?.investigado}
        </p>
      </CustomModalConfirmacionEliminacion>
      <CustomModalConfirmacionEliminacion
        isOpen={pedidoAEliminar !== null}
        onClose={() => setPedidoAEliminar(null)}
        onConfirm={() => eliminarPedidoMutation.mutate(pedidoAEliminar!.idPedido)}
        title="Eliminar pedido"
        isSubmitting={eliminarPedidoMutation.isPending}
      >
        <p className="text-sm text-gray-600">
          Pedido de <span className="font-semibold">{pedidoAEliminar?.cliente}</span> —{" "}
          {pedidoAEliminar?.investigado}
        </p>
      </CustomModalConfirmacionEliminacion>
    </div>
  );
}
