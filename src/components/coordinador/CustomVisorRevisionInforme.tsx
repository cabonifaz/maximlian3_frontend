import { ArrowLeft, CheckCircle2, CircleX, ShieldCheck } from "lucide-react";
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
  tipoPlantilla?: string;
  mostrarAccionesRevision?: boolean;
  mostrarInformeTraducido?: boolean;
  mostrarPie?: boolean;
  mostrarCerrar?: boolean;
  mostrarRegresar?: boolean;
  mostrarEncabezadoRevision?: boolean;
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
  tipoPlantilla,
  mostrarAccionesRevision = true,
  mostrarInformeTraducido = false,
  mostrarPie = true,
  mostrarRegresar = true,
  mostrarEncabezadoRevision = true,
  ocuparAltoDisponible = false,
  onDescargar,
  onAprobar,
  onRechazar,
  onVolver,
}: PropsCustomVisorRevisionInforme) {
  const tieneDocumento =
    Number.isFinite(Number(idInforme)) &&
    Number(idInforme) > 0 &&
    Number.isFinite(Number(idPedido)) &&
    Number(idPedido) > 0;
  const textoPlantilla = tipoPlantilla || "Plantilla no definida";

  const renderControlesRevision = (className: string) => (
    <div className={className}>
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
      <CustomDescargaInforme
        deshabilitado={!puedeDescargar}
        puedeDescargarXml={puedeDescargarXml}
        onDescargar={onDescargar}
      />
    </div>
  );

  return (
    <div
      className={`relative flex min-h-0 flex-col overflow-hidden bg-slate-100 ${ocuparAltoDisponible ? "h-full" : "h-[calc(100vh-4rem)]"}`}
    >
      <header className="z-30 shrink-0 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0 text-left">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Plantilla
              </p>
              <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
                {textoPlantilla}
              </p>
            </div>

            {!mostrarInformeTraducido && mostrarEncabezadoRevision ? (
              <>
                <div className="h-9 w-px shrink-0 bg-slate-200" />
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <ShieldCheck size={20} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold text-brand-black">
                    {"Revisi\u00f3n y Aprobaci\u00f3n"}
                  </h1>
                  <p className="truncate text-sm text-slate-500">
                    {`Revision de ${tituloInforme.toLowerCase()}.`}
                  </p>
                </div>
              </>
            ) : null}
          </div>

          {renderControlesRevision(
            "flex flex-wrap items-center justify-end gap-2",
          )}
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
            tituloBarraDocumento={tituloInforme}
            subtituloBarraDocumento={idiomaInforme}
            className="mx-auto flex h-full max-w-6xl flex-col space-y-3"
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
            {
              "No se encontr\u00f3 informaci\u00f3n para generar la vista previa."
            }
          </div>
        )}
      </main>

      {mostrarPie && mostrarRegresar ? (
        <footer className="z-30 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
          <CustomButton variant="secondary" size="sm" onClick={onVolver}>
            <ArrowLeft size={14} />
            Regresar
          </CustomButton>
        </footer>
      ) : null}
    </div>
  );
}
