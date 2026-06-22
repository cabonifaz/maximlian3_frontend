import { CheckCircle2, CircleX, Eye, ShieldCheck } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomDescargaInforme } from "@maximilian/components/coordinador/CustomDescargaInforme";
import { CustomVisorPdf } from "@maximilian/components/coordinador/CustomVisorPdf";
import type { FormatoDescargaInforme } from "@maximilian/shared/types/informe.type";

interface PropsCustomVisorRevisionInforme {
  documentoUrl?: string;
  nombreDocumento?: string;
  estaCargandoDocumento: boolean;
  errorDocumento: boolean;
  puedeEditar: boolean;
  esEjemplo: boolean;
  onCerrar: () => void;
  onDescargar: (formato: FormatoDescargaInforme) => void;
  onAprobar: () => void;
  onRechazar: () => void;
  onVolver: () => void;
}

export function CustomVisorRevisionInforme({
  documentoUrl,
  nombreDocumento,
  estaCargandoDocumento,
  errorDocumento,
  puedeEditar,
  esEjemplo,
  onCerrar,
  onDescargar,
  onAprobar,
  onRechazar,
  onVolver,
}: PropsCustomVisorRevisionInforme) {
  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-slate-100">
      <header className="z-30 shrink-0 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-black">{"Revisi\u00f3n y Aprobaci\u00f3n"}</h1>
              <p className="text-sm text-slate-500">
                {esEjemplo
                  ? "Vista de ejemplo para el flujo de aprobaci\u00f3n."
                  : "Revisi\u00f3n del informe original en espa\u00f1ol."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
              Cerrar
            </CustomButton>
            <CustomDescargaInforme
              deshabilitado={!documentoUrl}
              onDescargar={onDescargar}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
              {nombreDocumento || "Informe original"}
            </p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {"(Espa\u00f1ol)"}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <CustomButton
              variant="secondary"
              size="sm"
              className="border-green-400 text-green-600"
              disabled={!puedeEditar}
              onClick={onAprobar}
            >
              <CheckCircle2 size={14} />
              Aprobar
            </CustomButton>
            <CustomButton
              variant="secondary"
              size="sm"
              className="border-red-400 text-red-500"
              disabled={!puedeEditar}
              onClick={onRechazar}
            >
              <CircleX size={14} />
              Rechazar
            </CustomButton>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Original
            </span>
          </div>
        </div>
      </header>

      <main className="min-h-0 w-full flex-1 p-1.5 sm:p-2">
        {documentoUrl ? (
          <CustomVisorPdf urlDocumento={documentoUrl} />
        ) : estaCargandoDocumento ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            {"Obteniendo documento para revisi\u00f3n..."}
          </div>
        ) : errorDocumento ? (
          <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center text-sm text-red-600">
            {"No se pudo obtener el documento PDF para la revisi\u00f3n."}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
            {"No se encontr\u00f3 un documento PDF para este informe."}
          </div>
        )}
      </main>

      <footer className="z-30 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Eye size={16} />
          {esEjemplo ? "Ejemplo de revisi\u00f3n" : "Revisi\u00f3n activa"}
        </div>
        <CustomButton variant="secondary" size="sm" onClick={onVolver}>
          Volver a informes
        </CustomButton>
      </footer>
    </div>
  );
}
