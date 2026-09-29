import type { RegistroPersonaDirectorioAnalista } from "@maximilian/shared/types/investigacion.type";
import {
  esRegistroPlano,
  obtenerOpcionTablaMaestraPorId,
  obtenerOpcionTablaMaestraPorTexto,
} from "@maximilian/shared/utils/investigacion/investigacion-formato.util";
import {
  obtenerNumeroOpcional,
  obtenerTextoONumero as obtenerTexto,
} from "@maximilian/shared/utils/normalizacion-respuesta.util";
import { obtenerGentilicioPais } from "@maximilian/shared/utils/tabla-maestra-idioma.util";

type OpcionTablaMaestraExtraccion = {
  num1: number | null;
  string1: string | null;
  string2?: string | null;
  string3?: string | null;
  string4?: string | null;
  string5?: string | null;
  string6?: string | null;
  string7?: string | null;
};

interface OpcionesPersonaExtraida {
  opcionesTipoPersona?: OpcionTablaMaestraExtraccion[];
  opcionesPais?: OpcionTablaMaestraExtraccion[];
}

function obtenerId(valor: unknown) {
  const numero = obtenerNumeroOpcional(valor);
  return numero != null && numero > 0 ? numero : undefined;
}

function obtenerOpcion(opciones: OpcionTablaMaestraExtraccion[] | undefined, valor: unknown) {
  const opcion = obtenerOpcionTablaMaestraPorId(opciones, valor) ?? obtenerOpcionTablaMaestraPorTexto(opciones, valor);
  return opcion ? opciones?.find((item) => item === opcion) : undefined;
}

function normalizarTextoComparacion(valor: unknown) {
  return obtenerTexto(valor).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function obtenerOpcionPais(opciones: OpcionTablaMaestraExtraccion[] | undefined, valor: unknown) {
  const opcionPorId = obtenerOpcionTablaMaestraPorId(opciones, valor);
  if (opcionPorId) return opciones?.find((item) => item === opcionPorId);

  const texto = normalizarTextoComparacion(valor);
  if (!texto) return undefined;

  return opciones?.find((opcion) => [
    opcion.string1,
    opcion.string2,
    opcion.string3,
    opcion.string4,
    opcion.string5,
    opcion.string6,
    opcion.string7,
  ].some((nombre) => normalizarTextoComparacion(nombre) === texto));
}

export function construirPersonaExtraidaDirectorio(
  item: Record<string, unknown>,
  { opcionesTipoPersona, opcionesPais }: OpcionesPersonaExtraida,
): Partial<RegistroPersonaDirectorioAnalista> {
  const datos = esRegistroPlano(item.datosPersona) ? item.datosPersona : {};
  const opcionTipoPersona = obtenerOpcion(opcionesTipoPersona, item.tipoPersona);
  const opcionPais = obtenerOpcionPais(opcionesPais, datos.pais ?? item.pais);
  const opcionNacionalidad = obtenerOpcionPais(opcionesPais, datos.nacionalidad);

  return {
    idTipoPersona: opcionTipoPersona?.num1 ?? undefined,
    tipoPersona: opcionTipoPersona?.string1?.trim() ?? "",
    nombres: obtenerTexto(item.ejecutivo ?? item.nombreCompleto),
    idPais: opcionPais?.num1 ?? undefined,
    pais: opcionPais?.string1?.trim() ?? obtenerTexto(datos.pais ?? item.pais),
    direccionPrincipal: obtenerTexto(datos.direccion),
    ciudadProvinciaEstado: obtenerTexto(datos.ciudad),
    codigoPostal: obtenerTexto(datos.codigoPostal),
    idNacionalidad: opcionNacionalidad?.num1 ?? undefined,
    nacionalidad: opcionNacionalidad ? obtenerGentilicioPais(opcionNacionalidad) : "",
    idTipoDocumento: obtenerId(datos.idTipoDocumento),
    tipoDocumentoIdentidad: "",
    numeroDocumentoIdentidad: obtenerTexto(datos.numeroDocumento),
    taxIdType: obtenerId(datos.idTipoIdFiscal),
    tipoIdFiscal: "",
    numeroIdFiscal: obtenerTexto(datos.numeroIdFiscal),
    fechaNacimiento: obtenerTexto(datos.fechaNacimiento),
    idEstadoCivil: obtenerId(datos.idEstadoCivil),
    estadoCivil: "",
    profesion: obtenerTexto(datos.profesion),
    referenciaAdicional: obtenerTexto(datos.referenciaAdicional),
  };
}
