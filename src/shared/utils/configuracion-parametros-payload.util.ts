import type {
  ConfiguracionCamposParametro,
  FormularioParametro,
} from "@maximilian/shared/types/configuracion-parametros.type";
import {
  obtenerDescripcionTablaMaestra,
  obtenerSiguienteNumTablaMaestra,
  type EntradaTablaMaestra,
  type TablaMaestraCrearRequest,
} from "@maximilian/shared/types/tabla-maestra.type";
import { obtenerConfiguracionCamposParametro } from "@maximilian/shared/utils/configuracion-parametros.util";

export function validarFormularioParametro(
  valores: FormularioParametro,
  configuracion: ConfiguracionCamposParametro,
) {
  const descripcion = valores.descripcion.trim();
  const codigo = valores.codigo.trim();
  const referencia = valores.referencia.trim();

  if (!descripcion) return "Ingrese descripcion para continuar.";

  if (configuracion.codigoRequerido && !codigo) {
    return `Ingrese ${configuracion.etiquetaCodigo?.toLowerCase()} para continuar.`;
  }

  if (configuracion.referenciaRequerida && !referencia) {
    return `Ingrese ${configuracion.etiquetaReferencia?.toLowerCase()} para continuar.`;
  }

  return "";
}

export function crearPayloadParametro(
  idMaestro: number,
  valores: FormularioParametro,
  opcionesActuales: EntradaTablaMaestra[],
  parametro?: EntradaTablaMaestra,
): TablaMaestraCrearRequest {
  const configuracion = obtenerConfiguracionCamposParametro(idMaestro);
  const codigo = configuracion.etiquetaCodigo
    ? valores.codigo.trim() || null
    : parametro?.string2 ?? null;
  const referencia = configuracion.etiquetaReferencia
    ? Number.parseInt(valores.referencia, 10)
    : parametro?.num2 ?? null;
  const detalle = configuracion.etiquetaDetalle
    ? valores.detalle.trim() || null
    : parametro?.string3 ?? null;

  return {
    idMaestro,
    descripcion: obtenerDescripcionTablaMaestra(
      idMaestro,
      parametro?.descripcion,
    ),
    num1: parametro?.num1 ?? obtenerSiguienteNumTablaMaestra(opcionesActuales),
    num2: Number.isNaN(referencia) ? null : referencia,
    num3: parametro?.num3 ?? null,
    inputText: valores.descripcion.trim(),
    inputText2: codigo,
    string1: valores.descripcion.trim(),
    string2: codigo,
    string3: detalle,
    string4: valores.traduccionIngles1.trim() || null,
    string5: valores.traduccionIngles2.trim() || null,
    string6: valores.traduccionPortugues1.trim() || null,
    string7: valores.traduccionPortugues2.trim() || null,
    date1: parametro?.date1 ?? null,
    date2: parametro?.date2 ?? null,
    date3: parametro?.date3 ?? null,
  };
}
