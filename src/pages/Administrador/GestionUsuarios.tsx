import {
  Search,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react";
import { ModalUsuario } from "@maximilian/components/administrador/ModalUsuario";
import { CustomModalConfirmacionEliminacion } from "@maximilian/components/common/CustomModalConfirmacionEliminacion";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomChipEstado } from "@maximilian/components/common/CustomChipEstado";
import { useGestionUsuarios } from "@maximilian/hooks/useGestionUsuarios";
import type { UserListEntry } from "@maximilian/shared/types/usuario.type";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";

export default function GestionUsuarios() {
  const {
    abrirModalEditar,
    abrirModalEliminar,
    actualizarUsuarioMutation,
    cambiarBusqueda,
    cambiarFiltroEstado,
    cambiarPagina,
    cerrarModalEditar,
    cerrarModalEliminar,
    crearUsuario,
    crearUsuarioMutation,
    editarUsuario,
    eliminarUsuario,
    eliminarUsuarioMutation,
    estaAbiertoModalCrear,
    estaAbiertoModalEditar,
    estaAbiertoModalEliminar,
    estaCargandoUsuario,
    estadosUsuarioData,
    filtro,
    idEstadoFiltro,
    idMenuActivo,
    isLoading,
    isError,
    paginaActual,
    refetch,
    setEstaAbiertoModalCrear,
    setIdMenuActivo,
    usuarioSeleccionado,
    usuariosData,
  } = useGestionUsuarios();

  const columnas = [
    { label: "Nombre", width: "14%" },
    { label: "Apellido Paterno", width: "13%" },
    { label: "Apellido Materno", width: "13%" },
    { label: "Nombre de Usuario", width: "15%" },
    { label: "Rol(es)", width: "15%" },
    { label: "Correo", width: "17%" },
    {
      label: (
        <CustomEncabezadoFiltroTabla
          titulo="Estado"
          opciones={estadosUsuarioData}
          valores={idEstadoFiltro ? [idEstadoFiltro] : []}
          onChange={cambiarFiltroEstado}
          onFiltroCambiado={() => cambiarPagina(1)}
          multiple={false}
        />
      ),
      width: "10%",
    },
    { label: "", width: "3%" },
  ];

  const renderRow = (user: UserListEntry, index: number) => (
    <>
      <td className="px-6 py-4 text-brand-black font-medium">{user.nombres}</td>
      <td className="px-6 py-4 text-gray-600">{user.apellidoPaterno}</td>
      <td className="px-6 py-4 text-gray-600">{user.apellidoMaterno}</td>
      <td className="px-6 py-4 text-gray-600">{user.usuario}</td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {user.roles ? (
            user.roles.split(", ").map((role, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium capitalize"
              >
                {role.toLowerCase()}
              </span>
            ))
          ) : (
            <span className="text-gray-400 italic text-[10px]">Sin roles</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-gray-600">
        <span className="block truncate" title={user.correo}>
          {user.correo}
        </span>
      </td>
      <td className="px-6 py-4">
        <CustomChipEstado
          tamano="normal"
          claseColor={user.estado === "Activo"
            ? "bg-green-50 text-green-700 border-green-100"
            : "bg-red-50 text-red-700 border-red-100"}
          className="border font-semibold"
        >
          {user.estado}
        </CustomChipEstado>
      </td>
      <td className="px-6 py-4 text-right relative">
        <button
          onClick={() =>
            setIdMenuActivo(
              idMenuActivo === user.idUsuario ? null : user.idUsuario,
            )
          }
          className="text-gray-400 hover:text-brand-black transition-colors p-1 cursor-pointer hover:scale-110 active:scale-90"
        >
          <MoreHorizontal size={20} />
        </button>

        {idMenuActivo === user.idUsuario && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIdMenuActivo(null)}
            />
            <div
              className={`absolute right-6 ${
                index >= (usuariosData?.lstUsuarios.length ?? 0) - 2
                  ? "bottom-10"
                  : "top-10"
              } w-48 bg-brand-white rounded-xl shadow-2xl border border-gray-200/50 py-1 z-20 animate-in fade-in zoom-in-95 duration-100`}
            >
              <button
                onClick={() => abrirModalEditar(user)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Edit2 size={14} />
                <span>Editar usuario</span>
              </button>
              <button
                onClick={() => abrirModalEliminar(user)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 size={14} />
                <span>Eliminar usuario</span>
              </button>
            </div>
          </>
        )}
      </td>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-black">Usuarios</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, usuario o correo"
              value={filtro}
              onChange={(e) => cambiarBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 bg-brand-white border border-gray-200 rounded-lg text-sm w-96 focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setEstaAbiertoModalCrear(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-wine text-brand-white rounded-lg text-sm font-medium hover:bg-brand-wine/90 transition-all shadow-sm shadow-brand-wine/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Agregar Usuario</span>
          </button>
        </div>
      </div>

      <ModalUsuario
        isOpen={estaAbiertoModalCrear}
        onClose={() => setEstaAbiertoModalCrear(false)}
        onConfirm={crearUsuario}
        modo="crear"
        isSubmitting={crearUsuarioMutation.isPending}
      />

      <ModalUsuario
        isOpen={estaAbiertoModalEditar}
        onClose={cerrarModalEditar}
        onConfirm={editarUsuario}
        modo="editar"
        datosIniciales={usuarioSeleccionado}
        isSubmitting={actualizarUsuarioMutation.isPending}
      />

      <CustomModalConfirmacionEliminacion
        isOpen={estaAbiertoModalEliminar}
        onClose={cerrarModalEliminar}
        onConfirm={eliminarUsuario}
        isSubmitting={eliminarUsuarioMutation.isPending}
        title="¿Eliminar este usuario?"
        descripcion="Esta acción eliminará al usuario seleccionado de forma permanente. El usuario dejará de tener acceso al sistema."
        textoCargandoConfirmar="Eliminando..."
        anchoMaximoClassName="max-w-lg"
      >
        <p>
          Usuario seleccionado:{" "}
          <span className="font-bold text-brand-black">
            {usuarioSeleccionado
              ? `${usuarioSeleccionado.nombres} ${usuarioSeleccionado.apellidoPaterno} ${usuarioSeleccionado?.apellidoMaterno ?? ""}`.trim()
              : "-"}
          </span>
        </p>
      </CustomModalConfirmacionEliminacion>

      <CustomTabla
        columns={columnas}
        data={usuariosData?.lstUsuarios}
        getId={(u) => u.idUsuario}
        renderRow={renderRow}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="No se encontraron usuarios registrados."
        errorMessage="Error al cargar usuarios"
        paginaActual={paginaActual}
        totalPages={usuariosData?.totalPaginas ?? 1}
        totalRecords={usuariosData?.totalRegistros ?? 0}
        onPageChange={cambiarPagina}
        entityLabel="usuarios"
      />

      {estaCargandoUsuario && (
        <PantallaCarga message="Cargando datos del usuario..." />
      )}
    </div>
  );
}
