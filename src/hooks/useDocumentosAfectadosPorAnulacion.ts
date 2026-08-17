import { useQuery } from "@tanstack/react-query";
import { facturacionService } from "@maximilian/services/facturacion.service";

export type ModoConsultaAnulacion = "normal" | "manual";

export function useDocumentosAfectadosPorAnulacion(
  idDocumentoElectronico: number | null,
  modo: ModoConsultaAnulacion,
) {
  const consulta = useQuery({
    queryKey: ["facturacion", "anularPreview", modo, idDocumentoElectronico],
    queryFn: () =>
      modo === "manual"
        ? facturacionService.obtenerDocumentosAfectadosPorAnulacionManual(
            idDocumentoElectronico!,
          )
        : facturacionService.obtenerDocumentosAfectadosPorAnulacion([
            idDocumentoElectronico!,
          ]),
    enabled: idDocumentoElectronico !== null,
  });

  const notasDependientes = (consulta.data ?? []).filter(
    (documento) => documento.idDocumentoElectronico !== idDocumentoElectronico,
  );

  return {
    notasDependientes,
    cargandoNotasDependientes: consulta.isLoading,
    errorNotasDependientes: consulta.isError,
  };
}
