import { useMemo, useState } from "react";
import { Eye, EyeOff, Plus, Recycle, Sparkles, Trash2 } from "lucide-react";
import { CODIGO_PEDIDOS_SIN_GRUPO } from "@maximilian/shared/constants/components/coordinador/agrupar-pedidos-drag-drop.constants";
import type {
  CargaArrastrePedido,
  LineaFacturaBorrador,
  PedidoConGrupo,
} from "@maximilian/shared/types/agrupar-pedidos-drag-drop.type";
import { leerCargaArrastre } from "@maximilian/shared/utils/agrupar-pedidos-drag-drop.util";
import { formatearMontoDosDecimales } from "@maximilian/shared/utils/formato-monto.util";

interface CustomPanelRecomendacionesGrupoPedidosProps {
  lineas: LineaFacturaBorrador[];
  pedidosTotales: PedidoConGrupo[];
  idLineaEnfocada: number | null;
  onAlternarEnfoque: (idLinea: number) => void;
  onAlternarSeleccion: (idLinea: number) => void;
  onSoltarPedido: (idLinea: number, carga: CargaArrastrePedido) => void;
  onActualizarCodigo: (idLinea: number, codigo: string) => void;
  onActualizarDescripcion: (idLinea: number, descripcion: string) => void;
  onEliminar: (idLinea: number) => void;
  onCrearLinea: () => void;
}

