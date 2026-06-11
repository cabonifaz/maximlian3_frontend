import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilianService";
import { servicioBanco } from "./banco.service";
import { servicioCompania } from "./compania.service";
import { servicioDirectorioEjecutivo } from "./directorioEjecutivo.service";
import { servicioTablaMaestra } from "./tablaMaestra.service";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import type {
  ImagenPendienteSubida,
  InformeAutocompletarRequest,
  InformeActualizarArchivoRequest,
  InformeCrearRequest,
  InformeCrearResponse,
  InformeEliminarArchivoRequest,
  InformeExtraerDocumentoRequest,
  InformeExtraccionResponse,
  InformeGenerarUrlsArchivoRequest,
  InformeInsertarArchivoLoteRequest,
  InformeInsertarArchivoLoteResponse,
  InformeListEntry,
  InformeListParams,
  InformeListResponse,
  InformeObtenerArchivoRequest,
  InformeObtenerArchivoResponse,
  InformeObtenerParams,
  InformeObtenerUrlPrefirmadaRequest,
  InformeObtenerUrlPrefirmadaResponse,
  InformeObtenerResponse,
  InformeUrlArchivoGenerada,
} from "@maximilian/shared/types/informe.type";
import type {
  AccionBandejaAnalista,
  ArchivoInvestigacionAnalista,
  DatosInvestigacionAnalista,
  EstadoInvestigacionAnalista,
} from "@maximilian/shared/types/investigacion.type";
import {
  formatearMontoDecimales,
  obtenerNumeroDesdeMonto,
} from "@maximilian/shared/utils/formato-monto.util";
import {
  adaptarCuentaBalanceDesdeApi,
  esCampoEnteroEstadoFinanciero,
  obtenerClaveEstadoFinanciero,
  obtenerValorCampoEstadoFinanciero,
} from "@maximilian/shared/utils/estados-financieros.util";

type RegistroCompaniaInvestigacion = DatosInvestigacionAnalista["companiasRelacionadas"][number];
type RegistroBancoInvestigacion = DatosInvestigacionAnalista["bancos"][number];
type RegistroDirectorioInvestigacion = DatosInvestigacionAnalista["directorioEjecutivo"][number];
type RegistroLocalInvestigacion = DatosInvestigacionAnalista["locales"][number];
type RegistroBalanceInvestigacion = DatosInvestigacionAnalista["balances"][number];
type RegistroProveedorInvestigacion = DatosInvestigacionAnalista["proveedores"][number];

const TIMEOUT_EXTRACCION_MS = 10 * 60 * 1000;

function obtenerNumero(...valores: unknown[]): number {
  for (const valor of valores) {
    if (typeof valor === "number" && Number.isFinite(valor)) return valor;
    if (typeof valor === "string" && valor.trim() !== "") {
      const numero = Number(valor);
      if (Number.isFinite(numero)) return numero;
    }
  }

  return 0;
}

function obtenerNumeroOpcional(...valores: unknown[]): number | undefined {
  for (const valor of valores) {
    if (typeof valor === "number" && Number.isFinite(valor)) return valor;
    if (typeof valor === "string" && valor.trim() !== "") {
      const numero = Number(valor);
      if (Number.isFinite(numero)) return numero;
    }
  }

  return undefined;
}

function obtenerTexto(...valores: unknown[]): string {
  for (const valor of valores) {
    if (typeof valor === "string") {
      const texto = valor.trim();
      if (texto) return texto;
    }
  }

  return "";
}

function obtenerBooleano(...valores: unknown[]): boolean {
  for (const valor of valores) {
    if (typeof valor === "boolean") return valor;
    if (typeof valor === "number") return valor === 1;
    if (typeof valor === "string") {
      const texto = valor.trim().toLowerCase();
      if (["1", "true", "si", "sí", "s"].includes(texto)) return true;
      if (["0", "false", "no", "n"].includes(texto)) return false;
    }
  }

  return false;
}

function obtenerTipoDocumentoArchivo(...valores: unknown[]): "" | "Informativo" | "Evidencia" {
  for (const valor of valores) {
    if (valor === 1 || valor === "1") return "Informativo";
    if (valor === 2 || valor === "2") return "Evidencia";

    if (typeof valor === "string") {
      const texto = valor.trim().toLowerCase();
      if (!texto) continue;
      if (texto.includes("inform")) return "Informativo";
      if (texto.includes("evid")) return "Evidencia";
    }
  }

  return "";
}

function normalizarArchivosInvestigacion(
  registro: Record<string, unknown>,
): ArchivoInvestigacionAnalista[] {
  return obtenerLista(registro.archivos, registro.Archivos).map((item, indice) => {
    const archivo = obtenerRegistro(item);
    const nombre = obtenerTexto(
      archivo.nombreDocumento,
      archivo.NombreDocumento,
      archivo.nombre,
      archivo.Nombre,
      archivo.fileName,
      archivo.FileName,
    ) || `archivo-${indice + 1}`;
    const urlDescarga = obtenerTexto(
      archivo.downloadUrl,
      archivo.DownloadUrl,
      archivo.documentoURL,
      archivo.DocumentoURL,
      archivo.url,
      archivo.Url,
      archivo.imagenURL,
      archivo.ImagenURL,
    ) || undefined;
    const mimeType = obtenerTexto(
      archivo.mimeType,
      archivo.MimeType,
      archivo.tipoArchivo,
      archivo.TipoArchivo,
      archivo.contentType,
      archivo.ContentType,
    ) || undefined;
    const faseVinculadaTexto = obtenerTexto(
      archivo.faseVinculada,
      archivo.FaseVinculada,
      archivo.fase,
      archivo.Fase,
      archivo.seccion,
      archivo.Seccion,
    ) || undefined;

    return {
      idInformeArchivo: obtenerNumeroOpcional(
        archivo.idInformeArchivo,
        archivo.IdInformeArchivo,
      ),
      id: String(
        obtenerNumero(
          archivo.idInformeArchivo,
          archivo.IdInformeArchivo,
          archivo.idPedidoArchivo,
          archivo.IdPedidoArchivo,
          indice + 1,
        ),
      ),
      nombre,
      extension: nombre.split(".").pop()?.toUpperCase() ?? "—",
      tamano: obtenerNumero(
        archivo.tamanoArchivo,
        archivo.TamanoArchivo,
        archivo.tamano,
        archivo.Tamano,
        archivo.size,
        archivo.Size,
      ),
      tipoDocumento: obtenerTipoDocumentoArchivo(
        archivo.idTipoArchivo,
        archivo.IdTipoArchivo,
        archivo.tipoDocumento,
        archivo.TipoDocumento,
      ),
      idTipoEvidencia: obtenerNumeroOpcional(archivo.idTipoArchivo, archivo.IdTipoArchivo),
      idFaseEvidencia: obtenerNumeroOpcional(
        archivo.idFaseEvidencia,
        archivo.IdFaseEvidencia,
        archivo.idFase,
        archivo.IdFase,
      ),
      esPersistido: true,
      urlDescarga,
      mimeType,
      faseVinculadaTexto,
    };
  });
}

function obtenerRegistro(...valores: unknown[]): Record<string, unknown> {
  for (const valor of valores) {
    if (typeof valor === "object" && valor !== null && !Array.isArray(valor)) {
      return valor as Record<string, unknown>;
    }
  }

  return {};
}

function obtenerLista(...valores: unknown[]): unknown[] {
  for (const valor of valores) {
    if (Array.isArray(valor)) return valor;
  }

  return [];
}

function formatearFechaEntrada(valor: string): string {
  const texto = valor.trim();
  if (!texto) return "";

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return texto;

  const coincidenciaIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (coincidenciaIso) {
    const [, ano, mes, dia] = coincidenciaIso;
    return `${dia}/${mes}/${ano}`;
  }

  return texto;
}

function formatearNumero(valor: unknown, decimales = 2): string {
  const numero = obtenerNumeroOpcional(valor);
  if (numero == null) return "";
  return numero.toFixed(decimales);
}

function formatearPorcentaje(valor: unknown, decimales = 2): string {
  const numero = obtenerNumeroOpcional(valor);
  if (numero == null) return "";
  return `${(numero * 100).toFixed(decimales)}%`;
}

function formatearMonto(valor: unknown, decimales = 2): string {
  const numero = obtenerNumeroOpcional(valor);
  if (numero == null) return "";
  return formatearMontoDecimales(numero, decimales);
}

function formatearEntero(valor: unknown): string {
  const numero = obtenerNumeroOpcional(valor);
  if (numero == null) return "";
  return String(Math.trunc(numero));
}

function obtenerValorRegistro(registro: Record<string, unknown>, ...claves: string[]) {
  const valoresPorClave = new Map(
    Object.entries(registro).map(([clave, valor]) => [clave.toLowerCase(), valor]),
  );
  for (const clave of claves) {
    const valor = valoresPorClave.get(clave.toLowerCase());
    if (valor != null) return valor;
  }
  return undefined;
}

function normalizarEstado(...valores: unknown[]): EstadoInvestigacionAnalista {
  for (const valor of valores) {
    if (typeof valor === "string") {
      const texto = valor.trim().toLowerCase();
      if (texto.includes("rechaz")) return "rechazado";
      if (texto.includes("aprob")) return "aprobado";
      if (texto.includes("pend")) return "pendiente-aprobacion";
      if (texto.includes("proceso") || texto.includes("curso") || texto.includes("borrador")) return "en-proceso";
      if (texto.includes("asign")) return "asignado";
    }

    if (typeof valor === "number") {
      if (valor === 5) return "rechazado";
      if (valor === 4) return "aprobado";
      if (valor === 3) return "pendiente-aprobacion";
      if (valor === 2) return "en-proceso";
      if (valor === 1) return "asignado";
    }
  }

  return "asignado";
}

function obtenerAccion(estado: EstadoInvestigacionAnalista): AccionBandejaAnalista {
  if (estado === "asignado") return "iniciar";
  if (estado === "en-proceso" || estado === "rechazado") return "continuar";
  return "detalle";
}

