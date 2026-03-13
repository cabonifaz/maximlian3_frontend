import { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreateUserModal } from "@maximilian/components/CreateUserModal";
import { EditUserModal } from "@maximilian/components/EditUserModal";
import { DeleteUserModal } from "@maximilian/components/DeleteUserModal";
import { type UserFormData } from "@maximilian/schemas";
import { userService } from "@maximilian/services/user.service";
import type {
  CreateUserRequest,
  DeleteUserRequest,
  UpdateUserRequest,
  UserListEntry,
} from "@maximilian/shared/types/user.type";
import LoadingScreen from "@maximilian/components/LoadingScreen";

interface CreateUserMutationParams {
  userData: UserFormData;
  resetForm: () => void;
}

interface UpdateUserMutationParams {
  userData: UserFormData;
  resetForm: () => void;
}

export default function UserManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserFormData | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Pagination and Filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");

  const queryClient = useQueryClient();

  // Fetch Users Query
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", currentPage, filter],
    queryFn: () => userService.list({ numPag: currentPage, filtro: filter }),
  });

  // Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: ({ userData }: CreateUserMutationParams) => {
      const apiRequest: CreateUserRequest = {
        nombres: userData.firstName,
        apellidoPaterno: userData.paternalLastName,
        apellidoMaterno: userData.maternalLastName,
        email: userData.email,
        roles: userData.roles as number[],
        idiomas: (userData.languages || []) as number[],
      };
      return userService.create(apiRequest);
    },
    onSuccess: (_, { resetForm }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario creado exitosamente");
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Error al crear usuario:", error.message);
    },
  });

  // Update User Mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userData }: UpdateUserMutationParams) => {
      if (editingUserId === null)
        throw new Error("No user selected for editing");

      const apiRequest: UpdateUserRequest = {
        idUsuario: editingUserId,
        nombres: userData.firstName,
        apellidoPaterno: userData.paternalLastName,
        apellidoMaterno: userData.maternalLastName,
        roles: userData.roles as number[],
        idiomas: (userData.languages || []) as number[],
      };
      return userService.update(apiRequest);
    },
    onSuccess: (_, { resetForm }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario actualizado exitosamente");
      setIsEditModalOpen(false);
      setEditingUserId(null);
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Error al actualizar usuario:", error.message);
    },
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (idUsuario: number) => {
      const apiRequest: DeleteUserRequest = { idUsuarioEliminar: idUsuario };
      return userService.delete(apiRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario eliminado exitosamente");
      setIsDeleteModalOpen(false);
      setDeletingUserId(null);
    },
    onError: (error: Error) => {
      console.error("Error al eliminar usuario:", error.message);
    },
  });

  const handleCreateUser = (userData: UserFormData, resetForm: () => void) => {
    createUserMutation.mutate({ userData, resetForm });
  };

  const handleEditUser = (userData: UserFormData, resetForm: () => void) => {
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
    try {
      const details = await userService.getById(user.idUsuario);

      const editData: UserFormData = {
        firstName: details.nombres || "",
        paternalLastName: details.apellidoPaterno || "",
        maternalLastName: details.apellidoMaterno || "",
        username: user.username || "",
        email: details.email || "",
        roles: details.roles || [],
        languages: details.idiomas || [],
      };
      setEditingUserId(user.idUsuario);
      setSelectedUser(editData);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error loading user details", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const openDeleteModal = (user: UserListEntry) => {
    setDeletingUserId(user.idUsuario);
    setSelectedUser({
      firstName: user.nombres,
      paternalLastName: user.apellidoPaterno,
      maternalLastName: user.apellidoMaterno,
      username: user.username,
      email: user.email,
      roles: user.roles ? user.roles.split(", ") : [],
    });
    setIsDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (usersData?.totalPaginas || 1)) {
      setCurrentPage(page);
    }
  };

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
              placeholder="Buscar usuario"
              value={filter}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 bg-brand-white border border-gray-200 rounded-lg text-sm w-72 focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
            <Filter size={16} />
            <span>Estado</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-wine text-brand-white rounded-lg text-sm font-medium hover:bg-brand-wine/90 transition-all shadow-sm shadow-brand-wine/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Agregar Usuario</span>
          </button>
        </div>
      </div>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateUser}
        isSubmitting={createUserMutation.isPending}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUserId(null);
        }}
        onConfirm={handleEditUser}
        initialData={selectedUser}
        isSubmitting={updateUserMutation.isPending}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingUserId(null);
        }}
        onConfirm={handleDeleteUser}
        userName={selectedUser?.firstName}
        isSubmitting={deleteUserMutation.isPending}
      />

      <div className="bg-brand-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 size={40} className="text-brand-wine animate-spin" />
            <p className="text-sm font-medium text-gray-500">
              Cargando usuarios...
            </p>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <AlertCircle size={28} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-brand-black">
                Error al cargar usuarios
              </p>
              <p className="text-xs text-gray-500">{(error as Error).message}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-brand-wine text-brand-white rounded-lg text-xs font-bold hover:bg-brand-wine/90 transition-all cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>REINTENTAR</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                    Apellido Paterno
                  </th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                    Apellido Materno
                  </th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                    Nombre de Usuario
                  </th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersData?.lstUsuarios.map((user) => (
                  <tr
                    key={user.idUsuario}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-brand-black font-medium">
                      {user.nombres}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {user.apellidoPaterno}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {user.apellidoMaterno}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.username}</td>
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
                          <span className="text-gray-400 italic text-[10px]">
                            Sin roles
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
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
                            activeMenuId === user.idUsuario
                              ? null
                              : user.idUsuario,
                          )
                        }
                        className="text-gray-400 hover:text-brand-black transition-colors p-1 cursor-pointer hover:scale-110 active:scale-90"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {activeMenuId === user.idUsuario && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div
                            className={`absolute right-6 ${
                              (usersData?.lstUsuarios.indexOf(user) ?? 0) >=
                              (usersData?.lstUsuarios.length ?? 0) - 2
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
                  </tr>
                ))}

                {(!usersData || usersData.lstUsuarios.length === 0) && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-20 text-center text-gray-400 text-sm"
                    >
                      No se encontraron usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-gray-500 text-xs">
          <span>
            Mostrando {usersData?.lstUsuarios.length || 0} de{" "}
            {usersData?.totalRegistros || 0} registros
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-1 hover:text-brand-black disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
              disabled={isLoading || isError || currentPage === 1}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <div className="flex items-center gap-2">
              {[...Array(usersData?.totalPaginas || 1)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-6 h-6 flex items-center justify-center rounded font-medium cursor-pointer hover:scale-110 transition-transform ${
                    currentPage === i + 1
                      ? "bg-brand-black text-brand-white"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center gap-1 hover:text-brand-black disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
              disabled={
                isLoading ||
                isError ||
                currentPage === (usersData?.totalPaginas || 1)
              }
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {isLoadingUser && <LoadingScreen message="Cargando datos del usuario..." />}
    </div>
  );
}
