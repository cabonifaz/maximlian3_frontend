import { X } from "lucide-react";
import {
  CustomVistaPreviaInformeComparado,
  type EncabezadoVistaPreviaInforme,
} from "@maximilian/components/common/CustomVistaPreviaInforme";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";

interface PropsCustomModalVistaPreviaInforme {
  estaAbierto: boolean;
  datosInvestigacion: DatosInvestigacionAnalista;
  encabezado: EncabezadoVistaPreviaInforme;
  idPedido?: number;
  mostrarInformeTraducido?: boolean;
  onCerrar: () => void;
}

export function CustomModalVistaPreviaInforme({
  estaAbierto,
  datosInvestigacion,
  encabezado,
  idPedido,
  mostrarInformeTraducido = false,
  onCerrar,
}: PropsCustomModalVistaPreviaInforme) {
  if (!estaAbierto) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Vista previa</p>
            <h2 className="mt-0.5 text-lg font-bold text-slate-800">Reporte de Investigación</h2>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar vista previa">
            <X size={20} className="text-slate-500" />
          </CustomButton>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6">
          <CustomVistaPreviaInformeComparado
            datosInvestigacion={datosInvestigacion}
            encabezado={encabezado}
            idPedido={idPedido}
            mostrarInformeTraducido={mostrarInformeTraducido}
            className="space-y-3"
          />
        </div>
      </div>
    </div>
  );
}
