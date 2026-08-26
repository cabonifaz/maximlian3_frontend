import { AlertTriangle } from "lucide-react";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import type { LineaFacturaBorrador } from "@maximilian/shared/types/agrupar-pedidos-drag-drop.type";
import { formatearMontoDosDecimales } from "@maximilian/shared/utils/formato-monto.util";

interface CustomModalConfirmarLineasFacturaProps {
  abierto: boolean;
  lineas: LineaFacturaBorrador[];
  creando: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
}

export function CustomModalConfirmarLineasFactura({
  abierto,
  lineas,
  creando,
  onCerrar,
  onConfirmar,
}: CustomModalConfirmarLineasFacturaProps) {
  const lineasSinDescripcion = lineas.filter((linea) => linea.descripcion.trim() === "");
  const totalPedidos = lineas.reduce((total, linea) => total + linea.idsPedido.length, 0);

  return (
    <CustomModalConfirmacionAccion
      isOpen={abierto}
      onClose={onCerrar}
      onConfirm={onConfirmar}
      title="Confirmar creacion de lineas"
      descripcion="Se enviaran las siguientes lineas a facturacion. Esta accion no se puede deshacer."
      isSubmitting={creando}
      confirmDisabled={lineas.length === 0 || lineasSinDescripcion.length > 0}
      textoConfirmar="Crear lineas"
      textoCargandoConfirmar="Creando..."
      varianteConfirmar="wine"
      anchoMaximoClassName="max-w-lg"
      zIndexClassName="z-[90]"
      contenidoAdicional={
        <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
          {lineas.length === 0 ? (
            <p className="py-4 text-center text-sm italic text-slate-400">No hay lineas seleccionadas.</p>
          ) : (
            lineas.map((linea) => (
              <div key={linea.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-brand-black">{linea.codigo || "Sin codigo"}</span>
                  <span className="text-slate-500">{linea.idsPedido.length} pedido{linea.idsPedido.length === 1 ? "" : "s"}</span>
                </div>
                <p className={linea.descripcion.trim() === "" ? "italic text-red-500" : "text-slate-600"}>
                  {linea.descripcion.trim() === "" ? "Falta la descripcion" : linea.descripcion}
                </p>
                <div className="mt-1 flex items-center justify-between text-slate-500">
                  <span>Valor unit.: {formatearMontoDosDecimales(linea.precio)}</span>
                  <span>Descuento: {formatearMontoDosDecimales(linea.descuento)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      }
    >
      <p><span className="font-bold">Lineas a crear:</span> {lineas.length}</p>
      <p><span className="font-bold">Pedidos incluidos:</span> {totalPedidos}</p>
      {lineasSinDescripcion.length > 0 ? (
        <p className="flex items-center gap-1.5 font-bold text-red-500">
          <AlertTriangle size={13} className="shrink-0" />
          {lineasSinDescripcion.length} linea{lineasSinDescripcion.length === 1 ? "" : "s"} sin descripcion
        </p>
      ) : null}
    </CustomModalConfirmacionAccion>
  );
}
