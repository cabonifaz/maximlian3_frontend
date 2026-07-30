import { CONFIGURACION_CAMPOS_POR_MAESTRO, REGISTROS_POR_PAGINA } from "@maximilian/shared/constants/pages/Administrador/configuracion-parametros.constants";
import type {
  ColumnasVisiblesParametro,
  ConfiguracionCamposParametro,
  FormularioParametro,
} from "@maximilian/shared/types/configuracion-parametros.type";
import {
  TablaMaestraId,
  type EntradaTablaMaestra,
} from "@maximilian/shared/types/tabla-maestra.type";

export function normalizarTextoParametro(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function obtenerNumeroParametro(parametro: EntradaTablaMaestra) {
  return String(parametro.num1 ?? "");
}

export function obtenerCodigoParametro(parametro: EntradaTablaMaestra) {
  return parametro.string2?.trim() || "";
}

export function obtenerReferenciaParametro(parametro: EntradaTablaMaestra) {
  return parametro.num2 != null ? String(parametro.num2) : "";
}

export function obtenerDescripcionParametro(parametro: EntradaTablaMaestra) {
  return parametro.string1?.trim() || parametro.descripcion?.trim() || "";
}

export function obtenerEtiquetaCodigoDescripcionParametro(parametro: EntradaTablaMaestra) {
  const codigo = obtenerCodigoParametro(parametro);
  const descripcion = obtenerDescripcionParametro(parametro);

  return [codigo, descripcion].filter(Boolean).join(" - ");
}

export function obtenerEtiquetaReferenciaParametro(
  parametro: EntradaTablaMaestra,
  opcionesReferencia: EntradaTablaMaestra[] | undefined,
  configuracion: ConfiguracionCamposParametro,
) {
  const referencia = parametro.num2;
  if (referencia == null) return "";

  const opcionReferencia = opcionesReferencia?.find(
    (opcion) => opcion.num1 === referencia,
  );

  if (!opcionReferencia) return String(referencia);

  if (configuracion.mostrarReferenciaConCodigo) {
    return obtenerEtiquetaCodigoDescripcionParametro(opcionReferencia);
  }

  return opcionReferencia.string1?.trim() || String(referencia);
}

export function obtenerSimboloParametro(parametro: EntradaTablaMaestra) {
  return parametro.string3?.trim() || "";
}

export function obtenerConfiguracionCamposParametro(
  idMaestro: number,
): ConfiguracionCamposParametro {
  return CONFIGURACION_CAMPOS_POR_MAESTRO[idMaestro as TablaMaestraId] ?? {};
}

export function obtenerTraduccionInglesParametro(parametro: EntradaTablaMaestra) {
  return parametro.string4?.trim() || "";
}

export function obtenerDetalleInglesParametro(parametro: EntradaTablaMaestra) {
  return parametro.string5?.trim() || "";
}

export function obtenerTraduccionPortuguesParametro(parametro: EntradaTablaMaestra) {
  return parametro.string6?.trim() || "";
}

export function obtenerDetallePortuguesParametro(parametro: EntradaTablaMaestra) {
  return parametro.string7?.trim() || "";
}

function tieneValorTexto(valor?: string | null) {
  return Boolean(valor?.trim());
}

export function obtenerColumnasVisiblesParametro(
  parametros: EntradaTablaMaestra[] | undefined,
  configuracion: ConfiguracionCamposParametro,
): ColumnasVisiblesParametro {
  const lista = parametros ?? [];

  return {
    codigo:
      Boolean(configuracion.etiquetaCodigo) ||
      lista.some((parametro) => tieneValorTexto(parametro.string2)),
    referencia:
      Boolean(configuracion.etiquetaReferencia) ||
      lista.some((parametro) => parametro.num2 != null),
    detalle:
      Boolean(configuracion.etiquetaDetalle) ||
      lista.some((parametro) => tieneValorTexto(parametro.string3)),
    ingles: lista.some(
      (parametro) =>
        tieneValorTexto(parametro.string4) ||
        tieneValorTexto(parametro.string5),
    ),
    portugues: lista.some(
      (parametro) =>
        tieneValorTexto(parametro.string6) ||
        tieneValorTexto(parametro.string7),
    ),
  };
}

export function obtenerClaveRegistroParametro(parametro: EntradaTablaMaestra) {
  if (parametro.idTablaMaestra != null) return `tabla-${parametro.idTablaMaestra}`;

  return [
    "maestro",
    parametro.idMaestro,
    "num",
    parametro.num1 ?? "",
    "numero",
    obtenerNumeroParametro(parametro),
  ].join("-");
}

export function crearValoresFormularioParametro(
  parametro?: EntradaTablaMaestra,
): FormularioParametro {
  return {
    codigo: parametro ? obtenerCodigoParametro(parametro) : "",
    referencia: parametro ? obtenerReferenciaParametro(parametro) : "",
    descripcion: parametro ? obtenerDescripcionParametro(parametro) : "",
    detalle: parametro ? obtenerSimboloParametro(parametro) : "",
    traduccionIngles1: parametro
      ? obtenerTraduccionInglesParametro(parametro)
      : "",
    traduccionIngles2: parametro ? obtenerDetalleInglesParametro(parametro) : "",
    traduccionPortugues1: parametro
      ? obtenerTraduccionPortuguesParametro(parametro)
      : "",
    traduccionPortugues2: parametro
      ? obtenerDetallePortuguesParametro(parametro)
      : "",
  };
}

export function filtrarParametros(
  parametros: EntradaTablaMaestra[] | undefined,
  filtro: string,
) {
  const termino = normalizarTextoParametro(filtro);
  const lista = parametros ?? [];
  if (!termino) return lista;

  return lista.filter((parametro) =>
    [
      obtenerNumeroParametro(parametro),
      obtenerCodigoParametro(parametro),
      obtenerReferenciaParametro(parametro),
      obtenerDescripcionParametro(parametro),
      obtenerSimboloParametro(parametro),
      obtenerTraduccionInglesParametro(parametro),
      obtenerDetalleInglesParametro(parametro),
      obtenerTraduccionPortuguesParametro(parametro),
      obtenerDetallePortuguesParametro(parametro),
    ].some((valor) => normalizarTextoParametro(valor).includes(termino)),
  );
}

export function obtenerTotalPaginasParametros(totalRegistros: number) {
  return Math.max(1, Math.ceil(totalRegistros / REGISTROS_POR_PAGINA));
}

export function paginarParametros<T>(registros: T[], paginaActual: number) {
  return registros.slice(
    (paginaActual - 1) * REGISTROS_POR_PAGINA,
    paginaActual * REGISTROS_POR_PAGINA,
  );
}

export function obtenerPaginasParametros(paginaActual: number, totalPaginas: number) {
  const paginasVisibles = new Set([
    1,
    totalPaginas,
    paginaActual - 1,
    paginaActual,
    paginaActual + 1,
  ]);
  const paginasOrdenadas = Array.from(paginasVisibles)
    .filter((pagina) => pagina >= 1 && pagina <= totalPaginas)
    .sort((paginaA, paginaB) => paginaA - paginaB);

  return paginasOrdenadas.reduce<Array<number | "puntos">>(
    (acumulado, pagina, indice) => {
      const paginaAnterior = paginasOrdenadas[indice - 1];

      if (paginaAnterior && pagina - paginaAnterior > 1) {
        acumulado.push("puntos");
      }

      acumulado.push(pagina);
      return acumulado;
    },
    [],
  );
}
