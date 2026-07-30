import {
  CONFIGURACION_EXTRACCION_POR_SECCION,
  ETIQUETAS_CAMPOS_EXTRACCION,
  ETIQUETAS_SECCIONES_EXTRACCION,
  FILAS_POR_PAGINA_INVESTIGACION,
  SECCIONES_LISTA_EXTRACCION,
} from "@maximilian/shared/constants/pages/Analista/investigacion-analista.constants";
import type {
  AlcanceExtraccionInforme,
  InformeSeccionExtraccionDisponible,
} from "@maximilian/shared/types/informe.type";
import type { IdSeccionInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";
import {
  formatearPorcentajeDecimales,
  obtenerNumeroDesdeMonto,
  obtenerNumeroOpcionalDesdeMonto,
} from "@maximilian/shared/utils/formato-monto.util";

export function obtenerTotalPaginasInvestigacion(totalRegistros: number) {
  return Math.max(1, Math.ceil(totalRegistros / FILAS_POR_PAGINA_INVESTIGACION));
}

export function paginarRegistrosInvestigacion<T>(registros: T[], paginaActual: number) {
  const inicio = (paginaActual - 1) * FILAS_POR_PAGINA_INVESTIGACION;
  return registros.slice(inicio, inicio + FILAS_POR_PAGINA_INVESTIGACION);
}

export function formatearPorcentajeOchoDecimales(valor: number) {
  return formatearPorcentajeDecimales(valor, 8);
}

export function obtenerNumeroDesdeTexto(valor?: string) {
  return obtenerNumeroDesdeMonto(valor);
}

export function obtenerNumeroOpcionalDesdeTexto(valor?: string) {
  return obtenerNumeroOpcionalDesdeMonto(valor);
}

export function obtenerEnteroDesdeTexto(valor?: string) {
  if (!valor) return 0;
  const numero = Number.parseInt(valor.replace(/\D/g, ""), 10);
  return Number.isFinite(numero) ? numero : 0;
}

export function obtenerEnteroOpcionalDesdeTexto(valor?: string) {
  const numero = obtenerEnteroDesdeTexto(valor);
  return numero > 0 ? numero : undefined;
}

export function convertirFechaIso(valor?: string) {
  if (!valor?.trim()) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return `${valor}T00:00:00.000Z`;

  const partes = valor.split("/");
  if (partes.length !== 3) return null;

  const [dia, mes, ano] = partes;
  if (!dia || !mes || !ano) return null;

  return `${ano.padStart(4, "0")}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}T00:00:00.000Z`;
}

export function obtenerIdPorTexto(
  opciones: {
    num1: number | null;
    string1: string | null;
    string2?: string | null;
    string3?: string | null;
    string4?: string | null;
    string5?: string | null;
    string6?: string | null;
    string7?: string | null;
  }[] | undefined,
  valor: string,
) {
  const texto = valor.trim().toLowerCase();
  if (!texto) return 0;

  const id = Number.parseInt(valor.trim(), 10);
  if (/^\d+$/.test(valor.trim()) && Number.isFinite(id) && opciones?.some((opcion) => opcion.num1 === id)) {
    return id;
  }

  return opciones?.find((opcion) => {
    const textos = [
      opcion.string1,
      opcion.string2,
      opcion.string3,
      opcion.string4,
      opcion.string5,
      opcion.string6,
      opcion.string7,
      [opcion.string2?.trim(), opcion.string1?.trim()].filter(Boolean).join(" - "),
      [opcion.string5?.trim(), opcion.string4?.trim()].filter(Boolean).join(" - "),
      [opcion.string7?.trim(), opcion.string6?.trim()].filter(Boolean).join(" - "),
    ];

    return textos.some((textoOpcion) => textoOpcion?.trim().toLowerCase() === texto);
  })?.num1 ?? 0;
}

export function obtenerIdPorTextoONumero(
  opciones: { num1: number | null; string1: string | null }[] | undefined,
  valor: string,
) {
  const id = obtenerEnteroDesdeTexto(valor);
  if (id > 0) return id;
  return obtenerIdPorTexto(opciones, valor);
}

export function obtenerIdCiiuPorValor(
  opciones: {
    num1: number | null;
    string1: string | null;
    string2?: string | null;
    string3?: string | null;
    string4?: string | null;
    string5?: string | null;
    string6?: string | null;
    string7?: string | null;
  }[] | undefined,
  valor: string,
) {
  const texto = valor.trim().toLowerCase();
  if (!texto) return 0;
  const codigo = valor.match(/^\d+/)?.[0] ?? "";

  const opcionPorCodigoOTexto = opciones?.find((opcion) => {
    const textos = [
      opcion.string1,
      opcion.string2,
      opcion.string3,
      opcion.string4,
      opcion.string5,
      opcion.string6,
      opcion.string7,
      [opcion.string2?.trim(), opcion.string1?.trim()].filter(Boolean).join(" - "),
      [opcion.string5?.trim(), opcion.string4?.trim()].filter(Boolean).join(" - "),
      [opcion.string7?.trim(), opcion.string6?.trim()].filter(Boolean).join(" - "),
    ];
    return textos.some((textoOpcion) => textoOpcion?.trim().toLowerCase() === texto)
      || (!!codigo && [opcion.string2, opcion.string5, opcion.string7].some((codigoOpcion) => codigoOpcion?.trim() === codigo));
  });
  if (opcionPorCodigoOTexto?.num1) return opcionPorCodigoOTexto.num1;

  const esIdNumerico = /^\d+$/.test(valor.trim());
  const id = esIdNumerico ? Number.parseInt(valor.trim(), 10) : 0;
  if (esIdNumerico && Number.isFinite(id) && opciones?.some((opcion) => opcion.num1 === id)) return id;

  return 0;
}

export function obtenerTextoPorId(
  opciones: { num1: number | null; string1: string | null }[] | undefined,
  id?: number,
) {
  if (!id) return "";
  return opciones?.find((opcion) => Number(opcion.num1) === Number(id))?.string1?.trim() ?? "";
}

export function obtenerIdMoneda(valor: string) {
  const monedaNormalizada = valor.trim().toLowerCase();
  if (monedaNormalizada === "us dollar") return 1;
  if (monedaNormalizada === "euro") return 2;
  if (monedaNormalizada === "sol") return 3;
  return 0;
}

export function obtenerIdTipoBalance(valor?: string) {
  const texto = valor?.trim().toLowerCase() ?? "";
  if (texto === "balance general") return 1;
  if (texto === "balance consolidado") return 2;
  return 0;
}

export function obtenerIdTipoArchivo(valor?: string) {
  const texto = valor?.trim().toLowerCase() ?? "";
  if (texto.startsWith("image/")) return 1;
  if (texto === "application/pdf") return 2;
  return 0;
}

export function obtenerNumeroMes(valor: string) {
  const meses: Record<string, number> = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    setiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
  };

  return meses[valor.trim().toLowerCase()] ?? 0;
}

