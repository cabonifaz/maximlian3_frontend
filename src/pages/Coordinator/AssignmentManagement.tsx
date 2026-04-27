import { useEffect, useState } from "react";
import { Search, MoreHorizontal, Edit, X, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CustomTable } from "@maximilian/components/common/CustomTable";
import { ConfirmDeleteModal } from "@maximilian/components/common/ConfirmDeleteModal";
import { AssignmentWorkflowModal } from "@maximilian/components/coordinator/AssignmentWorkflowModal";
import { SearchableSelect } from "@maximilian/components/common/SearchableSelect";
import { useDebounce } from "@maximilian/hooks/useDebounce";
import { assignmentService } from "@maximilian/services/assignment.service";
import type { AssignmentOrderEntry } from "@maximilian/shared/types/assignment.type";
import type { PedidoListEntry } from "@maximilian/shared/types/pedido.type";
import type { MasterTableEntry } from "@maximilian/shared/types/master-table.type";

const ASSIGNMENT_COLUMNS = [
  { label: "Cliente" },
  { label: "Investigado" },
  { label: "Analista" },
  { label: "Traductor" },
  { label: "Estado", className: "text-center" },
  { label: "Vencimiento" },
  { label: "Acciones", className: "text-right" },
];

const ID_ROL_TRADUCTOR = 3;
const ID_ROL_ANALISTA = 4;

function tieneAsignado(nombre?: string) {
  return !!nombre && nombre !== "-" && nombre !== "Sin Asignacion";
}

function construirOpcionesEliminacion(asignacion: AssignmentOrderEntry): MasterTableEntry[] {
  const opciones: MasterTableEntry[] = [];

  if (tieneAsignado(asignacion.analista) && asignacion.analistaIdAsignacion) {
    opciones.push({
      idEmpresa: 0,
      idTablaMaestra: null,
      idMaestro: 0,
      descripcion: "",
      num1: asignacion.analistaIdAsignacion,
      num2: ID_ROL_ANALISTA,
      num3: null,
      string1: `Analista - ${asignacion.analista}`,
      string2: null,
      string3: null,
      date1: null,
      date2: null,
      date3: null,
    });
  }

  if (tieneAsignado(asignacion.traductor) && asignacion.traductorIdAsignacion) {
    opciones.push({
      idEmpresa: 0,
      idTablaMaestra: null,
      idMaestro: 0,
      descripcion: "",
      num1: asignacion.traductorIdAsignacion,
      num2: ID_ROL_TRADUCTOR,
      num3: null,
      string1: `Traductor - ${asignacion.traductor}`,
      string2: null,
      string3: null,
      date1: null,
      date2: null,
      date3: null,
    });
  }

  return opciones;
}

