import { type ReactNode } from "react";
import { Download, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import {
  CustomVistaPreviaInformeComparado,
  type EncabezadoVistaPreviaInforme,
} from "@maximilian/components/common/CustomVistaPreviaInforme";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";

interface PropsCustomModalVistaPreviaTraductor {
  estaAbierto: boolean;
  datosInvestigacion: DatosInvestigacionAnalista;
  idPedido?: number;
  onCerrar: () => void;
  indicadorReporteTraducido?: string;
  footer?: ReactNode;
}

export function CustomModalVistaPreviaTraductor({
  estaAbierto,
  datosInvestigacion,
  idPedido,
  onCerrar,
  indicadorReporteTraducido = "En traducción",
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#151d33] px-7 py-5 text-white">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Vista previa del informe</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto bg-slate-50 px-6 py-6">
          <CustomVistaPreviaInformeComparado
            datosInvestigacion={datosInvestigacion}
            encabezado={encabezado}
            idPedido={idPedido}
            indicadorReporteTraducido={indicadorReporteTraducido}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-white px-7 py-5">
          {footer ?? (
            <>
              <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
                Cerrar
              </CustomButton>
              <CustomButton size="sm" onClick={() => window.print()}>
                <Download size={14} />
                Descargar PDF
              </CustomButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