export function esTextoAfirmativo(valor?: string) {
  const texto = valor?.trim().toLowerCase() ?? "";
  const textoSinAcentos = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return textoSinAcentos === "si" || texto === "sÃ­" || texto === "true" || texto === "1";
}

export function obtenerIdObligacionBolsa(valor?: string) {
  const texto = valor?.trim().toLowerCase() ?? "";
  const textoSinAcentos = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (textoSinAcentos === "si" || texto === "sÃ­" || texto === "true" || texto === "1") return 1;
  if (texto === "no" || texto === "false" || texto === "0" || texto === "2") return 0;
  return undefined;
}

export function obtenerTextoObligacionBolsa(
  opciones: { num1: number | null; string1: string | null }[] | undefined,
  valor?: string,
) {
  const id = obtenerIdObligacionBolsa(valor);
  if (id != null) return opciones?.find((opcion) => opcion.num1 === id)?.string1?.trim() ?? "";
  return "";
}

export function humanizarClaveExtraccion(valor: string) {
  const texto = valor
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim();

  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : valor;
}

export function construirSeccionesDisponiblesExtraccion(
  alcance: AlcanceExtraccionInforme,
): InformeSeccionExtraccionDisponible[] {
  const entradasConfiguracion = alcance === "general"
    ? Object.entries(CONFIGURACION_EXTRACCION_POR_SECCION)
    : [[alcance, CONFIGURACION_EXTRACCION_POR_SECCION[alcance]]] as [
        IdSeccionInvestigacionAnalista,
        Record<string, string[]>,
      ][];

  return entradasConfiguracion.map(([claveGrupo, configuracion]) => {
    const campos = Object.entries(configuracion).flatMap(([claveSeccion, camposSeccion]) => {
      const etiquetaSeccion = ETIQUETAS_SECCIONES_EXTRACCION[claveSeccion] ?? humanizarClaveExtraccion(claveSeccion);

      if (SECCIONES_LISTA_EXTRACCION.has(claveSeccion)) {
        return [{
          id: 0,
          claveCampo: claveSeccion,
          etiquetaCampo: etiquetaSeccion,
          claveSeccionExtraccion: claveSeccion,
          clavesCamposExtraccion: camposSeccion,
        }];
      }

      return camposSeccion.map((campo) => ({
        id: 0,
        claveCampo: campo,
        etiquetaCampo: ETIQUETAS_CAMPOS_EXTRACCION[campo] ?? humanizarClaveExtraccion(campo),
        claveSeccionExtraccion: claveSeccion,
      }));
    });

    return {
      claveSeccion: claveGrupo,
      etiquetaSeccion: ETIQUETAS_SECCIONES_EXTRACCION[claveGrupo] ?? humanizarClaveExtraccion(claveGrupo),
      campos: campos.map((campo, indice) => ({
        ...campo,
        id: indice + 1,
      })),
    };
  }).filter((seccion) => seccion.campos.length > 0);
}

export function esRegistroPlano(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

export function normalizarTextoExtraccion(valor: string) {
  return valor.trim().toLowerCase();
}

export function obtenerOpcionTablaMaestraPorId(
  opciones: { num1: number | null; string1: string | null }[] | undefined,
  valor: unknown,
) {
  const numero = typeof valor === "number"
    ? valor
    : typeof valor === "string" && valor.trim() !== "" && !Number.isNaN(Number(valor))
      ? Number(valor)
      : null;

  if (numero == null) return undefined;
  return opciones?.find((opcion) => opcion.num1 === numero);
}

export function obtenerOpcionTablaMaestraPorTexto(
  opciones: { num1: number | null; string1: string | null }[] | undefined,
  valor: unknown,
) {
  const texto = normalizarTextoExtraccion(typeof valor === "string" ? valor : "");
  if (!texto) return undefined;
  return opciones?.find((opcion) => normalizarTextoExtraccion(opcion.string1 ?? "") === texto);
}

export function actualizarValorEnRuta<T>(valorActual: T, ruta: string[], valorNuevo: unknown): T {
  if (ruta.length === 0) return valorNuevo as T;

  const [claveActual, ...restoRuta] = ruta;
  const registroActual = (esRegistroPlano(valorActual) ? valorActual : {}) as Record<string, unknown>;

  return {
    ...registroActual,
    [claveActual]: restoRuta.length === 0
      ? valorNuevo
      : actualizarValorEnRuta(registroActual[claveActual], restoRuta, valorNuevo),
  } as T;
}
