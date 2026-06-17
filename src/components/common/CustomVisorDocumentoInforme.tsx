import type { DocumentoInformeGenerado } from "@maximilian/shared/types/informe.type";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";

interface PropsCustomVisorDocumentoInforme {
  documento: DocumentoInformeGenerado;
  datosInvestigacion?: DatosInvestigacionAnalista;
  encabezado?: {
    pais: string;
    fecha: string;
    tipoSolicitud: string;
    analista: string;
    traductor: string;
  };
}

export function CustomVisorDocumentoInforme({ documento }: PropsCustomVisorDocumentoInforme) {
  const html = documento.html?.trim();

  if (!html) {
    return (
      <div className="rounded border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        La plantilla no contiene HTML para renderizar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div
        className="mx-auto min-w-[760px]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