function normalizarFilaInforme(fila: unknown): InformeListEntry {
  const registro = typeof fila === "object" && fila !== null ? (fila as Record<string, unknown>) : {};
  const idEstado = obtenerNumero(registro.idEstado, registro.IdEstado, registro.estado, registro.Estado);
  const estado = normalizarEstado(
    registro.estado,
    registro.idEstado,
    registro.descripcionEstado,
    registro.Estado,
    registro.IdEstado,
    registro.DescripcionEstado,
  );

  return {
    idInforme: obtenerNumero(registro.idInforme, registro.IdInforme),
    idPedido: obtenerNumero(registro.idPedido, registro.IdPedido),
    idEstado,
    idIdioma: obtenerNumeroOpcional(registro.idIdioma, registro.IdIdioma),
    codigo: obtenerTexto(registro.codigo, registro.Codigo, registro.codigoPedido, registro.CodigoPedido) || "-",
    vigencia: obtenerTexto(registro.vigencia, registro.Vigencia, registro.porVencerTexto, registro.PorVencerTexto) || "-",
    investigado: obtenerTexto(
      registro.investigado,
      registro.nombre,
      registro.nombreInvestigado,
      registro.investigarRazonSocialNombres,
      registro.razonSocial,
      registro.Investigado,
    ) || "-",
    pais: obtenerTexto(registro.pais, registro.nombrePais, registro.Pais, registro.NombrePais) || "-",
    fecha: obtenerTexto(
      registro.fecha,
      registro.fechaMod,
      registro.fechaCreacion,
      registro.Fecha,
      registro.FechaMod,
      registro.FechaCreacion,
    ) || "-",
    tipo: obtenerTexto(
      registro.tipo,
      registro.tipoTramite,
      registro.tipoInforme,
      registro.Tipo,
      registro.TipoTramite,
      registro.TipoInforme,
    ) || "-",
    estado,
    accion: idEstado === 0 ? "continuar" : obtenerAccion(estado),
  };
}

function normalizarRespuestaLista(resultado: unknown): InformeListResponse {
  if (Array.isArray(resultado)) {
    return {
      lstInforme: resultado.map(normalizarFilaInforme),
      totalRegistros: resultado.length,
      totalPaginas: 1,
    };
  }

  const registro = typeof resultado === "object" && resultado !== null ? (resultado as Record<string, unknown>) : {};
  const listaOriginal = Array.isArray(registro.lstInforme)
    ? (registro.lstInforme as unknown[])
    : Array.isArray(registro.lstInformes)
      ? (registro.lstInformes as unknown[])
      : Array.isArray(registro.informes)
        ? (registro.informes as unknown[])
        : [];

  return {
    lstInforme: listaOriginal.map(normalizarFilaInforme),
    totalRegistros: obtenerNumero(registro.totalRegistros, registro.TotalRegistros, listaOriginal.length),
    totalPaginas: obtenerNumero(registro.totalPaginas, registro.TotalPaginas, 1),
  };
}

function normalizarImagenPendiente(raw: unknown): ImagenPendienteSubida {
  const item = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    idInformeLocalImagen: obtenerNumero(item.idInformeLocalImagen, item.IdInformeLocalImagen) ?? 0,
    nombre: obtenerTexto(item.nombre, item.Nombre),
    uploadUrl: obtenerTexto(item.uploadUrl, item.UploadUrl),
  };
}

function normalizarRespuestaCrear(resultado: unknown): InformeCrearResponse {
  if (typeof resultado === "number" && Number.isFinite(resultado)) {
    return { idInforme: resultado };
  }

  if (Array.isArray(resultado)) {
    const primerRegistro = resultado[0];
    return normalizarRespuestaCrear(primerRegistro);
  }

  const registro = typeof resultado === "object" && resultado !== null ? (resultado as Record<string, unknown>) : {};
  const imagenesPendientesRaw = Array.isArray(registro.imagenesPendientes) ? registro.imagenesPendientes : [];

  return {
    idInforme: obtenerNumero(registro.idInforme, registro.IdInforme) || undefined,
    idPedido: obtenerNumero(registro.idPedido, registro.IdPedido) || undefined,
    imagenesPendientes: imagenesPendientesRaw.map(normalizarImagenPendiente),
  };
}

function normalizarRespuestaUrlPrefirmada(resultado: unknown): InformeObtenerUrlPrefirmadaResponse {
  const registro = obtenerRegistro(resultado);

  return {
    uploadUrl: obtenerTexto(registro.uploadUrl, registro.UploadUrl, registro.url, registro.Url),
    fileKey: obtenerTexto(registro.fileKey, registro.FileKey, registro.key, registro.Key),
    expiresIn: obtenerNumeroOpcional(registro.expiresIn, registro.ExpiresIn),
  };
}

function normalizarUrlsArchivoGeneradas(resultado: unknown): InformeUrlArchivoGenerada[] {
  const registro = obtenerRegistro(resultado);
  const lista = Array.isArray(resultado)
    ? resultado
    : obtenerLista(
      registro.archivos,
      registro.Archivos,
      registro.lstArchivos,
      registro.LstArchivos,
      registro.urls,
      registro.Urls,
      registro.result,
      registro.Result,
    );
  const registros = lista.length > 0 ? lista : Object.keys(registro).length > 0 ? [registro] : [];

  return registros.map((item) => {
    const archivo = obtenerRegistro(item);
    const uploadUrl = obtenerTexto(
      archivo.uploadUrl,
      archivo.UploadUrl,
      archivo.urlCarga,
      archivo.UrlCarga,
      archivo.urlPrefirmada,
      archivo.UrlPrefirmada,
      archivo.urlPreFirmada,
      archivo.UrlPreFirmada,
      archivo.url,
      archivo.Url,
    );
    const archivoUrl = obtenerTexto(
      archivo.archivoUrl,
      archivo.ArchivoUrl,
      archivo.urlArchivo,
      archivo.UrlArchivo,
      archivo.fileKey,
      archivo.FileKey,
      archivo.urlDestino,
      archivo.UrlDestino,
      archivo.ruta,
      archivo.Ruta,
    ) || uploadUrl.split("?")[0];

    return {
      nombre: obtenerTexto(
        archivo.nombre,
        archivo.Nombre,
        archivo.nombreArchivo,
        archivo.NombreArchivo,
        archivo.fileName,
        archivo.FileName,
      ),
      uploadUrl,
      archivoUrl,
    };
  });
}

function normalizarRespuestaExtraccion(resultado: unknown): InformeExtraccionResponse {
  const registro = obtenerRegistro(resultado);
  const contieneContenedorCamposExtraidos = [
    registro.camposExtraidos,
    registro.CamposExtraidos,
    registro.extractedFields,
    registro.ExtractedFields,
    registro.secciones,
    registro.Secciones,
    registro.result,
    registro.Result,
  ].some((valor) => typeof valor === "object" && valor !== null && !Array.isArray(valor));
  const camposExtraidos = obtenerRegistro(
    registro.camposExtraidos,
    registro.CamposExtraidos,
    registro.extractedFields,
    registro.ExtractedFields,
    registro.secciones,
    registro.Secciones,
    registro.result,
    registro.Result,
    contieneContenedorCamposExtraidos ? undefined : registro,
  );

  return {
    exito: typeof registro.exito === "boolean" ? registro.exito : typeof registro.success === "boolean" ? registro.success : undefined,
    success: typeof registro.success === "boolean" ? registro.success : typeof registro.exito === "boolean" ? registro.exito : undefined,
    mensaje: obtenerTexto(registro.mensaje, registro.Mensaje),
    camposExtraidos: camposExtraidos as InformeExtraccionResponse["camposExtraidos"],
    extractedFields: camposExtraidos as InformeExtraccionResponse["extractedFields"],
    secciones: camposExtraidos as InformeExtraccionResponse["secciones"],
    result: camposExtraidos as InformeExtraccionResponse["result"],
  };
}

function crearDatosInvestigacionVacios(): DatosInvestigacionAnalista {
  return {
    resumen: {
      codigo: "",
      nombreSolicitado: "",
      pais: "",
      prioridad: "",
      archivos: 0,
    },
    identificacion: {
      tipoPersona: "",
      nombreEmpresa: "",
      nombreComercial: "",
      pais: "",
      operacionesCambio: "",
      tipoIdentificacionFiscal: "",
      numeroIdentificacionFiscal: "",
      direccionPrincipal: "",
      ciudadEstadoProvincia: "",
      numeroTelefono: "",
      numeroFax: "",
      correoElectronico: "",
      paginaWeb: "",
      estadoActual: "",
      datosAdicionales: "",
    },
    aspectosLegales: {
      tipoEmpresa: "",
      fechaConstitucion: "",
      ciudadRegistro: "",
      notaria: "",
      notario: "",
      registro: "",
      condiciones: "",
      operacionesCambioDivisas: "",
      monedaTipoCambio: "",
      capitalInicial: "",
      capitalDesembolsado: "",
      ultimaAmpliacion: "",
      patrimonioNeto: "",
      tipoAcciones: "",
      valorAcciones: "",
      obligacionBolsa: "",
      tipoCambio: "",
      antecedentes: "",
      aspectosLegales: "",
      comentariosEmpresasRelacionadas: "",
    },
    companiasRelacionadas: [],
    operacionPrincipal: {
      sector: "",
      actividad: "",
      categoriaCiiu: "",
      claseCiiu: "",
      actividadPrincipal: "",
      ventasContadoPorcentaje: "",
      ventasContadoDetalle: "",
      ventasCreditoPorcentaje: "",
      ventasCreditoDetalle: "",
      ventasCreditoTiempo: "",
      territorioVentasPorcentaje: "",
      territorioVentasDetalle: "",
      ventasExtranjeroPorcentaje: "",
      ventasExtranjeroDetalle: "",
      comprasNacionalesPorcentaje: "",
      comprasNacionalesDetalle: "",
      comprasContadoNacionalesPorcentaje: "",
      comprasContadoNacionalesDetalle: "",
      comprasCreditoNacionalesPorcentaje: "",
      comprasCreditoNacionalesDetalle: "",
      comprasCreditoNacionalesTiempo: "",
      comprasExtranjeroPorcentaje: "",
      comprasExtranjeroDetalle: "",
      comprasContadoInternacionalesPorcentaje: "",
      comprasContadoInternacionalesDetalle: "",
      comprasCreditoInternacionalesPorcentaje: "",
      comprasCreditoInternacionalesDetalle: "",
      comprasCreditoInternacionalesTiempo: "",
      numeroEmpleados: "",
      numeroEmpleadosDetalle: "",
      comentariosOperaciones: "",
    },
    importaciones: [],
    exportaciones: [],
    locales: [],
    informacionFinanciera: {
      contenido: "",
      comentariosFinancieros: "",
      activosFijos: "",
      seguros: "",
    },
    balances: [],
    referencias: {
      comentariosProveedores: "",
      referenciasBancos: "",
      litigios: "",
      riesgoPrincipal: "",
      superintendencia: "",
    },
    proveedores: [],
    bancos: [],
    datosGenerales: {
      informacionGeneral: "",
      opinionCredito: "",
    },
    directorioEjecutivo: [],
  };
}

