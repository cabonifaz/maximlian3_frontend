import { useEffect, useRef, useState, useMemo } from "react";
import { Upload, Trash2, FileText, Filter, AlertCircle, RotateCcw } from "lucide-react";
import { CustomDatePicker } from "@maximilian/components/common/CustomDatePicker";
import { CustomTabbedModal } from "@maximilian/components/common/CustomTabbedModal";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { SearchableSelect } from "@maximilian/components/common/SearchableSelect";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterTableService } from "@maximilian/services/masterTable.service";
import { MasterTableId } from "@maximilian/shared/types/master-table.type";
import { clientService } from "@maximilian/services/client.service";
import { pedidoService } from "@maximilian/services/pedido.service";
import type { ClienteCorta, TarifarioCortaEntry } from "@maximilian/shared/types/client.type";
import {
  useForm,
  type Resolver,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
  type UseFormReset,
} from "react-hook-form";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { TarifarioCortaTable } from "@maximilian/components/coordinator/TarifarioCortaTable";
import { zodResolver } from "@hookform/resolvers/zod";
import { pedidoSchema, type PedidoFormData } from "@maximilian/schemas";
import type { GetPedidoResponse } from "@maximilian/shared/types/pedido.type";

const pedidoResolver: Resolver<PedidoFormData> = (...args) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = zodResolver(pedidoSchema)(...args);
  const { fechaDesde, fechaHasta } = args[0];
  if (fechaDesde && fechaHasta && fechaHasta < fechaDesde) {
    result.errors = {
      ...result.errors,
      fechaHasta: {
        type: "custom",
        message: "La fecha hasta debe ser mayor o igual a la fecha desde",
      },
    };
  }
  return result;
};

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
}

interface EditPedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: number | null;
}

