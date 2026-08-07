import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { verificacionFacturaService } from "@maximilian/services/verificacion-factura.service";
import { esErrorRespuestaApi } from "@maximilian/shared/types/api.type";
import type { FormatoDescargaFactura } from "@maximilian/shared/types/facturacion.type";

export function useVerificacionFactura(token: string | undefined) {
  const [formatoDescargando, setFormatoDescargando] =
    useState<FormatoDescargaFactura | null>(null);
  const [errorDescarga, setErrorDescarga] = useState("");

  const {
    data: factura,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["verificacionFactura", token],
    queryFn: () => verificacionFacturaService.obtenerFactura(token as string),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });

  const mensajeError = esErrorRespuestaApi(error)
    ? error.respuesta.mensaje
    : "No se pudo cargar la información de la factura.";

  const descargar = async (formato: FormatoDescargaFactura) => {
    if (!token) return;

    setErrorDescarga("");
    setFormatoDescargando(formato);
    try {
      const urlDescarga = await verificacionFacturaService.obtenerUrlDescarga(
        token,
        formato,
      );
      window.open(urlDescarga, "_blank", "noopener,noreferrer");
    } catch {
      setErrorDescarga("No se pudo generar la descarga. Intenta nuevamente.");
    } finally {
      setFormatoDescargando(null);
    }
  };

  return {
    descargar,
    errorDescarga,
    factura,
    formatoDescargando,
    isError,
    isLoading,
    mensajeError,
  };
}
