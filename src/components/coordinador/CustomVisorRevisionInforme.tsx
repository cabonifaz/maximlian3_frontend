import { CheckCircle2, CircleX, Eye, ShieldCheck } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomDescargaInforme } from "@maximilian/components/coordinador/CustomDescargaInforme";
import {
  CustomVistaPreviaInformeComparado,
  type EncabezadoVistaPreviaInforme,
} from "@maximilian/components/common/CustomVistaPreviaInforme";
import type { FormatoDescargaInforme } from "@maximilian/shared/types/informe.type";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";

interface PropsCustomVisorRevisionInforme {
  datosInvestigacion?: DatosInvestigacionAnalista;
  encabezado: EncabezadoVistaPreviaInforme;
  idInforme?: number;
  idPedido?: number;
  puedeDescargar: boolean;
  puedeDescargarXml?: boolean;
  puedeEditar: boolean;
  tituloInforme?: string;
  idiomaInforme?: string;
  mostrarAccionesRevision?: boolean;
  mostrarInformeTraducido?: boolean;
  mostrarPie?: boolean;
  mostrarCerrar?: boolean;
  ocuparAltoDisponible?: boolean;
  onCerrar: () => void;
  onDescargar: (formato: FormatoDescargaInforme) => void;
  onAprobar: () => void;
  onRechazar: () => void;
  onVolver: () => void;
}

export function CustomVisorRevisionInforme({
  datosInvestigacion,
  encabezado,
  idInforme,
  idPedido,
  puedeDescargar,
  puedeDescargarXml = false,
  puedeEditar,
  tituloInforme = "Informe original",
  idiomaInforme = "Espa\u00f1ol",
  mostrarAccionesRevision = true,
  mostrarInformeTraducido = false,
  mostrarPie = true,
  mostrarCerrar = true,
  ocuparAltoDisponible = false,
  onCerrar,
  onDescargar,
  onAprobar,
  onRechazar,
  onVolver,
}: PropsCustomVisorRevisionInforme) {
  const tieneDocumento = Number.isFinite(Number(idInforme)) && Number(idInforme) > 0
    && Number.isFinite(Number(idPedido)) && Number(idPedido) > 0;

  return (
    <div className={`relative flex min-h-0 flex-col overflow-hidden bg-slate-100 ${ocuparAltoDisponible ? "h-full" : "h-[calc(100vh-4rem)]"}`}>
      <header className="z-30 shrink-0 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-black">{"Revisi\u00f3n y Aprobaci\u00f3n"}</h1>
              <p className="text-sm text-slate-500">
                {`Revision de ${tituloInforme.toLowerCase()}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {mostrarCerrar ? (
              <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
                Cerrar
              </CustomButton>
            ) : null}
            <CustomDescargaInforme
              deshabilitado={!puedeDescargar}
              puedeDescargarXml={puedeDescargarXml}
              onDescargar={onDescargar}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
              {tituloInforme}
            </p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              ({idiomaInforme})
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {mostrarAccionesRevision ? (
              <>
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
              </>
            ) : null}
            <span className="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {mostrarInformeTraducido ? "Traducido" : "Original"}
            </span>
          </div>
        </div>
      </header>

      <main className="min-h-0 w-full flex-1 overflow-hidden bg-slate-50 p-3 sm:p-4">
        {datosInvestigacion || tieneDocumento ? (
          <CustomVistaPreviaInformeComparado
            datosInvestigacion={datosInvestigacion}
            encabezado={encabezado}
            idInforme={idInforme}
            idPedido={idPedido}
            mostrarInformeTraducido={mostrarInformeTraducido}
            ocuparAltoDisponibleDocumento={ocuparAltoDisponible}
            className="mx-auto flex h-full max-w-6xl flex-col space-y-3"
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
            {"No se encontr\u00f3 informaci\u00f3n para generar la vista previa."}
          </div>
        )}
      </main>

      {mostrarPie ? (
        <footer className="z-30 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Eye size={16} />
            Revision activa
          </div>
          <CustomButton variant="secondary" size="sm" onClick={onVolver}>
            Volver a informes
          </CustomButton>
        </footer>
      ) : null}
    </div>
  );
}
