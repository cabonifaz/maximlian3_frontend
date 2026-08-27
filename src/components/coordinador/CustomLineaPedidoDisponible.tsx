import { GripVertical, X } from "lucide-react";
import { FORMATO_ARRASTRE_AGRUPAR_PEDIDOS } from "@maximilian/shared/constants/components/coordinador/agrupar-pedidos-drag-drop.constants";
import { ESTILOS_TIPO_PRODUCTO_FACTURABLE } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type { CargaArrastrePedido, PedidoConGrupo } from "@maximilian/shared/types/agrupar-pedidos-drag-drop.type";
import { formatearFechaIsoADdMmYyyy } from "@maximilian/shared/utils/fecha.util";
import { formatearMontoDosDecimales } from "@maximilian/shared/utils/formato-monto.util";

interface CustomLineaPedidoDisponibleProps {
  pedido: PedidoConGrupo;
  onQuitar?: () => void;
}

export function CustomLineaPedidoDisponible({ pedido, onQuitar }: CustomLineaPedidoDisponibleProps) {
  const tipo = ESTILOS_TIPO_PRODUCTO_FACTURABLE[pedido.tipo];

  const manejarInicioArrastre = (evento: React.DragEvent<HTMLDivElement>) => {
    const carga: CargaArrastrePedido = { idPedido: pedido.idPedido };
    evento.dataTransfer.setData(FORMATO_ARRASTRE_AGRUPAR_PEDIDOS, JSON.stringify(carga));
    evento.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={manejarInicioArrastre}
      className="flex w-full shrink-0 cursor-grab items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all hover:border-brand-wine/40 hover:shadow-md active:cursor-grabbing"
    >
      <GripVertical size={14} className="shrink-0 text-slate-300" />
      <span className="w-28 shrink-0 truncate text-xs font-bold text-slate-700">{pedido.codigo}</span>
      <span className="min-w-[160px] flex-1 truncate text-xs text-slate-600" title={pedido.investigado}>
        {pedido.investigado}
      </span>
      <span className="w-28 shrink-0 truncate text-xs text-slate-500">{pedido.pais}</span>
      <span className="w-20 shrink-0">
        <span className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold ${tipo.clase}`}>
          {tipo.texto}
        </span>
      </span>
      <span className="w-20 shrink-0 text-xs text-slate-500">
        {formatearFechaIsoADdMmYyyy(pedido.fecha)}
      </span>
      <span className="w-24 shrink-0 text-right text-xs font-bold text-brand-black">
        {pedido.moneda} {formatearMontoDosDecimales(pedido.precio)}
      </span>
      <span className="w-24 shrink-0 text-right text-xs font-medium text-amber-600">
        {pedido.moneda} {formatearMontoDosDecimales(pedido.penalidad)}
      </span>
      <span className="flex w-6 shrink-0 items-center justify-center">
        {onQuitar ? (
          <button
            type="button"
            onClick={onQuitar}
            aria-label={`Quitar ${pedido.codigo} del grupo`}
            className="rounded-lg p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <X size={13} />
          </button>
        ) : null}
      </span>
    </div>
  );
}
