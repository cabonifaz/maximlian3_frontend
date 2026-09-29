import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  crearEsquemaIrAPagina,
  type DatosFormularioIrAPagina,
} from "@maximilian/schemas/paginacion.schema";
import {
  MAXIMO_ELEMENTOS_PAGINACION,
} from "@maximilian/shared/constants/components/common/custom-paginacion-tabla.constants";
import {
  obtenerElementosPaginacion,
  obtenerRangoRegistrosPagina,
} from "@maximilian/shared/utils/paginacion.util";

interface ParametrosUsePaginacionTabla {
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  cantidadPagina: number;
  onPaginaChange: (pagina: number) => void;
}

export function usePaginacionTabla({
  paginaActual,
  totalPaginas,
  totalRegistros,
  cantidadPagina,
  onPaginaChange,
}: ParametrosUsePaginacionTabla) {
  const totalPaginasSeguro = Math.max(1, totalPaginas);

  const formularioIrAPagina = useForm<DatosFormularioIrAPagina>({
    resolver: zodResolver(crearEsquemaIrAPagina(totalPaginasSeguro)),
    defaultValues: { paginaDestino: "" },
    mode: "onSubmit",
  });

  const irAPagina = formularioIrAPagina.handleSubmit(({ paginaDestino }) => {
    const pagina = Number(paginaDestino);
    formularioIrAPagina.reset();
    if (pagina !== paginaActual) onPaginaChange(pagina);
  });

  return {
    elementosPaginacion: obtenerElementosPaginacion(
      paginaActual,
      totalPaginasSeguro,
    ),
    rangoRegistros: obtenerRangoRegistrosPagina(
      paginaActual,
      totalPaginasSeguro,
      totalRegistros,
      cantidadPagina,
    ),
    totalPaginasSeguro,
    esPrimeraPagina: paginaActual <= 1,
    esUltimaPagina: paginaActual >= totalPaginasSeguro,
    mostrarIrAPagina: totalPaginasSeguro > MAXIMO_ELEMENTOS_PAGINACION,
    formularioIrAPagina,
    irAPagina,
  };
}