function normalizarRespuestaObtener(resultado: unknown): InformeObtenerResponse {
  if (Array.isArray(resultado)) {
    const primerRegistro = resultado[0];
    return normalizarRespuestaObtener(primerRegistro);
  }

  const contenedor = obtenerRegistro(resultado);
  const listaInformes = obtenerLista(
    contenedor.lstInformes,
    contenedor.LstInformes,
    contenedor.lstInforme,
    contenedor.LstInforme,
    contenedor.result,
  );
  const registro = listaInformes.length > 0
    ? obtenerRegistro(listaInformes[0])
    : contenedor;
  const resumen = obtenerRegistro(registro.resumen, registro.Resumen, registro.pedido, registro.Pedido);
  const cuentaArchivos = obtenerLista(registro.archivos, registro.Archivos).length;
  const archivosInvestigacion = normalizarArchivosInvestigacion(registro);
  const datos = crearDatosInvestigacionVacios();

  datos.resumen = {
    codigo: obtenerTexto(registro.codigo, registro.Codigo, resumen.codigo, resumen.Codigo),
    nombreSolicitado: obtenerTexto(
      registro.nombre,
      registro.Nombre,
      registro.investigado,
      registro.Investigado,
      resumen.nombreSolicitado,
      resumen.NombreSolicitado,
    ),
    pais: obtenerTexto(registro.pais, registro.Pais, resumen.pais, resumen.Pais),
    prioridad: obtenerTexto(
      registro.tipo,
      registro.Tipo,
      registro.tipoInforme,
      registro.TipoInforme,
      resumen.prioridad,
      resumen.Prioridad,
    ),
    archivos: obtenerNumero(registro.archivosCantidad, registro.ArchivosCantidad, cuentaArchivos),
    ultimaActualizacion: obtenerTexto(
      registro.fechaMod,
      registro.FechaMod,
      registro.ultimaActualizacion,
      registro.UltimaActualizacion,
    ) || undefined,
  };

  datos.identificacion = {
    tipoPersona: obtenerTexto(registro.tipoPersona, registro.TipoPersona),
    nombreEmpresa: obtenerTexto(registro.nombre, registro.Nombre, registro.razonSocial, registro.RazonSocial),
    nombreComercial: obtenerTexto(registro.nombreComercial, registro.NombreComercial),
    pais: obtenerTexto(registro.pais, registro.Pais, registro.nombrePais, registro.NombrePais),
    operacionesCambio: obtenerTexto(registro.operacionesTCMoneda, registro.OperacionesTCMoneda),
    tipoIdentificacionFiscal: obtenerTexto(registro.taxIdTypeDescripcion, registro.TaxIdTypeDescripcion, registro.taxIdType, registro.TaxIdType),
    numeroIdentificacionFiscal: obtenerTexto(registro.taxNum, registro.TaxNum),
    direccionPrincipal: obtenerTexto(registro.direccion, registro.Direccion),
    ciudadEstadoProvincia: obtenerTexto(registro.ubigeo, registro.Ubigeo),
    numeroTelefono: obtenerTexto(registro.telefono, registro.Telefono),
    numeroFax: obtenerTexto(registro.fax, registro.Fax),
    correoElectronico: obtenerTexto(registro.email, registro.Email),
    paginaWeb: obtenerTexto(registro.paginaWeb, registro.PaginaWeb),
    estadoActual: obtenerTexto(registro.estadoActual, registro.EstadoActual, registro.descripcionEstado, registro.DescripcionEstado),
    datosAdicionales: obtenerTexto(registro.datosAdicionales, registro.DatosAdicionales),
  };

  const idOperacionesCambioDivisas = obtenerNumeroOpcional(registro.idOperacionesCambioDivisas, registro.IdOperacionesCambioDivisas);
  const idTipoCambio = obtenerNumeroOpcional(registro.idTipoCambio, registro.IdTipoCambio);

  datos.aspectosLegales = {
    tipoEmpresa: obtenerTexto(registro.tipoEmpresa, registro.TipoEmpresa),
    fechaConstitucion: formatearFechaEntrada(obtenerTexto(registro.fechaConstitucion, registro.FechaConstitucion)),
    ciudadRegistro: obtenerTexto(registro.ciudadRegistro, registro.CiudadRegistro),
    notaria: obtenerTexto(registro.idNotaria, registro.IdNotaria, registro.notaria, registro.Notaria),
    notario: obtenerTexto(registro.idNotario, registro.IdNotario, registro.notario, registro.Notario),
    registro: obtenerTexto(registro.idRegistro, registro.IdRegistro, registro.registro, registro.Registro),
    condiciones: obtenerTexto(registro.idPlazo, registro.IdPlazo, registro.condiciones, registro.Condiciones),
    operacionesCambioDivisas: idOperacionesCambioDivisas && idOperacionesCambioDivisas > 0
      ? String(idOperacionesCambioDivisas)
      : obtenerTexto(registro.operacionesCambioDivisas, registro.OperacionesCambioDivisas),
    monedaTipoCambio: idTipoCambio && idTipoCambio > 0
      ? String(idTipoCambio)
      : obtenerTexto(registro.monedaTipoCambio, registro.MonedaTipoCambio),
    capitalInicial: formatearMonto(registro.capitalInicial, 2),
    capitalDesembolsado: formatearMonto(registro.capitalPagado, 2),
    ultimaAmpliacion: formatearFechaEntrada(obtenerTexto(registro.fechaUltimoIncremento, registro.FechaUltimoIncremento)),
    patrimonioNeto: formatearMonto(registro.patrimonioNeto, 2),
    tipoAcciones: obtenerTexto(registro.tipoAcciones, registro.TipoAcciones),
    valorAcciones: formatearMonto(registro.valorAcciones, 2),
    obligacionBolsa: obtenerBooleano(registro.cotizaBolsa, registro.CotizaBolsa) ? "Si" : "No",
    tipoCambio: formatearMonto(registro.tipoCambio, 6),
    antecedentes: obtenerTexto(registro.antecedentes, registro.Antecedentes),
    aspectosLegales: obtenerTexto(registro.aspectosLegales, registro.AspectosLegales),
    comentariosEmpresasRelacionadas: obtenerTexto(
      registro.comentariosAspectoLegal,
      registro.ComentariosAspectoLegal,
      registro.comentariosEmpresasRelacionadas,
      registro.ComentariosEmpresasRelacionadas,
    ),
  };

  datos.companiasRelacionadas = obtenerLista(
    registro.companiasRelacionadas,
    registro.CompaniasRelacionadas,
  ).map((item) => {
    const compania = obtenerRegistro(item);
    return {
      idInformeCompaniaRelacionada: obtenerNumeroOpcional(
        compania.idInformeCompaniaRelacionada,
        compania.IdInformeCompaniaRelacionada,
      ),
      idCompania: obtenerNumero(compania.idCompania, compania.IdCompania),
      empresa: obtenerTexto(compania.nombreCompleto, compania.NombreCompleto, compania.nombre, compania.Nombre, compania.empresa, compania.Empresa),
      idFiscal: obtenerTexto(compania.taxNum, compania.TaxNum, compania.idFiscal, compania.IdFiscal),
      pais: obtenerTexto(compania.pais, compania.Pais, compania.nombrePais, compania.NombrePais),
    };
  });

  datos.operacionPrincipal = {
    sector: obtenerTexto(registro.sector, registro.Sector),
    actividad: obtenerTexto(registro.actividad, registro.Actividad),
    categoriaCiiu: String(obtenerNumeroOpcional(registro.idIsicCategoria, registro.IdIsicCategoria) ?? "")
      || obtenerTexto(registro.isicCategoria, registro.IsicCategoria, registro.categoriaCiiu, registro.CategoriaCiiu),
    claseCiiu: String(obtenerNumeroOpcional(registro.idIsicClase, registro.IdIsicClase) ?? "")
      || obtenerTexto(registro.isicClase, registro.IsicClase, registro.claseCiiu, registro.ClaseCiiu),
    actividadPrincipal: obtenerTexto(registro.actividadPrincipal, registro.ActividadPrincipal),
    ventasContadoPorcentaje: formatearNumero(registro.ventasContado, 2),
    ventasContadoDetalle: obtenerTexto(registro.ventasContadoText, registro.VentasContadoText),
    ventasCreditoPorcentaje: formatearNumero(registro.ventasCredito, 2),
    ventasCreditoDetalle: obtenerTexto(registro.ventasCreditoText, registro.VentasCreditoText),
    ventasCreditoTiempo: String(
      obtenerNumeroOpcional(registro.idVentasCreditoTiempo, registro.IdVentasCreditoTiempo) ?? "",
    ) || obtenerTexto(
      registro.ventasCreditoTiempo,
      registro.VentasCreditoTiempo,
      registro.ventasCreditoSeleccion,
      registro.VentasCreditoSeleccion,
    ),
    territorioVentasPorcentaje: formatearNumero(
      registro.ventasNacionales
        ?? registro.VentasNacionales
        ?? registro.territorioVentas
        ?? registro.TerritorioVentas,
      2,
    ),
    territorioVentasDetalle: obtenerTexto(
      registro.ventasNacionalesText,
      registro.VentasNacionalesText,
      registro.territorioText,
      registro.TerritorioText,
    ),
    ventasExtranjeroPorcentaje: formatearNumero(registro.ventasInternacionales, 2),
    ventasExtranjeroDetalle: obtenerTexto(registro.ventasInternacionalesText, registro.VentasInternacionalesText),
    comprasNacionalesPorcentaje: formatearNumero(registro.comprasNacionales ?? registro.ComprasNacionales, 2),
    comprasNacionalesDetalle: obtenerTexto(registro.comprasNacionalesText, registro.ComprasNacionalesText),
    comprasContadoNacionalesPorcentaje: formatearNumero(registro.comprasContadoNacionales ?? registro.ComprasContadoNacionales, 2),
    comprasContadoNacionalesDetalle: obtenerTexto(registro.comprasContadoNacionalesText, registro.ComprasContadoNacionalesText),
    comprasCreditoNacionalesPorcentaje: formatearNumero(registro.comprasCreditoNacionales ?? registro.ComprasCreditoNacionales, 2),
    comprasCreditoNacionalesDetalle: obtenerTexto(registro.comprasCreditoNacionalesText, registro.ComprasCreditoNacionalesText),
    comprasCreditoNacionalesTiempo: String(
      obtenerNumeroOpcional(registro.idComprasCreditoNacionalesTiempo, registro.IdComprasCreditoNacionalesTiempo) ?? "",
    ),
    comprasExtranjeroPorcentaje: formatearNumero(
      registro.comprasInternacionales
        ?? registro.ComprasInternacionales
        ?? registro.comprasExtranjero
        ?? registro.ComprasExtranjero,
      2,
    ),
    comprasExtranjeroDetalle: obtenerTexto(
      registro.comprasInternacionalesText,
      registro.ComprasInternacionalesText,
      registro.comprasExtranjeroText,
      registro.ComprasExtranjeroText,
    ),
    comprasContadoInternacionalesPorcentaje: formatearNumero(registro.comprasContadoInternacionales ?? registro.ComprasContadoInternacionales, 2),
    comprasContadoInternacionalesDetalle: obtenerTexto(registro.comprasContadoInternacionalesText, registro.ComprasContadoInternacionalesText),
    comprasCreditoInternacionalesPorcentaje: formatearNumero(registro.comprasCreditoInternacionales ?? registro.ComprasCreditoInternacionales, 2),
    comprasCreditoInternacionalesDetalle: obtenerTexto(registro.comprasCreditoInternacionalesText, registro.ComprasCreditoInternacionalesText),
    comprasCreditoInternacionalesTiempo: String(
      obtenerNumeroOpcional(registro.idComprasCreditoInternacionalesTiempo, registro.IdComprasCreditoInternacionalesTiempo) ?? "",
    ),
    numeroEmpleados: formatearEntero(registro.numeroEmpleados),
    numeroEmpleadosDetalle: obtenerTexto(registro.numeroEmpleadosText, registro.NumeroEmpleadosText),
    comentariosOperaciones: obtenerTexto(registro.comentariosOperaciones, registro.ComentariosOperaciones),
  };

  const operaciones = obtenerLista(
    registro.exportacionesImportaciones,
    registro.ExportacionesImportaciones,
  ).map((item) => obtenerRegistro(item));

  datos.importaciones = operaciones
    .filter((item) => obtenerNumero(item.idTipoOperacion, item.IdTipoOperacion) === 1)
    .map((item) => ({
      idInformeExportacionImportacion: obtenerNumeroOpcional(item.idInformeExportacionImportacion, item.IdInformeExportacionImportacion),
      idMesInicio: obtenerNumeroOpcional(item.mesInicio, item.MesInicio),
      idMesFin: obtenerNumeroOpcional(item.mesFin, item.MesFin),
      idMoneda: obtenerNumeroOpcional(item.idMoneda, item.IdMoneda),
      anio: formatearEntero(item.anio ?? item.Anio),
      mes: obtenerTexto(item.mesInicioDescripcion, item.MesInicioDescripcion, item.mes, item.Mes),
      moneda: obtenerTexto(item.moneda, item.Moneda),
      paises: obtenerTexto(item.paises, item.Paises),
      productos: obtenerTexto(item.productos, item.Productos),
      monto: formatearMonto(item.monto, 2),
      operaciones: formatearEntero(item.numOperaciones ?? item.NumOperaciones),
    }));

  datos.exportaciones = operaciones
    .filter((item) => obtenerNumero(item.idTipoOperacion, item.IdTipoOperacion) === 2)
    .map((item) => ({
      idInformeExportacionImportacion: obtenerNumeroOpcional(item.idInformeExportacionImportacion, item.IdInformeExportacionImportacion),
      idMesInicio: obtenerNumeroOpcional(item.mesInicio, item.MesInicio),
      idMesFin: obtenerNumeroOpcional(item.mesFin, item.MesFin),
      idMoneda: obtenerNumeroOpcional(item.idMoneda, item.IdMoneda),
      anio: formatearEntero(item.anio ?? item.Anio),
      mes: obtenerTexto(item.mesInicioDescripcion, item.MesInicioDescripcion, item.mes, item.Mes),
      moneda: obtenerTexto(item.moneda, item.Moneda),
      paises: obtenerTexto(item.paises, item.Paises),
      productos: obtenerTexto(item.productos, item.Productos),
      monto: formatearMonto(item.monto, 2),
      operaciones: formatearEntero(item.numOperaciones ?? item.NumOperaciones),
    }));

  datos.locales = obtenerLista(registro.locales, registro.Locales).map((item) => {
    const local = obtenerRegistro(item);
    const idTipoLocal = obtenerNumeroOpcional(local.idTipoLocal, local.IdTipoLocal);
    const imagenes = obtenerLista(local.imagenes, local.Imagenes).map((imagen) => {
      const registroImagen = obtenerRegistro(imagen);
      return {
        idInformeLocalImagen: obtenerNumeroOpcional(registroImagen.idInformeLocalImagen, registroImagen.IdInformeLocalImagen),
        idTipoArchivo: obtenerNumeroOpcional(registroImagen.idTipoArchivo, registroImagen.IdTipoArchivo),
        nombre: obtenerTexto(registroImagen.nombre, registroImagen.Nombre, registroImagen.imagenURL, registroImagen.ImagenURL) || "archivo",
        url: obtenerTexto(registroImagen.url, registroImagen.Url, registroImagen.imagenURL, registroImagen.ImagenURL) || undefined,
        tipo: obtenerTexto(registroImagen.tipoArchivo, registroImagen.TipoArchivo, registroImagen.mimeType, registroImagen.MimeType) || undefined,
      };
    });

    return {
      idInformeLocal: obtenerNumeroOpcional(local.idInformeLocal, local.IdInformeLocal),
      idTipoLocal,
      tipoLocal: obtenerTexto(local.tipoLocal, local.TipoLocal, local.tipoLocalDescripcion, local.TipoLocalDescripcion)
        || (idTipoLocal ? String(idTipoLocal) : ""),
      direccion: obtenerTexto(local.direccion, local.Direccion) || undefined,
      comentario: obtenerTexto(local.comentario, local.Comentario),
      imagen: imagenes[0]?.nombre ?? "",
      imagenUrl: obtenerTexto(local.imagenUrl, local.ImagenUrl, local.imagenURL, local.ImagenURL) || imagenes[0]?.url,
      imagenTipo: obtenerTexto(local.imagenTipo, local.ImagenTipo) || imagenes[0]?.tipo,
      imagenes,
    };
  });

  datos.informacionFinanciera = {
    contenido: obtenerTexto(registro.contenidoInformacionFinanciera, registro.ContenidoInformacionFinanciera),
    comentariosFinancieros: obtenerTexto(registro.comentarioInformacionFinanciera, registro.ComentarioInformacionFinanciera),
    activosFijos: obtenerTexto(registro.activosFijos, registro.ActivosFijos),
    seguros: obtenerTexto(registro.seguros, registro.Seguros),
  };

  datos.balances = obtenerLista(registro.balances, registro.Balances).map((item, indice) => {
    const balance = obtenerRegistro(item);
    const cuentaBalance = obtenerRegistro(balance.cuentaBalance, balance.CuentaBalance);
    const idTipoBalance = obtenerNumeroOpcional(balance.idTipoBalance, balance.IdTipoBalance, balance.tipoBalance, balance.TipoBalance);
    const idTipoEstadoFinanciero = obtenerNumeroOpcional(
      balance.idTipoEstadoFinanciero,
      balance.IdTipoEstadoFinanciero,
      balance.tipoEstadoFinanciero,
      balance.TipoEstadoFinanciero,
    );
    const idMoneda = obtenerNumeroOpcional(balance.idMoneda, balance.IdMoneda);
    const tipoEstadoFinanciero = obtenerTexto(balance.tipoEstadoFinanciero, balance.TipoEstadoFinanciero)
      || ({ 1: "Desagregado", 2: "Totalizado", 3: "Bancos", 4: "Seguros", 5: "Turquia" }[
        idTipoEstadoFinanciero ?? 0
      ] ?? "");
    const claveEstadoFinanciero = obtenerClaveEstadoFinanciero(tipoEstadoFinanciero);
    const registrosEstadoFinanciero = adaptarCuentaBalanceDesdeApi(
      cuentaBalance,
      tipoEstadoFinanciero,
    );
    const valorCuenta = (...claves: string[]) => obtenerValorRegistro(cuentaBalance, ...claves);

    return {
      idInformeBalance: obtenerNumeroOpcional(balance.idInformeBalance, balance.IdInformeBalance, balance.idIformeBalance, balance.IdIformeBalance),
      codigo: obtenerTexto(balance.codigo, balance.Codigo) || `${indice + 1}`,
      periodo: obtenerTexto(balance.periodo, balance.Periodo),
      fecha: obtenerTexto(balance.fechaTexto, balance.FechaTexto)
        || [
          formatearFechaEntrada(obtenerTexto(balance.fechaBalance, balance.FechaBalance)),
          obtenerBooleano(balance.flgActualidad, balance.FlgActualidad)
            ? "Actualidad"
            : formatearFechaEntrada(obtenerTexto(balance.fechaHasta, balance.FechaHasta)),
        ].filter(Boolean).join(" - "),
      fechaInicio: formatearFechaEntrada(obtenerTexto(balance.fechaBalance, balance.FechaBalance)) || undefined,
      fechaFin: formatearFechaEntrada(obtenerTexto(balance.fechaHasta, balance.FechaHasta)) || undefined,
      esActual: obtenerBooleano(balance.flgActualidad, balance.FlgActualidad),
      tipo: obtenerTexto(balance.tipo, balance.Tipo),
      idTipoEstadoFinanciero,
      tipoEstadoFinanciero,
      tipoCambio: formatearMonto(balance.tipoCambio, 2),
      idMoneda,
      operacionCambio: obtenerTexto(balance.moneda, balance.Moneda),
      idTipoBalance,
      tipoBalance: obtenerTexto(balance.tipoBalanceDescripcion, balance.TipoBalanceDescripcion)
        || (idTipoBalance ? String(idTipoBalance) : ""),
      balanceGeneral: true,
      perdidaGanancia: true,
      cuentas: Object.keys(cuentaBalance).length > 0,
      detalleCuentas: Object.keys(cuentaBalance).length > 0
        ? {
            balanceGeneral: {
              totalCorrientes: formatearMonto(valorCuenta("totalCorriente", "totalActivoCorriente"), 2),
              totalNoCorrientes: formatearMonto(valorCuenta("totalNoCorriente", "totalActivoNoCorriente"), 2),
              otrosActivos: formatearMonto(valorCuenta("otrosActivos"), 2),
              totalActivos: formatearMonto(valorCuenta("totalActivos", "totalActivo"), 2),
              totalPasivosCorrientes: formatearMonto(valorCuenta("totalPasivosCorrientes", "totalPasivoCorriente"), 2),
              totalPasivosNoCorrientes: formatearMonto(valorCuenta("totalPasivosNoCorrientes", "totalPasivoNoCorriente"), 2),
              otrosPasivos: formatearMonto(valorCuenta("otrosPasivos"), 2),
              totalPasivos: formatearMonto(valorCuenta("totalPasivos", "totalPasivo"), 2),
              patrimonio: formatearMonto(valorCuenta("patrimonio", "totalPatrimonio"), 2),
              totalPasivoPatrimonio: formatearMonto(valorCuenta("totalPasivoPatrimonio", "totalPasivosPatrimonio"), 2),
            },
            estadoGananciasPerdidas: {
              ventasNetas: formatearMonto(valorCuenta("ventasNetas", "ingresosOrdinarios", "ingresosIntereses", "primasGanadasNetas"), 2),
              utilidadGanancia: formatearMonto(valorCuenta("utilidadPerdida", "gananciaNeta", "utilidadEjercicio", "utilidadNeta"), 2),
            },
            ratios: {
              liquidez: formatearNumero(valorCuenta("indiceLiquidez"), 2),
              capitalTrabajo: formatearMonto(valorCuenta("capitalTrabajo"), 2),
              endeudamiento: formatearPorcentaje(valorCuenta("ratioEndeudamiento")),
              rentabilidad: formatearPorcentaje(valorCuenta("ratioRentabilidad")),
            },
            registrosHabilitados: true,
            registrosEstadoFinanciero: Object.fromEntries(
              Object.entries(registrosEstadoFinanciero).map(([clave, valor]) => {
                if (["balance-date", "balance-date-p", "currency", "currency-p", "currency-iso", "reliability-level"].includes(clave)) {
                  return [clave, valor];
                }
                if (esCampoEnteroEstadoFinanciero(clave, tipoEstadoFinanciero)) {
                  return [clave, valor];
                }
                if (/(indebtedness|profitability)/.test(clave)) {
                  return [clave, formatearPorcentaje(valor)];
                }
                const esRatioNumero = claveEstadoFinanciero !== "turquia" && /liquidity/.test(clave);
                return [clave, esRatioNumero ? formatearNumero(valor, 2) : formatearMonto(valor, 2)];
              }),
            ),
          }
        : undefined,
    };
  });

  datos.referencias = {
    comentariosProveedores: obtenerTexto(registro.comentarioProveedor, registro.ComentarioProveedor),
    referenciasBancos: obtenerTexto(registro.referenciaBanco, registro.ReferenciaBanco),
    litigios: obtenerTexto(registro.litigios, registro.Litigios),
    riesgoPrincipal: obtenerTexto(registro.riesgoPrincipal, registro.RiesgoPrincipal),
    superintendencia: obtenerTexto(registro.superintendecia, registro.Superintendecia),
  };

  datos.proveedores = obtenerLista(registro.proveedores, registro.Proveedores).map((item) => {
    const proveedor = obtenerRegistro(item);
    const idTipoProveedor = obtenerNumeroOpcional(proveedor.idTipoPersona, proveedor.IdTipoPersona, proveedor.idTipoProveedor, proveedor.IdTipoProveedor);
    const idLimiteCredito = obtenerNumeroOpcional(proveedor.idLimiteCredito, proveedor.IdLimiteCredito);
    const idPlazoCredito = obtenerNumeroOpcional(proveedor.idPlazoCredito, proveedor.IdPlazoCredito, idLimiteCredito);
    return {
      idInformeProveedor: obtenerNumeroOpcional(proveedor.idInformeProveedor, proveedor.IdInformeProveedor),
      idTipoProveedor,
      nombreEmpresa: obtenerTexto(proveedor.nombre, proveedor.Nombre, proveedor.nombreEmpresa, proveedor.NombreEmpresa),
      contacto: obtenerTexto(proveedor.nombreContacto, proveedor.NombreContacto, proveedor.contacto, proveedor.Contacto),
      tipoProveedor: obtenerTexto(proveedor.productos, proveedor.Productos, proveedor.tipoProveedor, proveedor.TipoProveedor)
        || (idTipoProveedor ? String(idTipoProveedor) : ""),
      telefono: obtenerTexto(proveedor.telefono, proveedor.Telefono),
      tipoPersona: obtenerTexto(proveedor.tipoPersona, proveedor.TipoPersona),
      idPais: obtenerNumeroOpcional(proveedor.idPais, proveedor.IdPais),
      pais: obtenerTexto(proveedor.pais, proveedor.Pais),
      idTipoDocumento: obtenerNumeroOpcional(proveedor.idTipoDocumento, proveedor.IdTipoDocumento),
      taxIdType: obtenerTexto(proveedor.tipoDocumento, proveedor.TipoDocumento, proveedor.taxIdType, proveedor.TaxIdType),
      taxIdNumber: obtenerTexto(proveedor.numeroDocumento, proveedor.NumeroDocumento, proveedor.taxNum, proveedor.TaxNum),
      tieneReferenciaComercial: obtenerBooleano(
        proveedor.esTieneReferenciaComercial,
        proveedor.EsTieneReferenciaComercial,
        proveedor.tieneReferenciaComercial,
        proveedor.TieneReferenciaComercial,
      ),
      esTieneReferenciaComercial: obtenerBooleano(
        proveedor.esTieneReferenciaComercial,
        proveedor.EsTieneReferenciaComercial,
        proveedor.tieneReferenciaComercial,
        proveedor.TieneReferenciaComercial,
      ),
      comienzoNegociaciones: formatearFechaEntrada(obtenerTexto(
        proveedor.comienzoNegociaciones,
        proveedor.ComienzoNegociaciones,
        proveedor.fechaInicio,
        proveedor.FechaInicio,
      )) || undefined,
      idMoneda: obtenerNumeroOpcional(proveedor.idMoneda, proveedor.IdMoneda),
      operacionCambioMoneda: obtenerTexto(proveedor.moneda, proveedor.Moneda),
      tipoCambio: formatearMonto(proveedor.tipoCambio, 6) || undefined,
      idLimiteCredito,
      idPlazoCredito,
      limiteCredito: obtenerTexto(proveedor.plazoCredito, proveedor.PlazoCredito)
        || (idPlazoCredito ? String(idPlazoCredito) : ""),
      promedioMensual: formatearMonto(proveedor.promedioMensual, 2) || undefined,
    };
  });

  datos.bancos = obtenerLista(registro.bancos, registro.Bancos).map((item) => {
    const banco = obtenerRegistro(item);
    return {
      idInformeBanco: obtenerNumeroOpcional(
        banco.idInformeBanco,
        banco.IdInformeBanco,
        banco.idIformeBanco,
        banco.IdIformeBanco,
      ),
      idBanco: obtenerNumero(banco.idBanco, banco.IdBanco),
      idPais: obtenerNumero(banco.idPais, banco.IdPais),
      idSector: obtenerNumeroOpcional(banco.idSector, banco.IdSector),
      pais: obtenerTexto(banco.pais, banco.Pais, banco.nombrePais, banco.NombrePais) || undefined,
      banco: obtenerTexto(banco.nombre, banco.Nombre, banco.banco, banco.Banco),
      numeroCuenta: obtenerTexto(banco.numeroCuenta, banco.NumeroCuenta),
      sector: obtenerTexto(banco.sector, banco.Sector),
      telefono: obtenerTexto(banco.telefono, banco.Telefono, banco.referenciaBanco, banco.ReferenciaBanco),
      sectoristaJefeCuenta: obtenerTexto(banco.sectorista, banco.Sectorista, banco.sectoristaJefeCuenta, banco.SectoristaJefeCuenta) || undefined,
    };
  });

  datos.datosGenerales = {
    informacionGeneral: obtenerTexto(registro.informacionGeneral, registro.InformacionGeneral),
    opinionCredito: obtenerTexto(registro.opinionCredito, registro.OpinionCredito),
  };

  datos.directorioEjecutivo = obtenerLista(
    registro.directoriosEjecutivos,
    registro.DirectoriosEjecutivos,
  ).map((item, indice) => {
    const ejecutivo = obtenerRegistro(item);
    const idDirectorioEjecutivo = obtenerNumeroOpcional(
      ejecutivo.idDirectorioEjecutivo,
      ejecutivo.IdDirectorioEjecutivo,
    );
    const id = idDirectorioEjecutivo ?? obtenerNumero(ejecutivo.id, ejecutivo.Id, indice + 1);
    const nombreCompleto = obtenerTexto(
      ejecutivo.nombreCompleto,
      ejecutivo.NombreCompleto,
      ejecutivo.ejecutivo,
      ejecutivo.Ejecutivo,
    );

    return {
      idInformeDirectorioEjecutivo: obtenerNumeroOpcional(
        ejecutivo.idInformeDirectorioEjecutivo,
        ejecutivo.IdInformeDirectorioEjecutivo,
      ),
      id,
      idDirectorioEjecutivo,
      idCargo: obtenerNumeroOpcional(ejecutivo.idCargo, ejecutivo.IdCargo),
      ejecutivo: nombreCompleto,
      cargo: obtenerTexto(ejecutivo.cargos, ejecutivo.Cargos, ejecutivo.cargo, ejecutivo.Cargo, ejecutivo.idCargo, ejecutivo.IdCargo),
      porcentaje: formatearNumero(ejecutivo.participacion, 8),
      lista: obtenerBooleano(ejecutivo.apareceImpresoLista, ejecutivo.ApareceImpresoLista),
      detalleEjecutivo: obtenerBooleano(ejecutivo.imprimeDatosEjecutivos, ejecutivo.ImprimeDatosEjecutivos),
      orden: formatearEntero(ejecutivo.orden),
      vinculadoDesde: formatearFechaEntrada(obtenerTexto(ejecutivo.vinculadoDesde, ejecutivo.VinculadoDesde, ejecutivo.formularioVinculado, ejecutivo.FormularioVinculado)),
      companiaAnterior: obtenerTexto(ejecutivo.companiaAnterior, ejecutivo.CompaniaAnterior),
      esParteDirectorio: obtenerBooleano(ejecutivo.esParticipanteDirectiva, ejecutivo.EsParticipanteDirectiva),
      pais: obtenerTexto(ejecutivo.pais, ejecutivo.Pais),
      tipoPersona: obtenerTexto(ejecutivo.tipoPersona, ejecutivo.TipoPersona),
      descripcionBusqueda: obtenerTexto(ejecutivo.referencias, ejecutivo.Referencias),
      nombreCompleto,
    };
  });

  return {
    idInforme: obtenerNumero(registro.idInforme, registro.IdInforme) || undefined,
    idPedido: obtenerNumero(registro.idPedido, registro.IdPedido) || undefined,
    idTipoPersona: obtenerNumeroOpcional(registro.idTipoPersona, registro.IdTipoPersona),
    idPais: obtenerNumeroOpcional(registro.idPais, registro.IdPais),
    taxIdType: obtenerNumeroOpcional(registro.taxIdType, registro.TaxIdType),
    idEstadoManual: obtenerNumeroOpcional(registro.idEstadoManual, registro.IdEstadoManual),
    idTipoEmpresa: obtenerNumeroOpcional(registro.idTipoEmpresa, registro.IdTipoEmpresa),
    idTipoCambio: obtenerNumeroOpcional(registro.idTipoCambio, registro.IdTipoCambio),
    idOperacionesTCMoneda: obtenerNumeroOpcional(registro.operacionesTCMoneda, registro.OperacionesTCMoneda),
    idOperacionesCambioDivisas: obtenerNumeroOpcional(registro.idOperacionesCambioDivisas, registro.IdOperacionesCambioDivisas),
    idVentasCreditoTiempo: obtenerNumeroOpcional(registro.idVentasCreditoTiempo, registro.IdVentasCreditoTiempo),
    idCiudadRegistro: obtenerNumeroOpcional(registro.idCiudadRegistro, registro.IdCiudadRegistro),
    idSector: obtenerNumeroOpcional(registro.idSector, registro.IdSector),
    idActividad: obtenerNumeroOpcional(registro.idActividad, registro.IdActividad),
    idIsicCategoria: obtenerNumeroOpcional(registro.idIsicCategoria, registro.IdIsicCategoria),
    idIsicClase: obtenerNumeroOpcional(registro.idIsicClase, registro.IdIsicClase),
    datosInvestigacion: datos,
    archivosInvestigacion,
  };
}

