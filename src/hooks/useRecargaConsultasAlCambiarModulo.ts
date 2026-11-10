import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { useQueryClient, type Query } from "@tanstack/react-query";
import { CLAVE_CONSULTA_TABLA_MAESTRA } from "@maximilian/shared/constants/tabla-maestra.constants";

function esConsultaDeModulo(consulta: Query) {
  return consulta.queryKey[0] !== CLAVE_CONSULTA_TABLA_MAESTRA;
}

// Al cambiar de módulo (ruta) se marcan como desactualizadas las consultas: el módulo que entra vuelve a pedir
// sus datos y los demás lo harán cuando se vuelva a ellos. Dentro de un módulo (tabs, filtros) se usa la caché.
export function useRecargaConsultasAlCambiarModulo() {
  const { pathname } = useLocation();
  const clienteConsultas = useQueryClient();
  const rutaAnterior = useRef(pathname);

  useEffect(() => {
    if (rutaAnterior.current === pathname) return;
    rutaAnterior.current = pathname;

    void clienteConsultas.invalidateQueries(
      { predicate: esConsultaDeModulo },
      { cancelRefetch: false },
    );
  }, [clienteConsultas, pathname]);
}
