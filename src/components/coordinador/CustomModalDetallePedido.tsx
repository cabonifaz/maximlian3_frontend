import { AlertCircle, Download, RotateCcw } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomChipTipoArchivo } from "@maximilian/components/common/CustomChipTipoArchivo";
import { formatearTamanoArchivo, obtenerExtensionArchivo } from "@maximilian/shared/utils/archivo.util";
import { formatearFechaVisual } from "@maximilian/shared/utils/fecha.util";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { CustomModalPestanas } from "@maximilian/components/common/CustomModalPestanas";
import { TablaTarifarioCorta } from "@maximilian/components/coordinador/TablaTarifarioCorta";
import { useAnexosDetallePedido } from "@maximilian/hooks/useAnexosDetallePedido";
import { useDetallePedido } from "@maximilian/hooks/useDetallePedido";

interface CustomModalDetallePedidoProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: number | null;
  zIndex?: string;
}

const opcionesFechaNumerica: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
};

function formatearFecha(valor: string | null | undefined) {
  return formatearFechaVisual(valor, opcionesFechaNumerica, "es-BO");
}

function formatearMonto(valor: number | null | undefined, simboloMoneda?: string | null) {
  if (valor == null) return "-";
  return `${simboloMoneda ?? ""}${valor}`;
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
  const {
    archivos,
    busqueda,
    descargar,
    idDescargando,
    isError,
    isLoading,
    refetch,
    setBusqueda,
  } = useAnexosDetallePedido(pedidoId);

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
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
      />
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full text-left text-sm">
        <thead className="bg-white">
          <tr className="border-b border-gray-100">
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Nombre</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Formato</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Tamaño</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Fecha de carga</th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-400">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {archivos.map((archivo) => {
            const extension = obtenerExtensionArchivo(archivo.nombreDocumento);

            return (
              <tr key={archivo.idPedidoArchivo} className="hover:bg-gray-50/70">
                <td className="px-4 py-3 font-medium text-brand-black">
                  <span title={archivo.nombreDocumento} className="block max-w-48 truncate">{archivo.nombreDocumento}</span>
                </td>
                <td className="px-4 py-3">
                  <CustomChipTipoArchivo extension={extension} />
                </td>
                <td className="px-4 py-3 text-slate-600">{formatearTamanoArchivo(archivo.tamanoArchivo)}</td>
                <td className="px-4 py-3 text-slate-600">{archivo.fechaCarga || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => descargar(archivo)}
                    disabled={idDescargando === archivo.idPedidoArchivo}
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
    </div>
  );
}

export function CustomModalDetallePedido({
  isOpen,
  onClose,
  pedidoId,
  zIndex = "z-50",
}: CustomModalDetallePedidoProps) {
  const {
    cerrarDetalle,
    clientes,
    clasesInforme,
    empresasAtencion,
    estaCargandoTodo,
    idiomas,
    isError,
    paises,
    pedido,
    plantillasInforme,
    refetch,
    setTabActiva,
    tabActiva,
    tarifarioSeleccionado,
    tiposPersona,
    tiposPlazoCredito,
    tiposTramite,
  } = useDetallePedido({ isOpen, pedidoId });

  const loadingContent = (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-wine border-t-transparent" />
      <p className="text-sm text-gray-500">Cargando datos del pedido...</p>
    </div>
  );

  const errorContent = (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <AlertCircle size={40} className="text-red-400" />
      <p className="text-sm text-gray-600">No se pudo cargar la información del pedido.</p>
      <CustomButton variant="secondary" size="sm" onClick={() => refetch()}>
        <RotateCcw size={14} />
        REINTENTAR
      </CustomButton>
    </div>
  );

  const clienteTarifaContent = estaCargandoTodo
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
            label="País del informe"
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
            label="Tipo de trámite"
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

  const infoPedidoContent = estaCargandoTodo
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
          <CampoSoloLectura etiqueta="Código" valor={pedido.codigo || "-"} />
          <CustomSelectorBuscable
            label="Atendido por"
            options={empresasAtencion}
            value={pedido.idCompania}
            onChange={() => {}}
            disabled
          />
          <CampoSoloLectura etiqueta="Desde" valor={formatearFecha(pedido.fchDesde)} />
          <CampoSoloLectura etiqueta="Hasta" valor={formatearFecha(pedido.fchHasta)} />
          <CampoSoloLectura etiqueta="Monto crédito" valor={formatearMonto(pedido.montoCredito, tarifarioSeleccionado?.simboloMoneda)} />
          <div className="flex gap-2">
            <div className="flex-1">
              <CampoSoloLectura etiqueta="Plazo crédito" valor={pedido.plazoCredito != null ? String(pedido.plazoCredito) : "-"} />
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
      onClose={() => cerrarDetalle(onClose)}
      title="Detalle del Pedido"
      tabs={[
        {
          id: "cliente-tarifa",
          label: "Cliente y Tarifa",
          content: clienteTarifaContent,
        },
        {
          id: "info-pedido",
          label: "Información del pedido",
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
      activeTab={tabActiva}
      onTabChange={setTabActiva}
      maxWidth="max-w-5xl"
      zIndex={zIndex}
    />
  );
}
