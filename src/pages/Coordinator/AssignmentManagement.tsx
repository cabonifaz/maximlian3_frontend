import { useMemo, useState } from "react";
import { Search, Filter, MoreHorizontal, Edit, X, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CustomTable } from "@maximilian/components/common/CustomTable";
import { ConfirmDeleteModal } from "@maximilian/components/common/ConfirmDeleteModal";
import { MultiSearchableSelect } from "@maximilian/components/common/MultiSearchableSelect";
import { AssignmentWorkflowModal } from "@maximilian/components/coordinator/AssignmentWorkflowModal";
import { useDebounce } from "@maximilian/hooks/useDebounce";
import { assignmentService } from "@maximilian/services/assignment.service";
import type { AssignmentOrderEntry } from "@maximilian/shared/types/assignment.type";
import type { PedidoListEntry } from "@maximilian/shared/types/pedido.type";

const ASSIGNMENT_COLUMNS = [
  { label: "Cliente" },
  { label: "Investigado" },
  { label: "Analista" },
  { label: "Traductor" },
  { label: "Estado" },
  { label: "Vencimiento" },
  { label: "Acciones", className: "text-right" },
];

function getEstadoBadge(descripcion: string, colorLetra: string, colorFondo: string) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold text-center"
      style={{ backgroundColor: colorFondo, color: colorLetra }}
    >
      {descripcion}
    </span>
  );
}

function getVigenciaBadge(asignacion: AssignmentOrderEntry) {
  const esVencido = asignacion.porVencerTexto.toLowerCase().includes("venc");
  const dias = asignacion.porVencerTexto.match(/\d+/)?.[0];

  return (
    <span
      className="inline-flex min-w-24 flex-col rounded-xl px-3 py-2 text-center text-xs font-semibold"
      style={{ color: asignacion.porVencerColor, backgroundColor: asignacion.porVencerFondo }}
    >
      <span>{esVencido ? "Vencido" : asignacion.porVencerTexto}</span>
      {esVencido && dias ? (
        <span className="text-[11px] font-medium opacity-80">
          {dias} {dias === "1" ? "dia" : "dias"}
        </span>
      ) : null}
    </span>
  );
}

function convertirAsignacionAPedido(asignacion: AssignmentOrderEntry): PedidoListEntry {
  return {
    idPedido: asignacion.idPedido,
    codigo: "",
    idCliente: 0,
    cliente: asignacion.cliente,
    investigado: asignacion.investigado,
    idIdioma: asignacion.idIdioma ?? 0,
    idioma: asignacion.idiomaInforme,
    logoImprimible: false,
    estado: asignacion.idEstado ?? 0,
    descripcionEstado: asignacion.estado || "-",
    colorLetra: asignacion.estadoColorLetra || "#475569",
    colorFondo: asignacion.estadoColorFondo || "#f1f5f9",
    vigencia: 0,
  };
}

function convertirAsignacionAAsignacionesIniciales(asignacion: AssignmentOrderEntry) {
  return [
    {
      role: "analyst" as const,
      assignee:
        asignacion.analista && asignacion.analista !== "-" && asignacion.analista !== "Sin Asignacion"
          ? {
              idUsuario: 0,
              nombre: asignacion.analista,
              iniciales: asignacion.analista
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((parte) => parte.charAt(0).toUpperCase())
                .join("") || "?",
              rol: "analyst" as const,
              cantidadAsignaciones: 0,
            }
          : null,
    },
    {
      role: "translator" as const,
      assignee:
        asignacion.traductor && asignacion.traductor !== "-" && asignacion.traductor !== "Sin Asignacion"
          ? {
              idUsuario: 0,
              nombre: asignacion.traductor,
              iniciales: asignacion.traductor
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((parte) => parte.charAt(0).toUpperCase())
                .join("") || "?",
              rol: "translator" as const,
              cantidadAsignaciones: 0,
            }
          : null,
    },
  ];
}

