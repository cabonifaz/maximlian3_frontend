import { PEDIDO_COLUMNS, ASIGNACIONES_INICIALES, ETIQUETAS_ROL } from "@maximilian/shared/constants/components/coordinador/modal-flujo-asignacion.constants";
import { ArrowLeft, Eye, Loader2, Search } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomIndicadorErrorFormulario } from "@maximilian/components/common/CustomIndicadorErrorFormulario";
import { CustomModalDetallePedido } from "@maximilian/components/coordinador/CustomModalDetallePedido";
import { CustomModalPestanas } from "@maximilian/components/common/CustomModalPestanas";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { useModalFlujoAsignacion } from "@maximilian/hooks/useModalFlujoAsignacion";
import type { AssignmentRoleSelection } from "@maximilian/shared/types/asignacion.type";
import type { PedidoListEntry } from "@maximilian/shared/types/pedido.type";
import type { TabAsignacion } from "@maximilian/shared/types/modal-flujo-asignacion.type";
import { normalizarTextoBusqueda } from "@maximilian/shared/utils/texto.util";

interface ModalFlujoAsignacionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  pedidosIniciales?: PedidoListEntry[];
  asignacionesIniciales?: AssignmentRoleSelection[];
  modo?: "crear" | "editar";
  tabInicial?: TabAsignacion;
  titulo?: string;
}

function getBadgeVigencia(vigencia: string | number) {
  const texto = String(vigencia || "-").trim();
  const textoNormalizado = normalizarTextoBusqueda(texto);
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

export function ModalFlujoAsignacion({
  isOpen,
  onClose,
  onSuccess,
  pedidosIniciales = [],
  asignacionesIniciales = ASIGNACIONES_INICIALES,
  modo = "crear",
  tabInicial = "pedidos",
  titulo = "Nueva Asignación",
}: ModalFlujoAsignacionProps) {
  const {
    asignacionesBorrador,
    candidatosFiltrados,
    cantidadSeleccionados,
    esModoEdicion,
    guardarAsignacionesMutation,
    handleCambiarTab,
    handleElegirCandidato,
    handleSeleccionPedidos,
    hayErroresAsignacion,
    hayErroresPedidos,
    idsSeleccionados,
    isErrorPedidos,
    isFetchingCandidatos,
    isFetchingPedidos,
    isLoadingCandidatos,
    isLoadingPedidos,
    paginaPedido,
    pedidoDetalleId,
    pedidosActivos,
    pedidosData,
    puedeAsignarTraductor,
    puedeGuardar,
    refetchPedidos,
    rolActivo,
    setPaginaPedido,
    setPedidoDetalleId,
    setRolActivo,
    setTabActiva,
    setTerminoBusquedaPedido,
    setTerminoBusquedaUsuario,
    tabActiva,
    terminoBusquedaPedido,
    terminoBusquedaUsuario,
  } = useModalFlujoAsignacion({
    isOpen,
    onClose,
    onSuccess,
    pedidosIniciales,
    asignacionesIniciales,
    modo,
    tabInicial,
  });

  const renderPedidoRow = (pedido: PedidoListEntry) => (
    <>
      <td className="px-6 py-4 text-sm font-semibold text-brand-black">
        <span className="block truncate" title={pedido.cliente}>
          {pedido.cliente}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        <span className="block truncate" title={pedido.investigado}>
          {pedido.investigado}
        </span>
      </td>
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

      <CustomTabla
        columns={PEDIDO_COLUMNS}
        data={pedidosActivos}
        getId={(pedido) => pedido.idPedido}
        renderRow={renderPedidoRow}
        isLoading={isLoadingPedidos || isFetchingPedidos}
        isError={isErrorPedidos}
        onRetry={() => refetchPedidos()}
        emptyMessage="No se encontraron pedidos."
        errorMessage="Error al cargar los pedidos"
        paginaActual={esModoEdicion ? 1 : paginaPedido}
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

      <div className="max-w-full overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full min-w-[900px] table-fixed border-collapse text-left [&_td]:max-w-0 [&_td]:break-words">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[24%]" />
            <col className="w-[44%]" />
            <col className="w-[20%]" />
          </colgroup>
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
              const esTraductorNoRequerido = assignment.role === "translator" && !puedeAsignarTraductor;

              return (
                <tr key={assignment.role}>
                  <td className="px-6 py-5 text-center text-sm text-slate-500">{index + 1}</td>
                  <td className="px-6 py-5 text-xl font-bold text-brand-black">{ETIQUETAS_ROL[assignment.role]}</td>
                  <td className="px-6 py-5">
                    {esTraductorNoRequerido ? (
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
                        No requiere traducción
                      </span>
                    ) : isAssigned ? (
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
                        disabled={esTraductorNoRequerido}
                        title={esTraductorNoRequerido ? "El idioma del informe es Español, no requiere traductor" : undefined}
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
      <CustomModalPestanas
        isOpen={isOpen}
        onClose={onClose}
        title={titulo}
        tabs={[
          {
            id: "pedidos",
            label: "Pedidos",
            content: contenidoPedidos,
            indicator: hayErroresPedidos
              ? <CustomIndicadorErrorFormulario />
              : <span className="rounded-full bg-brand-wine/10 px-2 py-0.5 text-xs text-brand-wine">{cantidadSeleccionados}</span>,
          },
          {
            id: "asignacion",
            label: "Asignación",
            content: contenidoAsignacion,
            indicator: hayErroresAsignacion ? <CustomIndicadorErrorFormulario /> : undefined,
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
      <CustomModalDetallePedido
        isOpen={pedidoDetalleId !== null}
        onClose={() => setPedidoDetalleId(null)}
        pedidoId={pedidoDetalleId}
        zIndex="z-[110]"
      />
    </>
  );
}
