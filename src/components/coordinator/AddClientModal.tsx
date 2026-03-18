import { useState, useMemo } from "react";
import {
  X,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  MailCheck,
  MailX,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  clientInfoSchema,
  type ClientInfoFormData,
  type ContactFormData,
  type RateFormData,
} from "@maximilian/schemas";
import { AddRateModal } from "./AddRateModal";
import { AddContactModal } from "./AddContactModal";
import { masterTableService } from "@maximilian/services/masterTable.service";
import { MasterTableId } from "@maximilian/shared/types/master-table.type";
import { SearchableSelect } from "@maximilian/components/common/SearchableSelect";
import { MultiSearchableSelect } from "@maximilian/components/common/MultiSearchableSelect";
import { CustomButton } from "@maximilian/components/common/CustomButton";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    data: ClientInfoFormData,
    contacts: ContactFormData[],
    rates: RateFormData[],
    reset: () => void,
  ) => void;
  isSubmitting?: boolean;
}

type Tab = "info" | "rates" | "contacts";

interface RateEntry {
  productoId: number;
  productoLabel: string;
  paisId: number;
  paisLabel: string;
  monedaId: number;
  monedaLabel: string;
  tramiteId: number;
  tramiteLabel: string;
  diasMin: number;
  diasMax: number;
  precio: number;
  penalidad: number;
}

interface ContactEntry {
  tipoPersonaId: number;
  tipoPersonaLabel: string;
  tipoContactoId: number;
  tipoContactoLabel: string;
  codigoContacto: string;
  nombre: string;
  email: string;
  telefono: string;
  areaTrabajoId: number;
  areaTrabajoLabel: string;
  enviarCorreo: boolean;
}


