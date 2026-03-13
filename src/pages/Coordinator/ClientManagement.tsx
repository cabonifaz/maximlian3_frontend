import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserMinus,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AddClientModal } from "@maximilian/components/AddClientModal";
import { ClientDetailModal } from "@maximilian/components/ClientDetailModal";
import { clientService } from "@maximilian/services/client.service";
import {
  type ClientInfoFormData,
  type ContactFormData,
} from "@maximilian/schemas";
import { type CreateClientRequest } from "@maximilian/shared/types/client.type";

interface ClientMutationParams {
  data: ClientInfoFormData;
  contacts: ContactFormData[];
  reset: () => void;
}

export default function ClientManagement() {
  const [searchTerm, setSearchBar] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const {
    data: clientsData,
    isLoading: isLoadingClients,
    isError: isErrorClients,
    refetch: refetchClients,
  } = useQuery({
    queryKey: ["clients", currentPage, searchTerm],
    queryFn: () =>
      clientService.list({
        numPag: currentPage,
        Filtro: searchTerm || undefined,
      }),
  });

  const createClientMutation = useMutation({
    mutationFn: ({ data, contacts }: ClientMutationParams) => {
      const apiRequest: CreateClientRequest = {
        idTipoPersona: data.tipoPersona as number,
        nombre: data.nombre,
        nombreCorto: data.nombre.substring(0, 20), // Fallback
        idPais: data.pais as number,
        idRegistroTributario: data.tipoRegistroTributario as number,
        numRegistroTributario: data.representanteLegal, // Placeholder
        correo: data.email,
        webSite: data.sitioWeb || "",
        telefono: data.telefono,
        fax: "",
        direccion: data.direccion,
        recomendacion: "",
        idEmpresaAtencion: 1, // Default or context-based
        idIdioma: 1, // Default (Español)
        logoClienteUrl: "",
        imprimeLogoSafety: true,
        idFormatoDocumento: data.formatoInforme as number,
        idMoneda: 1, // Default (USD or based on context)
        idIdiomaFacturacion: 1,
        aplicaPenalidad: false,
        idPlantilla: 1,
        contactos: contacts.map((c) => ({
          nombres: c.nombre,
          idTipoContacto: c.tipoContacto as number,
          areaTrabajo: c.areaTrabajo as number,
          telefono: c.telefono,
          email: c.email,
        })),
      };
      return clientService.create(apiRequest);
    },
    onSuccess: (_, { reset }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente creado exitosamente");
      setIsModalOpen(false);
      reset();
    },
    onError: (error: Error) => {
      console.error("Error al crear cliente:", error.message);
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: (updateData: any) => {
      return clientService.update(updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", selectedClientId] });
      toast.success("Cliente actualizado exitosamente");
      setIsDetailModalOpen(false);
      setSelectedClientId(null);
    },
    onError: (error: Error) => {
      console.error("Error al actualizar cliente:", error.message);
    },
  });

  const handleConfirmCreate = (
    data: ClientInfoFormData,
    contacts: ContactFormData[],
    reset: () => void,
  ) => {
    createClientMutation.mutate({ data, contacts, reset });
  };

  const handleUpdateClient = (data: any, contacts: any[]) => {
    updateClientMutation.mutate({ ...data, contactos: contacts });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchBar(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (clientsData?.totalPaginas || 1)) {
      setCurrentPage(page);
    }
  };

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
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-brand-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
            <Filter className="w-4 h-4" />
            <span>País</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-brand-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
            <div className="w-2 h-2 rounded-full bg-brand-wine" />
            <span>Estado</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-black text-brand-white rounded-xl text-sm font-bold hover:bg-brand-black/90 transition-all shadow-lg shadow-black/10 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Cliente</span>
          </button>
        </div>
      </div>

      <div className="bg-brand-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  País
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Tipo de Persona
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoadingClients ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-brand-wine animate-spin" />
                      <p className="text-sm font-medium text-gray-500">
                        Cargando clientes...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : isErrorClients ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <AlertCircle className="w-10 h-10 text-red-500" />
                      <p className="text-sm font-bold text-brand-black">
                        Error al cargar los clientes
                      </p>
                      <button
                        onClick={() => refetchClients()}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-wine text-brand-white rounded-lg text-xs font-bold hover:bg-brand-wine/90 transition-all cursor-pointer"
                      >
                        <RefreshCw size={14} />
                        <span>REINTENTAR</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : clientsData?.lstClientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-20 text-center text-gray-400 text-sm italic"
                  >
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                clientsData?.lstClientes.map((client, index) => (
                  <tr
                    key={client.idCliente}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-brand-black">
                        {client.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {client.pais}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 capitalize">
                        {client.tipoPersona.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">
                        {client.telefono}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {client.correo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-600">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() =>
                          setActiveMenuId(
                            activeMenuId === client.idCliente
                              ? null
                              : client.idCliente,
                          )
                        }
                        className="p-2 text-gray-400 hover:text-brand-black hover:bg-gray-100 rounded-lg transition-all cursor-pointer hover:scale-110 active:scale-90"
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {activeMenuId === client.idCliente && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div
                            className={`absolute right-6 ${
                              index >= clientsData.lstClientes.length - 2
                                ? "bottom-10"
                                : "top-10"
                            } w-48 bg-brand-white rounded-xl shadow-2xl border border-gray-200/50 py-1 z-20 animate-in fade-in zoom-in-95 duration-100`}
                          >
                            <button
                              onClick={() => {
                                setSelectedClientId(client.idCliente);
                                setIsDetailModalOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Eye size={14} />
                              <span>Ver detalle</span>
                            </button>
                            <button
                              onClick={() => setActiveMenuId(null)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <UserMinus size={14} />
                              <span>Desactivar cliente</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">
            Mostrando {clientsData?.lstClientes.length || 0} de{" "}
            {clientsData?.totalRegistros || 0} clientes
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoadingClients}
              className="p-2 text-gray-400 hover:text-brand-black transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {Array.from(
                { length: clientsData?.totalPaginas || 1 },
                (_, i) => i + 1,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer hover:scale-110 ${
                    page === currentPage
                      ? "bg-brand-black text-brand-white shadow-lg shadow-black/10"
                      : "text-gray-400 hover:bg-gray-100 hover:text-brand-black"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={
                currentPage === (clientsData?.totalPaginas || 1) ||
                isLoadingClients
              }
              className="p-2 text-gray-400 hover:text-brand-black transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCreate}
        isSubmitting={createClientMutation.isPending}
      />

      <ClientDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClientId(null);
        }}
        clientId={selectedClientId}
        onUpdate={handleUpdateClient}
        isUpdating={updateClientMutation.isPending}
      />
    </div>
  );
}
