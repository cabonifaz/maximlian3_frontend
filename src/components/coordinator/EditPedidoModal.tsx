import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "sonner";
import { Upload, Trash2, FileText, Filter, AlertCircle, RotateCcw, ChevronLeft, ChevronRight, Download } from "lucide-react";
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
import { ConfirmDeleteModal } from "@maximilian/components/common/ConfirmDeleteModal";
import { TarifarioCortaTable } from "@maximilian/components/coordinator/TarifarioCortaTable";
import { zodResolver } from "@hookform/resolvers/zod";
import { pedidoSchema, type PedidoFormData } from "@maximilian/schemas";
import type { GetPedidoResponse, PedidoArchivoEntry } from "@maximilian/shared/types/pedido.type";

const pedidoResolver: Resolver<PedidoFormData> = async (...args) => {
  const result = await zodResolver(pedidoSchema)(...args);
  const { fechaDesde, fechaHasta, codigo } = args[0];
  if (fechaDesde && fechaHasta && fechaHasta <= fechaDesde) {
    result.errors = {
      ...result.errors,
      fechaDesde: {
        type: "custom",
        message: "La fecha \"Desde\" debe ser menor a la fecha \"Hasta\"",
      },
      fechaHasta: {
        type: "custom",
        message: "La fecha \"Hasta\" debe ser mayor a la fecha \"Desde\"",
      },
    };
  }
  if (!codigo || (codigo as string).trim() === "") {
    result.errors = {
      ...result.errors,
      codigo: { type: "custom", message: "El código es requerido" },
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
  tipoId?: number;
}

interface EditPedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: number | null;
}

interface ClienteTarifaTabProps {
  register: UseFormRegister<PedidoFormData>;
  setValue: UseFormSetValue<PedidoFormData>;
  watch: UseFormWatch<PedidoFormData>;
  errors: Partial<Record<keyof PedidoFormData, { message?: string }>>;
  clientes: ClienteCorta[];
  selectedIdTarifario: number | undefined;
  onTarifarioSelect: (entry: TarifarioCortaEntry | undefined) => void;
  tarifarioError?: string;
}

interface InfoPedidoTabProps {
  register: UseFormRegister<PedidoFormData>;
  setValue: UseFormSetValue<PedidoFormData>;
  watch: UseFormWatch<PedidoFormData>;
  errors: Partial<Record<keyof PedidoFormData, { message?: string }>>;
  selectedTarifario: TarifarioCortaEntry | undefined;
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

function ClienteTarifaTab({ register, setValue, watch, errors, clientes, selectedIdTarifario, onTarifarioSelect, tarifarioError }: ClienteTarifaTabProps) {
  const idCliente = watch("idCliente");
  const idPais = watch("idPais");
  const idIdioma = watch("idIdioma");
  const idClaseInforme = watch("idClaseInforme");
  const logoImprimible = watch("logoImprimible");
  const idTipoTramite = watch("idTipoTramite");
  const idPlantillaInforme = watch("idPlantillaInforme");

  const clienteOptions = useMemo(
    () =>
      clientes.map((c: ClienteCorta) => ({
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

  const { data: paises } = useQuery({
    queryKey: ["masterTable", MasterTableId.PAIS],
    queryFn: () => masterTableService.list(MasterTableId.PAIS),
    staleTime: Infinity,
  });

  const { data: idiomas } = useQuery({
    queryKey: ["masterTable", MasterTableId.IDIOMA],
    queryFn: () => masterTableService.list(MasterTableId.IDIOMA),
    staleTime: Infinity,
  });

  const { data: clasesInforme } = useQuery({
    queryKey: ["masterTable", MasterTableId.CLASE_INFORME],
    queryFn: () => masterTableService.list(MasterTableId.CLASE_INFORME),
    staleTime: Infinity,
  });

  const { data: tiposTramite } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_TRAMITE],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_TRAMITE),
    staleTime: Infinity,
  });

  const { data: plantillasInforme } = useQuery({
    queryKey: ["masterTable", MasterTableId.PLANTILLA_INFORME],
    queryFn: () => masterTableService.list(MasterTableId.PLANTILLA_INFORME),
    staleTime: Infinity,
  });

  const handleClienteChange = (val: number | undefined) => {
    setValue("idCliente", val as number, { shouldValidate: true });
    if (val == null) return;
    const cliente = clientes.find((c) => c.idCliente === val);
    if (!cliente) return;
    setValue("idIdioma", cliente.idIdioma, { shouldValidate: true });
    setValue("logoImprimible", cliente.logoImprimible, { shouldValidate: true });
    setValue("idPlantillaInforme", cliente.idPlantilla, { shouldValidate: true });
  };

  return (
    <div className="flex gap-6">
      {/* Left column */}
      <div className="flex-1 flex flex-col gap-5">
        <SearchableSelect
          label="Cliente"
          options={clienteOptions}
          value={idCliente}
          onChange={handleClienteChange}
          placeholder="Seleccione"
          required
          error={errors.idCliente?.message}
        />
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
      </div>

      {/* Right column */}
      <div className="flex-1 flex flex-col gap-5 min-h-120">
        <SearchableSelect
          label={<span className="inline-flex items-center gap-1.5"><Filter size={13} className="text-gray-400" />País del Informe</span>}
          required
          options={paises}
          value={idPais}
          onChange={(val) => setValue("idPais", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          error={errors.idPais?.message}
        />
        <SearchableSelect
          label={<span className="inline-flex items-center gap-1.5"><Filter size={13} className="text-gray-400" />Clases de Informe</span>}
          options={clasesInforme}
          value={idClaseInforme}
          onChange={(val) => setValue("idClaseInforme", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          required
          error={errors.idClaseInforme?.message}
        />
        <SearchableSelect
          label={<span className="inline-flex items-center gap-1.5"><Filter size={13} className="text-gray-400" />Tipo de Trámite</span>}
          options={tiposTramite}
          value={idTipoTramite}
          onChange={(val) => setValue("idTipoTramite", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          required
          error={errors.idTipoTramite?.message}
        />
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
              onTarifarioSelect(entry);
            }}
            error={tarifarioError}
          />
        </div>
      </div>
    </div>
  );
}

function InfoPedidoTab({ register, setValue, watch, errors, selectedTarifario }: InfoPedidoTabProps) {
  const idTipoPersona = watch("idTipoPersona");
  const idEmpresaAtencion = watch("idEmpresaAtencion");
  const fechaDesde = watch("fechaDesde");
  const fechaHasta = watch("fechaHasta");
  const idTipoPlazoCredito = watch("idTipoPlazoCredito");

  const { data: tiposPersona } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_PERSONA],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_PERSONA),
    staleTime: Infinity,
  });

  const { data: empresasAtencion } = useQuery({
    queryKey: ["masterTable", MasterTableId.EMPRESA_ATENCION],
    queryFn: () => masterTableService.list(MasterTableId.EMPRESA_ATENCION),
    staleTime: Infinity,
  });

  const { data: tiposPlazoCredito } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_PLAZO_CREDITO],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_PLAZO_CREDITO),
    staleTime: Infinity,
  });

  return (
    <div className="flex gap-6">
      {/* Left column */}
      <div className="flex-1 flex flex-col gap-5">
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
        <SearchableSelect
          label="Tipo de Persona"
          options={tiposPersona}
          value={idTipoPersona}
          onChange={(val) => setValue("idTipoPersona", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          required
          error={errors.idTipoPersona?.message}
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
        <div className="flex flex-col gap-1.5">
          <CustomLabel optional>Nro. de Referencia</CustomLabel>
          <input
            type="text"
            placeholder="Nro. de Referencia"
            {...register("nroReferencia")}
            className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <CustomLabel optional>Comentario</CustomLabel>
          <textarea
            placeholder="Comentario"
            {...register("comentario")}
            className="w-full flex-1 px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all resize-none"
          />
        </div>
      </div>

      {/* Right column */}
      <div className="flex-1 flex flex-col gap-5">
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
          label="Atendido por"
          options={empresasAtencion}
          value={idEmpresaAtencion}
          onChange={(val) => setValue("idEmpresaAtencion", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          required
          error={errors.idEmpresaAtencion?.message}
        />
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
          <CustomLabel optional>
            Monto Crédito{selectedTarifario?.simboloMoneda ? ` (${selectedTarifario.simboloMoneda})` : ""}
          </CustomLabel>
          <input
            type="text"
            inputMode="numeric"
            placeholder={!selectedTarifario ? "Seleccione una Tarifa primero" : "Monto Crédito"}
            disabled={!selectedTarifario}
            {...register("montoCredito")}
            className={`w-full px-4 py-2.5 border ${errors.montoCredito ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all ${!selectedTarifario ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-brand-white"}`}
          />
          {errors.montoCredito && <p className="text-xs text-red-500">{errors.montoCredito.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <CustomLabel optional>Plazo Crédito</CustomLabel>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Plazo Crédito"
              {...register("plazoCredito")}
              className={`flex-1 px-4 py-2.5 bg-brand-white border ${errors.plazoCredito ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
            />
            <div className="w-40">
              <SearchableSelect
                options={tiposPlazoCredito}
                value={idTipoPlazoCredito}
                onChange={(val) => {
                  setValue("idTipoPlazoCredito", val as number, { shouldValidate: true });
                  const entry = tiposPlazoCredito?.find((t) => t.num1 === val);
                  setValue("tipoPlazoCredito", entry?.string1 ?? "", { shouldValidate: false });
                }}
                placeholder="Tipo"
              />
            </div>
          </div>
          {errors.plazoCredito && <p className="text-xs text-red-500">{errors.plazoCredito.message}</p>}
        </div>
      </div>
    </div>
  );
}

interface AnexosTabProps {
  pedidoId: number | null;
  newFiles: UploadedFile[];
  onNewFilesChange: (files: UploadedFile[]) => void;
  missingTipoIds: Set<string>;
  onClearMissingTipo: (id: string) => void;
}

function AnexosTab({ pedidoId, newFiles, onNewFilesChange, missingTipoIds, onClearMissingTipo }: AnexosTabProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [archivoToDelete, setArchivoToDelete] = useState<PedidoArchivoEntry | null>(null);
  const [viewingArchivoId, setViewingArchivoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [numPag, setNumPag] = useState(1);
  const [filterFormato, setFilterFormato] = useState("");
  const [filterTipo, setFilterTipo] = useState<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setNumPag(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ["pedidoArchivos", pedidoId, debouncedSearch, numPag],
    queryFn: () => pedidoService.listArchivos({ idPedido: pedidoId!, busqueda: debouncedSearch || undefined, numPag }),
    enabled: !!pedidoId,
  });

  const { data: tipoOptions = [] } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_DOCUMENTO],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_DOCUMENTO),
    staleTime: Infinity,
  });

  const { mutate: deleteArchivo, isPending: isDeleting } = useMutation({
    mutationFn: pedidoService.deleteArchivo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidoArchivos", pedidoId] });
      setArchivoToDelete(null);
    },
  });

  const handleViewArchivo = async (f: PedidoArchivoEntry) => {
    setViewingArchivoId(f.idPedidoArchivo);
    try {
      const result = await pedidoService.getArchivo({ idPedidoArchivo: f.idPedidoArchivo, idPedido: pedidoId! });
      window.open(result.downloadUrl, "_blank");
    } catch {
      // error handled by interceptor
    } finally {
      setViewingArchivoId(null);
    }
  };

  const archivos = useMemo(() => data?.lstPedidoArchivo ?? [], [data]);
  const totalPaginas = data?.totalPaginas ?? 1;

  const uniqueFormatos = useMemo(
    () => Array.from(new Set([
      ...archivos.map((f) => getExtension(f.nombreDocumento)),
      ...newFiles.map((f) => f.type),
    ])).sort(),
    [archivos, newFiles]
  );

  const filteredArchivos = useMemo(() => archivos.filter((f) => {
    const ext = getExtension(f.nombreDocumento);
    const matchesFormato = !filterFormato || ext === filterFormato;
    const matchesTipo = filterTipo === undefined || f.idTipoArchivo === filterTipo;
    return matchesFormato && matchesTipo;
  }), [archivos, filterFormato, filterTipo]);

  const filteredNewFiles = useMemo(() => newFiles.filter((f) => {
    const matchesFormato = !filterFormato || f.type === filterFormato;
    const matchesTipo = filterTipo === undefined || f.tipoId === filterTipo;
    return matchesFormato && matchesTipo;
  }), [newFiles, filterFormato, filterTipo]);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next: UploadedFile[] = Array.from(incoming).map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}`,
      name: f.name,
      type: getExtension(f.name),
      size: f.size,
      file: f,
    }));
    onNewFilesChange([...newFiles, ...next]);
  };

  const handleTipoChange = (id: string, tipoId: number | undefined) => {
    onNewFilesChange(newFiles.map((f) => (f.id === id ? { ...f, tipoId } : f)));
    if (tipoId !== undefined) onClearMissingTipo(id);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const showTable = isLoading || filteredArchivos.length > 0 || filteredNewFiles.length > 0;

  return (
    <div className="flex gap-4 min-h-75">
      {/* Left: drag & drop */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-44 shrink-0 flex flex-col items-center justify-center gap-3 p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${isDragging ? "border-brand-wine bg-brand-wine/5" : "border-gray-200 hover:border-brand-wine/40 hover:bg-gray-50"}`}
      >
        <div className="p-3 rounded-full bg-gray-100">
          <Upload size={22} className="text-gray-400" />
        </div>
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Arrastra archivos aquí o haz clic para subir
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Right: search + filters + table */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Search + filter row */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
          />
          <select
            value={filterFormato}
            onChange={(e) => setFilterFormato(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all cursor-pointer bg-white"
          >
            <option value="">Formato</option>
            {uniqueFormatos.map((fmt) => (
              <option key={fmt} value={fmt}>{fmt}</option>
            ))}
          </select>
          <select
            value={filterTipo ?? ""}
            onChange={(e) => setFilterTipo(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all cursor-pointer bg-white"
          >
            <option value="">Tipo</option>
            {tipoOptions.map((t) => (
              <option key={t.num1} value={t.num1 ?? ""}>{t.string1}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto max-h-64 border border-gray-100 rounded-xl">
          {!showTable ? (
            <div className="flex items-center justify-center h-full min-h-40 text-sm text-gray-400">
              No hay archivos adjuntos
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Nombre</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Formato</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Tamaño</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Tipo</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Fecha de Carga</th>
                  <th className="py-2 px-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5].map((j) => (
                        <td key={j} className="py-2.5 px-3">
                          <div className="h-3.5 bg-gray-200 rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <>
                    {filteredNewFiles.map((f) => (
                      <tr key={f.id} className="bg-amber-50 hover:bg-amber-100/60 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <FileIcon ext={f.type} />
                            <span className="text-gray-700 font-medium truncate max-w-40">{f.name}</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-200 text-amber-800 whitespace-nowrap shrink-0">
                              Nuevo
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3"><FileTypeBadge ext={f.type} /></td>
                        <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">{formatBytes(f.size)}</td>
                        <td className="py-2.5 px-3">
                          <SearchableSelect
                            options={tipoOptions}
                            value={f.tipoId}
                            onChange={(val) => handleTipoChange(f.id, val)}
                            placeholder="— Seleccione —"
                            error={missingTipoIds.has(f.id) ? "Requerido" : undefined}
                          />
                        </td>
                        <td className="py-2.5 px-3 text-gray-400">—</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onNewFilesChange(newFiles.filter((n) => n.id !== f.id))}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredArchivos.map((f) => {
                      const ext = getExtension(f.nombreDocumento);
                      return (
                        <tr key={f.idPedidoArchivo} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewArchivo(f)}
                                disabled={viewingArchivoId === f.idPedidoArchivo}
                                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                              >
                                <Download size={15} />
                              </button>
                              <FileIcon ext={ext} />
                              <span className="text-gray-700 font-medium truncate max-w-40">{f.nombreDocumento}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3"><FileTypeBadge ext={ext} /></td>
                          <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">{formatBytes(f.tamanoArchivo)}</td>
                          <td className="py-2.5 px-3">
                            <SearchableSelect
                              options={tipoOptions}
                              value={f.idTipoArchivo}
                              onChange={() => {}}
                              placeholder="— Seleccione —"
                              disabled
                            />
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">{f.fechaCarga}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setArchivoToDelete(f)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => setNumPag((p) => Math.max(1, p - 1))}
              disabled={numPag === 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setNumPag(page)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer ${page === numPag ? "bg-brand-wine text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setNumPag((p) => Math.min(totalPaginas, p + 1))}
              disabled={numPag === totalPaginas}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={archivoToDelete !== null}
        onClose={() => setArchivoToDelete(null)}
        onConfirm={() => deleteArchivo({ idPedidoArchivo: archivoToDelete!.idPedidoArchivo, idPedido: archivoToDelete!.idPedido })}
        title="Eliminar archivo"
        isSubmitting={isDeleting}
      >
        <p className="text-sm font-medium">{archivoToDelete?.nombreDocumento}</p>
      </ConfirmDeleteModal>
    </div>
  );
}

function useFormReset(
  pedido: GetPedidoResponse | undefined,
  allTarifas: TarifarioCortaEntry[] | undefined,
  reset: UseFormReset<PedidoFormData>,
  setSelectedTarifario: (entry: TarifarioCortaEntry | undefined) => void
) {
  useEffect(() => {
    if (!pedido || allTarifas === undefined) return;
    const tarifaEntry = allTarifas.find((t) => t.idTarifario === pedido.idTarifario);
    reset({
      codigo: pedido.codigo ?? "",
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
      idTipoPlazoCredito: pedido.idTipoPlazoCredito ?? undefined,
      tipoPlazoCredito: pedido.tipoPlazoCredito ?? undefined,
      fechaDesde: new Date(pedido.fchDesde),
      fechaHasta: new Date(pedido.fchHasta),
      comentario: pedido.comentario,
      logoImprimible: pedido.imprimeLogoSafety,
    });
    setSelectedTarifario(tarifaEntry);
  }, [pedido, allTarifas, reset, setSelectedTarifario]);
}

export function EditPedidoModal({ isOpen, onClose, pedidoId }: EditPedidoModalProps) {
  const [activeTab, setActiveTab] = useState("cliente-tarifa");
  const [selectedTarifario, setSelectedTarifario] = useState<TarifarioCortaEntry | undefined>(undefined);
  const [newFiles, setNewFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [missingTipoIds, setMissingTipoIds] = useState<Set<string>>(new Set());

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

  useFormReset(pedido, allTarifas, reset, setSelectedTarifario);

  const handleClose = () => {
    reset();
    setActiveTab("cliente-tarifa");
    setSelectedTarifario(undefined);
    setNewFiles([]);
    setIsUploading(false);
    setMissingTipoIds(new Set());
    onClose();
  };

  const { mutate: updatePedido, isPending } = useMutation({
    mutationFn: pedidoService.update,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", pedidoId] });
      if (newFiles.length > 0) {
        const toastId = toast.loading("Subiendo archivos...");
        setIsUploading(true);
        try {
          const uploadResult = await pedidoService.addArchivos({
            idPedido: pedidoId!,
            archivos: newFiles.map((f) => ({
              formatoArchivo: f.file.type || "application/octet-stream",
              nombreDocumento: f.name,
              tamanoArchivo: f.size,
              idTipoArchivo: f.tipoId ?? 0,
            })),
          });
          await Promise.all(
            uploadResult.map(({ nombreDocumento, uploadUrl }) => {
              const file = newFiles.find((f) => f.name === nombreDocumento)?.file;
              if (!file) return Promise.resolve();
              return fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type || "application/octet-stream" },
                body: file,
              });
            })
          );
          toast.dismiss(toastId);
          setNewFiles([]);
          queryClient.invalidateQueries({ queryKey: ["pedidoArchivos", pedidoId] });
        } catch {
          toast.error("No se pudieron subir los archivos", { id: toastId });
        } finally {
          setIsUploading(false);
        }
      }
    },
  });

  const onSubmit = (data: PedidoFormData) => {
    const missing = new Set(newFiles.filter((f) => !f.tipoId).map((f) => f.id));
    if (missing.size > 0) {
      setMissingTipoIds(missing);
      setActiveTab("anexos");
      return;
    }
    const cliente = clientes.find((c) => c.idCliente === data.idCliente);
    updatePedido({
      idPedido: pedidoId!,
      codigo: data.codigo ?? "",
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
      idTipoPlazoCredito: data.idTipoPlazoCredito,
      tipoPlazoCredito: data.tipoPlazoCredito,
      fchDesde: data.fechaDesde.toISOString(),
      fchHasta: data.fechaHasta.toISOString(),
      comentario: data.comentario ?? "",
      idEstado: pedido!.idEstado,
      imprimeLogoSafety: data.logoImprimible ?? false,
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

  const clienteTarifaContent = isLoadingAll
    ? loadingContent
    : isError
    ? errorContent
    : (
      <ClienteTarifaTab
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
        clientes={clientes}
        selectedIdTarifario={selectedTarifario?.idTarifario}
        onTarifarioSelect={(entry) => {
          setSelectedTarifario(entry);
          setValue("idTarifario", entry?.idTarifario as number, { shouldValidate: true });
        }}
        tarifarioError={errors.idTarifario?.message}
      />
    );

  const infoPedidoContent = isLoadingAll
    ? loadingContent
    : isError
    ? errorContent
    : (
      <InfoPedidoTab
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
        selectedTarifario={selectedTarifario}
      />
    );

  const tabs = [
    {
      id: "cliente-tarifa",
      label: "Cliente y Tarifa",
      content: clienteTarifaContent,
    },
    {
      id: "info-pedido",
      label: "Información del Pedido",
      content: infoPedidoContent,
    },
    {
      id: "anexos",
      label: "Anexos",
      content: <AnexosTab pedidoId={pedidoId} newFiles={newFiles} onNewFilesChange={setNewFiles} missingTipoIds={missingTipoIds} onClearMissingTipo={(id) => setMissingTipoIds((prev) => { const next = new Set(prev); next.delete(id); return next; })} />,
    },
  ];

  const footer = (
    <div className="flex justify-end">
      <CustomButton
        variant="primary"
        size="md"
        loading={isPending || isUploading}
        loadingText="Guardando..."
        onClick={handleSubmit(onSubmit)}
        disabled={isLoadingAll || isError}
      >
        {newFiles.length > 0 ? `Guardar (${newFiles.length} nuevo${newFiles.length === 1 ? " archivo" : "s archivos"})` : "Guardar"}
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