function getEstadoBadge(descripcion: string, colorLetra: string, colorFondo: string) {
  const texto = descripcion.trim() || "-";
  const textoNormalizado = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  let lineas = [texto];

  if (textoNormalizado.startsWith("reasignado a ")) {
    lineas = ["Reasignado a", texto.slice("Reasignado a ".length).trim() || "-"];
  } else if (textoNormalizado.startsWith("asignado a ")) {
    lineas = ["Asignado a", texto.slice("Asignado a ".length).trim() || "-"];
  } else if (textoNormalizado === "traduccion completa") {
    lineas = ["Traduccion", "completa"];
  } else if (textoNormalizado === "analisis completo") {
    lineas = ["Analisis", "completo"];
  } else if (textoNormalizado === "asignacion anulada") {
    lineas = ["Asignacion", "anulada"];
  }

  return (
    <span
      className="inline-flex min-w-32 flex-col items-center justify-center rounded-2xl px-3 py-2 text-center text-xs font-bold leading-tight"
      style={{ backgroundColor: colorFondo, color: colorLetra }}
      title={texto}
    >
      {lineas.map((linea) => (
        <span key={linea} className="whitespace-nowrap">
          {linea}
        </span>
      ))}
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
    idAsignacion: asignacion.idAsignacion,
    codigo: "",
    idCliente: 0,
    cliente: asignacion.cliente,
    investigado: asignacion.investigado,
    idIdioma: asignacion.idIdioma ?? 0,
    idioma: asignacion.idiomaInforme || "-",
    tipoTramite: asignacion.tipoTramite || "-",
    analista: asignacion.analista,
    traductor: asignacion.traductor,
    logoImprimible: false,
    estado: asignacion.idEstado ?? 0,
    descripcionEstado: asignacion.estado || "-",
    colorLetra: asignacion.estadoColorLetra || "#475569",
    colorFondo: asignacion.estadoColorFondo || "#f1f5f9",
    vigencia: asignacion.porVencerTexto || "-",
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
  const [idEstadoFiltro, setIdEstadoFiltro] = useState<number | undefined>(undefined);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [menuDropdownStyle, setMenuDropdownStyle] = useState<React.CSSProperties>({});
  const [asignacionAAnular, setAsignacionAAnular] = useState<AssignmentOrderEntry | null>(null);
  const [idAsignacionAEliminar, setIdAsignacionAEliminar] = useState<number | undefined>(undefined);
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
    modo?: "crear" | "editar";
  } | null>(null);

  const debouncedSearch = useDebounce(searchTerm);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["assignment-orders", currentPage, debouncedSearch, idEstadoFiltro],
    queryFn: () =>
      assignmentService.list({
        numPag: currentPage,
        busqueda: debouncedSearch || undefined,
        idEstado: idEstadoFiltro,
      }),
  });

  const anularAsignacionMutation = useMutation({
    mutationFn: ({ idAsignacion }: { idAsignacion: number }) =>
      assignmentService.delete({ idAsignacion }),
    onSuccess: () => {
      setAsignacionAAnular(null);
      setIdAsignacionAEliminar(undefined);
      queryClient.invalidateQueries({ queryKey: ["assignment-orders"] });
    },
  });

  useEffect(() => {
    if (!asignacionAAnular) {
      setIdAsignacionAEliminar(undefined);
      return;
    }

    const opciones = construirOpcionesEliminacion(asignacionAAnular);
    if (opciones.length === 1) {
      setIdAsignacionAEliminar(opciones[0].num1 ?? undefined);
      return;
    }

    setIdAsignacionAEliminar(undefined);
  }, [asignacionAAnular]);

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
                    modo: "editar",
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
                disabled={!asignacion.analistaIdAsignacion && !asignacion.traductorIdAsignacion}
              >
                <X size={14} />
                <span>Eliminar</span>
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
                modo: "crear",
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
        <div className="w-full max-w-xs">
        <SearchableSelect
          idMaster={43}
          value={idEstadoFiltro}
          onChange={(idEstado) => {
            setIdEstadoFiltro(idEstado);
            setCurrentPage(1);
          }}
          onClear={() => {
            setIdEstadoFiltro(undefined);
            setCurrentPage(1);
          }}
          optional
          etiquetaOpcionVacia="Todos los estados"
          placeholder="Filtrar por estado"
        />
        </div>
      </div>

      <CustomTable
        columns={ASSIGNMENT_COLUMNS}
        data={data?.lstPedido}
        getId={(asignacion) => asignacion.idPedido}
        renderRow={renderRow}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="No se encontraron asignaciones."
        errorMessage="Error al cargar las asignaciones"
        currentPage={currentPage}
        totalPages={data?.totalPaginas ?? 1}
        totalRecords={data?.totalRegistros ?? 0}
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
          modo={modalAsignacion.modo}
          tabInicial={modalAsignacion.tabInicial}
          titulo={modalAsignacion.titulo}
        />
      ) : null}

      <ConfirmDeleteModal
        isOpen={asignacionAAnular !== null}
        onClose={() => {
          setAsignacionAAnular(null);
          setIdAsignacionAEliminar(undefined);
        }}
        onConfirm={() =>
          anularAsignacionMutation.mutate({
            idAsignacion: idAsignacionAEliminar!,
          })
        }
        title="Eliminar asignación"
        isSubmitting={anularAsignacionMutation.isPending}
        confirmDisabled={idAsignacionAEliminar === undefined}
        anchoMaximoClassName="max-w-lg"
      >
        <p className="text-sm text-gray-600">
          Pedido de <span className="font-semibold">{asignacionAAnular?.cliente}</span> — {asignacionAAnular?.investigado}
        </p>
        {asignacionAAnular ? (
          <SearchableSelect
            label="Asignacion a eliminar"
            options={construirOpcionesEliminacion(asignacionAAnular)}
            value={idAsignacionAEliminar}
            onChange={(idAsignacionSeleccionada) => {
              setIdAsignacionAEliminar(idAsignacionSeleccionada);
            }}
            placeholder="Seleccione una asignacion"
            required
            error={idAsignacionAEliminar === undefined ? "Seleccione la asignacion a eliminar" : undefined}
            dropdownZIndexClassName="z-[120]"
            overlayZIndexClassName="z-[110]"
          />
        ) : null}
      </ConfirmDeleteModal>
    </div>
  );
}
