import type { QueryClient } from "@tanstack/react-query";
import { CLAVES_CONSULTA_AFECTADAS_POR_APROBACION_MIGRACION } from "@maximilian/shared/constants/pages/Coordinador/aprobacion-migraciones.constants";

export function invalidarConsultasAprobacionMigracion(clienteConsultas: QueryClient) {
  return Promise.all(
    CLAVES_CONSULTA_AFECTADAS_POR_APROBACION_MIGRACION.map((clave) =>
      clienteConsultas.invalidateQueries({ queryKey: [clave] })),
  );
}