async function enriquecerRespuestaObtener(respuesta: InformeObtenerResponse): Promise<InformeObtenerResponse> {
  const [
    sectores,
    tiposLocal,
    tiposBalance,
    estadosFinancieros,
    monedas,
    tiposProveedor,
    limitesCreditoProveedor,
    paises,
    tiposDocumento,
    tiposPersona,
    estadosCliente,
    tiposEmpresa,
    ciudades,
    actividadesEconomicas,
    clasesCiiu,
    tiemposCreditoVentas,
  ]: EntradaTablaMaestra[][] = await Promise.all([
    servicioTablaMaestra.list(TablaMaestraId.SECTOR_ECONOMICO).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.TIPO_LOCAL).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.TIPO_BALANCE).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.ESTADO_FINANCIERO).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.MONEDA).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.TIPO_PROVEEDOR).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.LIMITE_CREDITO_PROVEEDOR).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.PAIS).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.TIPO_REG_TRIBUTARIO).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.TIPO_PERSONA).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.ESTADO_CLIENTE).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.TIPO_EMPRESA).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.CIUDAD).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.ACTIVIDAD_ECONOMICA).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.CLASE_CIIU).catch(() => []),
    servicioTablaMaestra.list(TablaMaestraId.TIEMPO_CREDITO_VENTAS).catch(() => []),
  ]);

  const companias: RegistroCompaniaInvestigacion[] = await Promise.all(
    respuesta.datosInvestigacion.companiasRelacionadas.map(async (compania): Promise<RegistroCompaniaInvestigacion> => {
      if (!compania.idCompania || (compania.empresa && compania.idFiscal && compania.pais)) return compania;

      try {
        const detalle = await servicioCompania.obtener({ idCompania: compania.idCompania });
        if (!detalle) return compania;

        return {
          ...compania,
          empresa: compania.empresa || detalle.nombreCompleto,
          idFiscal: compania.idFiscal || detalle.numeroDocumento,
          pais: compania.pais || detalle.pais,
        };
      } catch {
        return compania;
      }
    }),
  );

  const bancos: RegistroBancoInvestigacion[] = await Promise.all(
    respuesta.datosInvestigacion.bancos.map(async (banco): Promise<RegistroBancoInvestigacion> => {
      if (!banco.idBanco) return banco;

      try {
        const detalle = await servicioBanco.obtener({ idBanco: banco.idBanco });
        if (!detalle) return banco;

        const idSector = banco.idSector ?? detalle.idSector;

        return {
          ...banco,
          idPais: banco.idPais ?? detalle.idPais,
          pais: banco.pais || detalle.pais,
          banco: banco.banco || detalle.nombre,
          telefono: banco.telefono || detalle.telefono,
          idSector,
          sector: banco.sector || sectores.find((sector) => sector.num1 === idSector)?.string1 || "",
        };
      } catch {
        return banco;
      }
    }),
  );

  const directorios: RegistroDirectorioInvestigacion[] = await Promise.all(
    respuesta.datosInvestigacion.directorioEjecutivo.map(async (ejecutivo): Promise<RegistroDirectorioInvestigacion> => {
      if (!ejecutivo.idDirectorioEjecutivo || (ejecutivo.pais && ejecutivo.tipoPersona && ejecutivo.descripcionBusqueda)) return ejecutivo;

      try {
        const detalle = await servicioDirectorioEjecutivo.obtener({ idDirectorioEjecutivo: ejecutivo.idDirectorioEjecutivo });
        if (!detalle) return ejecutivo;

        return {
          ...ejecutivo,
          pais: ejecutivo.pais || detalle.pais,
          tipoPersona: ejecutivo.tipoPersona || detalle.tipoPersona,
          descripcionBusqueda: ejecutivo.descripcionBusqueda || detalle.referenciaAdicional,
          nombreCompleto: ejecutivo.nombreCompleto || detalle.nombres,
          ejecutivo: ejecutivo.ejecutivo || detalle.nombres,
        };
      } catch {
        return ejecutivo;
      }
    }),
  );

  const locales: RegistroLocalInvestigacion[] = respuesta.datosInvestigacion.locales.map((local) => ({
    ...local,
    tipoLocal: tiposLocal.find((tipoLocal) => tipoLocal.num1 === local.idTipoLocal)?.string1
      || local.tipoLocal,
  }));

  const resolverIdMoneda = (val: string, campo: "string1" | "string2") => {
    const id = Number(val);
    return Number.isFinite(id) && id > 0
      ? (monedas.find((m) => m.num1 === id)?.[campo] ?? val)
      : val;
  };

  const balances: RegistroBalanceInvestigacion[] = respuesta.datosInvestigacion.balances.map((balance) => {
    let detalleCuentas = balance.detalleCuentas;

    const esTipoTurquia =
      balance.idTipoEstadoFinanciero === 5 ||
      (balance.tipoEstadoFinanciero ?? "").toLowerCase().includes("turqu");

    if (esTipoTurquia && detalleCuentas?.registrosEstadoFinanciero) {
      const registros: Record<string, string> = { ...detalleCuentas.registrosEstadoFinanciero };
      if (registros["currency"]) registros["currency"] = resolverIdMoneda(registros["currency"], "string1");
      if (registros["currency-p"]) registros["currency-p"] = resolverIdMoneda(registros["currency-p"], "string1");
      if (registros["currency-iso"]) registros["currency-iso"] = resolverIdMoneda(registros["currency-iso"], "string2");
      detalleCuentas = { ...detalleCuentas, registrosEstadoFinanciero: registros };
    }

    return {
      ...balance,
      tipoBalance: tiposBalance.find((tipoBalance) => tipoBalance.num1 === balance.idTipoBalance)?.string1
        || balance.tipoBalance,
      tipoEstadoFinanciero: estadosFinancieros.find((estadoFinanciero) => estadoFinanciero.num1 === balance.idTipoEstadoFinanciero)?.string1
        || balance.tipoEstadoFinanciero,
      operacionCambio: monedas.find((moneda) => moneda.num1 === balance.idMoneda)?.string1
        || balance.operacionCambio,
      detalleCuentas,
    };
  });

  const proveedores: RegistroProveedorInvestigacion[] = respuesta.datosInvestigacion.proveedores.map((proveedor) => ({
    ...proveedor,
    tipoProveedor: tiposProveedor.find((tipoProveedor) => tipoProveedor.num1 === proveedor.idTipoProveedor)?.string1
      || proveedor.tipoProveedor,
    pais: paises.find((pais) => pais.num1 === proveedor.idPais)?.string1
      || proveedor.pais,
    taxIdType: tiposDocumento.find((tipoDocumento) => tipoDocumento.num1 === proveedor.idTipoDocumento)?.string1
      || proveedor.taxIdType,
    operacionCambioMoneda: monedas.find((moneda) => moneda.num1 === proveedor.idMoneda)?.string1
      || proveedor.operacionCambioMoneda,
    limiteCredito: limitesCreditoProveedor.find((limiteCredito) => limiteCredito.num1 === (proveedor.idPlazoCredito ?? proveedor.idLimiteCredito))?.string1
      || proveedor.limiteCredito,
  }));

  const operacionPrincipal = { ...respuesta.datosInvestigacion.operacionPrincipal };
  if (respuesta.idSector) {
    const entradaSector = sectores.find((s) => s.num1 === respuesta.idSector);
    if (entradaSector) {
      operacionPrincipal.sector = entradaSector.string2 && entradaSector.string1
        ? `${entradaSector.string2} - ${entradaSector.string1}`
        : (entradaSector.string1 ?? operacionPrincipal.sector);
    }
  }
  if (respuesta.idIsicCategoria) {
    const opcionCategoria = actividadesEconomicas.find((a) => a.num1 === respuesta.idIsicCategoria);
    if (opcionCategoria) {
      operacionPrincipal.categoriaCiiu = opcionCategoria.string2 && opcionCategoria.string1
        ? `${opcionCategoria.string2} - ${opcionCategoria.string1}`
        : (opcionCategoria.string1 ?? operacionPrincipal.categoriaCiiu);
    }
  }
  if (respuesta.idIsicClase) {
    const opcionClase = clasesCiiu.find((c) => c.num1 === respuesta.idIsicClase);
    if (opcionClase) {
      operacionPrincipal.claseCiiu = opcionClase.string2 && opcionClase.string1
        ? `${opcionClase.string2} - ${opcionClase.string1}`
        : (opcionClase.string1 ?? operacionPrincipal.claseCiiu);
    }
  }
  if (respuesta.idVentasCreditoTiempo) {
    operacionPrincipal.ventasCreditoTiempo = tiemposCreditoVentas.find((t) => t.num1 === respuesta.idVentasCreditoTiempo)?.string1 ?? operacionPrincipal.ventasCreditoTiempo;
  }

  const enriquecerImportExport = (item: typeof respuesta.datosInvestigacion.importaciones[number]) => {
    const entradaMoneda = item.idMoneda ? monedas.find((m) => m.num1 === item.idMoneda) ?? null : null;
    const iso = entradaMoneda?.string2 ?? null;
    return {
      ...item,
      moneda: entradaMoneda?.string1 || item.moneda,
      monto: item.monto && iso ? `${item.monto} ${iso}` : item.monto,
    };
  };

  const importaciones = respuesta.datosInvestigacion.importaciones.map(enriquecerImportExport);
  const exportaciones = respuesta.datosInvestigacion.exportaciones.map(enriquecerImportExport);

  const identificacion = { ...respuesta.datosInvestigacion.identificacion };
  if (!identificacion.tipoPersona && respuesta.idTipoPersona) {
    identificacion.tipoPersona = tiposPersona.find((t) => t.num1 === respuesta.idTipoPersona)?.string1 ?? identificacion.tipoPersona;
  }
  if (!identificacion.pais && respuesta.idPais) {
    identificacion.pais = paises.find((p) => p.num1 === respuesta.idPais)?.string1 ?? identificacion.pais;
  }
  if (!identificacion.operacionesCambio && respuesta.idOperacionesTCMoneda) {
    identificacion.operacionesCambio = monedas.find((m) => m.num1 === respuesta.idOperacionesTCMoneda)?.string1 ?? identificacion.operacionesCambio;
  }
  if (!identificacion.tipoIdentificacionFiscal && respuesta.taxIdType) {
    identificacion.tipoIdentificacionFiscal = tiposDocumento.find((t) => t.num1 === respuesta.taxIdType)?.string1 ?? identificacion.tipoIdentificacionFiscal;
  }
  if (!identificacion.estadoActual && respuesta.idEstadoManual) {
    identificacion.estadoActual = estadosCliente.find((e) => e.num1 === respuesta.idEstadoManual)?.string1 ?? identificacion.estadoActual;
  }

  const aspectosLegales = { ...respuesta.datosInvestigacion.aspectosLegales };
  if (!aspectosLegales.tipoEmpresa && respuesta.idTipoEmpresa) {
    aspectosLegales.tipoEmpresa = tiposEmpresa.find((t) => t.num1 === respuesta.idTipoEmpresa)?.string1 ?? aspectosLegales.tipoEmpresa;
  }
  if (!aspectosLegales.ciudadRegistro && respuesta.idCiudadRegistro) {
    aspectosLegales.ciudadRegistro = ciudades.find((c) => c.num1 === respuesta.idCiudadRegistro)?.string1 ?? aspectosLegales.ciudadRegistro;
  }

  const entradaMonedaDivisas = respuesta.idOperacionesCambioDivisas
    ? monedas.find((m) => m.num1 === respuesta.idOperacionesCambioDivisas) ?? null
    : null;
  const entradaMonedaTipoCambio = respuesta.idTipoCambio
    ? monedas.find((m) => m.num1 === respuesta.idTipoCambio) ?? null
    : null;

  if (entradaMonedaDivisas) {
    aspectosLegales.operacionesCambioDivisas = entradaMonedaDivisas.string1 ?? aspectosLegales.operacionesCambioDivisas;
  }
  if (entradaMonedaTipoCambio) {
    aspectosLegales.monedaTipoCambio = entradaMonedaTipoCambio.string1 ?? aspectosLegales.monedaTipoCambio;
  }

  const isoDivisas = entradaMonedaDivisas?.string2 ?? null;
  const isoTipoCambio = entradaMonedaTipoCambio?.string2 ?? null;

  if (isoDivisas) {
    const agregarIso = (valor: string) => valor ? `${valor} ${isoDivisas}` : valor;
    if (aspectosLegales.capitalInicial) aspectosLegales.capitalInicial = agregarIso(aspectosLegales.capitalInicial);
    if (aspectosLegales.capitalDesembolsado) aspectosLegales.capitalDesembolsado = agregarIso(aspectosLegales.capitalDesembolsado);
    if (aspectosLegales.patrimonioNeto) aspectosLegales.patrimonioNeto = agregarIso(aspectosLegales.patrimonioNeto);
    if (aspectosLegales.valorAcciones) aspectosLegales.valorAcciones = agregarIso(aspectosLegales.valorAcciones);
  }

  if (aspectosLegales.tipoCambio && isoTipoCambio && isoDivisas) {
    aspectosLegales.tipoCambio = `1 ${isoTipoCambio} = ${aspectosLegales.tipoCambio} ${isoDivisas}`;
  }

  return {
    ...respuesta,
    datosInvestigacion: {
      ...respuesta.datosInvestigacion,
      identificacion,
      aspectosLegales,
      operacionPrincipal,
      importaciones,
      exportaciones,
      companiasRelacionadas: companias,
      bancos,
      directorioEjecutivo: directorios,
      locales,
      balances,
      proveedores,
    },
  };
}

