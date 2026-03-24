import { useRef, useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Trash2, FileText, Filter } from "lucide-react";
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
} from "react-hook-form";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { TarifarioCortaTable } from "@maximilian/components/coordinator/TarifarioCortaTable";
import { zodResolver } from "@hookform/resolvers/zod";
import { pedidoSchema, type PedidoFormData } from "@maximilian/schemas";

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
  tipoId?: number;
}

interface AddPedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InformacionTabProps {
  register: UseFormRegister<PedidoFormData>;
  setValue: UseFormSetValue<PedidoFormData>;
  watch: UseFormWatch<PedidoFormData>;
  errors: Partial<Record<keyof PedidoFormData, { message?: string }>>;
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

function InformacionTab({ register, setValue, watch, errors, selectedIdTarifario, onTarifarioSelect, tarifarioError }: InformacionTabProps) {
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
  const autogenerarCodigo = watch("autogenerarCodigo");
  const idTipoPlazoCredito = watch("idTipoPlazoCredito");

  const [clientesEnabled, setClientesEnabled] = useState(false);
  const { data: clientes = [], isFetching: isLoadingClientes } = useQuery({
    queryKey: ["clientes", "listaCorta"],
    queryFn: () => clientService.listaCorta(),
    enabled: clientesEnabled,
  });

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

  const queryClient = useQueryClient();

  const { data: empresasAtencion } = useQuery({
    queryKey: ["masterTable", MasterTableId.EMPRESA_ATENCION],
    queryFn: () => masterTableService.list(MasterTableId.EMPRESA_ATENCION),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (empresasAtencion && !idEmpresaAtencion) {
      const defaultOption = empresasAtencion.find((o) => o.num1 === 1);
      if (defaultOption?.num1 != null) {
        setValue("idEmpresaAtencion", defaultOption.num1, { shouldValidate: false });
      }
    }
  }, [empresasAtencion, idEmpresaAtencion, setValue]);

  useEffect(() => {
    if (autogenerarCodigo) setValue("codigo", "", { shouldValidate: false });
  }, [autogenerarCodigo, setValue]);

  const handleClienteChange = (val: number | undefined) => {
    setValue("idCliente", val as number, { shouldValidate: true });
    if (val == null) return;
    const cliente = clientes.find((c: ClienteCorta) => c.idCliente === val);
    if (!cliente) return;
    setValue("nroDocumento", cliente.numeroDocumento, { shouldValidate: true });
    setValue("idIdioma", cliente.idIdioma, { shouldValidate: true });
    setValue("logoImprimible", cliente.logoImprimible, { shouldValidate: true });
    setValue("idPlantillaInforme", cliente.idPlantilla, { shouldValidate: true });
    queryClient.prefetchQuery({
      queryKey: ["masterTable", MasterTableId.IDIOMA],
      queryFn: () => masterTableService.list(MasterTableId.IDIOMA),
      staleTime: Infinity,
    });
    queryClient.prefetchQuery({
      queryKey: ["masterTable", MasterTableId.PLANTILLA_INFORME],
      queryFn: () => masterTableService.list(MasterTableId.PLANTILLA_INFORME),
      staleTime: Infinity,
    });
  };

  return (
    <div className="flex gap-6">
      {/* Left column: client data + filters + tarifa */}
      <div className="flex flex-col gap-5 flex-[3]">
        <SearchableSelect
          label="Cliente"
          options={clienteOptions}
          value={idCliente}
          onChange={handleClienteChange}
          onOpen={() => setClientesEnabled(true)}
          loading={isLoadingClientes}
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
          idMaster={MasterTableId.PLANTILLA_INFORME}
          value={idPlantillaInforme}
          onChange={(val) => setValue("idPlantillaInforme", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          required
          error={errors.idPlantillaInforme?.message}
        />
        <SearchableSelect
          label="Idioma del Informe"
          idMaster={MasterTableId.IDIOMA}
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
        {/* Filter fields */}
        <SearchableSelect
          label={<span className="inline-flex items-center gap-1.5"><Filter size={13} className="text-gray-400" />País del Informe</span>}
          required
          idMaster={MasterTableId.PAIS}
          value={idPais}
          onChange={(val) => setValue("idPais", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          error={errors.idPais?.message}
        />
        <SearchableSelect
          label={<span className="inline-flex items-center gap-1.5"><Filter size={13} className="text-gray-400" />Clases de Informe</span>}
          idMaster={MasterTableId.CLASE_INFORME}
          value={idClaseInforme}
          onChange={(val) => setValue("idClaseInforme", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          required
          error={errors.idClaseInforme?.message}
        />
        <SearchableSelect
          label={<span className="inline-flex items-center gap-1.5"><Filter size={13} className="text-gray-400" />Tipo de Trámite</span>}
          idMaster={MasterTableId.TIPO_TRAMITE}
          value={idTipoTramite}
          onChange={(val) => setValue("idTipoTramite", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          required
          error={errors.idTipoTramite?.message}
        />
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
                  queryClient.prefetchQuery({
                    queryKey: ["masterTable", MasterTableId.PAIS],
                    queryFn: () => masterTableService.list(MasterTableId.PAIS),
                    staleTime: Infinity,
                  });
                  queryClient.prefetchQuery({
                    queryKey: ["masterTable", MasterTableId.CLASE_INFORME],
                    queryFn: () => masterTableService.list(MasterTableId.CLASE_INFORME),
                    staleTime: Infinity,
                  });
                  queryClient.prefetchQuery({
                    queryKey: ["masterTable", MasterTableId.TIPO_TRAMITE],
                    queryFn: () => masterTableService.list(MasterTableId.TIPO_TRAMITE),
                    staleTime: Infinity,
                  });
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
          idMaster={MasterTableId.TIPO_PERSONA}
          value={idTipoPersona}
          onChange={(val) => setValue("idTipoPersona", val as number, { shouldValidate: true })}
          placeholder="Seleccione"
          required
          error={errors.idTipoPersona?.message}
        />
        <div className="flex flex-col gap-1.5">
          <CustomLabel optional>Nro. de Referencia</CustomLabel>
          <input
            type="text"
            placeholder="Nro. de Referencia"
            {...register("nroReferencia")}
            className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <CustomLabel required={!autogenerarCodigo}>Código</CustomLabel>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder={autogenerarCodigo ? "Autogenerado" : "Código"}
              disabled={autogenerarCodigo}
              {...register("codigo")}
              className={`flex-1 px-4 py-2.5 border ${errors.codigo ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all ${autogenerarCodigo ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-brand-white"}`}
            />
            <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer shrink-0">
              <input
                type="checkbox"
                {...register("autogenerarCodigo")}
                className="w-4 h-4 accent-brand-wine cursor-pointer"
              />
              Autogenerar
            </label>
          </div>
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
                idMaster={MasterTableId.TIPO_PLAZO_CREDITO}
                value={idTipoPlazoCredito}
                onChange={(val) => {
                  setValue("idTipoPlazoCredito", val as number, { shouldValidate: true });
                  const cached = queryClient.getQueryData<{ num1?: number; string1?: string }[]>(["masterTable", MasterTableId.TIPO_PLAZO_CREDITO]);
                  const entry = cached?.find((t) => t.num1 === val);
                  setValue("tipoPlazoCredito", entry?.string1 ?? "", { shouldValidate: false });
                }}
                placeholder="Tipo"
              />
            </div>
          </div>
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
  missingTipoIds: Set<string>;
  onClearMissingTipo: (id: string) => void;
}

function AnexosTab({ files, onFilesChange, missingTipoIds, onClearMissingTipo }: AnexosTabProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFormato, setFilterFormato] = useState("");
  const [filterTipo, setFilterTipo] = useState<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: tipoOptions = [] } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_DOCUMENTO],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_DOCUMENTO),
    staleTime: Infinity,
  });

  const uniqueFormatos = useMemo(
    () => Array.from(new Set(files.map((f) => f.type))).sort(),
    [files]
  );

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const matchesSearch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFormato = !filterFormato || f.type === filterFormato;
      const matchesTipo = filterTipo === undefined || f.tipoId === filterTipo;
      return matchesSearch && matchesFormato && matchesTipo;
    });
  }, [files, searchQuery, filterFormato, filterTipo]);

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

