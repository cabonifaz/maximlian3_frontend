import type {
  DatosFormularioContacto,
  DatosFormularioInformacionCliente,
  DatosFormularioTarifa,
} from "@maximilian/schemas";
import type { CreateClientRequest } from "@maximilian/shared/types/cliente.type";

export function construirPayloadCrearCliente(
  datosCliente: DatosFormularioInformacionCliente,
  contactos: DatosFormularioContacto[],
  tarifas: DatosFormularioTarifa[],
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
    contactos: contactos.map((contacto) => ({
      nombres: contacto.nombre,
      idTipoPersonaContacto: contacto.tipoPersona as number,
      idTipoContacto: contacto.tipoContacto as number,
      tipoContacto: contacto.tipoContacto === 0 ? (contacto.tipoContactoNuevo ?? null) : null,
      areaTrabajo: contacto.areaTrabajo as number,
      telefono: contacto.telefono ?? "",
      correo: contacto.correo,
      codigo: contacto.codigoContacto || null,
      enviarCorreo: contacto.enviarCorreo,
    })),
    tarifario: tarifas.map((tarifa) => ({
      idProducto: tarifa.producto as number,
      idTipoTramite: tarifa.tramite as number,
      idPais: tarifa.pais as number,
      idMoneda: tarifa.moneda as number,
      diasMax: tarifa.diasMax,
      diasMin: tarifa.diasMin,
      precio: tarifa.precio,
      penalidad: tarifa.penalidad,
    })),
  };
}
