import type { Query, QueryClient } from "@tanstack/react-query";
import { cancelarSolicitudesPendientesPorCambioRol } from "@maximilian/services/maximilian-service";

function esConsultaCompartidaEntreRoles(consulta: Query) {
  return consulta.queryKey[0] === "masterTable";
}

export async function invalidarConsultasAntesDeCambiarRol(
  clienteConsultas: QueryClient,
) {
  const filtroConsultasPorRol = {
    predicate: (consulta: Query) => !esConsultaCompartidaEntreRoles(consulta),
  };

  await clienteConsultas.cancelQueries(filtroConsultasPorRol);
  cancelarSolicitudesPendientesPorCambioRol();
  await clienteConsultas.invalidateQueries({
    ...filtroConsultasPorRol,
    refetchType: "none",
  });
  clienteConsultas.removeQueries(filtroConsultasPorRol);
}
