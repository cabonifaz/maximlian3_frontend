import { useState, useMemo, useEffect } from "react";
import {
  X,
  Plus,
  MoreHorizontal,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  clientDetailSchema,
  type ClientDetailFormData,
  clientDetailContactSchema,
  type ClientDetailContactFormData,
} from "@maximilian/schemas";
import { AddRateModal } from "./AddRateModal";
import { masterTableService } from "@maximilian/services/masterTable.service";
import { clientService } from "@maximilian/services/client.service";
import {
  MasterTableId,
  type MasterTableEntry,
} from "@maximilian/shared/types/master-table.type";

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number | null;
  onUpdate?: (
    data: ClientDetailFormData,
    contacts: ClientDetailContactFormData[],
  ) => void;
  isUpdating?: boolean;
}

type Tab = "info" | "rates" | "contacts";
type ContactView = "list" | "create" | "edit" | "detail";

interface SearchableSelectProps {
  label: string;
  options: MasterTableEntry[] | undefined;
  value: string | number | undefined;
  onChange: (val: number) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

function SearchableSelect({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = "Seleccione...",
  disabled = false,
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!options) return [];
    return options
      .filter((opt) =>
        opt.string1?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => (a.string1 || "").localeCompare(b.string1 || ""));
  }, [options, searchTerm]);

  const selectedOption = options?.find((opt) => opt.num1 === value);

  return (
    <div className="relative space-y-2">
      <label className="text-sm font-bold text-gray-700">{label}</label>
      <div
        className={`w-full px-4 py-2.5 bg-brand-white border ${error ? "border-red-500" : "border-gray-200"} rounded-xl text-sm flex items-center justify-between transition-all ${disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : "cursor-pointer hover:border-brand-wine/30"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-brand-black" : "text-gray-400"}>
          {selectedOption ? selectedOption.string1 : placeholder}
        </span>
        <Search size={16} className="text-gray-400" />
      </div>

      {!disabled && isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-brand-white border border-gray-100 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-2 border-b border-gray-50">
              <input
                type="text"
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-wine/10"
                placeholder="Buscar..."
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.num1}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-brand-wine/5 transition-colors ${value === opt.num1 ? "bg-brand-wine/10 text-brand-wine font-bold" : "text-gray-600"}`}
                    onClick={() => {
                      onChange(opt.num1!);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
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
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function ClientDetailModal({
  isOpen,
  onClose,
  clientId,
  onUpdate,
  isUpdating = false,
}: ClientDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [contactView, setContactView] = useState<ContactView>("list");
  const [addedContacts, setAddedContacts] = useState<ClientDetailContactFormData[]>([]);

  const {
    data: client,
    isLoading: isLoadingClient,
    isError: isErrorClient,
    refetch: refetchClient,
  } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => (clientId ? clientService.getById(clientId) : null),
    enabled: !!clientId && isOpen,
  });

  const {
    register: infoRegister,
    reset: infoReset,
    setValue: setInfoValue,
    watch: infoWatch,
    getValues: getInfoValues,
  } = useForm<ClientDetailFormData>({
    resolver: zodResolver(clientDetailSchema),
  });

  const {
    register: contactRegister,
    reset: contactReset,
    setValue: setContactValue,
    watch: contactWatch,
  } = useForm<ClientDetailContactFormData>({
    resolver: zodResolver(clientDetailContactSchema),
  });

  // Populate form when client data is loaded
  useEffect(() => {
    if (client) {
      infoReset({
        id: client.idCliente,
        tipoPersona: client.idTipoPersona,
        nombre: client.nombre,
        pais: client.idPais,
        direccion: client.direccion,
        email: client.correo,
        telefono: client.telefono,
        sitioWeb: client.webSite,
        tipoRegistroTributario: client.idRegistroTributario,
        representanteLegal: client.numRegistroTributario,
        formatoInforme: client.idFormatoDocumento,
        estado: client.estado,
      });

      setAddedContacts(
        client.contactos.map((c) => ({
          id: c.idContacto,
          tipoPersona: client.idTipoPersona, // Fallback if not in detail
          tipoContacto: c.idTipoContacto,
          codigoContacto: "N/A", // Fallback if not in detail
          nombre: c.nombres,
          email: c.email,
          telefono: c.telefono,
          areaTrabajo: c.areaTrabajo,
        })),
      );
    }
  }, [client, infoReset]);

  // Queries for MasterTable parameters
  const { data: tipoPersonaData } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_PERSONA],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_PERSONA),
    enabled: isOpen,
  });

  const { data: paisData } = useQuery({
    queryKey: ["masterTable", MasterTableId.PAIS],
    queryFn: () => masterTableService.list(MasterTableId.PAIS),
    enabled: isOpen,
  });

  const { data: tipoRegTributarioData } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_REG_TRIBUTARIO],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_REG_TRIBUTARIO),
    enabled: isOpen,
  });

  const { data: formatoInformeData } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_FORMATO_INFORME],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_FORMATO_INFORME),
    enabled: isOpen,
  });

  const { data: tipoContactoData } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_CONTACTO],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_CONTACTO),
    enabled: isOpen && activeTab === "contacts",
  });

  const { data: areaTrabajoData } = useQuery({
    queryKey: ["masterTable", MasterTableId.AREA_TRABAJO],
    queryFn: () => masterTableService.list(MasterTableId.AREA_TRABAJO),
    enabled: isOpen && activeTab === "contacts",
  });

  if (!isOpen) return null;

  const handleUpdate = () => {
    const infoData = getInfoValues();
    onUpdate?.(infoData, addedContacts);
  };

  const openDetailContact = (contact: ClientDetailContactFormData) => {
    Object.keys(contact).forEach((key) => {
      setContactValue(
        key as keyof ClientDetailContactFormData,
        contact[key as keyof ClientDetailContactFormData],
      );
    });
    setContactView("detail");
  };

  const watchedPais = infoWatch("pais");
  const watchedTipoRegTributario = infoWatch("tipoRegistroTributario");
  const watchedContactTipoPersona = contactWatch("tipoPersona");
  const watchedContactAreaTrabajo = contactWatch("areaTrabajo");
  const watchedContactTipoContacto = contactWatch("tipoContacto");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-brand-black">
              Detalle del Cliente
            </h2>
            {client && (
              <p className="text-xs text-gray-400 mt-1 font-medium text-brand-wine/80">
                Estado: {client.estado}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-6 shrink-0">
          <div className="bg-gray-50 p-1 rounded-2xl flex gap-1">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                activeTab === "info"
                  ? "bg-brand-white text-brand-black shadow-sm border-b-2 border-brand-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Información
            </button>
            <button
              onClick={() => setActiveTab("rates")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                activeTab === "rates"
                  ? "bg-brand-white text-brand-black shadow-sm border-b-2 border-brand-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Tarifas
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                activeTab === "contacts"
                  ? "bg-brand-white text-brand-black shadow-sm border-b-2 border-brand-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Contactos
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto min-h-0">
          {isLoadingClient ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 size={40} className="text-brand-wine animate-spin" />
              <p className="text-sm font-medium text-gray-500">
                Cargando información...
              </p>
            </div>
          ) : isErrorClient ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-20 text-center">
              <AlertCircle size={40} className="text-red-500" />
              <p className="text-sm font-bold text-brand-black">
                Error al cargar el cliente
              </p>
              <button
                onClick={() => refetchClient()}
                className="flex items-center gap-2 px-4 py-2 bg-brand-wine text-brand-white rounded-lg text-xs font-bold hover:bg-brand-wine/90 transition-all cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>REINTENTAR</span>
              </button>
            </div>
          ) : (
            <>
              {activeTab === "info" && (
                <form
                  id="client-detail-form"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Tipo Persona
                    </label>
                    <select
                      {...infoRegister("tipoPersona", { valueAsNumber: true })}
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
                    >
                      <option value="">Seleccione</option>
                      {tipoPersonaData?.map((item) => (
                        <option key={item.num1} value={item.num1 ?? ""}>
                          {item.string1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Nombre
                    </label>
                    <input
                      {...infoRegister("nombre")}
                      type="text"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
                    />
                  </div>

                  <SearchableSelect
                    label="País"
                    options={paisData}
                    value={watchedPais}
                    onChange={(val) =>
                      setInfoValue("pais", val, { shouldValidate: true })
                    }
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Dirección
                    </label>
                    <input
                      {...infoRegister("direccion")}
                      type="text"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Email
                    </label>
                    <input
                      {...infoRegister("email")}
                      type="email"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Teléfono
                    </label>
                    <input
                      {...infoRegister("telefono")}
                      type="text"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Sitio Web
                    </label>
                    <input
                      {...infoRegister("sitioWeb")}
                      type="text"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
                    />
                  </div>

                  <SearchableSelect
                    label="Tipo Registro Tributario"
                    options={tipoRegTributarioData}
                    value={watchedTipoRegTributario}
                    onChange={(val) =>
                      setInfoValue("tipoRegistroTributario", val, {
                        shouldValidate: true,
                      })
                    }
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Representante Legal
                    </label>
                    <input
                      {...infoRegister("representanteLegal")}
                      type="text"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Formato Informe
                    </label>
                    <select
                      {...infoRegister("formatoInforme", { valueAsNumber: true })}
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
                    >
                      <option value="">Seleccione</option>
                      {formatoInformeData?.map((item) => (
                        <option key={item.num1} value={item.num1 ?? ""}>
                          {item.string1}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              )}

              {activeTab === "rates" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-xs">
                      <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full px-4 py-2 bg-brand-white border border-gray-200 rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsRateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-black text-brand-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 cursor-pointer hover:scale-[1.05] active:scale-95 transition-all"
                      >
                        <Plus size={14} />
                        <span>Nuevo</span>
                      </button>
                      <button className="px-4 py-2 bg-brand-black text-brand-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 cursor-pointer hover:scale-[1.05] active:scale-95 transition-all">
                        Editar
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-gray-50 text-gray-400 uppercase">
                        <tr>
                          <th className="px-4 py-3 font-bold">Producto</th>
                          <th className="px-4 py-3 font-bold">País</th>
                          <th className="px-4 py-3 font-bold">Moneda</th>
                          <th className="px-4 py-3 font-bold">Trámite</th>
                          <th className="px-4 py-3 font-bold text-center">
                            Días Min.
                          </th>
                          <th className="px-4 py-3 font-bold text-center">
                            Precio
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        <tr className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-gray-600">
                            Informe confidencial
                          </td>
                          <td className="px-4 py-3 text-gray-600">Perú</td>
                          <td className="px-4 py-3 text-gray-600">Dólar</td>
                          <td className="px-4 py-3 text-gray-600 text-center">
                            XP
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-center">
                            3
                          </td>
                          <td className="px-4 py-3 text-brand-black font-bold text-center">
                            45.0
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "contacts" && (
                <div className="animate-in fade-in duration-300 h-full">
                  {contactView === "list" && (
                    <div className="space-y-6">
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            contactReset();
                            setContactView("create");
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-brand-black text-brand-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 cursor-pointer hover:scale-[1.05] active:scale-95 transition-all"
                        >
                          <Plus size={14} />
                          <span>Agregar Contacto</span>
                        </button>
                      </div>
                      {addedContacts.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 text-sm italic">
                          No hay contactos registrados.
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {addedContacts.map((contact, i) => (
                            <div
                              key={i}
                              className="py-4 flex items-center justify-between group"
                            >
                              <div className="grid grid-cols-3 flex-1 gap-4">
                                <div>
                                  <p className="text-sm font-bold text-brand-black">
                                    {contact.nombre}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {contact.email}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {tipoContactoData?.find(
                                      (t) => t.num1 === contact.tipoContacto,
                                    )?.string1 || contact.tipoContacto}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {contact.telefono}
                                  </span>
                                </div>
                              </div>
                              <div className="relative group/menu">
                                <button className="p-2 text-gray-400 hover:text-brand-black rounded-lg transition-all cursor-pointer">
                                  <MoreHorizontal size={18} />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-40 bg-brand-white border border-gray-100 rounded-xl shadow-xl z-10 hidden group-hover/menu:block py-1">
                                  <button
                                    onClick={() => openDetailContact(contact)}
                                    className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-600 cursor-pointer"
                                  >
                                    Ver Detalles
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {contactView === "detail" && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setContactView("list")}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer hover:scale-110 active:scale-90"
                        >
                          <ArrowLeft size={20} className="text-brand-black" />
                        </button>
                        <h3 className="font-bold text-lg text-brand-black">
                          Detalles de Contacto
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SearchableSelect
                          label="Tipo Persona"
                          options={tipoPersonaData}
                          value={watchedContactTipoPersona}
                          onChange={() => {}}
                          disabled
                        />

                        <SearchableSelect
                          label="Tipo de Contacto"
                          options={tipoContactoData}
                          value={watchedContactTipoContacto}
                          onChange={() => {}}
                          disabled
                        />

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">
                            Código de Contacto
                          </label>
                          <input
                            {...contactRegister("codigoContacto")}
                            disabled
                            type="text"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 outline-none cursor-not-allowed"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">
                            Nombre
                          </label>
                          <input
                            {...contactRegister("nombre")}
                            disabled
                            type="text"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 outline-none cursor-not-allowed"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">
                            Email
                          </label>
                          <input
                            {...contactRegister("email")}
                            disabled
                            type="email"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 outline-none cursor-not-allowed"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">
                            Teléfono
                          </label>
                          <input
                            {...contactRegister("telefono")}
                            disabled
                            type="text"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 outline-none cursor-not-allowed"
                          />
                        </div>

                        <SearchableSelect
                          label="Área de Trabajo"
                          options={areaTrabajoData}
                          value={watchedContactAreaTrabajo}
                          onChange={() => {}}
                          disabled
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-3 border border-gray-200 text-brand-black rounded-xl font-bold hover:bg-gray-100 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating || isLoadingClient}
            className="flex items-center gap-2 px-8 py-3 bg-brand-black text-brand-white rounded-xl font-bold hover:bg-brand-black/90 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10 disabled:opacity-50 min-w-[140px] justify-center"
          >
            {isUpdating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-brand-white" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      <AddRateModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        onConfirm={(data) => console.log("Rate added:", data)}
      />
    </div>
  );
}
