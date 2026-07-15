import { CLIENT_COLUMNS } from "@maximilian/shared/constants/pages/Coordinador/gestion-clientes.constants";
import {
  Search,
  Plus,
  MoreHorizontal,
  UserMinus,
  Edit,
} from "lucide-react";
import { ModalAgregarCliente } from "@maximilian/components/coordinador/ModalAgregarCliente";
import { ModalDetalleCliente } from "@maximilian/components/coordinador/ModalDetalleCliente";
import { CustomModalConfirmacionEliminacion } from "@maximilian/components/common/CustomModalConfirmacionEliminacion";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomChipEstado } from "@maximilian/components/common/CustomChipEstado";
import { useGestionClientes } from "@maximilian/hooks/useGestionClientes";
import type { ClientListEntry } from "@maximilian/shared/types/cliente.type";

export default function GestionClientes() {
  const {
    terminoBusqueda,
    paginaActual,
    cambiarBusqueda,
    cambiarFiltroEstado,
    cambiarFiltroPais,
    cambiarPaginaCliente,
    cerrarDetalleCliente,
    clienteAEliminar,
    clientesData,
    crearCliente,
    crearClienteMutation,
    eliminarCliente,
    eliminarClienteMutation,
    estaAbiertoModalCrear,
    estaAbiertoModalDetalle,
    estaCargandoClientes,
    estadosCliente,
    filtroEstado,
    filtroPais,
    hayErrorClientes,
    idClienteSeleccionado,
    idMenuActivo,
    paises,
    recargarClientes,
    seleccionarClienteAEliminar,
    setClienteAEliminar,
    setEstaAbiertoModalCrear,
    setIdMenuActivo,
    abrirDetalleCliente,
  } = useGestionClientes();

  const columnas = CLIENT_COLUMNS.map((columna, indice) => {
    if (indice === 1) {
      return {
        ...columna,
        label: (
          <CustomEncabezadoFiltroTabla
            titulo="Pais"
            opciones={paises}
            valores={filtroPais ? [filtroPais] : []}
            onChange={cambiarFiltroPais}
            multiple={false}
          />
        ),
      };
    }

    if (indice === 5) {
      return {
        ...columna,
        label: (
          <CustomEncabezadoFiltroTabla
            titulo="Estado"
            opciones={estadosCliente}
            valores={filtroEstado ? [filtroEstado] : []}
            onChange={cambiarFiltroEstado}
            multiple={false}
          />
        ),
      };
    }

    return columna;
  });

  const renderRow = (client: ClientListEntry, index: number) => (
    <>
      <td className="px-6 py-4">
        <span className="block truncate text-sm font-bold text-brand-black" title={client.nombre}>
          {client.nombre}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">{client.pais || "-"}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600 capitalize">
          {client.tipoPersona?.toLowerCase() || "-"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="block truncate text-sm font-medium text-gray-600" title={client.telefono}>
          {client.telefono}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="block truncate text-sm text-gray-500" title={client.correo}>
          {client.correo}
        </span>
      </td>
      <td className="px-6 py-4">
        {client.estado ? (
          <CustomChipEstado
            claseColor={client.estado.toLowerCase() === "activo"
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-500"}
          >
            {client.estado}
          </CustomChipEstado>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-right relative">
        <button
          onClick={() =>
            setIdMenuActivo(
              idMenuActivo === client.idCliente ? null : client.idCliente,
            )
          }
          className="p-2 text-gray-400 hover:text-brand-black hover:bg-gray-100 rounded-lg transition-all cursor-pointer hover:scale-110 active:scale-90"
        >
          <MoreHorizontal size={18} />
        </button>

        {idMenuActivo === client.idCliente && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIdMenuActivo(null)}
            />
            <div
              className={`absolute right-6 ${
                index >= (clientesData?.lstClientes.length ?? 0) - 2
                  ? "bottom-10"
                  : "top-10"
              } w-48 bg-brand-white rounded-xl shadow-2xl border border-gray-200/50 py-1 z-20 animate-in fade-in zoom-in-95 duration-100`}
            >
              <button
                onClick={() => {
                  abrirDetalleCliente(client.idCliente);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Edit size={14} />
                <span>Modificar Cliente</span>
              </button>
              <button
                onClick={() => {
                  seleccionarClienteAEliminar(client);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <UserMinus size={14} />
                <span>Desactivar cliente</span>
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
          <h1 className="text-2xl font-bold text-brand-black">Clientes</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Busca por nombre o nro. de registro tributario"
              className="w-full pl-10 pr-4 py-2 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
              value={terminoBusqueda}
              onChange={(evento) => cambiarBusqueda(evento.target.value)}
            />
          </div>


          <button
            onClick={() => setEstaAbiertoModalCrear(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-wine text-brand-white rounded-lg text-sm font-medium hover:bg-brand-wine/90 transition-all shadow-sm shadow-brand-wine/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Agregar Cliente</span>
          </button>
        </div>
      </div>

      <CustomTabla
        columns={columnas}
        data={clientesData?.lstClientes}
        getId={(c) => c.idCliente}
        renderRow={renderRow}
        isLoading={estaCargandoClientes}
        isError={hayErrorClientes}
        onRetry={() => recargarClientes()}
        emptyMessage="No se encontraron clientes."
        errorMessage="Error al cargar los clientes"
        paginaActual={paginaActual}
        totalPages={clientesData?.totalPaginas ?? 1}
        totalRecords={clientesData?.totalRegistros ?? 0}
        onPageChange={cambiarPaginaCliente}
        entityLabel="clientes"
      />

      <ModalAgregarCliente
        isOpen={estaAbiertoModalCrear}
        onClose={() => setEstaAbiertoModalCrear(false)}
        onConfirm={crearCliente}
        isSubmitting={crearClienteMutation.isPending}
      />

      <ModalDetalleCliente
        isOpen={estaAbiertoModalDetalle}
        onClose={cerrarDetalleCliente}
        clientId={idClienteSeleccionado}
      />

      <CustomModalConfirmacionEliminacion
        isOpen={clienteAEliminar !== null}
        onClose={() => setClienteAEliminar(null)}
        onConfirm={eliminarCliente}
        title="Desactivar cliente"
        isSubmitting={eliminarClienteMutation.isPending}
      >
        <p><span className="font-bold">Nombre:</span> {clienteAEliminar?.nombre ?? "-"}</p>
        <p><span className="font-bold">Correo:</span> {clienteAEliminar?.correo ?? "-"}</p>
      </CustomModalConfirmacionEliminacion>
    </div>
  );
}
