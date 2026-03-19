import { useRef, useState } from "react";
import { Upload, Trash2, FileText } from "lucide-react";
import { CustomTabbedModal } from "@maximilian/components/common/CustomTabbedModal";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { SearchableSelect } from "@maximilian/components/common/SearchableSelect";
import { useQuery } from "@tanstack/react-query";
import { masterTableService } from "@maximilian/services/masterTable.service";
import { MasterTableId } from "@maximilian/shared/types/master-table.type";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
}

interface AddPedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting?: boolean;
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

// Static options for Logo Imprimible (Sí / No)
const LOGO_OPTIONS = [
  { idEmpresa: 0, idMasterTable: null, idMaster: 0, descripcion: "", num1: 1, num2: null, num3: null, string1: "Sí", string2: null, string3: null, date1: null, date2: null, date3: null },
  { idEmpresa: 0, idMasterTable: null, idMaster: 0, descripcion: "", num1: 2, num2: null, num3: null, string1: "No", string2: null, string3: null, date1: null, date2: null, date3: null },
];

function InformacionTab() {
  const [idCliente, setIdCliente] = useState<number | undefined>();
  const [investigado, setInvestigado] = useState("");
  const [idPais, setIdPais] = useState<number | undefined>();
  const [idIdioma, setIdIdioma] = useState<number | undefined>();
  const [idClaseInforme, setIdClaseInforme] = useState<number | undefined>();
  const [idLogoImprimible, setIdLogoImprimible] = useState<number | undefined>();
  const [razonSocial, setRazonSocial] = useState("");
  const [nroReferencia, setNroReferencia] = useState("");
  const [idTipoTramite, setIdTipoTramite] = useState<number | undefined>();

  const { data: paises } = useQuery({
    queryKey: ["masterTable", MasterTableId.PAIS],
    queryFn: () => masterTableService.list(MasterTableId.PAIS),
  });

  const { data: idiomas } = useQuery({
    queryKey: ["masterTable", MasterTableId.IDIOMA],
    queryFn: () => masterTableService.list(MasterTableId.IDIOMA),
  });

  const { data: tiposTramite } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_TRAMITE],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_TRAMITE),
  });

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
      <SearchableSelect
        label="Cliente"
        options={[]}
        value={idCliente}
        onChange={setIdCliente}
        placeholder="Seleccione"
        required
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Investigado
        </label>
        <input
          type="text"
          placeholder="Investigado"
          value={investigado}
          onChange={(e) => setInvestigado(e.target.value)}
          className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
        />
      </div>

      <SearchableSelect
        label="País del Informe"
        options={paises}
        value={idPais}
        onChange={setIdPais}
        placeholder="Seleccione"
        required
      />
      <SearchableSelect
        label="Idioma del Informe"
        options={idiomas}
        value={idIdioma}
        onChange={setIdIdioma}
        placeholder="Seleccione"
        required
      />

      <SearchableSelect
        label="Clases de Informe"
        options={[]}
        value={idClaseInforme}
        onChange={setIdClaseInforme}
        placeholder="Seleccione"
        required
      />
      <SearchableSelect
        label="Logo Imprimible"
        options={LOGO_OPTIONS}
        value={idLogoImprimible}
        onChange={setIdLogoImprimible}
        placeholder="Seleccione"
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Razón Social</label>
        <input
          type="text"
          placeholder="Razón Social"
          value={razonSocial}
          onChange={(e) => setRazonSocial(e.target.value)}
          className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Nro. de Referencia</label>
        <input
          type="text"
          placeholder="Nro. de Referencia"
          value={nroReferencia}
          onChange={(e) => setNroReferencia(e.target.value)}
          className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
        />
      </div>

      <SearchableSelect
        label="Tipo de Trámite"
        options={tiposTramite}
        value={idTipoTramite}
        onChange={setIdTipoTramite}
        placeholder="Seleccione"
        required
      />
    </div>
  );
}

function AnexosTab() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
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
    setFiles((prev) => [...prev, ...next]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Upload zone */}
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

      {/* File list */}
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

export function AddPedidoModal({ isOpen, onClose, isSubmitting = false }: AddPedidoModalProps) {
  const [activeTab, setActiveTab] = useState("informacion");

  const tabs = [
    {
      id: "informacion",
      label: "Información",
      content: <InformacionTab />,
    },
    {
      id: "anexos",
      label: "Anexos",
      content: <AnexosTab />,
    },
  ];

  const footer = (
    <div className="flex justify-end">
      <CustomButton variant="primary" size="md" loading={isSubmitting} loadingText="Guardando...">
        Confirmar
      </CustomButton>
    </div>
  );

  return (
    <CustomTabbedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registra un Pedido"
      tabs={tabs}
      footer={footer}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      maxWidth="max-w-2xl"
    />
  );
}
