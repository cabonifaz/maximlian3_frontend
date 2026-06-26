import { type ReactNode } from "react";
import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import {
  CustomVistaPreviaInformeComparado,
  type EncabezadoVistaPreviaInforme,
} from "@maximilian/components/common/CustomVistaPreviaInforme";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";

interface PropsCustomModalVistaPreviaTraductor {
  estaAbierto: boolean;
  datosInvestigacion: DatosInvestigacionAnalista;
  idInforme?: number;
  idPedido?: number;
  onCerrar: () => void;
  indicadorReporteTraducido?: string;
  footer?: ReactNode;
}

export function CustomModalVistaPreviaTraductor({
  estaAbierto,
  datosInvestigacion,
  idInforme,
  idPedido,
  onCerrar,
  indicadorReporteTraducido = "Traducido",
  footer,
}: PropsCustomModalVistaPreviaTraductor) {
  if (!estaAbierto) return null;

  const encabezado: EncabezadoVistaPreviaInforme = {
    pais: datosInvestigacion.resumen.pais || "-",
    fecha: "31/12/2025",
    tipoSolicitud: datosInvestigacion.resumen.prioridad || "-",
    analista: "AN001",
    traductor: "TR0010",
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Vista previa</p>
            <h2 className="mt-0.5 text-lg font-bold text-slate-800">Reporte de Investigacion</h2>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar vista previa">
            <X size={20} className="text-slate-500" />
          </CustomButton>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6">
          <CustomVistaPreviaInformeComparado
            datosInvestigacion={datosInvestigacion}
            encabezado={encabezado}
            idInforme={idInforme}
            idPedido={idPedido}
            indicadorReporteTraducido={indicadorReporteTraducido}
            mostrarInformeTraducido
            className="space-y-3"
          />
        </div>

        {footer ? (
          <div className="flex justify-end gap-3 border-t border-gray-100 bg-white px-7 py-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
