import { useState } from "react";
import { Plus, MailCheck, MailX } from "lucide-react";
import { CustomModalPestanas } from "@maximilian/components/common/CustomModalPestanas";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import {
  esquemaInformacionCliente,
  type DatosFormularioInformacionCliente,
  type DatosFormularioContacto,
  type DatosFormularioTarifa,
} from "@maximilian/schemas";
import { ModalAgregarTarifa } from "./ModalAgregarTarifa";
import { ModalAgregarContacto } from "./ModalAgregarContacto";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { MultiCustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscableMultiple";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomEntradaUrl } from "@maximilian/components/common/CustomEntradaUrl";
import { useRetardo } from "@maximilian/hooks/useRetardo";

interface ModalAgregarClienteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    data: DatosFormularioInformacionCliente,
    contacts: DatosFormularioContacto[],
    rates: DatosFormularioTarifa[],
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
  penalidad?: number;
}

interface ContactEntry {
  tipoPersonaId: number;
  tipoPersonaLabel: string;
  tipoContactoId: number;
  tipoContactoLabel: string;
  tipoContactoNuevo?: string;
  codigoContacto: string;
  nombre: string;
  correo: string;
  telefono: string;
  areaTrabajoId: number;
  areaTrabajoLabel: string;
  enviarCorreo: boolean;
}


