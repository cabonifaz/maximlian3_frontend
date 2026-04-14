import { useMemo, useState } from "react";
import { AlertCircle, Download, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabbedModal } from "@maximilian/components/common/CustomTabbedModal";
import { clientService } from "@maximilian/services/client.service";
import { masterTableService } from "@maximilian/services/masterTable.service";
import { pedidoService } from "@maximilian/services/pedido.service";
import { MasterTableId, type MasterTableEntry } from "@maximilian/shared/types/master-table.type";
import type { TarifarioCortaEntry } from "@maximilian/shared/types/client.type";
import type { PedidoArchivoEntry } from "@maximilian/shared/types/pedido.type";

interface CustomPedidoDetalleModalProps {
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

function obtenerTextoTabla(tabla: MasterTableEntry[] | undefined, id?: number | null) {
  if (id == null) return "-";
  return tabla?.find((item) => item.num1 === id)?.string1 ?? "-";
}

function CampoDetalle({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{etiqueta}</p>
      <p className="mt-1 text-sm font-medium text-brand-black break-words">{valor || "-"}</p>
    </div>
  );
}

function SeccionDetalle({
  titulo,
  campos,
}: {
  titulo: string;
  campos: Array<{ etiqueta: string; valor: string }>;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-base font-bold text-brand-black">{titulo}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {campos.map((campo) => (
          <CampoDetalle key={campo.etiqueta} etiqueta={campo.etiqueta} valor={campo.valor} />
        ))}
      </div>
    </section>
  );
}

function AnexosDetalleTab({ pedidoId }: { pedidoId: number | null }) {
  const [descargandoId, setDescargandoId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pedidoArchivos", "detalle", pedidoId],
    queryFn: () => pedidoService.listArchivos({ idPedido: pedidoId!, numPag: 1 }),
    enabled: !!pedidoId,
  });

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
                <td className="px-4 py-3 font-medium text-brand-black">{archivo.nombreDocumento}</td>
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
  );
}

export function CustomPedidoDetalleModal({
  isOpen,
  onClose,
  pedidoId,
  zIndex = "z-50",
}: CustomPedidoDetalleModalProps) {
  const [activeTab, setActiveTab] = useState("cliente-tarifa");

  const { data: pedido, isLoading, isError, refetch } = useQuery({
    queryKey: ["pedido", "detalle", pedidoId],
    queryFn: () => pedidoService.getById(pedidoId!),
    enabled: !!pedidoId && isOpen,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes", "listaCorta"],
    queryFn: () => clientService.listaCorta(),
    enabled: isOpen,
  });

  const { data: allTarifas } = useQuery({
    queryKey: ["tarifario", "listaCorta", "detalle", { idCliente: pedido?.idCliente }],
    queryFn: () => clientService.listTarifarioCorta({ idCliente: pedido!.idCliente }),
    enabled: !!pedido?.idCliente && isOpen,
  });

  const { data: paises } = useQuery({
    queryKey: ["masterTable", MasterTableId.PAIS],
    queryFn: () => masterTableService.list(MasterTableId.PAIS),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: idiomas } = useQuery({
    queryKey: ["masterTable", MasterTableId.IDIOMA],
    queryFn: () => masterTableService.list(MasterTableId.IDIOMA),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: clasesInforme } = useQuery({
    queryKey: ["masterTable", MasterTableId.CLASE_INFORME],
    queryFn: () => masterTableService.list(MasterTableId.CLASE_INFORME),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: tiposTramite } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_TRAMITE],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_TRAMITE),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: plantillasInforme } = useQuery({
    queryKey: ["masterTable", MasterTableId.PLANTILLA_INFORME],
    queryFn: () => masterTableService.list(MasterTableId.PLANTILLA_INFORME),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: tiposPersona } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_PERSONA],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_PERSONA),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: empresasAtencion } = useQuery({
    queryKey: ["masterTable", MasterTableId.EMPRESA_ATENCION],
    queryFn: () => masterTableService.list(MasterTableId.EMPRESA_ATENCION),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: tiposPlazoCredito } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_PLAZO_CREDITO],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_PLAZO_CREDITO),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const cliente = useMemo(
    () => clientes.find((item) => item.idCliente === pedido?.idCliente),
    [clientes, pedido?.idCliente],
  );

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
      <div className="space-y-8">
        <SeccionDetalle
          titulo="Cliente"
          campos={[
            { etiqueta: "Cliente", valor: cliente?.nombreCliente ?? "-" },
            { etiqueta: "Nro. documento del cliente", valor: pedido.numeroDocumento || "-" },
            { etiqueta: "Plantilla de informe", valor: obtenerTextoTabla(plantillasInforme, pedido.idPlantilla) },
            { etiqueta: "Idioma del informe", valor: obtenerTextoTabla(idiomas, pedido.idIdioma) },
            { etiqueta: "Logo imprimible", valor: pedido.imprimeLogoSafety ? "Si" : "No" },
          ]}
        />
        <SeccionDetalle
          titulo="Tarifa"
          campos={[
            { etiqueta: "Pais del informe", valor: obtenerTextoTabla(paises, tarifarioSeleccionado?.idPais) },
            { etiqueta: "Clase de informe", valor: obtenerTextoTabla(clasesInforme, tarifarioSeleccionado?.idProducto ?? pedido.idClaseInforme) },
            { etiqueta: "Tipo de tramite", valor: tarifarioSeleccionado?.tipoTramite ?? obtenerTextoTabla(tiposTramite, tarifarioSeleccionado?.idTipoTramite) },
            { etiqueta: "Tarifa", valor: tarifarioSeleccionado ? `${tarifarioSeleccionado.moneda} ${tarifarioSeleccionado.precio}` : "-" },
          ]}
        />
      </div>
    );

  const infoPedidoContent = isLoadingAll
    ? loadingContent
    : isError || !pedido
    ? errorContent
    : (
      <div className="space-y-8">
        <SeccionDetalle
          titulo="Informacion principal"
          campos={[
            { etiqueta: "Investigado", valor: pedido.investigarRazonSocialNombres || "-" },
            { etiqueta: "Tipo de persona", valor: obtenerTextoTabla(tiposPersona, pedido.idTipoPersona) },
            { etiqueta: "Nro. documento", valor: pedido.numeroDocumentoInvestigado || "-" },
            { etiqueta: "Nro. de referencia", valor: pedido.numReferencia || "-" },
            { etiqueta: "Comentario", valor: pedido.comentario || "-" },
            { etiqueta: "Codigo", valor: pedido.codigo || "-" },
            { etiqueta: "Atendido por", valor: obtenerTextoTabla(empresasAtencion, pedido.idCompania) },
            { etiqueta: "Desde", valor: formatearFecha(pedido.fchDesde) },
            { etiqueta: "Hasta", valor: formatearFecha(pedido.fchHasta) },
            { etiqueta: "Monto credito", valor: formatearMonto(pedido.montoCredito, tarifarioSeleccionado?.simboloMoneda) },
            {
              etiqueta: "Plazo credito",
              valor: pedido.plazoCredito != null
                ? `${pedido.plazoCredito} ${obtenerTextoTabla(tiposPlazoCredito, pedido.idTipoPlazoCredito)}`
                : "-",
            },
          ]}
        />
      </div>
    );

  return (
    <CustomTabbedModal
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
