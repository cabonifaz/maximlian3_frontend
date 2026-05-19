import { Download, FileText, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";

interface PropsCustomModalVistaPreviaTraductor {
  estaAbierto: boolean;
  datosInvestigacion: DatosInvestigacionAnalista;
  onCerrar: () => void;
}

function obtenerFilasIdentificacion(datosInvestigacion: DatosInvestigacionAnalista) {
  const identificacion = datosInvestigacion.identificacion;

  return [
    { etiqueta: "Company Name", valorTraducido: identificacion.nombreEmpresa || "-", valorOriginal: identificacion.nombreEmpresa || "-" },
    { etiqueta: "Trade Name", valorTraducido: identificacion.nombreComercial || "-", valorOriginal: identificacion.nombreComercial || "-" },
    { etiqueta: "Tax ID Type", valorTraducido: identificacion.tipoIdentificacionFiscal || "-", valorOriginal: identificacion.tipoIdentificacionFiscal || "-" },
    { etiqueta: "Tax ID Number", valorTraducido: identificacion.numeroIdentificacionFiscal || "-", valorOriginal: identificacion.numeroIdentificacionFiscal || "-" },
    { etiqueta: "Address", valorTraducido: identificacion.direccionPrincipal || "-", valorOriginal: identificacion.direccionPrincipal || "-" },
    { etiqueta: "City/Province/State", valorTraducido: identificacion.ciudadEstadoProvincia || "-", valorOriginal: identificacion.ciudadEstadoProvincia || "-" },
    { etiqueta: "Phone", valorTraducido: identificacion.numeroTelefono || "-", valorOriginal: identificacion.numeroTelefono || "-" },
    { etiqueta: "Email", valorTraducido: identificacion.correoElectronico || "-", valorOriginal: identificacion.correoElectronico || "-" },
    { etiqueta: "Website", valorTraducido: identificacion.paginaWeb || "-", valorOriginal: identificacion.paginaWeb || "-" },
  ];
}

function TarjetaVistaPrevia({
  titulo,
  indicador,
  encabezado,
  filas,
  observaciones,
}: {
  titulo: string;
  indicador: string;
  encabezado: {
    pais: string;
    fecha: string;
    tipoSolicitud: string;
    analista: string;
    traductor: string;
  };
  filas: Array<{ etiqueta: string; valorTraducido: string; valorOriginal: string }>;
  observaciones: string;
}) {
  return (
    <article className="min-h-[540px] rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">{titulo}</p>
            <p className="text-xs font-semibold text-slate-500">Safety Report</p>
          </div>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
          {indicador}
        </span>
      </div>

      <div className="mb-6 border-b border-gray-100 pb-5 text-[11px] leading-5 text-slate-500">
        <p><span className="font-bold text-slate-700">Country:</span> {encabezado.pais}</p>
        <p><span className="font-bold text-slate-700">Date of Request:</span> {encabezado.fecha}</p>
        <p><span className="font-bold text-slate-700">Type of Report:</span> {encabezado.tipoSolicitud}</p>
        <p><span className="font-bold text-slate-700">Analyst:</span> {encabezado.analista}</p>
        <p><span className="font-bold text-slate-700">Translator:</span> {encabezado.traductor}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-center text-xs font-bold uppercase tracking-[0.16em] text-slate-700">
            Confidential Report
          </h3>
          <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Identification
          </p>
        </div>

        <div className="space-y-3 text-[11px] leading-5 text-slate-600">
          {filas.map((fila) => (
            <div key={fila.etiqueta} className="grid gap-2 border-b border-gray-50 pb-3 md:grid-cols-[132px_minmax(0,1fr)]">
              <p className="font-bold uppercase tracking-[0.14em] text-slate-400">{fila.etiqueta}</p>
              <p>{fila.valorTraducido}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-[11px] leading-5 text-slate-600">
          <p className="mb-2 font-bold uppercase tracking-[0.14em] text-slate-400">Remarks of Identification</p>
          <p>{observaciones || "No additional remarks were recorded for this section."}</p>
        </div>
      </div>
    </article>
  );
}

export function CustomModalVistaPreviaTraductor({
  estaAbierto,
  datosInvestigacion,
  onCerrar,
}: PropsCustomModalVistaPreviaTraductor) {
  if (!estaAbierto) return null;

  const filas = obtenerFilasIdentificacion(datosInvestigacion);
  const encabezado = {
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
          <div className="grid gap-6 xl:grid-cols-2">
            <TarjetaVistaPrevia
              titulo="Reporte original (español)"
              indicador="Original"
              encabezado={encabezado}
              filas={filas}
              observaciones={datosInvestigacion.identificacion.datosAdicionales}
            />
            <TarjetaVistaPrevia
              titulo="Reporte traducido (inglés)"
              indicador="En traducción"
              encabezado={encabezado}
              filas={filas}
              observaciones={datosInvestigacion.identificacion.datosAdicionales}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-white px-7 py-5">
          <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
            Cerrar
          </CustomButton>
          <CustomButton size="sm" onClick={() => window.print()}>
            <Download size={14} />
            Descargar PDF
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