export function ModalAgregarCliente({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}: ModalAgregarClienteProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isEditRateModalOpen, setIsEditRateModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [addedContacts, setAddedContacts] = useState<ContactEntry[]>([]);
  const [addedRates, setAddedRates] = useState<RateEntry[]>([]);
  const [selectedRateIndex, setSelectedRateIndex] = useState<number | null>(null);
  const [selectedContactIndex, setSelectedContactIndex] = useState<number | null>(null);
  const [contactsPag, setContactsPag] = useState(1);
  const [contactSearch, setContactSearch] = useState("");
  const busquedaContactoConRetardo = useRetardo(contactSearch);

  const {
    register: infoRegister,
    control: infoControl,
    handleSubmit: handleInfoSubmit,
    formState: { errors: infoErrors, isValid: isInfoValid },
    reset: infoReset,
    setValue: setInfoValue,
    watch: infoWatch,
    getValues: getInfoValues,
    trigger: triggerInfo,
  } = useForm<DatosFormularioInformacionCliente>({
    resolver: zodResolver(esquemaInformacionCliente),
    mode: "onTouched",
    defaultValues: {
      imprimeLogoSafety: false,
      aplicaPenalidad: false,
      emitirPrefactura: false,
    },
  });

  const queryClient = useQueryClient();

  const getCached = (id: number) =>
    queryClient.getQueryData<EntradaTablaMaestra[]>(["masterTable", id]) ?? [];
  const getLabel = (id: number, val: number) =>
    getCached(id).find((e) => e.num1 === val)?.string1 ?? String(val);

  if (!isOpen) return null;

  const handleGlobalReset = () => {
    infoReset();
    setAddedContacts([]);
    setAddedRates([]);
    setSelectedRateIndex(null);
    setSelectedContactIndex(null);
    setContactsPag(1);
    setContactSearch("");
    setActiveTab("info");
  };

  const handleClose = () => {
    handleGlobalReset();
    onClose();
  };

  const buildRate = (data: DatosFormularioTarifa) => {
    const productoId = Number(data.producto);
    const paisId = Number(data.pais);
    const monedaId = Number(data.moneda);
    const tramiteId = Number(data.tramite);
    return {
      productoId,
      productoLabel: getLabel(TablaMaestraId.PRODUCTO, productoId),
      paisId,
      paisLabel: getLabel(TablaMaestraId.PAIS, paisId),
      monedaId,
      monedaLabel: getLabel(TablaMaestraId.MONEDA, monedaId),
      tramiteId,
      tramiteLabel: getLabel(TablaMaestraId.TIPO_TRAMITE, tramiteId),
      diasMin: data.diasMin,
      diasMax: data.diasMax,
      precio: data.precio,
      penalidad: data.penalidad,
    };
  };

  const handleAddRate = (data: DatosFormularioTarifa) => {
    setAddedRates((prev) => [...prev, buildRate(data)]);
    setSelectedRateIndex(null);
  };

  const handleEditRate = (data: DatosFormularioTarifa) => {
    if (selectedRateIndex === null) return;
    setAddedRates((prev) =>
      prev.map((rate, i) => (i === selectedRateIndex ? buildRate(data) : rate)),
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
        tipoContactoNuevo: c.tipoContactoNuevo,
        codigoContacto: c.codigoContacto,
        nombre: c.nombre,
        correo: c.correo,
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

  const buildContact = (data: DatosFormularioContacto) => {
    const tipoPersonaId = Number(data.tipoPersona);
    const tipoContactoId = Number(data.tipoContacto);
    const areaTrabajoId = Number(data.areaTrabajo);
    return {
      tipoPersonaId,
      tipoPersonaLabel: getLabel(TablaMaestraId.TIPO_PERSONA, tipoPersonaId),
      tipoContactoId,
      tipoContactoLabel: tipoContactoId === 0
        ? (data.tipoContactoNuevo ?? String(tipoContactoId))
        : getLabel(TablaMaestraId.TIPO_CONTACTO, tipoContactoId),
      tipoContactoNuevo: data.tipoContactoNuevo,
      codigoContacto: data.codigoContacto ?? "",
      nombre: data.nombre,
      correo: data.correo,
      telefono: data.telefono ?? "",
      areaTrabajoId,
      areaTrabajoLabel: getLabel(TablaMaestraId.AREA_TRABAJO, areaTrabajoId),
      enviarCorreo: data.enviarCorreo,
    };
  };

  const CONTACTS_PER_PAGE = 5;

  const handleAddContact = (data: DatosFormularioContacto) => {
    setAddedContacts((prev) => {
      const next = [...prev, buildContact(data)];
      setContactsPag(Math.ceil(next.length / CONTACTS_PER_PAGE));
      return next;
    });
    setSelectedContactIndex(null);
  };

  const handleEditContact = (data: DatosFormularioContacto) => {
    if (selectedContactIndex === null) return;
    setAddedContacts((prev) =>
      prev.map((c, i) => (i === selectedContactIndex ? buildContact(data) : c)),
    );
    setSelectedContactIndex(null);
  };

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
    <>
      <CustomModalPestanas
        isOpen={isOpen}
        onClose={handleClose}
        title="Agrega un Cliente"
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as Tab)}
        tabs={[
          {
            id: "info",
            label: "Información",
            indicator: Object.keys(infoErrors).length > 0 ? (
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            ) : undefined,
            content: (
            <>
                <form
                  id="client-info-form"
                  onSubmit={handleInfoSubmit(() => setActiveTab("rates"))}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300"
                >
                  <CustomSelectorBuscable
                    label="Tipo Persona"
                    required
                    idMaster={TablaMaestraId.TIPO_PERSONA}
                    value={watchedTipoPersona}
                    onChange={(val) =>
                      setInfoValue("tipoPersona", val, { shouldValidate: true })
                    }
                    onBlur={() => triggerInfo("tipoPersona")}
                    autoSeleccionarOpcionUnica
                    error={infoErrors.tipoPersona?.message}
                  />

                  <div className="space-y-2">
                    <CustomLabel required>Nombre</CustomLabel>
                    <input
                      {...infoRegister("nombre")}
                      type="text"
                      placeholder="Nombre"
                      className={`w-full px-4 py-2.5 bg-brand-white border ${infoErrors.nombre ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300`}
                    />
                    {infoErrors.nombre && (
                      <p className="text-xs text-red-500">
                        {infoErrors.nombre.message}
                      </p>
                    )}
                  </div>

                  <CustomSelectorBuscable
                    label="País"
                    required
                    idMaster={TablaMaestraId.PAIS}
                    value={watchedPais}
                    onChange={(val) =>
                      setInfoValue("pais", val, { shouldValidate: true })
                    }
                    onBlur={() => triggerInfo("pais")}
                    autoSeleccionarOpcionUnica
                    error={infoErrors.pais?.message}
                  />

                  <div className="space-y-2">
                    <CustomLabel optional>Dirección</CustomLabel>
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
                    <CustomLabel required>Correo Electrónico</CustomLabel>
                    <input
                      {...infoRegister("correo")}
                      type="email"
                      placeholder="Correo Electrónico"
                      className={`w-full px-4 py-2.5 bg-brand-white border ${infoErrors.correo ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300`}
                    />
                    {infoErrors.correo && (
                      <p className="text-xs text-red-500">
                        {infoErrors.correo.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <CustomLabel optional>Teléfono</CustomLabel>
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
                    <CustomLabel optional>Sitio Web</CustomLabel>
                    <Controller
                      name="sitioWeb"
                      control={infoControl}
                      render={({ field }) => (
                        <CustomEntradaUrl
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={!!infoErrors.sitioWeb}
                        />
                      )}
                    />
                    {infoErrors.sitioWeb && (
                      <p className="text-xs text-red-500">
                        {infoErrors.sitioWeb.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <CustomLabel optional>Fax</CustomLabel>
                    <input
                      {...infoRegister("fax")}
                      type="text"
                      placeholder="Fax"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
                    />
                  </div>

                  <CustomSelectorBuscable
                    label="Tipo Registro Tributario"
                    required
                    idMaster={TablaMaestraId.TIPO_REG_TRIBUTARIO}
                    value={watchedTipoRegTributario}
                    onChange={(val) =>
                      setInfoValue("tipoRegistroTributario", val, {
                        shouldValidate: true,
                      })
                    }
                    onBlur={() => triggerInfo("tipoRegistroTributario")}
                    autoSeleccionarOpcionUnica
                    error={infoErrors.tipoRegistroTributario?.message}
                  />

                  <div className="space-y-2">
                    <CustomLabel required={!!watchedTipoRegTributario}>Registro Tributario</CustomLabel>
                    <input
                      {...infoRegister("numRegistroTributario")}
                      type="text"
                      placeholder="Registro Tributario"
                      disabled={!watchedTipoRegTributario}
                      className={`w-full px-4 py-2.5 bg-brand-white border ${infoErrors.numRegistroTributario ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                    />
                    {infoErrors.numRegistroTributario && (
                      <p className="text-xs text-red-500">{infoErrors.numRegistroTributario.message}</p>
                    )}
                  </div>

                  <CustomSelectorBuscable
                    label="Moneda"
                    required
                    idMaster={TablaMaestraId.MONEDA}
                    value={watchedMoneda}
                    onChange={(val) =>
                      setInfoValue("moneda", val, { shouldValidate: true })
                    }
                    onBlur={() => triggerInfo("moneda")}
                    autoSeleccionarOpcionUnica
                    error={infoErrors.moneda?.message}
                  />

                  <CustomSelectorBuscable
                    label="Atendido por"
                    required
                    idMaster={TablaMaestraId.EMPRESA_ATENCION}
                    value={watchedAtendidoPor}
                    onChange={(val) =>
                      setInfoValue("atendidoPor", val, { shouldValidate: true })
                    }
                    onBlur={() => triggerInfo("atendidoPor")}
                    autoSeleccionarOpcionUnica
                    error={infoErrors.atendidoPor?.message}
                  />

                  <CustomSelectorBuscable
                    label="Idioma preferido"
                    required
                    idMaster={TablaMaestraId.IDIOMA}
                    value={watchedIdioma}
                    onChange={(val) =>
                      setInfoValue("idioma", val, { shouldValidate: true })
                    }
                    onBlur={() => triggerInfo("idioma")}
                    autoSeleccionarOpcionUnica
                    error={infoErrors.idioma?.message}
                  />

                  <CustomSelectorBuscable
                    label="Idioma de facturación"
                    required
                    idMaster={TablaMaestraId.IDIOMA}
                    value={watchedIdiomaFacturacion}
                    onChange={(val) =>
                      setInfoValue("idiomaFacturacion", val, { shouldValidate: true })
                    }
                    onBlur={() => triggerInfo("idiomaFacturacion")}
                    autoSeleccionarOpcionUnica
                    error={infoErrors.idiomaFacturacion?.message}
                  />

                  <MultiCustomSelectorBuscable
                    label="Formato de Informe"
                    required
                    idMaster={TablaMaestraId.TIPO_FORMATO_INFORME}
                    value={watchedFormatoInforme ?? []}
                    onChange={(val) =>
                      setInfoValue("formatoInforme", val, { shouldValidate: true })
                    }
                    onBlur={() => triggerInfo("formatoInforme")}
                    autoSeleccionarOpcionUnica
                    error={infoErrors.formatoInforme?.message}
                  />

                  <CustomSelectorBuscable
                    label="Plantilla de informe"
                    required
                    idMaster={TablaMaestraId.PLANTILLA_INFORME}
                    value={watchedPlantillaInforme ?? null}
                    onChange={(val) =>
                      setInfoValue("plantillaInforme", val, { shouldValidate: true })
                    }
                    onBlur={() => triggerInfo("plantillaInforme")}
                    autoSeleccionarOpcionUnica
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
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        {...infoRegister("emitirPrefactura")}
                        id="emitirPrefactura"
                        className="w-4 h-4 accent-brand-wine cursor-pointer"
                      />
                      <label htmlFor="emitirPrefactura" className="text-sm font-bold text-gray-700 cursor-pointer">
                        Emitir Prefactura
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <CustomLabel optional>Recomendación</CustomLabel>
                    <textarea
                      {...infoRegister("recomendacion")}
                      rows={3}
                      placeholder="Recomendación"
                      className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300 resize-none"
                    />
                  </div>
                </form>
            </>
            ),
          },
          {
            id: "rates",
            label: "Tarifas",
            content: (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 max-w-xs">
                  <input
                    type="text"
                    placeholder="Buscar por producto y país"
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

              <div className="border border-gray-100 rounded-2xl overflow-hidden min-h-60">
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
            ),
          },
          {
            id: "contacts",
            label: "Contactos",
            content: (
            <div className="animate-in fade-in duration-300 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 max-w-xs">
                  <input
                    type="text"
                    placeholder="Buscar por nombre"
                    value={contactSearch}
                    onChange={(e) => {
                      setContactSearch(e.target.value);
                      setContactsPag(1);
                      setSelectedContactIndex(null);
                    }}
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
                      const next = addedContacts.filter((_, idx) => idx !== selectedContactIndex);
                      const newTotal = Math.ceil(next.length / CONTACTS_PER_PAGE);
                      if (contactsPag > newTotal && newTotal > 0) setContactsPag(newTotal);
                      setAddedContacts(next);
                      setSelectedContactIndex(null);
                    }}
                  >
                    Eliminar
                  </CustomButton>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden min-h-60">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-50 text-gray-400 uppercase">
                    <tr>
                      <th className="px-3 py-3 w-8" />
                      <th className="px-4 py-3 font-bold">Nombre</th>
                      <th className="px-4 py-3 font-bold">Correo</th>
                      <th className="px-4 py-3 font-bold">Teléfono</th>
                      <th className="px-4 py-3 font-bold">Tipo Contacto</th>
                      <th className="px-4 py-3 font-bold">Área Trabajo</th>
                      <th className="px-4 py-3 font-bold text-center">
                        <span title="Se envía correo">CC</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(() => {
                      const term = busquedaContactoConRetardo.toLowerCase();
                      const filtered = addedContacts
                        .map((c, originalIndex) => ({ ...c, originalIndex }))
                        .filter(c =>
                          !term ||
                          c.nombre.toLowerCase().includes(term) ||
                          c.correo.toLowerCase().includes(term) ||
                          c.telefono.toLowerCase().includes(term) ||
                          c.tipoContactoLabel.toLowerCase().includes(term) ||
                          c.areaTrabajoLabel.toLowerCase().includes(term),
                        );
                      const totalPages = Math.ceil(filtered.length / CONTACTS_PER_PAGE);
                      const paged = filtered.slice((contactsPag - 1) * CONTACTS_PER_PAGE, contactsPag * CONTACTS_PER_PAGE);

                      if (addedContacts.length === 0) return (
                        <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm italic">No hay contactos agregados.</td></tr>
                      );
                      if (filtered.length === 0) return (
                        <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm italic">Sin resultados.</td></tr>
                      );
                      return (
                        <>
                          {paged.map((contact) => (
                            <tr key={contact.originalIndex} className="hover:bg-gray-50/50">
                              <td className="px-3 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedContactIndex === contact.originalIndex}
                                  onChange={() => setSelectedContactIndex(selectedContactIndex === contact.originalIndex ? null : contact.originalIndex)}
                                  className="accent-brand-wine cursor-pointer w-4 h-4"
                                />
                              </td>
                              <td className="px-4 py-3 text-gray-600">{contact.nombre}</td>
                              <td className="px-4 py-3 text-gray-600">
                                <span className="block max-w-44 truncate" title={contact.correo}>
                                  {contact.correo}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                <span className="block max-w-36 truncate" title={contact.telefono}>
                                  {contact.telefono}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{contact.tipoContactoLabel}</td>
                              <td className="px-4 py-3 text-gray-600">{contact.areaTrabajoLabel}</td>
                              <td className="px-4 py-3 text-center">
                                {contact.enviarCorreo
                                  ? <MailCheck size={16} className="inline text-green-500" />
                                  : <MailX size={16} className="inline text-gray-400" />}
                              </td>
                            </tr>
                          ))}
                          {totalPages > 1 && (
                            <tr>
                              <td colSpan={7}>
                                <div className="flex items-center justify-end gap-2 px-2 py-2">
                                  <button disabled={contactsPag === 1} onClick={() => setContactsPag(p => p - 1)} className="px-2 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer">‹</button>
                                  <span className="text-sm">{contactsPag} / {totalPages}</span>
                                  <button disabled={contactsPag === totalPages} onClick={() => setContactsPag(p => p + 1)} className="px-2 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer">›</button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            ),
          },
        ]}
        footer={
          <div className="flex justify-between gap-3">
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
                disabled={!isInfoValid}
                loading={isSubmitting}
                loadingText="Creando..."
                className="min-w-35"
              >
                <div className="w-2 h-2 rounded-full bg-brand-white" />
                <span>Confirmar</span>
              </CustomButton>
            </div>
          </div>
        }
      />

      <ModalAgregarTarifa
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        onConfirm={handleAddRate}
      />
      <ModalAgregarTarifa
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
      <ModalAgregarContacto
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onConfirm={handleAddContact}
      />
      <ModalAgregarContacto
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
                correo: addedContacts[selectedContactIndex].correo,
                telefono: addedContacts[selectedContactIndex].telefono,
                areaTrabajo: addedContacts[selectedContactIndex].areaTrabajoId,
                enviarCorreo: addedContacts[selectedContactIndex].enviarCorreo,
              }
            : undefined
        }
      />
    </>
  );
}