  const handleTipoChange = (id: string, tipoId: number | undefined) => {
    onFilesChange(files.map((f) => (f.id === id ? { ...f, tipoId } : f)));
    if (tipoId !== undefined) onClearMissingTipo(id);
  };

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
          {filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-40 text-sm text-gray-400">
                  {files.length === 0 ? "No hay archivos adjuntos" : "No hay resultados para los filtros aplicados"}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Nombre</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Formato</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Tamaño</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Tipo</th>
                  <th className="py-2 px-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFiles.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <FileIcon ext={f.type} />
                        <span className="text-gray-700 font-medium truncate max-w-40">{f.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <FileTypeBadge ext={f.type} />
                    </td>
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
                    <td className="py-2.5 px-3 text-right">
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
      </div>
    </div>
  );
}

export function AddPedidoModal({ isOpen, onClose }: AddPedidoModalProps) {
  const [activeTab, setActiveTab] = useState("informacion");
  const [selectedIdTarifario, setSelectedIdTarifario] = useState<number | undefined>(undefined);
  const [anexosFiles, setAnexosFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [missingTipoIds, setMissingTipoIds] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

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

  const handleClose = () => {
    reset();
    setActiveTab("informacion");
    setSelectedIdTarifario(undefined);
    setAnexosFiles([]);
    setIsUploading(false);
    setMissingTipoIds(new Set());
    onClose();
  };

  const { mutate: createPedido, isPending } = useMutation({
    mutationFn: pedidoService.create,
    onSuccess: async (result) => {
      if (result.archivos.length === 0) {
        queryClient.invalidateQueries({ queryKey: ["pedidos"] });
        handleClose();
        return;
      }

      const toastId = toast.loading("Subiendo archivos...");
      setIsUploading(true);
      try {
        await Promise.all(
          result.archivos.map(({ nombreDocumento, uploadUrl }) => {
            const file = anexosFiles.find((f) => f.name === nombreDocumento)?.file;
            if (!file) return Promise.resolve();
            return fetch(uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": file.type || "application/octet-stream" },
              body: file,
            });
          })
        );
        toast.dismiss(toastId);
        queryClient.invalidateQueries({ queryKey: ["pedidos"] });
        handleClose();
      } catch {
        toast.error("No se pudieron subir los archivos", { id: toastId });
      } finally {
        setIsUploading(false);
      }
    },
  });

  const onSubmit = (data: PedidoFormData) => {
    const missing = new Set(anexosFiles.filter((f) => !f.tipoId).map((f) => f.id));
    if (missing.size > 0) {
      setMissingTipoIds(missing);
      setActiveTab("anexos");
      return;
    }
    const clientesCache = queryClient.getQueryData<ClienteCorta[]>(["clientes", "listaCorta"]) ?? [];
    const cliente = clientesCache.find((c: ClienteCorta) => c.idCliente === data.idCliente);
    createPedido({
      codigo: data.autogenerarCodigo ? null : (data.codigo ?? ""),
      idCliente: data.idCliente,
      numeroDocumento: data.nroDocumento,
      nombreCliente: cliente?.nombreCliente ?? "",
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
      idEstado: 1,
      archivos: anexosFiles.map((f) => ({
        formatoArchivo: f.file.type || "application/octet-stream",
        nombreDocumento: f.name,
        tamanoArchivo: f.size,
        idTipoArchivo: f.tipoId ?? 0,
      })),
    });
  };

  const tabs = [
    {
      id: "informacion",
      label: "Información",
      content: (
        <InformacionTab
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          selectedIdTarifario={selectedIdTarifario}
          onTarifarioSelect={(id) => {
            setSelectedIdTarifario(id);
            setValue("idTarifario", id as number, { shouldValidate: true });
          }}
          tarifarioError={errors.idTarifario?.message}
        />
      ),
    },
    {
      id: "anexos",
      label: "Anexos",
      content: <AnexosTab files={anexosFiles} onFilesChange={setAnexosFiles} missingTipoIds={missingTipoIds} onClearMissingTipo={(id) => setMissingTipoIds((prev) => { const next = new Set(prev); next.delete(id); return next; })} />,
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
      >
        Confirmar
      </CustomButton>
    </div>
  );

  return (
    <CustomTabbedModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registra un Pedido"
      tabs={tabs}
      footer={footer}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      maxWidth="max-w-5xl"
    />
  );
}
