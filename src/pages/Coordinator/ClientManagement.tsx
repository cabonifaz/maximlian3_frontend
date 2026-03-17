import { useMemo, useRef, useState } from "react";
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
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddClientModal } from "@maximilian/components/AddClientModal";
import { ClientDetailModal } from "@maximilian/components/ClientDetailModal";
import { ConfirmDeleteModal } from "@maximilian/components/ConfirmDeleteModal";
import { useDebounce } from "@maximilian/hooks/useDebounce";
import { clientService } from "@maximilian/services/client.service";
import { masterTableService } from "@maximilian/services/masterTable.service";
import {
  type ClientInfoFormData,
  type ContactFormData,
  type RateFormData,
} from "@maximilian/schemas";
import { type CreateClientRequest, type ClientListEntry } from "@maximilian/shared/types/client.type";
import { MasterTableId } from "@maximilian/shared/types/master-table.type";

interface ClientMutationParams {
  data: ClientInfoFormData;
  contacts: ContactFormData[];
  rates: RateFormData[];
  reset: () => void;
}

export default function ClientManagement() {
  const [searchTerm, setSearchBar] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientListEntry | null>(null);
  const [filterPais, setFilterPais] = useState<number | undefined>(undefined);
  const [filterEstado, setFilterEstado] = useState<number | undefined>(undefined);
  const [isPaisOpen, setIsPaisOpen] = useState(false);
  const [isEstadoOpen, setIsEstadoOpen] = useState(false);
  const [paisSearch, setPaisSearch] = useState("");
  const [paisDropdownStyle, setPaisDropdownStyle] = useState<React.CSSProperties>({});
  const [estadoDropdownStyle, setEstadoDropdownStyle] = useState<React.CSSProperties>({});
  const paisBtnRef = useRef<HTMLButtonElement>(null);
  const estadoBtnRef = useRef<HTMLButtonElement>(null);

  const debouncedSearch = useDebounce(searchTerm);

  const queryClient = useQueryClient();

  const {
    data: clientsData,
    isLoading: isLoadingClients,
    isError: isErrorClients,
    refetch: refetchClients,
  } = useQuery({
    queryKey: ["clients", currentPage, debouncedSearch, filterPais, filterEstado],
    queryFn: () =>
      clientService.list({
        numPag: currentPage,
        busqueda: debouncedSearch || undefined,
        idPais: filterPais,
        idEstado: filterEstado,
      }),
  });

  const { data: paises } = useQuery({
    queryKey: ["masterTable", MasterTableId.PAIS],
    queryFn: () => masterTableService.list(MasterTableId.PAIS),
  });

  const { data: estadosCliente } = useQuery({
    queryKey: ["masterTable", MasterTableId.ESTADO_CLIENTE],
    queryFn: () => masterTableService.list(MasterTableId.ESTADO_CLIENTE),
  });

  const { data: tiposPersona } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_PERSONA],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_PERSONA),
  });

  const paisMap = useMemo(
    () => Object.fromEntries((paises ?? []).map((e) => [e.num1, e.string1])),
    [paises],
  );

  const tipoPersonaMap = useMemo(
    () =>
      Object.fromEntries((tiposPersona ?? []).map((e) => [e.num1, e.string1])),
    [tiposPersona],
  );

  const createClientMutation = useMutation({
    mutationFn: ({ data, contacts, rates }: ClientMutationParams) => {
      const apiRequest: CreateClientRequest = {
        idTipoPersona: data.tipoPersona as number,
        nombre: data.nombre,
        nombreCorto: data.nombre.substring(0, 20),
        idPais: data.pais as number,
        idRegistroTributario: data.tipoRegistroTributario as number,
        numRegistroTributario: data.numRegistroTributario ?? "",
        email: data.email,
        idEstado: 1,
        webSite: data.sitioWeb || "",
        telefono: data.telefono,
        fax: data.fax ?? "",
        direccion: data.direccion,
        recomendacion: data.recomendacion ?? "",
        idEmpresaAtencion: data.atendidoPor as number,
        idIdioma: data.idioma as number,
        logoClienteUrl: "",
        imprimeLogoSafety: data.imprimeLogoSafety,
        lstIdFormatoDocumento: data.formatoInforme as number[],
        idMoneda: data.moneda as number,
        idIdiomaFacturacion: data.idiomaFacturacion as number,
        aplicaPenalidad: data.aplicaPenalidad,
        idPlantilla: data.plantillaInforme,
        contactos: contacts.map((c) => ({
          nombres: c.nombre,
          idTipoPersonaContacto: c.tipoPersona as number,
          idTipoContacto: c.tipoContacto as number,
          areaTrabajo: c.areaTrabajo as number,
          telefono: c.telefono,
          email: c.email,
          codigo: c.codigoContacto || null,
          enviarCorreo: c.enviarCorreo,
        })),
        tarifario: rates.map((r) => ({
          idProducto: r.producto as number,
          idTipoTramite: r.tramite as number,
          idPais: r.pais as number,
          idMoneda: r.moneda as number,
          diasMax: r.diasMax,
          diasMin: r.diasMin,
          precio: r.precio,
          penalidad: r.penalidad,
        })),
      };
      return clientService.create(apiRequest);
    },
    onSuccess: (_, { reset }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsModalOpen(false);
      reset();
    },
    onError: (error: Error) => {
      console.error("Error al crear cliente:", error.message);
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (idCliente: number) => clientService.eliminate({ idCliente }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: Error) => {
      console.error("Error al desactivar cliente:", error.message);
    },
  });

  const handleConfirmCreate = (
    data: ClientInfoFormData,
    contacts: ContactFormData[],
    rates: RateFormData[],
    reset: () => void,
  ) => {
    createClientMutation.mutate({ data, contacts, rates, reset });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchBar(e.target.value);
    setCurrentPage(1);
  };

  const handlePaisButtonClick = () => {
    if (!isPaisOpen && paisBtnRef.current) {
      const rect = paisBtnRef.current.getBoundingClientRect();
      setPaisDropdownStyle({ top: rect.bottom + 8, left: rect.left, width: Math.max(rect.width, 220) });
    }
    setIsPaisOpen((v) => !v);
    setIsEstadoOpen(false);
  };

  const handleEstadoButtonClick = () => {
    if (!isEstadoOpen && estadoBtnRef.current) {
      const rect = estadoBtnRef.current.getBoundingClientRect();
      setEstadoDropdownStyle({ top: rect.bottom + 8, left: rect.left, width: Math.max(rect.width, 180) });
    }
    setIsEstadoOpen((v) => !v);
    setIsPaisOpen(false);
  };

  const handleSelectPais = (idPais: number | undefined) => {
    setFilterPais(idPais);
    setCurrentPage(1);
    setIsPaisOpen(false);
    setPaisSearch("");
  };

  const handleSelectEstado = (idEstado: number | undefined) => {
    setFilterEstado(idEstado);
    setCurrentPage(1);
    setIsEstadoOpen(false);
  };

  const filteredPaisOptions = useMemo(() => {
    if (!paises) return [];
    return paises
      .filter((p) => p.string1?.toLowerCase().includes(paisSearch.toLowerCase()))
      .sort((a, b) => (a.string1 || "").localeCompare(b.string1 || ""));
  }, [paises, paisSearch]);

  const selectedPaisLabel = paises?.find((p) => p.num1 === filterPais)?.string1;
  const selectedEstadoLabel = estadosCliente?.find((e) => e.num1 === filterEstado)?.string1;

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

          {/* País filter */}
          <div className="relative">
            <button
              ref={paisBtnRef}
              onClick={handlePaisButtonClick}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${filterPais ? "bg-brand-wine/10 border-brand-wine/30 text-brand-wine" : "bg-brand-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              <Filter className="w-4 h-4" />
              <span>{selectedPaisLabel ?? "País"}</span>
              {filterPais && (
                <X
                  className="w-3 h-3 ml-1"
                  onClick={(e) => { e.stopPropagation(); handleSelectPais(undefined); }}
                />
              )}
            </button>
            {isPaisOpen && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setIsPaisOpen(false)} />
                <div
                  className="fixed bg-brand-white border border-gray-100 rounded-xl shadow-2xl z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                  style={paisDropdownStyle}
                >
                  <div className="p-2 border-b border-gray-50">
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-wine/10"
                      placeholder="Buscar..."
                      autoFocus
                      value={paisSearch}
                      onChange={(e) => setPaisSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <div
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-brand-wine/5 transition-colors ${!filterPais ? "bg-brand-wine/10 text-brand-wine font-bold" : "text-gray-500 italic"}`}
                      onClick={() => handleSelectPais(undefined)}
                    >
                      Todos
                    </div>
                    {filteredPaisOptions.length > 0 ? (
                      filteredPaisOptions.map((opt) => (
                        <div
                          key={opt.num1}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-brand-wine/5 transition-colors ${filterPais === opt.num1 ? "bg-brand-wine/10 text-brand-wine font-bold" : "text-gray-600"}`}
                          onClick={() => handleSelectPais(opt.num1!)}
                        >
                          {opt.string1}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs text-gray-400 italic text-center">
                        No se encontraron resultados
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Estado filter */}
          <div className="relative">
            <button
              ref={estadoBtnRef}
              onClick={handleEstadoButtonClick}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${filterEstado ? "bg-brand-wine/10 border-brand-wine/30 text-brand-wine" : "bg-brand-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              <div className={`w-2 h-2 rounded-full ${filterEstado ? "bg-brand-wine" : "bg-brand-wine"}`} />
              <span>{selectedEstadoLabel ?? "Estado"}</span>
              {filterEstado && (
                <X
                  className="w-3 h-3 ml-1"
                  onClick={(e) => { e.stopPropagation(); handleSelectEstado(undefined); }}
                />
              )}
            </button>
            {isEstadoOpen && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setIsEstadoOpen(false)} />
                <div
                  className="fixed bg-brand-white border border-gray-100 rounded-xl shadow-2xl z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                  style={estadoDropdownStyle}
                >
                  <div className="max-h-48 overflow-y-auto">
                    <div
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-brand-wine/5 transition-colors ${!filterEstado ? "bg-brand-wine/10 text-brand-wine font-bold" : "text-gray-500 italic"}`}
                      onClick={() => handleSelectEstado(undefined)}
                    >
                      Todos
                    </div>
                    {estadosCliente?.map((opt) => (
                      <div
                        key={opt.num1}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-brand-wine/5 transition-colors ${filterEstado === opt.num1 ? "bg-brand-wine/10 text-brand-wine font-bold" : "text-gray-600"}`}
                        onClick={() => handleSelectEstado(opt.num1!)}
                      >
                        {opt.string1}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

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
                        {paisMap[client.idPais] ?? "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 capitalize">
                        {tipoPersonaMap[client.idTipoPersona]?.toLowerCase() ?? "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">
                        {client.telefono}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {client.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {client.idEstado === 1 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-600">
                          Activo
                        </span>
                      ) : client.idEstado === 2 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                          Inactivo
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
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
                              onClick={() => {
                                setClientToDelete(client);
                                setActiveMenuId(null);
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
      />

      <ConfirmDeleteModal
        isOpen={clientToDelete !== null}
        onClose={() => setClientToDelete(null)}
        onConfirm={() => {
          deleteClientMutation.mutate(clientToDelete!.idCliente);
          setClientToDelete(null);
        }}
        title="Desactivar cliente"
        isSubmitting={deleteClientMutation.isPending}
      >
        <p><span className="font-bold">Nombre:</span> {clientToDelete?.nombre ?? "-"}</p>
        <p><span className="font-bold">Email:</span> {clientToDelete?.email ?? "-"}</p>
      </ConfirmDeleteModal>
    </div>
  );
}
