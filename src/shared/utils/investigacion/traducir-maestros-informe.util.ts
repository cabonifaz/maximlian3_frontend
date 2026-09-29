import type { OpcionesTablaMaestraPorId } from "@maximilian/services/tabla-maestra.service";
import type { InformeObtenerResponse } from "@maximilian/shared/types/informe.type";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";

function obtenerOpcion(opciones: OpcionesTablaMaestraPorId, idMaestro: number, id: number | undefined) {
  if (!id) return undefined;
  return opciones[idMaestro]?.find((opcion) => opcion.num1 === id);
}

function obtenerTexto(opciones: OpcionesTablaMaestraPorId, idMaestro: number, id: number | undefined, respaldo: string) {
  return obtenerOpcion(opciones, idMaestro, id)?.string1?.trim() || respaldo;
}

function obtenerTextoConCodigo(opciones: OpcionesTablaMaestraPorId, idMaestro: number, id: number | undefined, respaldo: string) {
  const opcion = obtenerOpcion(opciones, idMaestro, id);
  if (!opcion?.string1) return respaldo;
  return opcion.string2 ? `${opcion.string2} - ${opcion.string1}` : opcion.string1;
}

export function traducirMaestrosDatosInvestigacion(
  informe: InformeObtenerResponse,
  opciones: OpcionesTablaMaestraPorId,
): DatosInvestigacionAnalista {
  const datos = informe.datosInvestigacion;

  return {
    ...datos,
    identificacion: {
      ...datos.identificacion,
      tipoPersona: obtenerTexto(opciones, TablaMaestraId.TIPO_PERSONA, informe.idTipoPersona, datos.identificacion.tipoPersona),
      pais: obtenerTexto(opciones, TablaMaestraId.PAIS, informe.idPais, datos.identificacion.pais),
      tipoIdentificacionFiscal: obtenerTexto(
        opciones,
        TablaMaestraId.TIPO_DOCUMENTO_INVESTIGACION,
        informe.taxIdType,
        datos.identificacion.tipoIdentificacionFiscal,
      ),
      estadoActual: obtenerTexto(opciones, TablaMaestraId.ESTADO_CLIENTE, informe.idEstadoManual, datos.identificacion.estadoActual),
    },
    aspectosLegales: {
      ...datos.aspectosLegales,
      tipoEmpresa: obtenerTexto(opciones, TablaMaestraId.TIPO_EMPRESA, informe.idTipoEmpresa, datos.aspectosLegales.tipoEmpresa),
    },
    operacionPrincipal: {
      ...datos.operacionPrincipal,
      sector: obtenerTextoConCodigo(opciones, TablaMaestraId.SECTOR_ECONOMICO, informe.idSector, datos.operacionPrincipal.sector),
      categoriaCiiu: obtenerTextoConCodigo(
        opciones,
        TablaMaestraId.ACTIVIDAD_ECONOMICA,
        informe.idIsicCategoria,
        datos.operacionPrincipal.categoriaCiiu,
      ),
      claseCiiu: obtenerTextoConCodigo(opciones, TablaMaestraId.CLASE_CIIU, informe.idIsicClase, datos.operacionPrincipal.claseCiiu),
    },
    importaciones: datos.importaciones.map((registro) => ({
      ...registro,
      moneda: obtenerTexto(opciones, TablaMaestraId.MONEDA, registro.idMoneda, registro.moneda),
    })),
    exportaciones: datos.exportaciones.map((registro) => ({
      ...registro,
      moneda: obtenerTexto(opciones, TablaMaestraId.MONEDA, registro.idMoneda, registro.moneda),
    })),
    locales: datos.locales.map((local) => ({
      ...local,
      tipoLocal: obtenerTexto(opciones, TablaMaestraId.TIPO_LOCAL, local.idTipoLocal, local.tipoLocal),
    })),
    balances: datos.balances.map((balance) => ({
      ...balance,
      tipoBalance: obtenerTexto(opciones, TablaMaestraId.TIPO_BALANCE, balance.idTipoBalance, balance.tipoBalance ?? ""),
      tipoEstadoFinanciero: obtenerTexto(
        opciones,
        TablaMaestraId.ESTADO_FINANCIERO,
        balance.idTipoEstadoFinanciero,
        balance.tipoEstadoFinanciero ?? "",
      ),
      operacionCambio: obtenerTexto(opciones, TablaMaestraId.MONEDA, balance.idMoneda, balance.operacionCambio ?? ""),
    })),
    proveedores: datos.proveedores.map((proveedor) => ({
      ...proveedor,
      tipoProveedor: obtenerTexto(opciones, TablaMaestraId.TIPO_PROVEEDOR, proveedor.idTipoProveedor, proveedor.tipoProveedor),
      pais: obtenerTexto(opciones, TablaMaestraId.PAIS, proveedor.idPais, proveedor.pais),
      taxIdType: obtenerTexto(opciones, TablaMaestraId.TIPO_DOCUMENTO_INVESTIGACION, proveedor.idTipoDocumento, proveedor.taxIdType),
      operacionCambioMoneda: obtenerTexto(
        opciones,
        TablaMaestraId.MONEDA,
        proveedor.idMoneda,
        proveedor.operacionCambioMoneda ?? "",
      ),
      limiteCredito: obtenerTexto(
        opciones,
        TablaMaestraId.LIMITE_CREDITO_PROVEEDOR,
        proveedor.idLimiteCredito,
        proveedor.limiteCredito ?? "",
      ),
      plazoCredito: obtenerTexto(
        opciones,
        TablaMaestraId.PLAZO_CREDITO_PROVEEDOR,
        proveedor.idTiempoCredito,
        proveedor.plazoCredito ?? "",
      ),
    })),
    bancos: datos.bancos.map((banco) => ({
      ...banco,
      pais: obtenerTexto(opciones, TablaMaestraId.PAIS, banco.idPais, banco.pais ?? ""),
    })),
  };
}