export function CustomPanelRecomendacionesGrupoPedidos({
  lineas,
  pedidosTotales,
  idLineaEnfocada,
  onAlternarEnfoque,
  onAlternarSeleccion,
  onSoltarPedido,
  onActualizarCodigo,
  onActualizarDescripcion,
  onEliminar,
  onCrearLinea,
}: CustomPanelRecomendacionesGrupoPedidosProps) {
  const [idEnArrastre, setIdEnArrastre] = useState<number | null>(null);

  const lineasOrdenadas = useMemo(
    () => [
      ...lineas.filter((linea) => linea.codigo !== CODIGO_PEDIDOS_SIN_GRUPO),
      ...lineas.filter((linea) => linea.codigo === CODIGO_PEDIDOS_SIN_GRUPO),
    ],
    [lineas],
  );
  const gruposSeleccionados = lineas.filter((linea) => linea.seleccionada).length;

  return (
    <aside className="flex w-[30rem] shrink-0 flex-col gap-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Sparkles size={13} className="text-brand-wine" />
          Recomendaciones de grupos
        </div>
        <button
          type="button"
          onClick={onCrearLinea}
          title="Crear nuevo grupo"
          className="flex shrink-0 items-center gap-1 rounded-lg bg-brand-wine/10 px-2 py-1 text-[10px] font-bold text-brand-wine transition-colors hover:bg-brand-wine/20"
        >
          <Plus size={12} />
          Nuevo grupo
        </button>
      </div>
      {lineasOrdenadas.length === 0 ? (
        <p className="px-1 py-4 text-center text-[11px] italic text-slate-400">
          No hay grupos todavia. Crea uno nuevo o busca pedidos para ver
          recomendaciones.
        </p>
      ) : (
        lineasOrdenadas.map((linea) => {
          const pedidosLinea = pedidosTotales.filter((pedido) =>
            linea.idsPedido.includes(pedido.idPedido),
          );
          const moneda = pedidosLinea[0]?.moneda ?? "";
          const esSinGrupo = linea.codigo === CODIGO_PEDIDOS_SIN_GRUPO;
          const estaEnfocada = idLineaEnfocada === linea.id;
          const enArrastreSobre = idEnArrastre === linea.id;

          return (
            <div
              key={linea.id}
              onDragOver={(evento) => {
                evento.preventDefault();
                setIdEnArrastre(linea.id);
              }}
              onDragLeave={() => setIdEnArrastre(null)}
              onDrop={(evento) => {
                evento.preventDefault();
                setIdEnArrastre(null);
                const carga = leerCargaArrastre(evento);
                if (carga) onSoltarPedido(linea.id, carga);
              }}
              className={`space-y-1.5 rounded-xl border p-2.5 transition-all ${!esSinGrupo && !linea.seleccionada ? "opacity-50" : ""} ${
                enArrastreSobre
                  ? "border-brand-wine bg-brand-wine/10"
                  : estaEnfocada
                    ? `border-brand-wine bg-brand-wine/10 ring-2 ring-brand-wine/30`
                    : esSinGrupo
                      ? "border-slate-300 border-dashed bg-slate-50 hover:border-slate-400"
                      : "border-brand-wine/20 bg-brand-wine/5 hover:border-brand-wine/40"
              }`}
            >
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={linea.seleccionada}
                  disabled={esSinGrupo}
                  onChange={() => onAlternarSeleccion(linea.id)}
                  title={
                    esSinGrupo
                      ? "Este grupo no se puede incluir como linea de factura"
                      : "Incluir este grupo como linea de factura"
                  }
                  className="size-4 shrink-0 accent-brand-wine disabled:cursor-not-allowed disabled:opacity-40"
                />
                {esSinGrupo ? (
                  <>
                    <Recycle size={13} className="shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-500">
                      {linea.descripcion}
                    </span>
                  </>
                ) : (
                  <>
                    <input
                      value={linea.codigo}
                      maxLength={30}
                      onChange={(evento) =>
                        onActualizarCodigo(linea.id, evento.target.value)
                      }
                      placeholder="Codigo"
                      className="w-20 shrink-0 rounded-lg border border-brand-wine/20 bg-white px-1.5 py-1 text-[10px] font-bold text-slate-700 outline-none focus:border-brand-wine"
                    />
                    <input
                      value={linea.descripcion}
                      maxLength={500}
                      onChange={(evento) =>
                        onActualizarDescripcion(linea.id, evento.target.value)
                      }
                      placeholder="Descripcion"
                      className="min-w-0 flex-1 rounded-lg border border-brand-wine/20 bg-white px-1.5 py-1 text-[10px] text-slate-600 outline-none focus:border-brand-wine"
                    />
                    <button
                      type="button"
                      onClick={() => onEliminar(linea.id)}
                      aria-label="Eliminar grupo"
                      className="shrink-0 rounded-lg p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-1">
                <span
                  className="flex-1 rounded-lg border border-brand-wine/10 bg-white px-1.5 py-0.5 text-center"
                  title="Cantidad de pedidos"
                >
                  <span className="block text-[8px] font-bold uppercase text-slate-400">
                    Cant.
                  </span>
                  <span className="block text-[10px] font-bold text-brand-black">
                    {pedidosLinea.length}
                  </span>
                </span>
                <span
                  className="flex-1 rounded-lg border border-brand-wine/10 bg-white px-1.5 py-0.5 text-center"
                  title="Valor unitario por producto"
                >
                  <span className="block text-[8px] font-bold uppercase text-slate-400">
                    Valor unit.
                  </span>
                  <span className="block truncate text-[10px] font-bold text-brand-black">
                    {pedidosLinea.length === 0
                      ? "-"
                      : `${moneda} ${formatearMontoDosDecimales(linea.precio)}`}
                  </span>
                </span>
                <span
                  className="flex-1 rounded-lg border border-brand-wine/10 bg-white px-1.5 py-0.5 text-center"
                  title="Monto de descuento acumulado"
                >
                  <span className="block text-[8px] font-bold uppercase text-slate-400">
                    Desc. Acumulado
                  </span>
                  <span className="block truncate text-[10px] font-bold text-brand-black">
                    {pedidosLinea.length === 0
                      ? "-"
                      : `${moneda} ${formatearMontoDosDecimales(linea.descuento)}`}
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => onAlternarEnfoque(linea.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-left transition-colors ${
                  estaEnfocada ? "bg-white" : "hover:bg-white/60"
                }`}
                aria-pressed={estaEnfocada}
              >
                <span
                  className={`text-[10px] font-medium ${estaEnfocada ? "text-brand-wine" : "text-slate-500"}`}
                >
                  {estaEnfocada
                    ? "Viendo en Pedidos disponibles"
                    : "Ver pedidos incluidos"}
                </span>
                {estaEnfocada ? (
                  <EyeOff size={13} className="shrink-0 text-brand-wine" />
                ) : (
                  <Eye size={13} className="shrink-0 text-slate-400" />
                )}
              </button>
            </div>
          );
        })
      )}
      {lineas.length > 0 ? (
        <p className="mt-1 border-t border-slate-100 pt-2 text-center text-[11px] font-bold text-slate-500">
          {gruposSeleccionados} grupo{gruposSeleccionados === 1 ? "" : "s"} seleccionado{gruposSeleccionados === 1 ? "" : "s"}
        </p>
      ) : null}
    </aside>
  );
}