export function AddClientModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}: AddClientModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isEditRateModalOpen, setIsEditRateModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [addedContacts, setAddedContacts] = useState<ContactEntry[]>([]);
  const [addedRates, setAddedRates] = useState<RateEntry[]>([]);
  const [selectedRateIndex, setSelectedRateIndex] = useState<number | null>(null);
  const [selectedContactIndex, setSelectedContactIndex] = useState<number | null>(null);

  const {
    register: infoRegister,
    handleSubmit: handleInfoSubmit,
    formState: { errors: infoErrors, isValid: isInfoValid },
    reset: infoReset,
    setValue: setInfoValue,
    watch: infoWatch,
    getValues: getInfoValues,
    trigger: triggerInfo,
  } = useForm<ClientInfoFormData>({
    resolver: zodResolver(clientInfoSchema),
    mode: "onTouched",
    defaultValues: { imprimeLogoSafety: false, aplicaPenalidad: false },
  });

  // Queries for MasterTable parameters
  const {
    data: tipoPersonaData,
    isLoading: isLoadingTipoPersona,
    isError: isErrorTipoPersona,
    refetch: refetchTipoPersona,
  } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_PERSONA],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_PERSONA),
    enabled: isOpen,
  });

  const {
    data: paisData,
    isLoading: isLoadingPais,
    isError: isErrorPais,
    refetch: refetchPais,
  } = useQuery({
    queryKey: ["masterTable", MasterTableId.PAIS],
    queryFn: () => masterTableService.list(MasterTableId.PAIS),
    enabled: isOpen,
  });

  const {
    data: tipoRegTributarioData,
    isLoading: isLoadingTipoRegTributario,
    isError: isErrorTipoRegTributario,
    refetch: refetchTipoRegTributario,
  } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_REG_TRIBUTARIO],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_REG_TRIBUTARIO),
    enabled: isOpen,
  });

  const {
    data: formatoInformeData,
    isLoading: isLoadingFormatoInforme,
    isError: isErrorFormatoInforme,
    refetch: refetchFormatoInforme,
  } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_FORMATO_INFORME],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_FORMATO_INFORME),
    enabled: isOpen,
  });

  const { data: rateProductos } = useQuery({
    queryKey: ["masterTable", MasterTableId.PRODUCTO],
    queryFn: () => masterTableService.list(MasterTableId.PRODUCTO),
  });

  const { data: rateMonedas } = useQuery({
    queryKey: ["masterTable", MasterTableId.MONEDA],
    queryFn: () => masterTableService.list(MasterTableId.MONEDA),
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

  const { data: rateTiposTramite } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_TRAMITE],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_TRAMITE),
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

  const { data: plantillaInformeData } = useQuery({
    queryKey: ["masterTable", MasterTableId.PLANTILLA_INFORME],
    queryFn: () => masterTableService.list(MasterTableId.PLANTILLA_INFORME),
    enabled: isOpen,
  });
  const plantillaOptions = plantillaInformeData ?? [];

  const paisMap = useMemo(
    () => Object.fromEntries((paisData ?? []).map((e) => [e.num1, e.string1])),
    [paisData],
  );
  const productoMap = useMemo(
    () => Object.fromEntries((rateProductos ?? []).map((e) => [e.num1, e.string1])),
    [rateProductos],
  );
  const monedaMap = useMemo(
    () => Object.fromEntries((rateMonedas ?? []).map((e) => [e.num1, e.string1])),
    [rateMonedas],
  );
  const tramiteMap = useMemo(
    () => Object.fromEntries((rateTiposTramite ?? []).map((e) => [e.num1, e.string1])),
    [rateTiposTramite],
  );
  const tipoPersonaMap = useMemo(
    () => Object.fromEntries((tipoPersonaData ?? []).map((e) => [e.num1, e.string1])),
    [tipoPersonaData],
  );
  const tipoContactoMap = useMemo(
    () => Object.fromEntries((tipoContactoData ?? []).map((e) => [e.num1, e.string1])),
    [tipoContactoData],
  );
  const areaTrabajoMap = useMemo(
    () => Object.fromEntries((areaTrabajoData ?? []).map((e) => [e.num1, e.string1])),
    [areaTrabajoData],
  );

  if (!isOpen) return null;

  const handleGlobalReset = () => {
    infoReset();
    setAddedContacts([]);
    setAddedRates([]);
    setSelectedRateIndex(null);
    setSelectedContactIndex(null);
    setActiveTab("info");
  };

  const handleClose = () => {
    handleGlobalReset();
    onClose();
  };

  const handleAddRate = (data: RateFormData) => {
    const productoId = Number(data.producto);
    const paisId = Number(data.pais);
    const monedaId = Number(data.moneda);
    const tramiteId = Number(data.tramite);
    setAddedRates((prev) => [
      ...prev,
      {
        productoId,
        productoLabel: productoMap[productoId] ?? String(productoId),
        paisId,
        paisLabel: paisMap[paisId] ?? String(paisId),
        monedaId,
        monedaLabel: monedaMap[monedaId] ?? String(monedaId),
        tramiteId,
        tramiteLabel: tramiteMap[tramiteId] ?? String(tramiteId),
        diasMin: data.diasMin,
        diasMax: data.diasMax,
        precio: data.precio,
        penalidad: data.penalidad,
      },
    ]);
    setSelectedRateIndex(null);
  };

  const handleEditRate = (data: RateFormData) => {
    if (selectedRateIndex === null) return;
    const productoId = Number(data.producto);
    const paisId = Number(data.pais);
    const monedaId = Number(data.moneda);
    const tramiteId = Number(data.tramite);
    setAddedRates((prev) =>
      prev.map((rate, i) =>
        i === selectedRateIndex
          ? {
              productoId,
              productoLabel: productoMap[productoId] ?? String(productoId),
              paisId,
              paisLabel: paisMap[paisId] ?? String(paisId),
              monedaId,
              monedaLabel: monedaMap[monedaId] ?? String(monedaId),
              tramiteId,
              tramiteLabel: tramiteMap[tramiteId] ?? String(tramiteId),
              diasMin: data.diasMin,
              diasMax: data.diasMax,
              precio: data.precio,
              penalidad: data.penalidad,
            }
          : rate,
      ),
    );
    setSelectedRateIndex(null);
  };

  const handleConfirm = async () => {
    const valid = await triggerInfo();
    if (!valid) {
      setActiveTab("info");
      return;
    }
    onConfirm(
      getInfoValues(),
      addedContacts.map((c) => ({
        tipoPersona: c.tipoPersonaId,
        tipoContacto: c.tipoContactoId,
        codigoContacto: c.codigoContacto,
        nombre: c.nombre,
        email: c.email,
        telefono: c.telefono,
        areaTrabajo: c.areaTrabajoId,
        enviarCorreo: c.enviarCorreo,
      })),
      addedRates.map((r) => ({
        producto: r.productoId,
        pais: r.paisId,
        moneda: r.monedaId,
        tramite: r.tramiteId,
        diasMin: r.diasMin,
        diasMax: r.diasMax,
        precio: r.precio,
        penalidad: r.penalidad,
      })),
      handleGlobalReset,
    );
  };

  const handleAddContact = (data: ContactFormData) => {
    const tipoPersonaId = Number(data.tipoPersona);
    const tipoContactoId = Number(data.tipoContacto);
    const areaTrabajoId = Number(data.areaTrabajo);
    setAddedContacts((prev) => [
      ...prev,
      {
        tipoPersonaId,
        tipoPersonaLabel: tipoPersonaMap[tipoPersonaId] ?? String(tipoPersonaId),
        tipoContactoId,
        tipoContactoLabel: tipoContactoMap[tipoContactoId] ?? String(tipoContactoId),
        codigoContacto: data.codigoContacto,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        areaTrabajoId,
        areaTrabajoLabel: areaTrabajoMap[areaTrabajoId] ?? String(areaTrabajoId),
        enviarCorreo: data.enviarCorreo,
      },
    ]);
    setSelectedContactIndex(null);
  };

  const handleEditContact = (data: ContactFormData) => {
    if (selectedContactIndex === null) return;
    const tipoPersonaId = Number(data.tipoPersona);
    const tipoContactoId = Number(data.tipoContacto);
    const areaTrabajoId = Number(data.areaTrabajo);
    setAddedContacts((prev) =>
      prev.map((c, i) =>
        i === selectedContactIndex
          ? {
              tipoPersonaId,
              tipoPersonaLabel: tipoPersonaMap[tipoPersonaId] ?? String(tipoPersonaId),
              tipoContactoId,
              tipoContactoLabel: tipoContactoMap[tipoContactoId] ?? String(tipoContactoId),
              codigoContacto: data.codigoContacto,
              nombre: data.nombre,
              email: data.email,
              telefono: data.telefono,
              enviarCorreo: data.enviarCorreo,
              areaTrabajoId,
              areaTrabajoLabel: areaTrabajoMap[areaTrabajoId] ?? String(areaTrabajoId),
            }
          : c,
      ),
    );
    setSelectedContactIndex(null);
  };

  const isLoadingInfo =
    isLoadingTipoPersona ||
    isLoadingPais ||
    isLoadingTipoRegTributario ||
    isLoadingFormatoInforme;
  const isErrorInfo =
    isErrorTipoPersona ||
    isErrorPais ||
    isErrorTipoRegTributario ||
    isErrorFormatoInforme;

  const watchedPais = infoWatch("pais");
  const watchedTipoRegTributario = infoWatch("tipoRegistroTributario");
  const watchedAtendidoPor = infoWatch("atendidoPor");
  const watchedIdioma = infoWatch("idioma");
  const watchedIdiomaFacturacion = infoWatch("idiomaFacturacion");
  const watchedTipoPersona = infoWatch("tipoPersona");
  const watchedMoneda = infoWatch("moneda");
  const watchedFormatoInforme = infoWatch("formatoInforme");
  const watchedPlantillaInforme = infoWatch("plantillaInforme");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-brand-black">
            Agrega un Cliente
          </h2>
          <CustomButton variant="ghost" size="icon" onClick={handleClose} disabled={isSubmitting}>
            <X size={20} className="text-gray-400" />
          </CustomButton>
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
              <span>Información</span>
              {Object.keys(infoErrors).length > 0 && (
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
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
              <span>Contactos</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto min-h-0">
          {activeTab === "info" && (
            <>
              {isLoadingInfo ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 py-20">
                  <Loader2 size={40} className="text-brand-wine animate-spin" />
                  <p className="text-sm font-medium text-gray-500">
                    Cargando parámetros...
                  </p>
                </div>
              ) : isErrorInfo ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 py-20 text-center">
                  <AlertCircle size={40} className="text-red-500" />
                  <p className="text-sm font-bold text-brand-black">
                    Error al cargar parámetros
                  </p>
                  <CustomButton
                    variant="wine"
                    size="sm"
                    onClick={() => {
                      refetchTipoPersona();
                      refetchPais();
                      refetchTipoRegTributario();
                      refetchFormatoInforme();
                    }}
                  >
                    <RefreshCw size={14} />
                    <span>REINTENTAR</span>
                  </CustomButton>
                </div>
              ) : (
                <form
                  id="client-info-form"
                  onSubmit={handleInfoSubmit(() => setActiveTab("rates"))}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300"
                >
                  <SearchableSelect
                    label="Tipo Persona"
                    required
                    options={tipoPersonaData}
                    value={watchedTipoPersona}
                    onChange={(val) =>
                      setInfoValue("tipoPersona", val, { shouldValidate: true })
                    }
                    error={infoErrors.tipoPersona?.message}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Nombre<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      {...infoRegister("nombre")}
                      type="text"
                      placeholder="Nombre"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
                    />
                    {infoErrors.nombre && (
                      <p className="text-xs text-red-500">
                        {infoErrors.nombre.message}
                      </p>
                    )}
                  </div>

                  <SearchableSelect
                    label="País"
                    required
                    options={paisData}
                    value={watchedPais}
                    onChange={(val) =>
                      setInfoValue("pais", val, { shouldValidate: true })
                    }
                    error={infoErrors.pais?.message}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Dirección<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      {...infoRegister("direccion")}
                      type="text"
                      placeholder="Dirección"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
                    />
                    {infoErrors.direccion && (
                      <p className="text-xs text-red-500">
                        {infoErrors.direccion.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Email<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      {...infoRegister("email")}
                      type="email"
                      placeholder="Email"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
                    />
                    {infoErrors.email && (
                      <p className="text-xs text-red-500">
                        {infoErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Teléfono<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      {...infoRegister("telefono")}
                      type="text"
                      placeholder="Teléfono"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
                    />
                    {infoErrors.telefono && (
                      <p className="text-xs text-red-500">
                        {infoErrors.telefono.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Sitio Web <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      {...infoRegister("sitioWeb")}
                      type="text"
                      placeholder="Sitio Web"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
                    />
                    {infoErrors.sitioWeb && (
                      <p className="text-xs text-red-500">
                        {infoErrors.sitioWeb.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Fax <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      {...infoRegister("fax")}
                      type="text"
                      placeholder="Fax"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
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
                      })
                    }
                    error={infoErrors.tipoRegistroTributario?.message}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Registro Tributario{watchedTipoRegTributario && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <input
                      {...infoRegister("numRegistroTributario")}
                      type="text"
                      placeholder="Registro Tributario"
                      disabled={!watchedTipoRegTributario}
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    />
                    {infoErrors.numRegistroTributario && (
                      <p className="text-xs text-red-500">{infoErrors.numRegistroTributario.message}</p>
                    )}
                  </div>

                  <SearchableSelect
                    label="Moneda"
                    required
                    options={rateMonedas}
                    value={watchedMoneda}
                    onChange={(val) =>
                      setInfoValue("moneda", val, { shouldValidate: true })
                    }
                    error={infoErrors.moneda?.message}
                  />

                  <SearchableSelect
                    label="Atendido por"
                    required
                    options={empresaAtencionData}
                    value={watchedAtendidoPor}
                    onChange={(val) =>
                      setInfoValue("atendidoPor", val, { shouldValidate: true })
                    }
                    error={infoErrors.atendidoPor?.message}
                  />

                  <SearchableSelect
                    label="Idioma preferido"
                    required
                    options={idiomaData}
                    value={watchedIdioma}
                    onChange={(val) =>
                      setInfoValue("idioma", val, { shouldValidate: true })
                    }
                    error={infoErrors.idioma?.message}
                  />

                  <SearchableSelect
                    label="Idioma de facturación"
                    required
                    options={idiomaData}
                    value={watchedIdiomaFacturacion}
                    onChange={(val) =>
                      setInfoValue("idiomaFacturacion", val, { shouldValidate: true })
                    }
                    error={infoErrors.idiomaFacturacion?.message}
                  />

                  <MultiSearchableSelect
                    label="Formato de Informe"
                    required
                    options={formatoInformeData}
                    value={watchedFormatoInforme ?? []}
                    onChange={(val) =>
                      setInfoValue("formatoInforme", val, { shouldValidate: true })
                    }
                    error={infoErrors.formatoInforme?.message}
                  />

                  <SearchableSelect
                    label="Plantilla de informe"
                    required
                    options={plantillaOptions}
                    value={watchedPlantillaInforme ?? null}
                    onChange={(val) =>
                      setInfoValue("plantillaInforme", val, { shouldValidate: true })
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
                    <label className="text-sm font-bold text-gray-700">
                      Recomendación <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      {...infoRegister("recomendacion")}
                      rows={3}
                      placeholder="Recomendación"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300 resize-none"
                    />
                  </div>
                </form>
              )}
            </>
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
                  <CustomButton size="sm" onClick={() => setIsRateModalOpen(true)}>
                    <Plus size={14} />
                    <span>Nuevo</span>
                  </CustomButton>
                  <CustomButton
                    size="sm"
                    disabled={selectedRateIndex === null}
                    onClick={() => setIsEditRateModalOpen(true)}
                  >
                    Editar
                  </CustomButton>
                  <CustomButton
                    size="sm"
                    disabled={selectedRateIndex === null}
                    onClick={() => {
                      setAddedRates((prev) =>
                        prev.filter((_, idx) => idx !== selectedRateIndex),
                      );
                      setSelectedRateIndex(null);
                    }}
                  >
                    Eliminar
                  </CustomButton>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-50 text-gray-400 uppercase">
                    <tr>
                      <th className="px-3 py-3 w-8" />
                      <th className="px-4 py-3 font-bold">Producto</th>
                      <th className="px-4 py-3 font-bold">País</th>
                      <th className="px-4 py-3 font-bold">Moneda</th>
                      <th className="px-4 py-3 font-bold">Trámite</th>
                      <th className="px-4 py-3 font-bold text-center">
                        Días Min. - Máx.
                      </th>
                      <th className="px-4 py-3 font-bold text-center">
                        Precio
                      </th>
                      <th className="px-4 py-3 font-bold text-center">
                        Penalidad
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {addedRates.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-10 text-center text-gray-400 text-sm italic"
                        >
                          No hay tarifas agregadas.
                        </td>
                      </tr>
                    ) : (
                      addedRates.map((rate, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-3 py-3">
                            <input
                              type="checkbox"
                              checked={selectedRateIndex === i}
                              onChange={() => setSelectedRateIndex(selectedRateIndex === i ? null : i)}
                              className="accent-brand-wine cursor-pointer w-4 h-4"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {rate.productoLabel}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {rate.paisLabel}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {rate.monedaLabel}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-center">
                            {rate.tramiteLabel}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-center">
                            {rate.diasMin} - {rate.diasMax}
                          </td>
                          <td className="px-4 py-3 text-brand-black font-bold text-center">
                            {rate.precio}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-center">
                            {rate.penalidad}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="animate-in fade-in duration-300 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 max-w-xs">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full px-4 py-2 bg-brand-white border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <CustomButton size="sm" onClick={() => setIsContactModalOpen(true)}>
                    <Plus size={14} />
                    <span>Nuevo</span>
                  </CustomButton>
                  <CustomButton
                    size="sm"
                    disabled={selectedContactIndex === null}
                    onClick={() => setIsEditContactModalOpen(true)}
                  >
                    Editar
                  </CustomButton>
                  <CustomButton
                    size="sm"
                    disabled={selectedContactIndex === null}
                    onClick={() => {
                      setAddedContacts((prev) =>
                        prev.filter((_, idx) => idx !== selectedContactIndex),
                      );
                      setSelectedContactIndex(null);
                    }}
                  >
                    Eliminar
                  </CustomButton>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
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
                    {addedContacts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-gray-400 text-sm italic"
                        >
                          No hay contactos agregados.
                        </td>
                      </tr>
                    ) : (
                      addedContacts.map((contact, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-3 py-3">
                            <input
                              type="checkbox"
                              checked={selectedContactIndex === i}
                              onChange={() => setSelectedContactIndex(selectedContactIndex === i ? null : i)}
                              className="accent-brand-wine cursor-pointer w-4 h-4"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-600">{contact.nombre}</td>
                          <td className="px-4 py-3 text-gray-600">{contact.email}</td>
                          <td className="px-4 py-3 text-gray-600">{contact.telefono}</td>
                          <td className="px-4 py-3 text-gray-600">{contact.tipoContactoLabel}</td>
                          <td className="px-4 py-3 text-gray-600">{contact.areaTrabajoLabel}</td>
                          <td className="px-4 py-3 text-center">
                            {contact.enviarCorreo
                              ? <MailCheck size={16} className="inline text-green-500" />
                              : <MailX size={16} className="inline text-gray-400" />}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 flex justify-between gap-3 bg-gray-50/50 shrink-0">
          <div>
            {activeTab !== "info" && (
              <CustomButton
                variant="secondary"
                onClick={() => setActiveTab(activeTab === "rates" ? "info" : "rates")}
              >
                Anterior
              </CustomButton>
            )}
          </div>
          <div className="flex gap-3">
            {activeTab !== "contacts" && (
              <CustomButton
                variant="secondary"
                onClick={() => setActiveTab(activeTab === "info" ? "rates" : "contacts")}
              >
                Siguiente
              </CustomButton>
            )}
            <CustomButton
              onClick={handleConfirm}
              disabled={!isInfoValid || isLoadingInfo}
              loading={isSubmitting}
              loadingText="Creando..."
              className="min-w-35"
            >
              <div className="w-2 h-2 rounded-full bg-brand-white" />
              <span>Confirmar</span>
            </CustomButton>
          </div>
        </div>
      </div>

      <AddRateModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        onConfirm={handleAddRate}
      />
      <AddRateModal
        isOpen={isEditRateModalOpen}
        onClose={() => setIsEditRateModalOpen(false)}
        onConfirm={handleEditRate}
        defaultValues={
          selectedRateIndex !== null
            ? {
                producto: addedRates[selectedRateIndex].productoId,
                pais: addedRates[selectedRateIndex].paisId,
                moneda: addedRates[selectedRateIndex].monedaId,
                tramite: addedRates[selectedRateIndex].tramiteId,
                diasMin: addedRates[selectedRateIndex].diasMin,
                diasMax: addedRates[selectedRateIndex].diasMax,
                precio: addedRates[selectedRateIndex].precio,
                penalidad: addedRates[selectedRateIndex].penalidad,
              }
            : undefined
        }
      />
      <AddContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onConfirm={handleAddContact}
      />
      <AddContactModal
        isOpen={isEditContactModalOpen}
        onClose={() => setIsEditContactModalOpen(false)}
        onConfirm={handleEditContact}
        defaultValues={
          selectedContactIndex !== null
            ? {
                tipoPersona: addedContacts[selectedContactIndex].tipoPersonaId,
                tipoContacto: addedContacts[selectedContactIndex].tipoContactoId,
                codigoContacto: addedContacts[selectedContactIndex].codigoContacto,
                nombre: addedContacts[selectedContactIndex].nombre,
                email: addedContacts[selectedContactIndex].email,
                telefono: addedContacts[selectedContactIndex].telefono,
                areaTrabajo: addedContacts[selectedContactIndex].areaTrabajoId,
                enviarCorreo: addedContacts[selectedContactIndex].enviarCorreo,
              }
            : undefined
        }
      />
    </div>
  );
}
