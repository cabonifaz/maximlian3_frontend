import type { Query, QueryClient } from "@tanstack/react-query";
import { CLAVE_CONSULTA_TABLA_MAESTRA } from "@maximilian/shared/constants/tabla-maestra.constants";
import { iniciarTransicionSolicitudesPorCambioRol } from "@maximilian/services/maximilian-service";

function esConsultaCompartidaEntreRoles(consulta: Query) {
  return consulta.queryKey[0] === CLAVE_CONSULTA_TABLA_MAESTRA;
}

export async function invalidarConsultasAntesDeCambiarRol(
  clienteConsultas: QueryClient,
) {
  const filtroConsultasPorRol = {
    predicate: (consulta: Query) => !esConsultaCompartidaEntreRoles(consulta),
  };

  await clienteConsultas.cancelQueries(filtroConsultasPorRol);
  iniciarTransicionSolicitudesPorCambioRol();
  await clienteConsultas.invalidateQueries({
    ...filtroConsultasPorRol,
    refetchType: "none",
  });
  clienteConsultas.removeQueries(filtroConsultasPorRol);
}
