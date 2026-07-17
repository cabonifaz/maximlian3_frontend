import type { Query, QueryClient } from "@tanstack/react-query";

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
  await clienteConsultas.invalidateQueries({
    ...filtroConsultasPorRol,
    refetchType: "none",
  });
  clienteConsultas.removeQueries(filtroConsultasPorRol);
}
