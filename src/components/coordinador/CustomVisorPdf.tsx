import { useEffect, useState } from "react";

interface PropsCustomVisorPdf {
  urlDocumento: string;
}

export function CustomVisorPdf({ urlDocumento }: PropsCustomVisorPdf) {
  const [urlPdf, setUrlPdf] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    const controlador = new AbortController();
    let urlTemporal: string | null = null;

    const cargarDocumento = async () => {
      setUrlPdf(null);
      setMensajeError(null);

      try {
        const respuesta = await fetch(urlDocumento, {
          signal: controlador.signal,
        });
        if (!respuesta.ok) throw new Error("No se pudo descargar el documento");

        const contenido = await respuesta.arrayBuffer();
        const documentoPdf = new Blob([contenido], { type: "application/pdf" });
        urlTemporal = URL.createObjectURL(documentoPdf);
        setUrlPdf(urlTemporal);
      } catch {
        if (!controlador.signal.aborted) {
          setMensajeError("No se pudo cargar el informe para la revisión.");
        }
      }
    };

    void cargarDocumento();

    return () => {
      controlador.abort();
      if (urlTemporal) URL.revokeObjectURL(urlTemporal);
    };
  }, [urlDocumento]);

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {mensajeError ? (
        <div className="m-auto max-w-xl rounded-2xl border border-red-200 bg-white px-6 py-12 text-center text-sm text-red-600">
          {mensajeError}
        </div>
      ) : urlPdf ? (
        <iframe
          title="Vista del informe"
          src={`${urlPdf}`}
          className="h-full w-full border-0 bg-white"
        />
      ) : (
        <div className="m-auto text-sm text-slate-500">Cargando informe...</div>
      )}
    </div>
  );
}
