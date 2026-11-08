import type { CompaniaListaItem } from "@maximilian/shared/types/compania.type";
import type { DatosIdentificacionAnalista } from "@maximilian/shared/types/investigacion.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

interface OpcionesCompaniaIdentificacion {
  tiposPersona?: EntradaTablaMaestra[];
  paises?: EntradaTablaMaestra[];
  tiposDocumento?: EntradaTablaMaestra[];
}

function obtenerTextoValido(valor?: string | null) {
  const texto = valor?.trim() ?? "";
  return texto && texto !== "-" ? texto : "";
}

function obtenerEtiqueta(opciones: EntradaTablaMaestra[] | undefined, id?: number, respaldo?: string) {
  const etiqueta = id ? opciones?.find((opcion) => opcion.num1 === id)?.string1 : undefined;
  return obtenerTextoValido(etiqueta) || obtenerTextoValido(respaldo);
}

export function vincularCompaniaAIdentificacion(
  identificacion: DatosIdentificacionAnalista,
  compania: CompaniaListaItem,
  opciones: OpcionesCompaniaIdentificacion,
): DatosIdentificacionAnalista {
  const tipoPersona = obtenerEtiqueta(opciones.tiposPersona, compania.idTipoPersona, compania.tipoPersona);
  const pais = obtenerEtiqueta(opciones.paises, compania.idPais, compania.pais);
  const tipoDocumento = obtenerEtiqueta(opciones.tiposDocumento, compania.idTipoDocumento, compania.tipoDocumento);

  return {
    ...identificacion,
    idCompania: compania.idCompania,
    nombreEmpresa: obtenerTextoValido(compania.nombreCompleto) || identificacion.nombreEmpresa,
    tipoPersona: tipoPersona || identificacion.tipoPersona,
    pais: pais || identificacion.pais,
    tipoIdentificacionFiscal: tipoDocumento || identificacion.tipoIdentificacionFiscal,
    numeroIdentificacionFiscal: obtenerTextoValido(compania.numeroDocumento) || identificacion.numeroIdentificacionFiscal,
    direccionPrincipal: obtenerTextoValido(compania.direccion) || identificacion.direccionPrincipal,
    ciudadEstadoProvincia: obtenerTextoValido(compania.ubigeo) || identificacion.ciudadEstadoProvincia,
    codigoPostal: obtenerTextoValido(compania.codigoPostal) || identificacion.codigoPostal,
    numeroTelefono: obtenerTextoValido(compania.telefono) || identificacion.numeroTelefono,
  };
}
