import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Download, RotateCcw, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { CustomModalPestanas } from "@maximilian/components/common/CustomModalPestanas";
import { CustomModalExtraccionInformacionAnalista } from "@maximilian/components/analista/CustomModalExtraccionInformacionAnalista";
import { TablaTarifarioCorta } from "@maximilian/components/coordinador/TablaTarifarioCorta";
import { servicioCliente } from "@maximilian/services/cliente.service";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import { pedidoService } from "@maximilian/services/pedido.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import type { TarifarioCortaEntry } from "@maximilian/shared/types/cliente.type";
import type { PedidoArchivoEntry } from "@maximilian/shared/types/pedido.type";

interface CustomModalDetallePedidoProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: number | null;
  zIndex?: string;
}

function formatearFecha(valor: string | null | undefined) {
  if (!valor) return "-";

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

function formatearMonto(valor: number | null | undefined, simboloMoneda?: string | null) {
  if (valor == null) return "-";
  return `${simboloMoneda ?? ""}${valor}`;
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

  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${cls}`}>{ext}</span>;
}

function CampoSoloLectura({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <CustomLabel>{etiqueta}</CustomLabel>
      <input
        type="text"
        value={valor || "-"}
        disabled
        readOnly
        className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 outline-none"
      />
    </div>
  );
}

function TextAreaSoloLectura({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <CustomLabel optional>{etiqueta}</CustomLabel>
      <textarea
        value={valor || "-"}
        disabled
        readOnly
        className="min-h-32 w-full resize-none rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 outline-none"
      />
    </div>
  );
}

function AnexosDetalleTab({ pedidoId }: { pedidoId: number | null }) {
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [busquedaConRetardo, setDebouncedSearch] = useState("");
  const [estaAbiertoModalExtraccion, setEstaAbiertoModalExtraccion] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pedidoArchivos", "detalle", pedidoId, busquedaConRetardo],
    queryFn: () => pedidoService.listArchivos({ idPedido: pedidoId!, busqueda: busquedaConRetardo || undefined, numPag: 1 }),
    enabled: !!pedidoId,
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDescargar = async (archivo: PedidoArchivoEntry) => {
    setDescargandoId(archivo.idPedidoArchivo);
    try {
      const result = await pedidoService.getArchivo({
        idPedidoArchivo: archivo.idPedidoArchivo,
        idPedido: archivo.idPedido,
      });
      window.open(result.downloadUrl, "_blank");
    } catch {
      // handled by interceptor
    } finally {
      setDescargandoId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-wine border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-sm text-gray-600">No se pudieron cargar los anexos.</p>
        <CustomButton variant="secondary" size="sm" onClick={() => refetch()}>
          <RotateCcw size={14} />
          REINTENTAR
        </CustomButton>
      </div>
    );
  }

  const archivos = data?.lstPedidoArchivo ?? [];

  if (archivos.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-2xl border border-gray-100 text-sm text-gray-400">
        No hay archivos adjuntos.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
      />
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full text-left text-sm">
        <thead className="bg-white">
          <tr className="border-b border-gray-100">
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Nombre</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Formato</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Tamano</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Fecha de carga</th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-400">Accion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {archivos.map((archivo) => {
            const extension = getExtension(archivo.nombreDocumento);

            return (
              <tr key={archivo.idPedidoArchivo} className="hover:bg-gray-50/70">
                <td className="px-4 py-3 font-medium text-brand-black">
                  <span title={archivo.nombreDocumento} className="block max-w-48 truncate">{archivo.nombreDocumento}</span>
                </td>
                <td className="px-4 py-3">
                  <FileTypeBadge ext={extension} />
                </td>
                <td className="px-4 py-3 text-slate-600">{formatBytes(archivo.tamanoArchivo)}</td>
                <td className="px-4 py-3 text-slate-600">{archivo.fechaCarga || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDescargar(archivo)}
                    disabled={descargandoId === archivo.idPedidoArchivo}
                    className="inline-flex items-center rounded-lg p-2 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>
      <div className="flex justify-start">
        <CustomButton variant="secondary" size="sm" onClick={() => setEstaAbiertoModalExtraccion(true)}>
          <Sparkles size={14} />
          Extraer información
        </CustomButton>
      </div>

      <CustomModalExtraccionInformacionAnalista
        estaAbierto={estaAbiertoModalExtraccion}
        alcance="general"
        onCerrar={() => setEstaAbiertoModalExtraccion(false)}
        onExtraer={async () => Promise.resolve()}
      />
    </div>
  );
}

export function CustomModalDetallePedido({
  isOpen,
  onClose,
  pedidoId,
  zIndex = "z-50",
}: CustomModalDetallePedidoProps) {
  const [activeTab, setActiveTab] = useState("cliente-tarifa");

  const { data: pedido, isLoading, isError, refetch } = useQuery({
    queryKey: ["pedido", "detalle", pedidoId],
    queryFn: () => pedidoService.getById(pedidoId!),
    enabled: !!pedidoId && isOpen,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes", "listaCorta"],
    queryFn: () => servicioCliente.listaCorta(),
    enabled: isOpen,
  });

  const { data: allTarifas } = useQuery({
    queryKey: ["tarifario", "listaCorta", "detalle", { idCliente: pedido?.idCliente }],
    queryFn: () => servicioCliente.listTarifarioCorta({ idCliente: pedido!.idCliente }),
    enabled: !!pedido?.idCliente && isOpen,
  });

  const { data: paises } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: idiomas } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.IDIOMA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.IDIOMA),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: clasesInforme } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.CLASE_INFORME],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.CLASE_INFORME),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: tiposTramite } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_TRAMITE],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_TRAMITE),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: plantillasInforme } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PLANTILLA_INFORME],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PLANTILLA_INFORME),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: tiposPersona } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_PERSONA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_PERSONA),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: empresasAtencion } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.EMPRESA_ATENCION],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.EMPRESA_ATENCION),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: tiposPlazoCredito } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_PLAZO_CREDITO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_PLAZO_CREDITO),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const tarifarioSeleccionado = useMemo<TarifarioCortaEntry | undefined>(
    () => allTarifas?.find((item) => item.idTarifario === pedido?.idTarifario),
    [allTarifas, pedido?.idTarifario],
  );

  const loadingContent = (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-wine border-t-transparent" />
      <p className="text-sm text-gray-500">Cargando datos del pedido...</p>
    </div>
  );

  const errorContent = (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <AlertCircle size={40} className="text-red-400" />
      <p className="text-sm text-gray-600">No se pudo cargar la informacion del pedido.</p>
      <CustomButton variant="secondary" size="sm" onClick={() => refetch()}>
        <RotateCcw size={14} />
        REINTENTAR
      </CustomButton>
    </div>
  );

  const isLoadingAll = isLoading || (!!pedido && allTarifas === undefined);

  const clienteTarifaContent = isLoadingAll
    ? loadingContent
    : isError || !pedido
    ? errorContent
    : (
      <div className="flex gap-6">
        <div className="flex flex-1 flex-col gap-5">
          <CustomSelectorBuscable
            label="Cliente"
            options={clientes.map((item) => ({
              idEmpresa: 0,
              idTablaMaestra: null,
              idMaestro: 0,
              descripcion: "",
              num1: item.idCliente,
              num2: null,
              num3: null,
              string1: item.nombreCliente,
              string2: null,
              string3: null,
              date1: null,
              date2: null,
              date3: null,
            }))}
            value={pedido.idCliente}
            onChange={() => {}}
            disabled
          />
          <CampoSoloLectura etiqueta="Nro. documento del cliente" valor={pedido.numeroDocumento || "-"} />
          <CustomSelectorBuscable
            label="Plantilla de Informe"
            options={plantillasInforme}
            value={pedido.idPlantilla}
            onChange={() => {}}
            disabled
          />
          <CustomSelectorBuscable
            label="Idioma del Informe"
            options={idiomas}
            value={pedido.idIdioma}
            onChange={() => {}}
            disabled
          />
          <div className="flex flex-col gap-1.5">
            <CustomLabel>Logo Imprimible</CustomLabel>
            <input
              type="checkbox"
              checked={pedido.imprimeLogoSafety}
              disabled
              readOnly
              className="h-4 w-4 cursor-not-allowed accent-brand-wine"
            />
          </div>
        </div>

        <div className="flex min-h-120 flex-1 flex-col gap-5">
          <CustomSelectorBuscable
            label="Pais del Informe"
            options={paises}
            value={tarifarioSeleccionado?.idPais}
            onChange={() => {}}
            disabled
          />
          <CustomSelectorBuscable
            label="Clases de Informe"
            options={clasesInforme}
            value={tarifarioSeleccionado?.idProducto ?? pedido.idClaseInforme}
            onChange={() => {}}
            disabled
          />
          <CustomSelectorBuscable
            label="Tipo de Tramite"
            options={tiposTramite}
            value={tarifarioSeleccionado?.idTipoTramite}
            onChange={() => {}}
            disabled
          />
          <div className="flex flex-col gap-1">
            <CustomLabel>Tarifa</CustomLabel>
            <TablaTarifarioCorta
              idCliente={pedido.idCliente}
              idTipoProducto={tarifarioSeleccionado?.idProducto ?? pedido.idClaseInforme}
              idTipoTramite={tarifarioSeleccionado?.idTipoTramite}
              idPais={tarifarioSeleccionado?.idPais}
              idTarifarioSeleccionado={pedido.idTarifario}
              onTarifarioSelect={() => {}}
              soloLectura
            />
          </div>
        </div>
      </div>
    );

  const infoPedidoContent = isLoadingAll
    ? loadingContent
    : isError || !pedido
    ? errorContent
    : (
      <div className="flex gap-6">
        <div className="flex flex-1 flex-col gap-5">
          <CampoSoloLectura etiqueta="Investigado" valor={pedido.investigarRazonSocialNombres || "-"} />
          <CustomSelectorBuscable
            label="Tipo de Persona"
            options={tiposPersona}
            value={pedido.idTipoPersona}
            onChange={() => {}}
            disabled
          />
          <CampoSoloLectura etiqueta="Nro. Documento" valor={pedido.numeroDocumentoInvestigado || "-"} />
          <CampoSoloLectura etiqueta="Nro. de Referencia" valor={pedido.numReferencia || "-"} />
          <TextAreaSoloLectura etiqueta="Comentario" valor={pedido.comentario || "-"} />
        </div>

        <div className="flex flex-1 flex-col gap-5">
          <CampoSoloLectura etiqueta="Codigo" valor={pedido.codigo || "-"} />
          <CustomSelectorBuscable
            label="Atendido por"
            options={empresasAtencion}
            value={pedido.idCompania}
            onChange={() => {}}
            disabled
          />
          <CampoSoloLectura etiqueta="Desde" valor={formatearFecha(pedido.fchDesde)} />
          <CampoSoloLectura etiqueta="Hasta" valor={formatearFecha(pedido.fchHasta)} />
          <CampoSoloLectura etiqueta="Monto Credito" valor={formatearMonto(pedido.montoCredito, tarifarioSeleccionado?.simboloMoneda)} />
          <div className="flex gap-2">
            <div className="flex-1">
              <CampoSoloLectura etiqueta="Plazo Credito" valor={pedido.plazoCredito != null ? String(pedido.plazoCredito) : "-"} />
            </div>
            <div className="w-40">
              <CustomSelectorBuscable
                label="Tipo"
                options={tiposPlazoCredito}
                value={pedido.idTipoPlazoCredito ?? undefined}
                onChange={() => {}}
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <CustomModalPestanas
      isOpen={isOpen}
      onClose={() => {
        setActiveTab("cliente-tarifa");
        onClose();
      }}
      title="Detalle del Pedido"
      tabs={[
        {
          id: "cliente-tarifa",
          label: "Cliente y Tarifa",
          content: clienteTarifaContent,
        },
        {
          id: "info-pedido",
          label: "Informacion del Pedido",
          content: infoPedidoContent,
        },
        {
          id: "anexos",
          label: "Anexos",
          content: <AnexosDetalleTab pedidoId={pedidoId} />,
        },
      ]}
      footer={
        <div className="flex justify-end">
          <CustomButton variant="secondary" size="md" onClick={onClose}>
            Cerrar
          </CustomButton>
        </div>
      }
      activeTab={activeTab}
      onTabChange={setActiveTab}
      maxWidth="max-w-5xl"
      zIndex={zIndex}
    />
  );
}
