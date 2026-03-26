import { useState, useEffect } from "react";
import { useDebounce } from "@maximilian/hooks/useDebounce";
import {
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  MailCheck,
  MailX,
} from "lucide-react";
import { CustomTabbedModal } from "@maximilian/components/common/CustomTabbedModal";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { useForm, Controller } from "react-hook-form";
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
  TarifarioDetail,
  ContactoListEntry,
  ContactoDetail,
} from "@maximilian/shared/types/client.type";
import { SearchableSelect } from "@maximilian/components/common/SearchableSelect";
import { MultiSearchableSelect } from "@maximilian/components/common/MultiSearchableSelect";
import { ConfirmDeleteModal } from "@maximilian/components/common/ConfirmDeleteModal";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomUrlInput } from "@maximilian/components/common/CustomUrlInput";

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
  const [editingRate, setEditingRate] = useState<TarifarioDetail | null>(null);
  const [selectedRateIndex, setSelectedRateIndex] = useState<number | null>(null);
  const [contactosPag, setContactosPag] = useState(1);
  const [contactosSearch, setContactosSearch] = useState("");
  const [selectedContactIndex, setSelectedContactIndex] = useState<number | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactoDetail | null>(null);
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [isFetchingContact, setIsFetchingContact] = useState(false);
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
    control: infoControl,
    reset: infoReset,
    setValue: setInfoValue,
    watch: infoWatch,
    handleSubmit: infoHandleSubmit,
    formState: { errors: infoErrors, isDirty: infoIsDirty },
  } = useForm<ClientDetailFormData>({
    resolver: zodResolver(clientDetailSchema),
  });

  // Populate form when client data is loaded
  useEffect(() => {
    if (isOpen) {
      setActiveTab("info");
      setSelectedRateIndex(null);
    }
  }, [isOpen]);

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
        formatoInforme: client.lstIdFormatoDocumento ?? [],
        plantillaInforme: client.idPlantilla,
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
      if (tarifarioPag > 1 && (tarifarioData?.lstTarifario.length ?? 0) === 1) {
        setTarifarioPag(p => p - 1);
      }
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
      if (contactosPag > 1 && (contactosData?.lstClienteContactos.length ?? 0) === 1) {
        setContactosPag(p => p - 1);
      }
      queryClient.invalidateQueries({ queryKey: ["contactos", client?.idCliente] });
      setSelectedContactIndex(null);
    },
  });

  // Queries for MasterTable parameters
  const { data: tipoPersonaData } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_PERSONA],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_PERSONA),
    enabled: isOpen,
    staleTime: Infinity,
  });

  const { data: paisData } = useQuery({
    queryKey: ["masterTable", MasterTableId.PAIS],
    queryFn: () => masterTableService.list(MasterTableId.PAIS),
    enabled: isOpen,
    staleTime: Infinity,
  });

  const { data: tipoRegTributarioData } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_REG_TRIBUTARIO],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_REG_TRIBUTARIO),
    enabled: isOpen,
    staleTime: Infinity,
  });

  const { data: formatoInformeData } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_FORMATO_INFORME],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_FORMATO_INFORME),
    enabled: isOpen,
    staleTime: Infinity,
  });

  const { data: rateMonedas } = useQuery({
    queryKey: ["masterTable", MasterTableId.MONEDA],
    queryFn: () => masterTableService.list(MasterTableId.MONEDA),
    enabled: isOpen,
    staleTime: Infinity,
  });

  const { data: empresaAtencionData } = useQuery({
    queryKey: ["masterTable", MasterTableId.EMPRESA_ATENCION],
    queryFn: () => masterTableService.list(MasterTableId.EMPRESA_ATENCION),
    enabled: isOpen,
    staleTime: Infinity,
  });

  const { data: idiomaData } = useQuery({
    queryKey: ["masterTable", MasterTableId.IDIOMA],
    queryFn: () => masterTableService.list(MasterTableId.IDIOMA),
    enabled: isOpen,
    staleTime: Infinity,
  });

  const { data: plantillaInformeData } = useQuery({
    queryKey: ["masterTable", MasterTableId.PLANTILLA_INFORME],
    queryFn: () => masterTableService.list(MasterTableId.PLANTILLA_INFORME),
    enabled: isOpen,
    staleTime: Infinity,
  });
  const plantillaOptions = plantillaInformeData ?? [];

  const [tarifarioSearch, setTarifarioSearch] = useState("");
  const [tarifarioPag, setTarifarioPag] = useState(1);
  const debouncedTarifarioSearch = useDebounce(tarifarioSearch);

  const { data: tarifarioData, isLoading: tarifarioLoading } = useQuery({
    queryKey: ["tarifario", client?.idCliente, debouncedTarifarioSearch, tarifarioPag],
    queryFn: () => clientService.listTarifario({
      idCliente: client!.idCliente,
      busqueda: debouncedTarifarioSearch || undefined,
      numPag: tarifarioPag,
    }),
    enabled: activeTab === "rates" && !!client?.idCliente,
  });


  const debouncedContactosSearch = useDebounce(contactosSearch);

  const { data: contactosData, isLoading: contactosLoading } = useQuery({
    queryKey: ["contactos", client?.idCliente, debouncedContactosSearch, contactosPag],
    queryFn: () => clientService.listContactos({
      idCliente: client!.idCliente,
      busqueda: debouncedContactosSearch || undefined,
      numPag: contactosPag,
    }),
    enabled: activeTab === "contacts" && !!client?.idCliente,
  });


  if (!isOpen) return null;

  const watchedPais = infoWatch("pais");
  const watchedTipoRegTributario = infoWatch("tipoRegistroTributario");
  const watchedAtendidoPor = infoWatch("atendidoPor");
  const watchedIdioma = infoWatch("idioma");
  const watchedIdiomaFacturacion = infoWatch("idiomaFacturacion");
  const watchedTipoPersona = infoWatch("tipoPersona");
  const watchedMoneda = infoWatch("moneda");
  const watchedFormatoInforme = infoWatch("formatoInforme");
  const watchedPlantillaInforme = infoWatch("plantillaInforme");

  const loadingState = (
    <div className="h-full flex flex-col items-center justify-center gap-3 py-20">
      <Loader2 size={40} className="text-brand-wine animate-spin" />
      <p className="text-sm font-medium text-gray-500">Cargando información...</p>
    </div>
  );

  const errorState = (
    <div className="h-full flex flex-col items-center justify-center gap-4 py-20 text-center">
      <AlertCircle size={40} className="text-red-500" />
      <p className="text-sm font-bold text-brand-black">Error al cargar el cliente</p>
      <button
        onClick={() => refetchClient()}
        className="flex items-center gap-2 px-4 py-2 bg-brand-wine text-brand-white rounded-lg text-xs font-bold hover:bg-brand-wine/90 transition-all cursor-pointer"
      >
        <RefreshCw size={14} />
        <span>REINTENTAR</span>
      </button>
    </div>
  );

  return (
    <>
      <CustomTabbedModal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalle del Cliente"
        subtitle={client && (
          client.idEstado === 1 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-600">
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
              Inactivo
            </span>
          )
        )}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as Tab)}
        tabs={[
          {
            id: "info",
            label: "Información",
            content: isLoadingClient ? loadingState : isErrorClient ? errorState : (
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
                    error={infoErrors.tipoPersona?.message}
                  />

                  <div className="space-y-2">
                    <CustomLabel required>Nombre</CustomLabel>
                    <input
                      {...infoRegister("nombre")}
                      type="text"
                      className={`w-full px-4 py-2.5 bg-brand-white border ${infoErrors.nombre ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
                    />
                    {infoErrors.nombre && <p className="text-xs text-red-500">{infoErrors.nombre.message}</p>}
                  </div>

                  <SearchableSelect
                    label="País"
                    required
                    options={paisData}
                    value={watchedPais}
                    onChange={(val) =>
                      setInfoValue("pais", val, { shouldValidate: true, shouldDirty: true })
                    }
                    error={infoErrors.pais?.message}
                  />

                  <div className="space-y-2">
                    <CustomLabel required>Dirección</CustomLabel>
                    <input
                      {...infoRegister("direccion")}
                      type="text"
                      className={`w-full px-4 py-2.5 bg-brand-white border ${infoErrors.direccion ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
                    />
                    {infoErrors.direccion && <p className="text-xs text-red-500">{infoErrors.direccion.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <CustomLabel required>Email</CustomLabel>
                    <input
                      {...infoRegister("email")}
                      type="email"
                      className={`w-full px-4 py-2.5 bg-brand-white border ${infoErrors.email ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
                    />
                    {infoErrors.email && <p className="text-xs text-red-500">{infoErrors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <CustomLabel required>Teléfono</CustomLabel>
                    <input
                      {...infoRegister("telefono")}
                      type="text"
                      className={`w-full px-4 py-2.5 bg-brand-white border ${infoErrors.telefono ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
                    />
                    {infoErrors.telefono && <p className="text-xs text-red-500">{infoErrors.telefono.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <CustomLabel optional>Sitio Web</CustomLabel>
                    <Controller
                      name="sitioWeb"
                      control={infoControl}
                      render={({ field }) => (
                        <CustomUrlInput
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={!!infoErrors.sitioWeb}
                        />
                      )}
                    />
                    {infoErrors.sitioWeb && <p className="text-xs text-red-500">{infoErrors.sitioWeb.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <CustomLabel optional>Fax</CustomLabel>
                    <input
                      {...infoRegister("fax")}
                      type="text"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
                    />
                  </div>

                  <SearchableSelect
                    label="Tipo Registro Tributario"
                    required
                    options={tipoRegTributarioData}
                    value={watchedTipoRegTributario}
                    onChange={(val) =>
                      setInfoValue("tipoRegistroTributario", val, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    error={infoErrors.tipoRegistroTributario?.message}
                  />

                  <div className="space-y-2">
                    <CustomLabel required={!!watchedTipoRegTributario}>Registro Tributario</CustomLabel>
                    <input
                      {...infoRegister("numRegistroTributario")}
                      type="text"
                      disabled={!watchedTipoRegTributario}
                      className={`w-full px-4 py-2.5 bg-brand-white border ${infoErrors.numRegistroTributario ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                    />
                    {infoErrors.numRegistroTributario && <p className="text-xs text-red-500">{infoErrors.numRegistroTributario.message}</p>}
                  </div>

                  <SearchableSelect
                    label="Moneda"
                    required
                    options={rateMonedas}
                    value={watchedMoneda}
                    onChange={(val) =>
                      setInfoValue("moneda", val, { shouldValidate: true, shouldDirty: true })
                    }
                    error={infoErrors.moneda?.message}
                  />

                  <SearchableSelect
                    label="Atendido por"
                    required
                    options={empresaAtencionData}
                    value={watchedAtendidoPor}
                    onChange={(val) =>
                      setInfoValue("atendidoPor", val, { shouldValidate: true, shouldDirty: true })
                    }
                    error={infoErrors.atendidoPor?.message}
                  />

                  <SearchableSelect
                    label="Idioma preferido"
                    required
                    options={idiomaData}
                    value={watchedIdioma}
                    onChange={(val) =>
                      setInfoValue("idioma", val, { shouldValidate: true, shouldDirty: true })
                    }
                    error={infoErrors.idioma?.message}
                  />

                  <SearchableSelect
                    label="Idioma de facturación"
                    required
                    options={idiomaData}
                    value={watchedIdiomaFacturacion}
                    onChange={(val) =>
                      setInfoValue("idiomaFacturacion", val, { shouldValidate: true, shouldDirty: true })
                    }
                    error={infoErrors.idiomaFacturacion?.message}
                  />

                  <MultiSearchableSelect
                    label="Formato de Informe"
                    required
                    options={formatoInformeData}
                    value={watchedFormatoInforme ?? []}
                    onChange={(val) =>
                      setInfoValue("formatoInforme", val, { shouldValidate: true, shouldDirty: true })
                    }
                    error={infoErrors.formatoInforme?.message}
                  />

                  <SearchableSelect
                    label="Plantilla de informe"
                    required
                    options={plantillaOptions}
                    value={watchedPlantillaInforme}
                    onChange={(val) =>
                      setInfoValue("plantillaInforme", val, { shouldValidate: true, shouldDirty: true })
                    }
                    error={infoErrors.plantillaInforme?.message}
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
                    <CustomLabel optional>Recomendación</CustomLabel>
                    <textarea
                      {...infoRegister("recomendacion")}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all resize-none"
                    />
                  </div>
                </form>
            ),
          },
          {
            id: "rates",
            label: "Tarifas",
            content: isLoadingClient ? loadingState : isErrorClient ? errorState : (
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
                      <CustomButton
                        size="sm"
                        onClick={() => { setEditingRate(null); setIsRateModalOpen(true); }}
                      >
                        <Plus size={14} /><span>Nuevo</span>
                      </CustomButton>
                      <CustomButton
                        size="sm"
                        disabled={selectedRateIndex === null || isFetchingRate}
                        loading={isFetchingRate}
                        loadingText="Cargando..."
                        onClick={async () => {
                          const row = tarifarioData!.lstTarifario[selectedRateIndex!];
                          setIsFetchingRate(true);
                          try {
                            const detail = await clientService.getTarifarioById({
                              idTarifario: row.idTarifario,
                              idCliente: client!.idCliente,
                            });
                            setEditingRate(detail);
                            setIsRateModalOpen(true);
                          } finally {
                            setIsFetchingRate(false);
                          }
                        }}
                      >Editar</CustomButton>
                      <CustomButton
                        size="sm"
                        disabled={selectedRateIndex === null}
                        onClick={() => {
                          setRateToDelete(tarifarioData!.lstTarifario[selectedRateIndex!]);
                        }}
                      >Eliminar</CustomButton>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-2xl overflow-hidden min-h-60">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-gray-50 text-gray-400 uppercase">
                        <tr>
                          <th className="px-3 py-3 w-8" />
                          <th className="px-4 py-3 font-bold">Producto</th>
                          <th className="px-4 py-3 font-bold">País</th>
                          <th className="px-4 py-3 font-bold">Moneda</th>
                          <th className="px-4 py-3 font-bold">Trámite</th>
                          <th className="px-4 py-3 font-bold text-center">Días Min. - Máx.</th>
                          <th className="px-4 py-3 font-bold text-center">Precio</th>
                          <th className="px-4 py-3 font-bold text-center">Penalidad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {tarifarioLoading ? (
                          <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm italic">Cargando...</td></tr>
                        ) : (tarifarioData?.lstTarifario ?? []).length === 0 ? (
                          <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm italic">No hay tarifas agregadas.</td></tr>
                        ) : (
                          (tarifarioData?.lstTarifario ?? []).map((rate, i) => (
                            <tr key={rate.idTarifario} className="hover:bg-gray-50/50">
                              <td className="px-3 py-3">
                                <input type="checkbox" checked={selectedRateIndex === i} onChange={() => setSelectedRateIndex(selectedRateIndex === i ? null : i)} className="accent-brand-wine cursor-pointer w-4 h-4" />
                              </td>
                              <td className="px-4 py-3 text-gray-600">{rate.producto}</td>
                              <td className="px-4 py-3 text-gray-600">{rate.pais}</td>
                              <td className="px-4 py-3 text-gray-600">{rate.moneda}</td>
                              <td className="px-4 py-3 text-gray-600">{rate.tipoTramite}</td>
                              <td className="px-4 py-3 text-gray-600 text-center">{rate.diasMinMax}</td>
                              <td className="px-4 py-3 text-brand-black font-bold text-center">{rate.precio}</td>
                              <td className="px-4 py-3 text-gray-600 text-center">{rate.penalidad}</td>
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
            ),
          },
          {
            id: "contacts",
            label: "Contactos",
            content: isLoadingClient ? loadingState : isErrorClient ? errorState : (
                <div className="animate-in fade-in duration-300 space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-xs">
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={contactosSearch}
                        onChange={(e) => { setContactosSearch(e.target.value); setContactosPag(1); setSelectedContactIndex(null); }}
                        className="w-full px-4 py-2 bg-brand-white border border-gray-200 rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <CustomButton
                        size="sm"
                        onClick={() => { setEditingContact(null); setIsContactModalOpen(true); }}
                      >
                        <Plus size={14} /><span>Nuevo</span>
                      </CustomButton>
                      <CustomButton
                        size="sm"
                        disabled={selectedContactIndex === null || isFetchingContact}
                        loading={isFetchingContact}
                        loadingText="Cargando..."
                        onClick={async () => {
                          const row = contactosData!.lstClienteContactos[selectedContactIndex!];
                          setIsFetchingContact(true);
                          try {
                            const detail = await clientService.getContactoById({
                              idClienteContacto: row.idClienteContacto,
                              idCliente: client!.idCliente,
                            });
                            setEditingContact(detail);
                            setIsContactModalOpen(true);
                          } finally {
                            setIsFetchingContact(false);
                          }
                        }}
                      >Editar</CustomButton>
                      <CustomButton
                        size="sm"
                        disabled={selectedContactIndex === null}
                        onClick={() => {
                          setContactToDelete(contactosData!.lstClienteContactos[selectedContactIndex!]);
                        }}
                      >Eliminar</CustomButton>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-2xl overflow-hidden min-h-60">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-gray-50 text-gray-400 uppercase">
                        <tr>
                          <th className="px-3 py-3 w-8" />
                          <th className="px-4 py-3 font-bold">Nombre</th>
                          <th className="px-4 py-3 font-bold">Email</th>
                          <th className="px-4 py-3 font-bold">Teléfono</th>
                          <th className="px-4 py-3 font-bold">Tipo Contacto</th>
                          <th className="px-4 py-3 font-bold">Área Trabajo</th>
                          <th className="px-4 py-3 font-bold text-center">
                            <span title="Se envía correo">CC</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {contactosLoading ? (
                          <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm italic">Cargando...</td></tr>
                        ) : (contactosData?.lstClienteContactos ?? []).length === 0 ? (
                          <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm italic">No hay contactos agregados.</td></tr>
                        ) : (
                          (contactosData?.lstClienteContactos ?? []).map((c, i) => (
                            <tr key={c.idClienteContacto} className="hover:bg-gray-50/50">
                              <td className="px-3 py-3">
                                <input type="checkbox" checked={selectedContactIndex === i} onChange={() => setSelectedContactIndex(selectedContactIndex === i ? null : i)} className="accent-brand-wine cursor-pointer w-4 h-4" />
                              </td>
                              <td className="px-4 py-3 text-gray-600">{c.nombres}</td>
                              <td className="px-4 py-3 text-gray-600">{c.email}</td>
                              <td className="px-4 py-3 text-gray-600">{c.telefono}</td>
                              <td className="px-4 py-3 text-gray-600">{c.tipoContacto}</td>
                              <td className="px-4 py-3 text-gray-600">{c.areaTrabajo}</td>
                              <td className="px-4 py-3 text-center">
                                {c.enviarCorreo
                                  ? <MailCheck size={16} className="inline text-green-500" />
                                  : <MailX size={16} className="inline text-gray-400" />}
                              </td>
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
            ),
          },
        ]}
        footer={
          <div className="flex justify-end gap-3">
            <CustomButton variant="secondary" onClick={onClose}>
              Cancelar
            </CustomButton>
            <CustomButton
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
                lstIdFormatoDocumento: formData.formatoInforme as number[],
                idMoneda: formData.moneda as number,
                idIdiomaFacturacion: formData.idiomaFacturacion as number,
                aplicaPenalidad: formData.aplicaPenalidad ?? false,
                idPlantilla: formData.plantillaInforme ?? client.idPlantilla,
              });
            })}
            disabled={!infoIsDirty}
            loading={updateInfoMutation.isPending}
            loadingText="Guardando..."
            className="min-w-35"
          >
            <div className="w-2 h-2 rounded-full bg-brand-white" />
            <span>Guardar Cambios</span>
            </CustomButton>
          </div>
        }
      />

      <AddRateModal
        key={editingRate ? `edit-rate-${editingRate.idTarifario}` : "new-rate"}
        isOpen={isRateModalOpen}
        onClose={() => { setIsRateModalOpen(false); setEditingRate(null); setSelectedRateIndex(null); }}
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
        key={editingContact ? `edit-contact-${editingContact.idClienteContacto}` : "new-contact"}
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
              idAreaTrabajo: Number(data.areaTrabajo),
              telefono: data.telefono || null,
              email: data.email || null,
              enviarCorreo: data.enviarCorreo ?? false,
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
              enviarCorreo: data.enviarCorreo ?? false,
            });
          }
        }}
        defaultValues={editingContact ? {
          tipoPersona: editingContact.idTipoPersonaContacto,
          tipoContacto: editingContact.idTipoContacto,
          codigoContacto: editingContact.codigo ?? "",
          nombre: editingContact.nombres,
          email: editingContact.email ?? "",
          telefono: editingContact.telefono ?? "",
          areaTrabajo: editingContact.idAreaTrabajo,
          enviarCorreo: editingContact.enviarCorreo,
        } : undefined}
      />

      <ConfirmDeleteModal
        isOpen={rateToDelete !== null}
        onClose={() => { setRateToDelete(null); setSelectedRateIndex(null); }}
        onConfirm={() => {
          deleteTarifarioMutation.mutate({ idTarifario: rateToDelete!.idTarifario, idCliente: client!.idCliente });
          setRateToDelete(null);
          setSelectedRateIndex(null);
        }}
        title="Eliminar Tarifa"
        isSubmitting={deleteTarifarioMutation.isPending}
      >
        <p><span className="font-bold">Producto:</span> {rateToDelete?.producto ?? "-"}</p>
        <p><span className="font-bold">País:</span> {rateToDelete?.pais ?? "-"}</p>
        <p><span className="font-bold">Moneda:</span> {rateToDelete?.moneda ?? "-"}</p>
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
    </>
  );
}
