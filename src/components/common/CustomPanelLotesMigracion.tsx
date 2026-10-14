import { RotateCcw } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { RegistroLoteMigracion } from "@maximilian/shared/types/informe-migracion.type";

interface PropsCustomPanelLotesMigracion {
  lotes: RegistroLoteMigracion[];
  reintentando: boolean;
  onReintentar: (idLote: string) => void;
}

export function CustomPanelLotesMigracion({ lotes, reintentando, onReintentar }: PropsCustomPanelLotesMigracion) {
  if (!lotes.length) return null;
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-brand-black">Procesamiento por lotes</h2>
      <div className="mt-4 space-y-3">
        {lotes.map((lote) => {
          const procesados = lote.completados + lote.fallidos;
          const porcentaje = lote.total > 0 ? Math.min(100, Math.round((procesados / lote.total) * 100)) : 0;
          return <div key={lote.idLote} className="rounded-2xl border border-gray-100 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="font-semibold text-slate-700">{lote.nombre}</p><p className="mt-1 text-xs text-gray-400">{lote.estadoDescripcion} · {lote.completados} completados · {lote.fallidos} fallidos</p></div>{lote.puedeReintentar ? <CustomButton size="sm" variant="secondary" loading={reintentando} onClick={() => onReintentar(lote.idLote)}><RotateCcw size={14} /> Reintentar fallidos</CustomButton> : null}</div><div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-brand-wine transition-all" style={{ width: `${porcentaje}%` }} /></div></div>;
        })}
      </div>
    </section>
  );
}