export default function AssignmentManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterEstados, setFilterEstados] = useState<number[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [menuDropdownStyle, setMenuDropdownStyle] = useState<React.CSSProperties>({});
  const [asignacionAAnular, setAsignacionAAnular] = useState<AssignmentOrderEntry | null>(null);
  const [modalAsignacion, setModalAsignacion] = useState<{
    key: number;
    titulo: string;
    tabInicial: "pedidos" | "asignacion";
    pedidosIniciales: PedidoListEntry[];
    asignacionesIniciales: {
      role: "analyst" | "translator";
      assignee: {
        idUsuario: number;
        nombre: string;
        iniciales: string;
        rol: "analyst" | "translator";
        cantidadAsignaciones: number;
      } | null;
    }[];
  } | null>(null);

  const debouncedSearch = useDebounce(searchTerm);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["assignment-orders", currentPage, debouncedSearch],
    queryFn: () =>
      assignmentService.list({
        numPag: currentPage,
        busqueda: debouncedSearch || undefined,
      }),
  });

  const anularAsignacionMutation = useMutation({
    mutationFn: (idAsignacion: number) => assignmentService.delete({ idAsignacion }),
    onSuccess: () => {
      setAsignacionAAnular(null);
      queryClient.invalidateQueries({ queryKey: ["assignment-orders"] });
    },
  });

  const asignacionesFiltradas = useMemo(() => {
    return (data?.lstPedido ?? []).filter((asignacion) => {
      const pasaEstado =
        filterEstados.length === 0 ||
        filterEstados.some((estado) => asignacion.idEstado === estado);

      return pasaEstado;
    });
  }, [data?.lstPedido, filterEstados]);

  const usandoFiltroLocal = filterEstados.length > 0;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (data?.totalPaginas || 1)) {
      setCurrentPage(page);
    }
  };

  const renderRow = (asignacion: AssignmentOrderEntry) => (
    <>
      <td className="px-6 py-4 text-sm font-semibold text-brand-black">{asignacion.cliente}</td>
      <td className="px-6 py-4 text-sm text-slate-600">{asignacion.investigado}</td>
      <td className="px-6 py-4 text-sm text-slate-600">{asignacion.analista || "-"}</td>
      <td className="px-6 py-4 text-sm text-slate-600">{asignacion.traductor || "-"}</td>
      <td className="px-6 py-4">
        {getEstadoBadge(
          asignacion.estado || "-",
          asignacion.estadoColorLetra || "#475569",
          asignacion.estadoColorFondo || "#f1f5f9",
        )}
      </td>
      <td className="px-6 py-4">{getVigenciaBadge(asignacion)}</td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={(e) => {
            if (activeMenuId === asignacion.idPedido) {
              setActiveMenuId(null);
            } else {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const menuHeight = 96;
              const spaceBelow = window.innerHeight - rect.bottom;
              const top = spaceBelow < menuHeight ? rect.top - menuHeight - 4 : rect.bottom + 4;
              setMenuDropdownStyle({ top, right: window.innerWidth - rect.right });
              setActiveMenuId(asignacion.idPedido);
            }
          }}
          className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-brand-black cursor-pointer hover:scale-110 active:scale-90"
        >
          <MoreHorizontal size={18} />
        </button>

        {activeMenuId === asignacion.idPedido && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
            <div
              className="fixed z-20 w-52 rounded-xl border border-gray-200/50 bg-brand-white py-1 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
              style={menuDropdownStyle}
            >
              <button
                onClick={() => {
                  setModalAsignacion({
                    key: Date.now(),
                    titulo: "Modificar Asignación",
                    tabInicial: "asignacion",
                    pedidosIniciales: [convertirAsignacionAPedido(asignacion)],
                    asignacionesIniciales: convertirAsignacionAAsignacionesIniciales(asignacion),
                  });
                  setActiveMenuId(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
              >
                <Edit size={14} />
                <span>Reasignar</span>
              </button>
              <button
                onClick={() => {
                  setAsignacionAAnular(asignacion);
                  setActiveMenuId(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
                disabled={!asignacion.idAsignacion}
              >
                <X size={14} />
                <span>Anular</span>
              </button>
            </div>
          </>
        )}
      </td>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-brand-black">Asignaciones</h1>

        <div className="flex flex-1 flex-col gap-3 md:max-w-3xl md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre del cliente, analista o traductor"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-brand-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
            />
          </div>

          <button
            onClick={() =>
              setModalAsignacion({
                key: Date.now(),
                titulo: "Nueva Asignación",
                tabInicial: "pedidos",
                pedidosIniciales: [],
                asignacionesIniciales: [
                  { role: "analyst", assignee: null },
                  { role: "translator", assignee: null },
                ],
              })
            }
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-wine px-4 py-2 text-sm font-medium text-brand-white shadow-sm shadow-brand-wine/20 transition-all hover:bg-brand-wine/90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus size={16} />
            <span>Nueva Asignación</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <MultiSearchableSelect
          label="Estado"
          hideLabel
          triggerIcon={Filter}
          idMaster={43}
          value={filterEstados}
          onChange={(ids) => {
            setFilterEstados(ids);
            setCurrentPage(1);
          }}
          resumirSelecciones
          placeholder="Filtrar por estado"
        />
      </div>

      <CustomTable
        columns={ASSIGNMENT_COLUMNS}
        data={asignacionesFiltradas}
        getId={(asignacion) => asignacion.idPedido}
        renderRow={renderRow}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="No se encontraron asignaciones."
        errorMessage="Error al cargar las asignaciones"
        currentPage={usandoFiltroLocal ? 1 : currentPage}
        totalPages={usandoFiltroLocal ? 1 : data?.totalPaginas ?? 1}
        totalRecords={usandoFiltroLocal ? asignacionesFiltradas.length : data?.totalRegistros ?? 0}
        onPageChange={handlePageChange}
        entityLabel="asignaciones"
      />

      {modalAsignacion ? (
        <AssignmentWorkflowModal
          key={modalAsignacion.key}
          isOpen
          onClose={() => setModalAsignacion(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["assignment-orders"] });
            queryClient.invalidateQueries({ queryKey: ["pedidos"] });
          }}
          pedidosIniciales={modalAsignacion.pedidosIniciales}
          asignacionesIniciales={modalAsignacion.asignacionesIniciales}
          tabInicial={modalAsignacion.tabInicial}
          titulo={modalAsignacion.titulo}
        />
      ) : null}

      <ConfirmDeleteModal
        isOpen={asignacionAAnular !== null}
        onClose={() => setAsignacionAAnular(null)}
        onConfirm={() => anularAsignacionMutation.mutate(asignacionAAnular!.idAsignacion!)}
        title="Anular asignación"
        isSubmitting={anularAsignacionMutation.isPending}
      >
        <p className="text-sm text-gray-600">
          Pedido de <span className="font-semibold">{asignacionAAnular?.cliente}</span> — {asignacionAAnular?.investigado}
        </p>
      </ConfirmDeleteModal>
    </div>
  );
}
