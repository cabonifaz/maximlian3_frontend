import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Search, SlidersHorizontal } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { MultiCustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscableMultiple";
import { CustomSelectorFecha } from "@maximilian/components/common/CustomSelectorFecha";
import type { FiltrosAgruparPedidos } from "@maximilian/shared/types/agrupar-pedidos-drag-drop.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { formatearFechaDdMmYyyy } from "@maximilian/shared/utils/fecha.util";

const AYUDA_FILTROS_Y_BUSCAR =
  "Los filtros aplican al instante sobre lo ya cargado; Buscar trae pedidos nuevos y reemplaza los grupos actuales.";

interface CustomFiltrosAgruparPedidosDragDropProps {
  filtros: FiltrosAgruparPedidos;
  fechasCompletas: boolean;
  buscando: boolean;
  hayGruposConPedidos: boolean;
  onCambiar: (cambios: Partial<FiltrosAgruparPedidos>) => void;
  onBuscar: () => void;
}

export function CustomFiltrosAgruparPedidosDragDrop({
  filtros,
  fechasCompletas,
  buscando,
  hayGruposConPedidos,
  onCambiar,
  onBuscar,
}: CustomFiltrosAgruparPedidosDragDropProps) {
  const [expandido, setExpandido] = useState(true);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpandido((actual) => !actual)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5"
        aria-expanded={expandido}
      >
        <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <SlidersHorizontal size={13} className="text-brand-wine" />
          Filtros
          {filtros.fechaInicio && filtros.fechaFin ? (
            <span className="font-medium text-slate-400">
              ({formatearFechaDdMmYyyy(filtros.fechaInicio)} - {formatearFechaDdMmYyyy(filtros.fechaFin)})
            </span>
          ) : null}
        </span>
        {expandido ? (
          <ChevronUp size={15} className="shrink-0 text-slate-400" />
        ) : (
          <ChevronDown size={15} className="shrink-0 text-slate-400" />
        )}
      </button>

      {expandido ? (
        <div className="space-y-2 border-t border-slate-100 p-3">
          <div className="flex flex-wrap items-end gap-2.5">
            <div className="grid flex-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              <CustomSelectorFecha
                label="Fecha inicio"
                required
                value={filtros.fechaInicio}
                onChange={(fechaInicio) => onCambiar({ fechaInicio })}
              />
              <CustomSelectorFecha
                label="Fecha fin"
                required
                value={filtros.fechaFin}
                onChange={(fechaFin) => onCambiar({ fechaFin })}
              />
              <CustomSelectorBuscable
                label="Tramite"
                optional
                idMaster={TablaMaestraId.TIPO_TRAMITE}
                value={filtros.idTipoTramite}
                onChange={(idTipoTramite) => onCambiar({ idTipoTramite })}
                onClear={() => onCambiar({ idTipoTramite: undefined })}
                obtenerEtiquetaOpcion={(opcion) => opcion.string2 ?? opcion.string1 ?? ""}
              />
              <MultiCustomSelectorBuscable
                label="Pais"
                optional
                idMaster={TablaMaestraId.PAIS}
                value={filtros.idsPais}
                onChange={(idsPais) => onCambiar({ idsPais })}
                resumirSelecciones
              />
              <CustomSelectorBuscable
                label="Moneda"
                optional
                idMaster={TablaMaestraId.MONEDA_SUNAT}
                value={filtros.idMoneda}
                onChange={(idMoneda) => onCambiar({ idMoneda })}
                onClear={() => onCambiar({ idMoneda: undefined })}
              />
            </div>
            <div className="flex items-end gap-2.5">
              <CustomSelectorBuscable
                label="Vigencia"
                optional
                idMaster={TablaMaestraId.VIGENCIA_PEDIDOS}
                value={filtros.idVigencia}
                onChange={(idVigencia) => onCambiar({ idVigencia })}
                onClear={() => onCambiar({ idVigencia: undefined })}
              />
              <CustomButton
                type="button"
                variant="primary"
                size="md"
                disabled={!fechasCompletas}
                loading={buscando}
                loadingText="Buscando..."
                onClick={onBuscar}
                title={AYUDA_FILTROS_Y_BUSCAR}
              >
                <Search size={14} />
                Buscar
              </CustomButton>
            </div>
          </div>
          {!fechasCompletas ? (
            <p className="text-xs italic text-slate-400">Selecciona fecha de inicio y fin para buscar pedidos.</p>
          ) : (
            <p
              className={`flex items-center gap-1.5 text-xs ${
                hayGruposConPedidos ? "font-medium text-amber-600" : "italic text-slate-400"
              }`}
            >
              {hayGruposConPedidos ? <AlertTriangle size={13} className="shrink-0" /> : null}
              {AYUDA_FILTROS_Y_BUSCAR}
            </p>
          )}
          <div className="relative w-72">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={filtros.busqueda}
              onChange={(evento) => onCambiar({ busqueda: evento.target.value })}
              placeholder="Buscar en lo ya cargado..."
              className="w-full rounded-xl border border-gray-200 bg-brand-white py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
