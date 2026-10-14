import { useCallback } from "react";
import { toast } from "sonner";
import { informeService } from "@maximilian/services/informe.service";
import type { FormatoDescargaInforme } from "@maximilian/shared/types/informe.type";

export function useDescargaInforme() {
  return useCallback(async (
    idInforme: number,
    idPedido: number,
    formato: FormatoDescargaInforme,
  ) => {
    const etiquetaFormato = formato.slice(1).toUpperCase();
    const idToast = toast.loading(`Descargando documento ${etiquetaFormato}...`);
    try {
      const documentoDescarga = await informeService.obtenerDocumento(idInforme, idPedido, formato);
      const enlace = document.createElement("a");
      enlace.href = documentoDescarga.url;
      enlace.rel = "noopener noreferrer";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      toast.dismiss(idToast);
    } catch {
      toast.error(`No se pudo descargar el documento ${etiquetaFormato}.`, { id: idToast });
    }
  }, []);
}
