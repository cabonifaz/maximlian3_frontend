import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ModalUsuario } from "@maximilian/components/administrador/ModalUsuario";
import { CustomModalConfirmacionEliminacion } from "@maximilian/components/common/CustomModalConfirmacionEliminacion";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { type DatosFormularioUsuario } from "@maximilian/schemas";
import { servicioUsuario } from "@maximilian/services/usuario.service";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import type {
  CreateUserRequest,
  DeleteUserRequest,
  UpdateUserRequest,
  UserListEntry,
} from "@maximilian/shared/types/usuario.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";

interface CreateUserMutationParams {
  userData: DatosFormularioUsuario;
  resetForm: () => void;
}

interface UpdateUserMutationParams {
  userData: DatosFormularioUsuario;
  resetForm: () => void;
}

const USER_COLUMNS = [
  { label: "Nombre" },
  { label: "Apellido Paterno" },
  { label: "Apellido Materno" },
  { label: "Nombre de Usuario" },
  { label: "Rol(es)" },
  { label: "Correo" },
  { label: "Estado" },
  { label: "" },
];

const ID_MAESTRO_ESTADO_USUARIO = 100;

const normalizarTexto = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export default function GestionUsuarios() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DatosFormularioUsuario | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [idMenuActivo, setActiveMenuId] = useState<number | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const [paginaActual, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [idEstadoFiltro, setIdEstadoFiltro] = useState<number | undefined>(undefined);
  const debouncedFilter = useRetardo(filter);

  const queryClient = useQueryClient();

  const { data: estadosUsuarioData } = useQuery({
    queryKey: ["masterTable", ID_MAESTRO_ESTADO_USUARIO],
    queryFn: () => servicioTablaMaestra.list(ID_MAESTRO_ESTADO_USUARIO),
    staleTime: Infinity,
  });

  const {
    data: usersData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["users", paginaActual, debouncedFilter, idEstadoFiltro],
    queryFn: () =>
      servicioUsuario.list({
        numPag: paginaActual,
        filtro: debouncedFilter,
        idEstado: idEstadoFiltro,
      }),
    enabled: filter === debouncedFilter,
  });

  const createUserMutation = useMutation({
    mutationFn: ({ userData }: CreateUserMutationParams) => {
      const apiRequest: CreateUserRequest = {
        nombres: userData.nombres,
        apellidoPaterno: userData.apellidoPaterno,
        apellidoMaterno: userData.apellidoMaterno || null,
        usuarioCreacion: userData.usuarioCreacion,
        correo: userData.correo,
        roles: userData.roles as number[],
        idiomas: (userData.idiomas || []) as number[],
      };
      return servicioUsuario.create(apiRequest);
    },
    onSuccess: (_, { resetForm }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Error al crear usuario:", error.message);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userData }: UpdateUserMutationParams) => {
      if (editingUserId === null)
        throw new Error("No user selected for editing");

      const apiRequest: UpdateUserRequest = {
        idUsuario: editingUserId,
        nombres: userData.nombres,
        apellidoPaterno: userData.apellidoPaterno,
        apellidoMaterno: userData.apellidoMaterno || null,
        correo: userData.correo,
        roles: userData.roles as number[],
        idiomas: (userData.idiomas || []) as number[],
        idEstado: userData.activo ? 1 : 2,
      };
      return servicioUsuario.update(apiRequest);
    },
    onSuccess: (_, { resetForm }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditModalOpen(false);
      setEditingUserId(null);
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Error al actualizar usuario:", error.message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (idUsuario: number) => {
      const apiRequest: DeleteUserRequest = { idUsuarioEliminar: idUsuario };
      return servicioUsuario.delete(apiRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleteModalOpen(false);
      setDeletingUserId(null);
    },
    onError: (error: Error) => {
      console.error("Error al eliminar usuario:", error.message);
    },
  });

  const handleCreateUser = (userData: DatosFormularioUsuario, resetForm: () => void) => {
    createUserMutation.mutate({ userData, resetForm });
  };

  const handleEditUser = (userData: DatosFormularioUsuario, resetForm: () => void) => {
    updateUserMutation.mutate({ userData, resetForm });
  };

  const handleDeleteUser = () => {
    if (deletingUserId !== null) {
      deleteUserMutation.mutate(deletingUserId);
    }
  };

  const openEditModal = async (user: UserListEntry) => {
    setIsLoadingUser(true);
    setActiveMenuId(null);
    const obtenerRolesDesdeListado = async () => {
      if (!user.roles) return [];

      const nombresRoles = user.roles.split(",").map(normalizarTexto).filter(Boolean);
      if (nombresRoles.length === 0) return [];

      const rolesMaestros = await queryClient.fetchQuery({
        queryKey: ["masterTable", TablaMaestraId.ROLES],
        queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ROLES),
        staleTime: Infinity,
      });

      return rolesMaestros
        .filter((rol) => rol.num1 !== null && nombresRoles.includes(normalizarTexto(rol.string1 ?? "")))
        .map((rol) => rol.num1!);
    };

    try {
      const details = await servicioUsuario.getById(user.idUsuario);
      const rolesDesdeListado = await obtenerRolesDesdeListado();

      const editData: DatosFormularioUsuario = {
        nombres: details.nombres || "",
        apellidoPaterno: details.apellidoPaterno || "",
        apellidoMaterno: details.apellidoMaterno || "",
        usuarioCreacion: user.usuario || "",
        correo: details.correo || "",
        roles: details.roles?.length ? details.roles : rolesDesdeListado,
        idiomas: details.idiomas || [],
        activo:
          details.idEstado !== undefined
            ? details.idEstado === 1
            : (details.estado ?? user.estado).toLowerCase() === "activo",
      };
      setEditingUserId(user.idUsuario);
      setSelectedUser(editData);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error loading user details", error);
      if (user.estado.toLowerCase() !== "activo") {
        const rolesDesdeListado = await obtenerRolesDesdeListado();
        setEditingUserId(user.idUsuario);
        setSelectedUser({
          nombres: user.nombres || "",
          apellidoPaterno: user.apellidoPaterno || "",
          apellidoMaterno: user.apellidoMaterno || "",
          usuarioCreacion: user.usuario || "",
          correo: user.correo || "",
          roles: rolesDesdeListado,
          idiomas: [],
          activo: false,
        });
        setIsEditModalOpen(true);
      }
    } finally {
      setIsLoadingUser(false);
    }
  };

  const openDeleteModal = (user: UserListEntry) => {
    setDeletingUserId(user.idUsuario);
    setSelectedUser({
      nombres: user.nombres,
      apellidoPaterno: user.apellidoPaterno,
      apellidoMaterno: user.apellidoMaterno ?? undefined,
      usuarioCreacion: user.usuario,
      correo: user.correo,
      roles: user.roles ? user.roles.split(", ") : [],
      activo: user.estado.toLowerCase() === "activo",
    });
    setIsDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (usersData?.totalPaginas || 1)) {
      setCurrentPage(page);
    }
  };

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
      <td className="px-6 py-4 text-gray-600">{user.correo}</td>
      <td className="px-6 py-4">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
            user.estado === "Activo"
              ? "bg-green-50 text-green-700 border-green-100"
              : "bg-red-50 text-red-700 border-red-100"
          }`}
        >
          {user.estado}
        </span>
      </td>
      <td className="px-6 py-4 text-right relative">
        <button
          onClick={() =>
            setActiveMenuId(
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
              onClick={() => setActiveMenuId(null)}
            />
            <div
              className={`absolute right-6 ${
                index >= (usersData?.lstUsuarios.length ?? 0) - 2
                  ? "bottom-10"
                  : "top-10"
              } w-48 bg-brand-white rounded-xl shadow-2xl border border-gray-200/50 py-1 z-20 animate-in fade-in zoom-in-95 duration-100`}
            >
              <button
                onClick={() => openEditModal(user)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Edit2 size={14} />
                <span>Editar usuario</span>
              </button>
              <button
                onClick={() => openDeleteModal(user)}
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
              value={filter}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 bg-brand-white border border-gray-200 rounded-lg text-sm w-96 focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all"
            />
          </div>
          <div className="w-48">
            <CustomSelectorBuscable
              options={estadosUsuarioData}
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
              etiquetaOpcionVacia="Todos"
              placeholder="Estado"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-wine text-brand-white rounded-lg text-sm font-medium hover:bg-brand-wine/90 transition-all shadow-sm shadow-brand-wine/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Agregar Usuario</span>
          </button>
        </div>
      </div>

      <ModalUsuario
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateUser}
        modo="crear"
        isSubmitting={createUserMutation.isPending}
      />

      <ModalUsuario
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUserId(null);
        }}
        onConfirm={handleEditUser}
        modo="editar"
        datosIniciales={selectedUser}
        isSubmitting={updateUserMutation.isPending}
      />

      <CustomModalConfirmacionEliminacion
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingUserId(null);
        }}
        onConfirm={handleDeleteUser}
        isSubmitting={deleteUserMutation.isPending}
        title="¿Eliminar este usuario?"
        descripcion="Esta acción eliminará al usuario seleccionado de forma permanente. El usuario dejará de tener acceso al sistema."
        textoCargandoConfirmar="Eliminando..."
        anchoMaximoClassName="max-w-lg"
      >
        <p>
          Usuario seleccionado:{" "}
          <span className="font-bold text-brand-black">
            {selectedUser
              ? `${selectedUser.nombres} ${selectedUser.apellidoPaterno} ${selectedUser?.apellidoMaterno ?? ""}`.trim()
              : "-"}
          </span>
        </p>
      </CustomModalConfirmacionEliminacion>

      <CustomTabla
        columns={USER_COLUMNS}
        data={usersData?.lstUsuarios}
        getId={(u) => u.idUsuario}
        renderRow={renderRow}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="No se encontraron usuarios registrados."
        errorMessage="Error al cargar usuarios"
        paginaActual={paginaActual}
        totalPages={usersData?.totalPaginas ?? 1}
        totalRecords={usersData?.totalRegistros ?? 0}
        onPageChange={handlePageChange}
        entityLabel="usuarios"
      />

      {isLoadingUser && (
        <PantallaCarga message="Cargando datos del usuario..." />
      )}
    </div>
  );
}
