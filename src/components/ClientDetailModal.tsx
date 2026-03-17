import { useState, useMemo, useEffect } from "react";
import {
  X,
  Plus,
  Eraser,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientDetailSchema,
  type ClientDetailFormData,
} from "@maximilian/schemas";
import { AddRateModal } from "./AddRateModal";
import { AddContactModal } from "./AddContactModal";
import { masterTableService } from "@maximilian/services/masterTable.service";
import { clientService } from "@maximilian/services/client.service";
import { MasterTableId } from "@maximilian/shared/types/master-table.type";
import type {
  TarifarioListEntry,
  ContactoListEntry,
} from "@maximilian/shared/types/client.type";
import { SearchableSelect } from "@maximilian/components/SearchableSelect";
import { ConfirmDeleteModal } from "@maximilian/components/ConfirmDeleteModal";

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number | null;
}

type Tab = "info" | "rates" | "contacts";


export function ClientDetailModal({
  isOpen,
  onClose,
  clientId,
}: ClientDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<TarifarioListEntry | null>(null);
  const [selectedRateIndex, setSelectedRateIndex] = useState<number | null>(null);
  const [contactosPag, setContactosPag] = useState(1);
  const [selectedContactIndex, setSelectedContactIndex] = useState<number | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactoListEntry | null>(null);
  const [rateToDelete, setRateToDelete] = useState<TarifarioListEntry | null>(null);
  const [contactToDelete, setContactToDelete] = useState<ContactoListEntry | null>(null);

  const queryClient = useQueryClient();

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
    handleSubmit: infoHandleSubmit,
    formState,
  } = useForm<ClientDetailFormData>({
    resolver: zodResolver(clientDetailSchema),
  });

  // Populate form when client data is loaded
  useEffect(() => {
    if (client) {
      infoReset({
        id: client.idCliente,
        tipoPersona: client.idTipoPersona,
        nombre: client.nombre,
        pais: client.idPais,
        direccion: client.direccion ?? "",
        email: client.email ?? "",
        telefono: client.telefono ?? "",
        sitioWeb: client.webSite ?? "",
        fax: client.fax ?? "",
        tipoRegistroTributario: client.idRegistroTributario,
        numRegistroTributario: client.numRegistroTributario ?? "",
        moneda: client.idMoneda,
        atendidoPor: client.idEmpresaAtencion,
        idioma: client.idIdioma,
        idiomaFacturacion: client.idIdiomaFacturacion,
        formatoInforme: client.idFormatoDocumento,
        imprimeLogoSafety: client.imprimeLogoSafety,
        aplicaPenalidad: client.aplicaPenalidad,
        recomendacion: client.recomendacion ?? "",
      });
    }
  }, [client, infoReset]);

  const updateInfoMutation = useMutation({
    mutationFn: clientService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const createTarifarioMutation = useMutation({
    mutationFn: clientService.createTarifario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifario", client?.idCliente] });
      setIsRateModalOpen(false);
      setEditingRate(null);
    },
  });

  const updateTarifarioMutation = useMutation({
    mutationFn: clientService.updateTarifario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifario", client?.idCliente] });
      setIsRateModalOpen(false);
      setEditingRate(null);
      setSelectedRateIndex(null);
    },
  });

  const deleteTarifarioMutation = useMutation({
    mutationFn: clientService.deleteTarifario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifario", client?.idCliente] });
      setSelectedRateIndex(null);
    },
  });

  const createContactoMutation = useMutation({
    mutationFn: clientService.createContacto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos", client?.idCliente] });
      setIsContactModalOpen(false);
      setEditingContact(null);
    },
  });

  const updateContactoMutation = useMutation({
    mutationFn: clientService.updateContacto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos", client?.idCliente] });
      setIsContactModalOpen(false);
      setEditingContact(null);
      setSelectedContactIndex(null);
    },
  });

  const deleteContactoMutation = useMutation({
    mutationFn: clientService.deleteContacto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos", client?.idCliente] });
      setSelectedContactIndex(null);
    },
  });

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

  const { data: rateMonedas } = useQuery({
    queryKey: ["masterTable", MasterTableId.MONEDA],
    queryFn: () => masterTableService.list(MasterTableId.MONEDA),
    enabled: isOpen,
  });

  const { data: empresaAtencionData } = useQuery({
    queryKey: ["masterTable", MasterTableId.EMPRESA_ATENCION],
    queryFn: () => masterTableService.list(MasterTableId.EMPRESA_ATENCION),
    enabled: isOpen,
  });

  const { data: idiomaData } = useQuery({
    queryKey: ["masterTable", MasterTableId.IDIOMA],
    queryFn: () => masterTableService.list(MasterTableId.IDIOMA),
    enabled: isOpen,
  });

  const { data: tipoContactoData } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_CONTACTO],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_CONTACTO),
    enabled: isOpen,
  });

  const { data: areaTrabajoData } = useQuery({
    queryKey: ["masterTable", MasterTableId.AREA_TRABAJO],
    queryFn: () => masterTableService.list(MasterTableId.AREA_TRABAJO),
    enabled: isOpen,
  });

  const { data: productoData } = useQuery({
    queryKey: ["masterTable", MasterTableId.PRODUCTO],
    queryFn: () => masterTableService.list(MasterTableId.PRODUCTO),
    enabled: isOpen && activeTab === "rates",
  });

  const { data: tipoTramiteData } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_TRAMITE],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_TRAMITE),
    enabled: isOpen && activeTab === "rates",
  });

  const [tarifarioSearch, setTarifarioSearch] = useState("");
  const [tarifarioPag, setTarifarioPag] = useState(1);

  const { data: tarifarioData, isLoading: tarifarioLoading } = useQuery({
    queryKey: ["tarifario", client?.idCliente, tarifarioSearch, tarifarioPag],
    queryFn: () => clientService.listTarifario({
      idCliente: client!.idCliente,
      busqueda: tarifarioSearch || undefined,
      numPag: tarifarioPag,
    }),
    enabled: activeTab === "rates" && !!client?.idCliente,
  });

  const productoMap = useMemo(() =>
    Object.fromEntries((productoData ?? []).map(p => [p.num1, p.string1])), [productoData]);

  const tramiteMap = useMemo(() =>
    Object.fromEntries((tipoTramiteData ?? []).map(t => [t.num1, t.string1])), [tipoTramiteData]);

  const paisMap = useMemo(() =>
    Object.fromEntries((paisData ?? []).map(p => [p.num1, p.string1])), [paisData]);

  const monedaMap = useMemo(() =>
    Object.fromEntries((rateMonedas ?? []).map(m => [m.num1, m.string1])), [rateMonedas]);

  const { data: contactosData, isLoading: contactosLoading } = useQuery({
    queryKey: ["contactos", client?.idCliente, contactosPag],
    queryFn: () => clientService.listContactos({
      idCliente: client!.idCliente,
      numPag: contactosPag,
    }),
    enabled: activeTab === "contacts" && !!client?.idCliente,
  });

  const tipoContactoMap = useMemo(() =>
    Object.fromEntries((tipoContactoData ?? []).map(t => [t.num1, t.string1])), [tipoContactoData]);

  const areaTrabajoMap = useMemo(() =>
    Object.fromEntries((areaTrabajoData ?? []).map(a => [a.num1, a.string1])), [areaTrabajoData]);

  if (!isOpen) return null;

  const watchedPais = infoWatch("pais");
  const watchedTipoRegTributario = infoWatch("tipoRegistroTributario");
  const watchedAtendidoPor = infoWatch("atendidoPor");
  const watchedIdioma = infoWatch("idioma");
  const watchedIdiomaFacturacion = infoWatch("idiomaFacturacion");
  const watchedTipoPersona = infoWatch("tipoPersona");
  const watchedMoneda = infoWatch("moneda");
  const watchedFormatoInforme = infoWatch("formatoInforme");

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
              <div className="mt-1">
                {client.idEstado === 1 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-600">
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                    Inactivo
                  </span>
                )}
              </div>
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
                  <SearchableSelect
                    label="Tipo Persona"
                    required
                    options={tipoPersonaData}
                    value={watchedTipoPersona}
                    onChange={(val) =>
                      setInfoValue("tipoPersona", val, { shouldValidate: true, shouldDirty: true })
                    }
                  />

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
                      setInfoValue("pais", val, { shouldValidate: true, shouldDirty: true })
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

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Fax <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      {...infoRegister("fax")}
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
                        shouldDirty: true,
                      })
                    }
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Registro Tributario
                    </label>
                    <input
                      {...infoRegister("numRegistroTributario")}
                      type="text"
                      disabled={!watchedTipoRegTributario}
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    />
                  </div>

                  <SearchableSelect
                    label="Moneda"
                    required
                    options={rateMonedas}
                    value={watchedMoneda}
                    onChange={(val) =>
                      setInfoValue("moneda", val, { shouldValidate: true, shouldDirty: true })
                    }
                  />

                  <SearchableSelect
                    label="Atendido por"
                    options={empresaAtencionData}
                    value={watchedAtendidoPor}
                    onChange={(val) =>
                      setInfoValue("atendidoPor", val, { shouldValidate: true, shouldDirty: true })
                    }
                  />

                  <SearchableSelect
                    label="Idioma preferido"
                    options={idiomaData}
                    value={watchedIdioma}
                    onChange={(val) =>
                      setInfoValue("idioma", val, { shouldValidate: true, shouldDirty: true })
                    }
                  />

                  <SearchableSelect
                    label="Idioma de facturación"
                    options={idiomaData}
                    value={watchedIdiomaFacturacion}
                    onChange={(val) =>
                      setInfoValue("idiomaFacturacion", val, { shouldValidate: true, shouldDirty: true })
                    }
                  />

                  <SearchableSelect
                    label="Formato de Informe"
                    required
                    options={formatoInformeData}
                    value={watchedFormatoInforme}
                    onChange={(val) =>
                      setInfoValue("formatoInforme", val, { shouldValidate: true, shouldDirty: true })
                    }
                  />

                  <div className="md:col-span-2 flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        {...infoRegister("imprimeLogoSafety")}
                        id="imprimeLogoSafety"
                        className="w-4 h-4 accent-brand-wine cursor-pointer"
                      />
                      <label htmlFor="imprimeLogoSafety" className="text-sm font-bold text-gray-700 cursor-pointer">
                        Imprimir logo Safety
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        {...infoRegister("aplicaPenalidad")}
                        id="aplicaPenalidad"
                        className="w-4 h-4 accent-brand-wine cursor-pointer"
                      />
                      <label htmlFor="aplicaPenalidad" className="text-sm font-bold text-gray-700 cursor-pointer">
                        Aplica penalidad
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Recomendación <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      {...infoRegister("recomendacion")}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all resize-none"
                    />
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
                        value={tarifarioSearch}
                        onChange={(e) => { setTarifarioSearch(e.target.value); setTarifarioPag(1); setSelectedRateIndex(null); }}
                        className="w-full px-4 py-2 bg-brand-white border border-gray-200 rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingRate(null); setIsRateModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-black text-brand-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 cursor-pointer hover:scale-[1.05] active:scale-95 transition-all"
                      >
                        <Plus size={14} /><span>Nuevo</span>
                      </button>
                      <button
                        disabled={selectedRateIndex === null}
                        onClick={() => {
                          const rate = tarifarioData!.lstTarifario[selectedRateIndex!];
                          setEditingRate(rate);
                          setIsRateModalOpen(true);
                        }}
                        className={`px-4 py-2 bg-brand-black text-brand-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 transition-all ${selectedRateIndex === null ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-[1.05] active:scale-95"}`}
                      >Editar</button>
                      <button
                        disabled={selectedRateIndex === null}
                        onClick={() => {
                          setRateToDelete(tarifarioData!.lstTarifario[selectedRateIndex!]);
                        }}
                        className={`px-4 py-2 bg-brand-black text-brand-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 transition-all ${selectedRateIndex === null ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-[1.05] active:scale-95"}`}
                      >Eliminar</button>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-gray-50 text-gray-400 uppercase">
                        <tr>
                          <th className="px-3 py-3 w-8">
                            <button
                              disabled={selectedRateIndex === null}
                              onClick={() => setSelectedRateIndex(null)}
                              title="Limpiar selección"
                              className={`transition-colors ${selectedRateIndex === null ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-gray-600 cursor-pointer"}`}
                            ><Eraser size={13} /></button>
                          </th>
                          <th className="px-4 py-3 font-bold">Producto</th>
                          <th className="px-4 py-3 font-bold">País</th>
                          <th className="px-4 py-3 font-bold">Moneda</th>
                          <th className="px-4 py-3 font-bold">Trámite</th>
                          <th className="px-4 py-3 font-bold text-center">Días Min.</th>
                          <th className="px-4 py-3 font-bold text-center">Precio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {tarifarioLoading ? (
                          <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm italic">Cargando...</td></tr>
                        ) : (tarifarioData?.lstTarifario ?? []).length === 0 ? (
                          <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm italic">No hay tarifas agregadas.</td></tr>
                        ) : (
                          (tarifarioData?.lstTarifario ?? []).map((rate, i) => (
                            <tr key={rate.idTarifario} className="hover:bg-gray-50/50">
                              <td className="px-3 py-3">
                                <input type="radio" name="rate-selection" checked={selectedRateIndex === i} onChange={() => setSelectedRateIndex(i)} className="accent-brand-wine cursor-pointer" />
                              </td>
                              <td className="px-4 py-3 text-gray-600">{productoMap[rate.idProducto] ?? rate.idProducto}</td>
                              <td className="px-4 py-3 text-gray-600">{paisMap[rate.idPais] ?? rate.idPais}</td>
                              <td className="px-4 py-3 text-gray-600">{monedaMap[rate.idMoneda] ?? rate.idMoneda}</td>
                              <td className="px-4 py-3 text-gray-600">{tramiteMap[rate.idTipoTramite] ?? rate.idTipoTramite}</td>
                              <td className="px-4 py-3 text-gray-600 text-center">{rate.diasMin}</td>
                              <td className="px-4 py-3 text-brand-black font-bold text-center">{rate.precio}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {(tarifarioData?.totalPaginas ?? 0) > 1 && (
                    <div className="flex items-center justify-end gap-2 mt-3">
                      <button disabled={tarifarioPag === 1} onClick={() => setTarifarioPag(p => p - 1)} className="px-2 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer">‹</button>
                      <span className="text-sm">{tarifarioPag} / {tarifarioData?.totalPaginas}</span>
                      <button disabled={tarifarioPag === tarifarioData?.totalPaginas} onClick={() => setTarifarioPag(p => p + 1)} className="px-2 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer">›</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "contacts" && (
                <div className="animate-in fade-in duration-300 space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-xs" />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingContact(null); setIsContactModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-black text-brand-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 cursor-pointer hover:scale-[1.05] active:scale-95 transition-all"
                      >
                        <Plus size={14} /><span>Nuevo</span>
                      </button>
                      <button
                        disabled={selectedContactIndex === null}
                        onClick={() => {
                          const c = contactosData!.lstClienteContactos[selectedContactIndex!];
                          setEditingContact(c);
                          setIsContactModalOpen(true);
                        }}
                        className={`px-4 py-2 bg-brand-black text-brand-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 transition-all ${selectedContactIndex === null ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-[1.05] active:scale-95"}`}
                      >Editar</button>
                      <button
                        disabled={selectedContactIndex === null}
                        onClick={() => {
                          setContactToDelete(contactosData!.lstClienteContactos[selectedContactIndex!]);
                        }}
                        className={`px-4 py-2 bg-brand-black text-brand-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 transition-all ${selectedContactIndex === null ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-[1.05] active:scale-95"}`}
                      >Eliminar</button>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-gray-50 text-gray-400 uppercase">
                        <tr>
                          <th className="px-3 py-3 w-8">
                            <button
                              disabled={selectedContactIndex === null}
                              onClick={() => setSelectedContactIndex(null)}
                              title="Limpiar selección"
                              className={`transition-colors ${selectedContactIndex === null ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-gray-600 cursor-pointer"}`}
                            ><Eraser size={13} /></button>
                          </th>
                          <th className="px-4 py-3 font-bold">Nombre</th>
                          <th className="px-4 py-3 font-bold">Email</th>
                          <th className="px-4 py-3 font-bold">Teléfono</th>
                          <th className="px-4 py-3 font-bold">Tipo Contacto</th>
                          <th className="px-4 py-3 font-bold">Área Trabajo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {contactosLoading ? (
                          <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm italic">Cargando...</td></tr>
                        ) : (contactosData?.lstClienteContactos ?? []).length === 0 ? (
                          <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm italic">No hay contactos agregados.</td></tr>
                        ) : (
                          (contactosData?.lstClienteContactos ?? []).map((c, i) => (
                            <tr key={c.idClienteContacto} className="hover:bg-gray-50/50">
                              <td className="px-3 py-3">
                                <input type="radio" name="contact-selection" checked={selectedContactIndex === i} onChange={() => setSelectedContactIndex(i)} className="accent-brand-wine cursor-pointer" />
                              </td>
                              <td className="px-4 py-3 text-gray-600">{c.nombres}</td>
                              <td className="px-4 py-3 text-gray-600">{c.email}</td>
                              <td className="px-4 py-3 text-gray-600">{c.telefono}</td>
                              <td className="px-4 py-3 text-gray-600">{tipoContactoMap[c.idTipoContacto] ?? c.idTipoContacto}</td>
                              <td className="px-4 py-3 text-gray-600">{areaTrabajoMap[c.idAreaTrabajo] ?? c.idAreaTrabajo}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {(contactosData?.totalPaginas ?? 0) > 1 && (
                    <div className="flex items-center justify-end gap-2 mt-3">
                      <button disabled={contactosPag === 1} onClick={() => setContactosPag(p => p - 1)} className="px-2 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer">‹</button>
                      <span className="text-sm">{contactosPag} / {contactosData?.totalPaginas}</span>
                      <button disabled={contactosPag === contactosData?.totalPaginas} onClick={() => setContactosPag(p => p + 1)} className="px-2 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer">›</button>
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
            onClick={infoHandleSubmit((formData) => {
              if (!client) return;
              updateInfoMutation.mutate({
                idCliente: client.idCliente,
                idTipoPersona: formData.tipoPersona as number,
                nombre: formData.nombre ?? "",
                nombreCorto: client.nombreCorto ?? (formData.nombre ?? "").substring(0, 20),
                idPais: formData.pais as number,
                idRegistroTributario: formData.tipoRegistroTributario as number,
                numRegistroTributario: formData.numRegistroTributario ?? "",
                email: formData.email ?? "",
                idEstado: client.idEstado,
                webSite: formData.sitioWeb ?? "",
                telefono: formData.telefono ?? "",
                fax: formData.fax ?? "",
                direccion: formData.direccion ?? "",
                recomendacion: formData.recomendacion ?? "",
                idEmpresaAtencion: formData.atendidoPor as number,
                idIdioma: formData.idioma as number,
                logoClienteUrl: client.logoClienteUrl ?? "",
                imprimeLogoSafety: formData.imprimeLogoSafety ?? false,
                idFormatoDocumento: formData.formatoInforme as number,
                idMoneda: formData.moneda as number,
                idIdiomaFacturacion: formData.idiomaFacturacion as number,
                aplicaPenalidad: formData.aplicaPenalidad ?? false,
                idPlantilla: client.idPlantilla,
              });
            })}
            disabled={!formState.isDirty || updateInfoMutation.isPending}
            className="flex items-center gap-2 px-8 py-3 bg-brand-black text-brand-white rounded-xl font-bold hover:bg-brand-black/90 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10 disabled:opacity-50 min-w-[140px] justify-center"
          >
            {updateInfoMutation.isPending ? (
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
        onClose={() => { setIsRateModalOpen(false); setEditingRate(null); }}
        onConfirm={(data) => {
          if (editingRate) {
            updateTarifarioMutation.mutate({
              idTarifario: editingRate.idTarifario,
              idCliente: client!.idCliente,
              idProducto: Number(data.producto),
              idTipoTramite: Number(data.tramite),
              idPais: Number(data.pais),
              idMoneda: Number(data.moneda),
              diasMax: data.diasMax,
              diasMin: data.diasMin,
              precio: data.precio,
              penalidad: data.penalidad,
            });
          } else {
            createTarifarioMutation.mutate({
              idCliente: client!.idCliente,
              idProducto: Number(data.producto),
              idTipoTramite: Number(data.tramite),
              idPais: Number(data.pais),
              idMoneda: Number(data.moneda),
              diasMax: data.diasMax,
              diasMin: data.diasMin,
              precio: data.precio,
              penalidad: data.penalidad,
            });
          }
        }}
        defaultValues={editingRate ? {
          producto: editingRate.idProducto,
          pais: editingRate.idPais,
          moneda: editingRate.idMoneda,
          tramite: editingRate.idTipoTramite,
          diasMin: editingRate.diasMin,
          diasMax: editingRate.diasMax,
          precio: editingRate.precio,
          penalidad: editingRate.penalidad,
        } : undefined}
      />

      <AddContactModal
        isOpen={isContactModalOpen}
        onClose={() => { setIsContactModalOpen(false); setEditingContact(null); }}
        onConfirm={(data) => {
          if (editingContact) {
            updateContactoMutation.mutate({
              idClienteContacto: editingContact.idClienteContacto,
              idCliente: client!.idCliente,
              codigo: data.codigoContacto || null,
              nombres: data.nombre,
              idTipoPersonaContacto: Number(data.tipoPersona),
              idTipoContacto: Number(data.tipoContacto),
              areaTrabajo: Number(data.areaTrabajo),
              telefono: data.telefono || null,
              email: data.email || null,
            });
          } else {
            createContactoMutation.mutate({
              idCliente: client!.idCliente,
              codigo: data.codigoContacto || null,
              nombres: data.nombre,
              idTipoPersonaContacto: Number(data.tipoPersona),
              idTipoContacto: Number(data.tipoContacto),
              idAreaTrabajo: Number(data.areaTrabajo),
              telefono: data.telefono || null,
              email: data.email || null,
            });
          }
        }}
        defaultValues={editingContact ? {
          tipoPersona: "",
          tipoContacto: editingContact.idTipoContacto,
          codigoContacto: editingContact.codigo,
          nombre: editingContact.nombres,
          email: editingContact.email,
          telefono: editingContact.telefono,
          areaTrabajo: editingContact.idAreaTrabajo,
        } : undefined}
      />

      <ConfirmDeleteModal
        isOpen={rateToDelete !== null}
        onClose={() => setRateToDelete(null)}
        onConfirm={() => {
          deleteTarifarioMutation.mutate({ idTarifario: rateToDelete!.idTarifario, idCliente: client!.idCliente });
          setRateToDelete(null);
        }}
        title="Eliminar Tarifa"
        isSubmitting={deleteTarifarioMutation.isPending}
      >
        <p><span className="font-bold">Producto:</span> {productoMap[rateToDelete?.idProducto ?? 0] ?? "-"}</p>
        <p><span className="font-bold">País:</span> {paisMap[rateToDelete?.idPais ?? 0] ?? "-"}</p>
        <p><span className="font-bold">Moneda:</span> {monedaMap[rateToDelete?.idMoneda ?? 0] ?? "-"}</p>
        <p><span className="font-bold">Precio:</span> {rateToDelete?.precio ?? "-"}</p>
      </ConfirmDeleteModal>

      <ConfirmDeleteModal
        isOpen={contactToDelete !== null}
        onClose={() => setContactToDelete(null)}
        onConfirm={() => {
          deleteContactoMutation.mutate({ idClienteContacto: contactToDelete!.idClienteContacto, idCliente: client!.idCliente });
          setContactToDelete(null);
        }}
        title="Eliminar Contacto"
        isSubmitting={deleteContactoMutation.isPending}
      >
        <p><span className="font-bold">Nombre:</span> {contactToDelete?.nombres ?? "-"}</p>
        <p><span className="font-bold">Email:</span> {contactToDelete?.email ?? "-"}</p>
        <p><span className="font-bold">Teléfono:</span> {contactToDelete?.telefono ?? "-"}</p>
      </ConfirmDeleteModal>
    </div>
  );
}
