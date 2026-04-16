import { useState } from "react";
import { Search, Filter, MoreHorizontal, Edit, UserPlus, X, Plus, Eye } from "lucide-react";
import { MultiSearchableSelect } from "@maximilian/components/common/MultiSearchableSelect";
import type { MasterTableEntry } from "@maximilian/shared/types/master-table.type";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomTable } from "@maximilian/components/common/CustomTable";
import { ConfirmDeleteModal } from "@maximilian/components/common/ConfirmDeleteModal";
import { AddPedidoModal } from "@maximilian/components/coordinator/AddPedidoModal";
import { AssignmentWorkflowModal } from "@maximilian/components/coordinator/AssignmentWorkflowModal";
import { CustomPedidoDetalleModal } from "@maximilian/components/coordinator/CustomPedidoDetalleModal";
import { EditPedidoModal } from "@maximilian/components/coordinator/EditPedidoModal";
import { useDebounce } from "@maximilian/hooks/useDebounce";
import { pedidoService } from "@maximilian/services/pedido.service";
import { type PedidoListEntry } from "@maximilian/shared/types/pedido.type";

const PEDIDO_COLUMNS = [
  { label: "Cliente" },
  { label: "Investigado" },
  { label: "Idioma del Informe" },
  { label: "Logo Imprimible" },
  { label: "Estado" },
  { label: "Acciones", className: "text-right" },
];

const ESTADO_OPTIONS = [
  { num1: 1, string1: "Pendiente" },
  { num1: 2, string1: "En revisión" },
  { num1: 3, string1: "Aprobado" },
  { num1: 4, string1: "Observado" },
  { num1: 5, string1: "Cancelado" },
] as MasterTableEntry[];

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

export default function PedidoManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [menuDropdownStyle, setMenuDropdownStyle] = useState<React.CSSProperties>({});
  const [pedidoToCancel, setPedidoToCancel] = useState<PedidoListEntry | null>(null);
  const [modalAsignacion, setModalAsignacion] = useState<{ key: number; pedidosIniciales: PedidoListEntry[] } | null>(null);

  const cancelPedidoMutation = useMutation({
    mutationFn: (idPedido: number) => pedidoService.cancel({ idPedido }),
    onSuccess: () => {
      setPedidoToCancel(null);
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
  const [filterEstados, setFilterEstados] = useState<number[]>([]);

  const debouncedSearch = useDebounce(searchTerm);

  const {
    data: pedidosData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["pedidos", currentPage, debouncedSearch, filterEstados],
    queryFn: () =>
      pedidoService.list({
        numPag: currentPage,
        busqueda: debouncedSearch || undefined,
        idEstado: filterEstados.length > 0 ? filterEstados.join(",") : undefined,
      }),
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEstadosChange = (ids: number[]) => {
    setFilterEstados(ids);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (pedidosData?.totalPaginas || 1)) {
      setCurrentPage(page);
    }
  };

  const renderRow = (pedido: PedidoListEntry) => (
    <>
      <td className="px-6 py-4">
        <span className="text-sm font-bold text-brand-black">{pedido.cliente}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">{pedido.investigado}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">{pedido.idioma}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">{pedido.logoImprimible ? "Sí" : "No"}</span>
      </td>
      <td className="px-6 py-4">{getEstadoBadge(pedido.descripcionEstado, pedido.colorLetra, pedido.colorFondo)}</td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={(e) => {
            if (activeMenuId === pedido.idPedido) {
              setActiveMenuId(null);
            } else {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const menuHeight = 156;
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

        {activeMenuId === pedido.idPedido && (
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
                  setModalAsignacion({
                    key: Date.now(),
                    pedidosIniciales: [pedido],
                  });
                  setActiveMenuId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <UserPlus size={14} />
                <span>Asignar</span>
              </button>
              <button
                onClick={() => {
                  setPedidoToCancel(pedido);
                  setActiveMenuId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <X size={14} />
                <span>Cancelar pedido</span>
              </button>
            </div>
          </>
        )}
      </td>
    </>
  );

  return (
    <div className="space-y-6">
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
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <MultiSearchableSelect
            label="Estado"
            hideLabel
            triggerIcon={Filter}
            options={ESTADO_OPTIONS}
            value={filterEstados}
            onChange={handleEstadosChange}
            resumirSelecciones
            placeholder="Todos los estados"
          />

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-wine text-brand-white rounded-lg text-sm font-medium hover:bg-brand-wine/90 transition-all shadow-sm shadow-brand-wine/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Agregar Pedido</span>
          </button>
        </div>
      </div>

      <CustomTable
        columns={PEDIDO_COLUMNS}
        data={pedidosData?.lstPedido}
        getId={(p) => p.idPedido}
        renderRow={renderRow}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="No se encontraron pedidos."
        errorMessage="Error al cargar los pedidos"
        currentPage={currentPage}
        totalPages={pedidosData?.totalPaginas ?? 1}
        totalRecords={pedidosData?.totalRegistros ?? 0}
        onPageChange={handlePageChange}
        entityLabel="pedidos"
      />
      <AddPedidoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <EditPedidoModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedPedidoId(null); }}
        pedidoId={selectedPedidoId}
      />
      <CustomPedidoDetalleModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPedidoId(null);
        }}
        pedidoId={selectedPedidoId}
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
          tabInicial="asignacion"
          titulo="Nueva Asignación"
        />
      ) : null}
      <ConfirmDeleteModal
        isOpen={pedidoToCancel !== null}
        onClose={() => setPedidoToCancel(null)}
        onConfirm={() => cancelPedidoMutation.mutate(pedidoToCancel!.idPedido)}
        title="Cancelar pedido"
        isSubmitting={cancelPedidoMutation.isPending}
      >
        <p className="text-sm text-gray-600">
          Pedido de <span className="font-semibold">{pedidoToCancel?.cliente}</span> —{" "}
          {pedidoToCancel?.investigado}
        </p>
      </ConfirmDeleteModal>
    </div>
  );
}