interface InformacionTabProps {
  register: UseFormRegister<PedidoFormData>;
  setValue: UseFormSetValue<PedidoFormData>;
  watch: UseFormWatch<PedidoFormData>;
  errors: Partial<Record<keyof PedidoFormData, { message?: string }>>;
  clientes: ClienteCorta[];
  selectedIdTarifario: number | undefined;
  onTarifarioSelect: (id: number | undefined) => void;
  tarifarioError?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExtension(filename: string): string {
  return filename.split(".").pop()?.toUpperCase() ?? "—";
}

function FileTypeBadge({ ext }: { ext: string }) {
  const colorMap: Record<string, string> = {
    PDF: "bg-red-100 text-red-600",
    XLSX: "bg-green-100 text-green-600",
    XLS: "bg-green-100 text-green-600",
    DOCX: "bg-blue-100 text-blue-600",
    DOC: "bg-blue-100 text-blue-600",
    PNG: "bg-purple-100 text-purple-600",
    JPG: "bg-purple-100 text-purple-600",
    JPEG: "bg-purple-100 text-purple-600",
  };
  const cls = colorMap[ext] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${cls}`}>
      {ext}
    </span>
  );
}

function FileIcon({ ext }: { ext: string }) {
  const colorMap: Record<string, string> = {
    PDF: "text-red-500",
    XLSX: "text-green-500",
    XLS: "text-green-500",
    DOCX: "text-blue-500",
    DOC: "text-blue-500",
  };
  return <FileText size={18} className={colorMap[ext] ?? "text-gray-400"} />;
}

function InformacionTab({ register, setValue, watch, errors, clientes, selectedIdTarifario, onTarifarioSelect, tarifarioError }: InformacionTabProps) {
  const idCliente = watch("idCliente");
  const idPais = watch("idPais");
  const idIdioma = watch("idIdioma");
  const idClaseInforme = watch("idClaseInforme");
  const logoImprimible = watch("logoImprimible");
  const idTipoTramite = watch("idTipoTramite");
  const idTipoPersona = watch("idTipoPersona");
  const idEmpresaAtencion = watch("idEmpresaAtencion");
  const idPlantillaInforme = watch("idPlantillaInforme");
  const fechaDesde = watch("fechaDesde");
  const fechaHasta = watch("fechaHasta");

  const clienteOptions = useMemo(
    () =>
      clientes.map((c) => ({
        idEmpresa: 0,
        idMasterTable: null,
        idMaster: 0,
        descripcion: "",
        num1: c.idCliente,
        num2: null,
        num3: null,
        string1: c.nombreCliente,
        string2: null,
        string3: null,
        date1: null,
        date2: null,
        date3: null,
      })),
    [clientes]
  );

  const { data: tiposPersona } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_PERSONA],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_PERSONA),
  });

  const { data: empresasAtencion } = useQuery({
    queryKey: ["masterTable", MasterTableId.EMPRESA_ATENCION],
    queryFn: () => masterTableService.list(MasterTableId.EMPRESA_ATENCION),
  });

  const { data: paises } = useQuery({
    queryKey: ["masterTable", MasterTableId.PAIS],
    queryFn: () => masterTableService.list(MasterTableId.PAIS),
  });

  const { data: idiomas } = useQuery({
    queryKey: ["masterTable", MasterTableId.IDIOMA],
    queryFn: () => masterTableService.list(MasterTableId.IDIOMA),
  });

  const { data: clasesInforme } = useQuery({
    queryKey: ["masterTable", MasterTableId.CLASE_INFORME],
    queryFn: () => masterTableService.list(MasterTableId.CLASE_INFORME),
  });

  const { data: tiposTramite } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_TRAMITE],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_TRAMITE),
  });

  const { data: plantillasInforme } = useQuery({
    queryKey: ["masterTable", MasterTableId.PLANTILLA_INFORME],
    queryFn: () => masterTableService.list(MasterTableId.PLANTILLA_INFORME),
  });

  const handleClienteChange = (val: number | undefined) => {
    setValue("idCliente", val as number, { shouldValidate: true });
    if (val == null) return;
    const cliente = clientes.find((c) => c.idCliente === val);
    if (!cliente) return;
    setValue("nroDocumento", cliente.numeroDocumento, { shouldValidate: true });
    setValue("idIdioma", cliente.idIdioma, { shouldValidate: true });
    setValue("logoImprimible", cliente.logoImprimible, { shouldValidate: true });
    setValue("idPlantillaInforme", cliente.idPlantilla, { shouldValidate: true });
  };

  return (
    <div className="flex gap-6">
      {/* Left column: client data + filters + tarifa */}
      <div className="flex flex-col gap-5 flex-3">
        <SearchableSelect
          label="Cliente"
          options={clienteOptions}
          value={idCliente}
          onChange={handleClienteChange}
          placeholder="Seleccione"
          required
          error={errors.idCliente?.message}
        />
        <div className="flex flex-col gap-1.5">
          <CustomLabel required>Nro. Documento</CustomLabel>
          <input
            type="text"
            placeholder="Nro. Documento"
            {...register("nroDocumento")}
            className={`w-full px-4 py-2.5 bg-brand-white border ${errors.nroDocumento ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
          />
          {errors.nroDocumento && <p className="text-xs text-red-500">{errors.nroDocumento.message}</p>}
        </div>
        <SearchableSelect
          label="Plantilla de Informe"
          options={plantillasInforme}
          value={idPlantillaInforme}
          onChange={(val) => setValue("idPlantillaInforme", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          required
          error={errors.idPlantillaInforme?.message}
        />
        <SearchableSelect
          label="Idioma del Informe"
          options={idiomas}
          value={idIdioma}
          onChange={(val) => setValue("idIdioma", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          required
          error={errors.idIdioma?.message}
        />
        <div className="flex flex-col gap-1.5">
          <CustomLabel className="text-sm font-bold text-gray-700 flex items-center gap-2">
            Logo Imprimible
            <input
              type="checkbox"
              {...register("logoImprimible")}
              checked={logoImprimible ?? false}
              className="w-4 h-4 accent-brand-wine cursor-pointer"
            />
          </CustomLabel>
        </div>
        {/* Filter row */}
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <SearchableSelect
              label={<span className="inline-flex items-center gap-1.5"><Filter size={13} className="text-gray-400" />País del Informe</span>}
              required
              options={paises}
              value={idPais}
              onChange={(val) => setValue("idPais", val as number, { shouldValidate: true })}
              placeholder="Seleccione"
              error={errors.idPais?.message}
            />
          </div>
          <div className="flex-1 min-w-0">
            <SearchableSelect
              label={<span className="inline-flex items-center gap-1.5"><Filter size={13} className="text-gray-400" />Clases de Informe</span>}
              options={clasesInforme}
              value={idClaseInforme}
              onChange={(val) => setValue("idClaseInforme", val as number, { shouldValidate: true })}
              placeholder="Seleccione"
              required
              error={errors.idClaseInforme?.message}
            />
          </div>
          <div className="flex-1 min-w-0">
            <SearchableSelect
              label={<span className="inline-flex items-center gap-1.5"><Filter size={13} className="text-gray-400" />Tipo de Trámite</span>}
              options={tiposTramite}
              value={idTipoTramite}
              onChange={(val) => setValue("idTipoTramite", val as number, { shouldValidate: true })}
              placeholder="Seleccione"
              required
              error={errors.idTipoTramite?.message}
            />
          </div>
        </div>
        {/* Tarifa */}
        {idCliente && (
          <div className="flex flex-col gap-1">
            <CustomLabel required>Tarifa</CustomLabel>
            <TarifarioCortaTable
              idCliente={idCliente}
              idTipoProducto={idClaseInforme}
              idTipoTramite={idTipoTramite}
              idPais={idPais}
              selectedIdTarifario={selectedIdTarifario}
              onTarifarioSelect={(entry: TarifarioCortaEntry | undefined) => {
                if (entry) {
                  if (!idPais) setValue("idPais", entry.idPais, { shouldValidate: true });
                  if (!idClaseInforme) setValue("idClaseInforme", entry.idProducto, { shouldValidate: true });
                  if (!idTipoTramite) setValue("idTipoTramite", entry.idTipoTramite, { shouldValidate: true });
                }
                onTarifarioSelect(entry?.idTarifario);
              }}
              error={tarifarioError}
            />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px bg-gray-200 self-stretch" />

      {/* Right column: order fields */}
      <div className="flex flex-col gap-5 flex-2">
        <div className="flex flex-col gap-1.5">
          <CustomLabel required>Código</CustomLabel>
          <input
            type="text"
            placeholder="Código"
            {...register("codigo")}
            className={`w-full px-4 py-2.5 bg-brand-white border ${errors.codigo ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
          />
          {errors.codigo && <p className="text-xs text-red-500">{errors.codigo.message}</p>}
        </div>
        <SearchableSelect
          label="Tipo Persona"
          options={tiposPersona}
          value={idTipoPersona}
          onChange={(val) => setValue("idTipoPersona", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          required
          error={errors.idTipoPersona?.message}
        />
        <SearchableSelect
          label="Atendido por"
          options={empresasAtencion}
          value={idEmpresaAtencion}
          onChange={(val) => setValue("idEmpresaAtencion", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          required
          error={errors.idEmpresaAtencion?.message}
        />
        <div className="flex flex-col gap-1.5">
          <CustomLabel required>Investigado</CustomLabel>
          <input
            type="text"
            placeholder="Investigado"
            {...register("investigado")}
            className={`w-full px-4 py-2.5 bg-brand-white border ${errors.investigado ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
          />
          {errors.investigado && <p className="text-xs text-red-500">{errors.investigado.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <CustomLabel optional>Nro. de Referencia</CustomLabel>
          <input
            type="text"
            placeholder="Nro. de Referencia"
            {...register("nroReferencia")}
            className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
          />
        </div>
        <CustomDatePicker
          label="Desde"
          required
          value={fechaDesde}
          onChange={(date) => setValue("fechaDesde", date as Date, { shouldValidate: true })}
          error={errors.fechaDesde?.message}
        />
        <CustomDatePicker
          label="Hasta"
          required
          value={fechaHasta}
          onChange={(date) => setValue("fechaHasta", date as Date, { shouldValidate: true })}
          error={errors.fechaHasta?.message}
        />
        <div className="flex flex-col gap-1.5">
          <CustomLabel optional>Monto Crédito</CustomLabel>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Monto Crédito"
            {...register("montoCredito")}
            className={`w-full px-4 py-2.5 bg-brand-white border ${errors.montoCredito ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
          />
          {errors.montoCredito && <p className="text-xs text-red-500">{errors.montoCredito.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <CustomLabel optional>Plazo Crédito</CustomLabel>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Plazo Crédito"
            {...register("plazoCredito")}
            className={`w-full px-4 py-2.5 bg-brand-white border ${errors.plazoCredito ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
          />
          {errors.plazoCredito && <p className="text-xs text-red-500">{errors.plazoCredito.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <CustomLabel optional>Comentario</CustomLabel>
          <textarea
            placeholder="Comentario"
            rows={3}
            {...register("comentario")}
            className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}

interface AnexosTabProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

function AnexosTab({ files, onFilesChange }: AnexosTabProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next: UploadedFile[] = Array.from(incoming).map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}`,
      name: f.name,
      type: getExtension(f.name),
      size: f.size,
      file: f,
    }));
    onFilesChange([...files, ...next]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${isDragging ? "border-brand-wine bg-brand-wine/5" : "border-gray-200 hover:border-brand-wine/40 hover:bg-gray-50"}`}
      >
        <div className="p-3 rounded-full bg-gray-100">
          <Upload size={24} className="text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 text-center">
          Haz clic o arrastra archivos aquí para subirlos{" "}
          <span className="text-brand-wine">(PDF, Word, Excel, etc.)</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
                Nombre del Archivo
              </th>
              <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
                Tipo
              </th>
              <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
                Tamaño
              </th>
              <th className="text-right py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {files.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <FileIcon ext={f.type} />
                    <span className="text-gray-700 font-medium">{f.name}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <FileTypeBadge ext={f.type} />
                </td>
                <td className="py-3 px-3 text-gray-500">{formatBytes(f.size)}</td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => handleRemove(f.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function useFormReset(
  pedido: GetPedidoResponse | undefined,
  allTarifas: TarifarioCortaEntry[] | undefined,
  reset: UseFormReset<PedidoFormData>,
  setSelectedIdTarifario: (id: number | undefined) => void
) {
  useEffect(() => {
    if (!pedido || allTarifas === undefined) return;
    const tarifaEntry = allTarifas.find((t) => t.idTarifario === pedido.idTarifario);
    reset({
      codigo: pedido.codigo,
      idCliente: pedido.idCliente,
      nroDocumento: pedido.numeroDocumento,
      investigado: pedido.investigarRazonSocialNombres,
      idTipoPersona: pedido.idTipoPersona,
      idEmpresaAtencion: pedido.idCompania,
      idIdioma: pedido.idIdioma,
      idClaseInforme: pedido.idClaseInforme,
      idPlantillaInforme: pedido.idPlantilla,
      idTarifario: pedido.idTarifario,
      idPais: tarifaEntry?.idPais,
      idTipoTramite: tarifaEntry?.idTipoTramite,
      nroReferencia: pedido.numReferencia ?? undefined,
      montoCredito: pedido.montoCredito ?? undefined,
      plazoCredito: pedido.plazoCredito ?? undefined,
      fechaDesde: new Date(pedido.fchDesde),
      fechaHasta: new Date(pedido.fchHasta),
      comentario: pedido.comentario,
      logoImprimible: false,
    });
    setSelectedIdTarifario(pedido.idTarifario);
  }, [pedido, allTarifas, reset, setSelectedIdTarifario]);
}

export function EditPedidoModal({ isOpen, onClose, pedidoId }: EditPedidoModalProps) {
  const [activeTab, setActiveTab] = useState("informacion");
  const [selectedIdTarifario, setSelectedIdTarifario] = useState<number | undefined>(undefined);
  const [anexosFiles, setAnexosFiles] = useState<UploadedFile[]>([]);

  const queryClient = useQueryClient();

  const { data: pedido, isLoading, isError, refetch } = useQuery({
    queryKey: ["pedido", pedidoId],
    queryFn: () => pedidoService.getById(pedidoId!),
    enabled: !!pedidoId && isOpen,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes", "listaCorta"],
    queryFn: () => clientService.listaCorta(),
    enabled: isOpen,
  });

  const { data: allTarifas } = useQuery({
    queryKey: ["tarifario", "listaCorta", { idCliente: pedido?.idCliente }],
    queryFn: () => clientService.listTarifarioCorta({ idCliente: pedido!.idCliente }),
    enabled: !!pedido?.idCliente && isOpen,
  });

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PedidoFormData>({
    resolver: pedidoResolver,
    mode: "onTouched",
    defaultValues: { logoImprimible: false },
  });

  useFormReset(pedido, allTarifas, reset, setSelectedIdTarifario);

  const handleClose = () => {
    reset();
    setActiveTab("informacion");
    setSelectedIdTarifario(undefined);
    setAnexosFiles([]);
    onClose();
  };

  const { mutate: updatePedido, isPending } = useMutation({
    mutationFn: pedidoService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", pedidoId] });
      handleClose();
    },
  });

  const onSubmit = (data: PedidoFormData) => {
    const cliente = clientes.find((c) => c.idCliente === data.idCliente);
    updatePedido({
      idPedido: pedidoId!,
      codigo: data.codigo,
      idCliente: data.idCliente,
      numeroDocumento: data.nroDocumento,
      nombreCliente: cliente?.nombreCliente ?? pedido?.nombreCliente ?? "",
      idTipoPersona: data.idTipoPersona,
      idCompania: data.idEmpresaAtencion,
      investigarRazonSocialNombres: data.investigado,
      idTarifario: data.idTarifario,
      idPlantilla: data.idPlantillaInforme,
      idIdioma: data.idIdioma,
      idClaseInforme: data.idClaseInforme,
      numReferencia: data.nroReferencia,
      montoCredito: data.montoCredito,
      plazoCredito: data.plazoCredito,
      fchDesde: data.fechaDesde.toISOString(),
      fchHasta: data.fechaHasta.toISOString(),
      comentario: data.comentario ?? "",
      idEstado: pedido!.idEstado,
    });
  };

  const loadingContent = (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-2 border-brand-wine border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Cargando datos del pedido...</p>
    </div>
  );

  const errorContent = (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <AlertCircle size={40} className="text-red-400" />
      <p className="text-sm text-gray-600">No se pudo cargar la información del pedido.</p>
      <CustomButton variant="secondary" size="sm" onClick={() => refetch()}>
        <RotateCcw size={14} />
        REINTENTAR
      </CustomButton>
    </div>
  );

  const isLoadingAll = isLoading || (!!pedido && allTarifas === undefined);

  const informacionContent = isLoadingAll
    ? loadingContent
    : isError
    ? errorContent
    : (
      <InformacionTab
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
        clientes={clientes}
        selectedIdTarifario={selectedIdTarifario}
        onTarifarioSelect={(id) => {
          setSelectedIdTarifario(id);
          setValue("idTarifario", id as number, { shouldValidate: true });
        }}
        tarifarioError={errors.idTarifario?.message}
      />
    );

  const tabs = [
    {
      id: "informacion",
      label: "Información",
      content: informacionContent,
    },
    {
      id: "anexos",
      label: "Anexos",
      content: <AnexosTab files={anexosFiles} onFilesChange={setAnexosFiles} />,
    },
  ];

  const footer = (
    <div className="flex justify-end">
      <CustomButton
        variant="primary"
        size="md"
        loading={isPending}
        loadingText="Guardando..."
        onClick={handleSubmit(onSubmit)}
        disabled={isLoadingAll || isError}
      >
        Guardar
      </CustomButton>
    </div>
  );

  return (
    <CustomTabbedModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Modificar un Pedido"
      tabs={tabs}
      footer={footer}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      maxWidth="max-w-5xl"
    />
  );
}