export const informeService = {
  list: async (params: InformeListParams): Promise<InformeListResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/Informe/listar", {
      params: {
        Busqueda: params.busqueda,
        IdPedido: params.idPedido,
        IdEstado: params.idEstado,
        NumPag: params.numPag,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/listar")) {
      throw new Error(data.mensaje || "Error al listar los informes");
    }

    return normalizarRespuestaLista(data.result);
  },

  create: async (payload: InformeCrearRequest): Promise<InformeCrearResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Informe/crear", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/crear")) {
      throw new Error(data.mensaje || "Error al crear el informe");
    }

    return normalizarRespuestaCrear(data.result);
  },

  editar: async (payload: InformeCrearRequest): Promise<InformeCrearResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Informe/editar", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/editar")) {
      throw new Error(data.mensaje || "Error al editar el informe");
    }

    return normalizarRespuestaCrear(data.result);
  },

  obtener: async ({ idPedido }: InformeObtenerParams): Promise<InformeObtenerResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/Informe/obtener", {
      params: {
        IdPedido: idPedido,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/obtener")) {
      throw new Error(data.mensaje || "Error al obtener el informe");
    }

    return enriquecerRespuestaObtener(normalizarRespuestaObtener(data.result));
  },

  generarUrlsArchivo: async (
    payload: InformeGenerarUrlsArchivoRequest,
  ): Promise<InformeUrlArchivoGenerada[]> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      "/api/Informe/generarUrlsArchivo",
      payload,
    );

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/generarUrlsArchivo")) {
      throw new Error(data.mensaje || "No se pudieron generar las URLs de los archivos");
    }

    const urls = normalizarUrlsArchivoGeneradas(data.result);
    if (urls.some((archivo) => !archivo.nombre || !archivo.uploadUrl || !archivo.archivoUrl)) {
      throw new Error("La respuesta de URLs de archivos es invalida");
    }

    return urls;
  },

  insertarArchivoLote: async (
    payload: InformeInsertarArchivoLoteRequest,
  ): Promise<InformeInsertarArchivoLoteResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      "/api/Informe/insertarArchivoLote",
      payload,
    );

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/insertarArchivoLote")) {
      throw new Error(data.mensaje || "No se pudieron registrar los archivos");
    }

    return normalizarRespuestaCrear(data.result);
  },

  obtenerArchivo: async (
    payload: InformeObtenerArchivoRequest,
  ): Promise<InformeObtenerArchivoResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      "/api/Informe/obtenerArchivo",
      payload,
    );

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/obtenerArchivo")) {
      throw new Error(data.mensaje || "No se pudo obtener el archivo");
    }

    const registro = obtenerRegistro(
      Array.isArray(data.result) ? data.result[0] : data.result,
    );
    const downloadUrl = obtenerTexto(
      typeof data.result === "string" ? data.result : undefined,
      registro.downloadUrl,
      registro.DownloadUrl,
      registro.archivoUrl,
      registro.ArchivoUrl,
      registro.url,
      registro.Url,
    );
    if (!downloadUrl) throw new Error("La respuesta del archivo es invalida");

    return { downloadUrl };
  },

  actualizarArchivo: async (
    payload: InformeActualizarArchivoRequest,
  ): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      "/api/Informe/actualizarArchivo",
      payload,
    );

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/actualizarArchivo")) {
      throw new Error(data.mensaje || "No se pudo actualizar el archivo");
    }
  },

  eliminarArchivo: async (
    payload: InformeEliminarArchivoRequest,
  ): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      "/api/Informe/eliminarArchivo",
      payload,
    );

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/eliminarArchivo")) {
      throw new Error(data.mensaje || "No se pudo eliminar el archivo");
    }
  },

  obtenerUrlPrefirmada: async (
    payload: InformeObtenerUrlPrefirmadaRequest,
  ): Promise<InformeObtenerUrlPrefirmadaResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Informe/obtenerUrlPrefirmada", payload);

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/obtenerUrlPrefirmada")) {
      throw new Error(data.mensaje || "No se pudo obtener la URL prefirmada");
    }

    const respuesta = normalizarRespuestaUrlPrefirmada(data.result);
    if (!respuesta.uploadUrl || !respuesta.fileKey) {
      throw new Error("La respuesta de URL prefirmada es invalida");
    }

    return respuesta;
  },

  subirArchivoUrlPrefirmada: async (uploadUrl: string, archivo: File) => {
    const respuesta = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": archivo.type || "application/octet-stream",
      },
      body: archivo,
    });

    if (!respuesta.ok) {
      throw new Error("No se pudo subir el archivo al almacenamiento");
    }
  },

  actualizarEstadoCargaImagenes: async (ids: number[]): Promise<void> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Informe/actualizarEstadoCargaImagenes", { ids });

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/actualizarEstadoCargaImagenes")) {
      throw new Error(data.mensaje || "No se pudo actualizar el estado de carga de imágenes");
    }
  },

  obtenerUrlsImagenes: async (ids: number[]): Promise<{ idInformeLocalImagen: number; url: string }[]> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Informe/obtenerUrlsImagenes", { ids });

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/obtenerUrlsImagenes")) {
      throw new Error(data.mensaje || "No se pudo obtener las URLs de las imágenes");
    }

    const lista = Array.isArray(data.result) ? data.result : [];
    return lista.map((item: unknown) => {
      const registro = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
      return {
        idInformeLocalImagen: obtenerNumero(registro.idInformeLocalImagen, registro.IdInformeLocalImagen) ?? 0,
        url: obtenerTexto(registro.url, registro.Url, registro.uploadUrl, registro.UploadUrl),
      };
    });
  },

  autocompletar: async (payload: InformeAutocompletarRequest): Promise<InformeExtraccionResponse> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Informe/autocompletar", payload, {
      timeout: TIMEOUT_EXTRACCION_MS,
    });

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/autocompletar")) {
      throw new Error(data.mensaje || "No se pudo autocompletar el documento");
    }

    return normalizarRespuestaExtraccion(data.result);
  },

  extraerDocumento: async (payload: InformeExtraerDocumentoRequest): Promise<InformeExtraccionResponse> => {
    const formulario = new FormData();
    formulario.append("archivo", payload.archivo);
    formulario.append("secciones", payload.secciones);
    formulario.append("prompt", payload.prompt);

    const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Informe/extraerDocumento", formulario, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: TIMEOUT_EXTRACCION_MS,
    });

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/extraerDocumento")) {
      throw new Error(data.mensaje || "No se pudo extraer la informacion del documento");
    }

    return normalizarRespuestaExtraccion(data.result);
  },

  calcularBalance: async (payload: {
    tipoEstadoFinanciero: string;
    registros: Record<string, string>;
    balanceGeneral: Record<string, string>;
    estadoGananciasPerdidas: Record<string, string>;
  }): Promise<Record<string, string>> => {
    const clave = obtenerClaveEstadoFinanciero(payload.tipoEstadoFinanciero);
    const n = (...valores: Array<string | undefined>) => {
      const valor = valores.find((item) => item?.trim());
      return obtenerNumeroDesdeMonto(valor);
    };
    const r = payload.registros;
    const bg = payload.balanceGeneral;
    const egp = payload.estadoGananciasPerdidas;

    if (clave === "totalizado") {
      const cuerpo = {
        totalActivoCorriente: n(bg.totalCorrientes, r["total-activo-corriente"]),
        totalActivoNoCorriente: n(bg.totalNoCorrientes, r["total-activo-no-corriente"]),
        totalPasivoCorriente: n(bg.totalPasivosCorrientes, r["total-pasivo-corriente"]),
        totalPasivoNoCorriente: n(bg.totalPasivosNoCorrientes, r["total-pasivo-no-corriente"]),
        totalPatrimonio: n(bg.patrimonio, r["total-patrimonio"]),
        ingresosOrdinarios: n(r["ingresos-ordinarios-totalizado"], egp.ventasNetas),
        gananciaNeta: n(r["ganancia-neta-totalizado"], egp.utilidadGanancia),
      };
      const { data } = await maximilianService.post<ApiResponse<unknown>>("/api/Informe/calcularBalanceTotalizado", cuerpo);
      if (!esRespuestaOkCompatibilidad(data, "/api/Informe/calcularBalanceTotalizado")) {
        throw new Error(data.mensaje || "Error al calcular el balance");
      }
      const resultado = obtenerRegistro(obtenerLista(data.result)[0], data.result);
      return adaptarCuentaBalanceDesdeApi(resultado, payload.tipoEstadoFinanciero);
    }

    if (clave === "desagregado") {
      const campos = [
        "efectivoEquivalente",
        "otrosActivosFinancierosCorriente",
        "cuentasCobrarCorriente",
        "inventariosCorriente",
        "activosBiologicosCorriente",
        "activosImpuestosGanancias",
        "otrosActivosNoFinancierosCorriente",
        "otrosActivosFinancierosNoCorriente",
        "inversionesSubsidiarias",
        "cuentasCobrarNoCorriente",
        "inventariosNoCorriente",
        "activosBiologicosNoCorriente",
        "propiedadesInversion",
        "propiedadesPlantaEquipo",
        "intangibles",
        "activosImpuestosDiferidos",
        "activosImpuestosCorrientes",
        "plusvalia",
        "otrosActivosNoFinancierosNoCorriente",
        "otrosPasivosFinancierosCorriente",
        "cuentasPagarCorriente",
        "beneficiosEmpleadosCorriente",
        "otrasProvisionesCorriente",
        "impuestosGananciasCorriente",
        "otrosPasivosNoFinancierosCorriente",
        "otrosPasivosFinancierosNoCorriente",
        "cuentasPagarNoCorriente",
        "beneficiosEmpleadosNoCorriente",
        "otrasProvisionesNoCorriente",
        "impuestosDiferidosNoCorriente",
        "impuestosCorrientesNoCorriente",
        "otrosPasivosNoFinancierosNoCorriente",
        "capitalEmitido",
        "primasEmision",
        "accionesInversion",
        "accionesCartera",
        "otrasReservasCapital",
        "resultadosAcumulados",
        "otrasReservasPatrimonio",
        "ingresosOrdinarios",
        "costoVentas",
        "gastosVentas",
        "gastosAdministracion",
        "otrosIngresosOperativos",
        "otrosGastosOperativos",
        "otrasGananciasPerdidas",
        "ingresosFinancieros",
        "ingresosIntereses",
        "gastosFinancieros",
        "deterioroValor",
        "otrosIngresosSubsidiarias",
        "diferenciasCambio",
        "ingresoGastoImpuesto",
        "operacionesDescontinuadas",
      ];
      const cuerpo = Object.fromEntries(
        campos.map((campo) => [
          campo,
          n(obtenerValorCampoEstadoFinanciero(r, campo, payload.tipoEstadoFinanciero)),
        ]),
      );
      const ruta = "/api/Informe/calcularBalanceDesagregado";
      const { data } = await maximilianService.post<ApiResponse<unknown>>(ruta, cuerpo);
      if (!esRespuestaOkCompatibilidad(data, ruta)) {
        throw new Error(data.mensaje || "Error al calcular el balance");
      }
      const resultado = obtenerRegistro(obtenerLista(data.result)[0], data.result);
      return adaptarCuentaBalanceDesdeApi(resultado, payload.tipoEstadoFinanciero);
    }

    if (clave === "bancos") {
      const campos = [
        "disponible",
        "fondosInterbancarios",
        "inversionesValorRazonable",
        "carteraCreditos",
        "derivadosNegociacionActivo",
        "derivadosCoberturaActivo",
        "bienesRealizables",
        "participacionesSubsidiarias",
        "inmuebleMobiliarioEquipo",
        "impuestoRentaDiferido",
        "otrosActivos",
        "obligacionesPublico",
        "fondosInterbancariosPasivo",
        "adeudosFinancieras",
        "derivadosNegociacionPasivo",
        "derivadosCoberturaPasivo",
        "cuentasPagarProvisiones",
        "capitalSocial",
        "reservas",
        "resultadosNoRealizados",
        "resultadoEjercicio",
      ];
      const cuerpo = Object.fromEntries(
        campos.map((campo) => [
          campo,
          n(obtenerValorCampoEstadoFinanciero(r, campo, payload.tipoEstadoFinanciero)),
        ]),
      );
      const ruta = "/api/Informe/calcularBalanceBanco";
      const { data } = await maximilianService.post<ApiResponse<unknown>>(ruta, cuerpo);
      if (!esRespuestaOkCompatibilidad(data, ruta)) {
        throw new Error(data.mensaje || "Error al calcular el balance");
      }
      const resultado = obtenerRegistro(obtenerLista(data.result)[0], data.result);
      return adaptarCuentaBalanceDesdeApi(resultado, payload.tipoEstadoFinanciero);
    }

    if (clave === "seguros") {
      const campos = [
        "efectivoDisponible",
        "inversionesFinancieras",
        "prestamosInteresesNetos",
        "primasCobrar",
        "deudasReaseguradores",
        "activosVenta",
        "propiedadesInversion",
        "propiedadPlantaEquipo",
        "otrosActivos",
        "obligacionesAsegurados",
        "reservasSiniestros",
        "reservasTecnicas",
        "obligacionesReaseguradores",
        "obligacionesFinancieras",
        "cuentasPagar",
        "otrosPasivos",
        "capitalSocial",
        "aportesCapitalNoCapitalizados",
        "resultadosAcumulados",
        "patrimonioRestringido",
      ];
      const cuerpo = Object.fromEntries(
        campos.map((campo) => [
          campo,
          n(obtenerValorCampoEstadoFinanciero(r, campo, payload.tipoEstadoFinanciero)),
        ]),
      );
      const ruta = "/api/Informe/calcularBalanceSeguro";
      const { data } = await maximilianService.post<ApiResponse<unknown>>(ruta, cuerpo);
      if (!esRespuestaOkCompatibilidad(data, ruta)) {
        throw new Error(data.mensaje || "Error al calcular el balance");
      }
      const resultado = obtenerRegistro(obtenerLista(data.result)[0], data.result);
      return adaptarCuentaBalanceDesdeApi(resultado, payload.tipoEstadoFinanciero);
    }

    if (clave === "turquia") {
      const campos = [
        "efectivo",
        "existencias",
        "deudores",
        "bienesTongibles",
        "activosIntangibles",
        "prestamos",
        "acreedores",
        "pasivosNoCorrientes",
        "pasivosLargoPlazo",
        "patrimonio",
        "ventasNetas",
        "costoVentas",
        "otrosGastosOperativos",
        "costoEmpleados",
        "depreciacion",
        "ingresosFinancieros",
        "gastosFinancieros",
        "ingresosExtraordinarios",
        "gastosExtraordinarios",
        "impuestos",
        "costoMateriales",
        "interesesPagados",
        "capital",
        "ebit",
        "ebitda",
        "ganancia",
      ];
      const cuerpo = Object.fromEntries(
        campos.map((campo) => [
          campo,
          n(obtenerValorCampoEstadoFinanciero(r, campo, payload.tipoEstadoFinanciero)),
        ]),
      );
      const ruta = "/api/Informe/calcularBalanceTurquia";
      const { data } = await maximilianService.post<ApiResponse<unknown>>(ruta, cuerpo);
      if (!esRespuestaOkCompatibilidad(data, ruta)) {
        throw new Error(data.mensaje || "Error al calcular el balance");
      }
      const resultado = obtenerRegistro(obtenerLista(data.result)[0], data.result);
      return adaptarCuentaBalanceDesdeApi(resultado, payload.tipoEstadoFinanciero);
    }

    throw new Error(`Endpoint de calculo no disponible para el tipo: ${payload.tipoEstadoFinanciero}`);
  },
};
