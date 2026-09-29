import {
  MAXIMO_ELEMENTOS_PAGINACION,
  PAGINAS_VECINAS_PAGINACION,
  SEPARADOR_PAGINACION,
} from "@maximilian/shared/constants/components/common/custom-paginacion-tabla.constants";

export type ElementoPaginacion = number | typeof SEPARADOR_PAGINACION;

function crearRango(inicio: number, fin: number) {
  return Array.from({ length: fin - inicio + 1 }, (_, indice) => inicio + indice);
}

/**
 * Mantiene siempre la misma cantidad de elementos visibles para que los botones
 * no "salten" de posición al navegar: primera y última página fijas, un bloque
 * central alrededor de la página actual y separadores solo cuando ocultan páginas.
 */
export function obtenerElementosPaginacion(
  paginaActual: number,
  totalPaginas: number,
): ElementoPaginacion[] {
  if (totalPaginas <= MAXIMO_ELEMENTOS_PAGINACION) {
    return crearRango(1, totalPaginas);
  }

  const paginasBorde = MAXIMO_ELEMENTOS_PAGINACION - 2;
  const umbralInicio = paginasBorde - PAGINAS_VECINAS_PAGINACION;

  if (paginaActual <= umbralInicio) {
    return [...crearRango(1, paginasBorde), SEPARADOR_PAGINACION, totalPaginas];
  }

  if (paginaActual > totalPaginas - umbralInicio) {
    return [
      1,
      SEPARADOR_PAGINACION,
      ...crearRango(totalPaginas - paginasBorde + 1, totalPaginas),
    ];
  }

  return [
    1,
    SEPARADOR_PAGINACION,
    ...crearRango(
      paginaActual - PAGINAS_VECINAS_PAGINACION,
      paginaActual + PAGINAS_VECINAS_PAGINACION,
    ),
    SEPARADOR_PAGINACION,
    totalPaginas,
  ];
}

/**
 * Calcula el rango "desde–hasta" sin conocer el tamaño de página: todas las
 * páginas excepto la última vienen completas, así que la cantidad recibida en
 * una página intermedia es el tamaño de página, y la última termina en el total.
 */
export function obtenerRangoRegistrosPagina(
  paginaActual: number,
  totalPaginas: number,
  totalRegistros: number,
  cantidadPagina: number,
) {
  if (totalRegistros === 0 || cantidadPagina === 0) {
    return { desde: 0, hasta: 0 };
  }

  if (paginaActual >= totalPaginas) {
    return {
      desde: Math.max(1, totalRegistros - cantidadPagina + 1),
      hasta: totalRegistros,
    };
  }

  const desde = (paginaActual - 1) * cantidadPagina + 1;
  return { desde, hasta: Math.min(desde + cantidadPagina - 1, totalRegistros) };
}
