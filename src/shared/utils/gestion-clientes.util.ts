import type {
  DatosFormularioContacto,
  DatosFormularioInformacionCliente,
  DatosFormularioTarifa,
} from "@maximilian/schemas";
import type {
  CreateClientRequest,
  CreateContactoRequest,
  CreateTarifarioRequest,
} from "@maximilian/shared/types/cliente.type";

export function construirPayloadCrearCliente(
  datosCliente: DatosFormularioInformacionCliente,
): CreateClientRequest {
  return {
    idTipoPersona: datosCliente.tipoPersona as number,
    nombre: datosCliente.nombre,
    nombreCorto: datosCliente.nombre.substring(0, 20),
    idPais: datosCliente.pais as number,
    idRegistroTributario: datosCliente.tipoRegistroTributario as number,
    numRegistroTributario: datosCliente.numRegistroTributario ?? "",
    correo: datosCliente.correo,
    idEstado: 1,
    webSite: datosCliente.sitioWeb || "",
    telefono: datosCliente.telefono ?? "",
    fax: datosCliente.fax ?? "",
    direccion: datosCliente.direccion ?? "",
    recomendacion: datosCliente.recomendacion ?? "",
    idEmpresaAtencion: datosCliente.atendidoPor as number,
    idIdioma: datosCliente.idioma as number,
    logoClienteUrl: "",
    imprimeLogoSafety: datosCliente.imprimeLogoSafety,
    lstIdFormatoDocumento: datosCliente.formatoInforme as number[],
    idMoneda: datosCliente.moneda as number,
    idIdiomaFacturacion: datosCliente.idiomaFacturacion as number,
    aplicaPenalidad: datosCliente.aplicaPenalidad,
    emitirPrefactura: datosCliente.emitirPrefactura,
    idPlantilla: datosCliente.plantillaInforme,
    contactos: [],
    tarifario: [],
  };
}

export function construirPayloadCrearContacto(
  idCliente: number,
  contacto: DatosFormularioContacto,
): CreateContactoRequest {
  return {
    idCliente,
    nombres: contacto.nombre,
    idTipoPersonaContacto: contacto.tipoPersona as number,
    idTipoContacto: contacto.tipoContacto as number,
    tipoContacto: contacto.tipoContacto === 0 ? (contacto.tipoContactoNuevo ?? null) : null,
    idAreaTrabajo: contacto.areaTrabajo as number,
    telefono: contacto.telefono || null,
    correo: contacto.correo || null,
    codigo: contacto.codigoContacto || null,
    enviarCorreo: contacto.enviarCorreo,
  };
}

export function construirPayloadCrearTarifa(
  idCliente: number,
  tarifa: DatosFormularioTarifa,
): CreateTarifarioRequest {
  return {
    idCliente,
    idProducto: tarifa.producto as number,
    idTipoTramite: tarifa.tramite as number,
    idPais: tarifa.pais as number,
    idMoneda: tarifa.moneda as number,
    diasMax: tarifa.diasMax,
    diasMin: tarifa.diasMin,
    precio: tarifa.precio,
    penalidad: tarifa.penalidad,
  };
}
