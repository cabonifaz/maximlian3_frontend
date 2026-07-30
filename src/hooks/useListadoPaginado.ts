import { useCallback, useState } from "react";
import { useRetardo } from "@maximilian/hooks/useRetardo";

export function useListadoPaginado(busquedaInicial = "") {
  const [terminoBusqueda, setTerminoBusqueda] = useState(busquedaInicial);
  const [paginaActual, setPaginaActual] = useState(1);
  const busquedaConRetardo = useRetardo(terminoBusqueda);

  const cambiarBusqueda = useCallback((valor: string) => {
    setTerminoBusqueda(valor);
    setPaginaActual(1);
  }, []);

  const cambiarPagina = useCallback((pagina: number, totalPaginas: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) setPaginaActual(pagina);
  }, []);

  const reiniciarPagina = useCallback(() => setPaginaActual(1), []);

  return {
    terminoBusqueda,
    paginaActual,
    busquedaConRetardo,
    cambiarBusqueda,
    cambiarPagina,
    reiniciarPagina,
    setPaginaActual,
  };
}
