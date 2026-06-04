import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilianService";
import { servicioBanco } from "./banco.service";
import { servicioCompania } from "./compania.service";
import { servicioDirectorioEjecutivo } from "./directorioEjecutivo.service";
import { servicioTablaMaestra } from "./tablaMaestra.service";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import type {
  InformeAutocompletarRequest,
  InformeCrearRequest,
  InformeCrearResponse,
  InformeExtraerDocumentoRequest,
  InformeExtraccionResponse,
  InformeListEntry,
  InformeListParams,
  InformeListResponse,
  InformeObtenerParams,
  InformeObtenerUrlPrefirmadaRequest,
  InformeObtenerUrlPrefirmadaResponse,
  InformeObtenerResponse,
} from "@maximilian/shared/types/informe.type";
import type {
  AccionBandejaAnalista,
  ArchivoInvestigacionAnalista,
  DatosInvestigacionAnalista,
  EstadoInvestigacionAnalista,
} from "@maximilian/shared/types/investigacion.type";

type RegistroCompaniaInvestigacion = DatosInvestigacionAnalista["companiasRelacionadas"][number];
type RegistroBancoInvestigacion = DatosInvestigacionAnalista["bancos"][number];
type RegistroDirectorioInvestigacion = DatosInvestigacionAnalista["directorioEjecutivo"][number];

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
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;

  const coincidenciaIso = texto.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (coincidenciaIso?.[1]) return coincidenciaIso[1];

  const coincidenciaLatina = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (coincidenciaLatina) {
    const [, dia, mes, ano] = coincidenciaLatina;
    return `${ano}-${mes}-${dia}`;
  }

  return texto;
}

function formatearNumero(valor: unknown, decimales = 2): string {
  const numero = obtenerNumeroOpcional(valor);
  if (numero == null) return "";
  return numero.toFixed(decimales);
}

function formatearEntero(valor: unknown): string {
  const numero = obtenerNumeroOpcional(valor);
  if (numero == null) return "";
  return String(Math.trunc(numero));
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
    codigo: obtenerTexto(registro.codigo, registro.Codigo, registro.codigoPedido, registro.CodigoPedido) || "-",
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

function normalizarRespuestaCrear(resultado: unknown): InformeCrearResponse {
  if (Array.isArray(resultado)) {
    const primerRegistro = resultado[0];
    return normalizarRespuestaCrear(primerRegistro);
  }

  const registro = typeof resultado === "object" && resultado !== null ? (resultado as Record<string, unknown>) : {};

  return {
    idInforme: obtenerNumero(registro.idInforme, registro.IdInforme) || undefined,
    idPedido: obtenerNumero(registro.idPedido, registro.IdPedido) || undefined,
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
      ventasCreditoSeleccion: "",
      territorioVentasPorcentaje: "",
      territorioVentasDetalle: "",
      ventasExtranjeroPorcentaje: "",
      ventasExtranjeroDetalle: "",
      comprasNacionalesPorcentaje: "",
      comprasNacionalesDetalle: "",
      comprasExtranjeroPorcentaje: "",
      comprasExtranjeroDetalle: "",
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

  datos.aspectosLegales = {
    tipoEmpresa: obtenerTexto(registro.tipoEmpresa, registro.TipoEmpresa),
    fechaConstitucion: formatearFechaEntrada(obtenerTexto(registro.fechaConstitucion, registro.FechaConstitucion)),
    ciudadRegistro: obtenerTexto(registro.ciudadRegistro, registro.CiudadRegistro),
    notaria: obtenerTexto(registro.idNotaria, registro.IdNotaria, registro.notaria, registro.Notaria),
    notario: obtenerTexto(registro.idNotario, registro.IdNotario, registro.notario, registro.Notario),
    registro: obtenerTexto(registro.idRegistro, registro.IdRegistro, registro.registro, registro.Registro),
    condiciones: obtenerTexto(registro.idPlazo, registro.IdPlazo, registro.condiciones, registro.Condiciones),
    operacionesCambioDivisas: String(
      obtenerNumeroOpcional(registro.idOperacionesCambioDivisas, registro.IdOperacionesCambioDivisas) ?? "",
    ) || obtenerTexto(registro.operacionesCambioDivisas, registro.OperacionesCambioDivisas),
    monedaTipoCambio: obtenerTexto(registro.monedaTipoCambio, registro.MonedaTipoCambio),
    capitalInicial: formatearNumero(registro.capitalInicial, 2),
    capitalDesembolsado: formatearNumero(registro.capitalPagado, 2),
    ultimaAmpliacion: formatearFechaEntrada(obtenerTexto(registro.fechaUltimoIncremento, registro.FechaUltimoIncremento)),
    patrimonioNeto: formatearNumero(registro.patrimonioNeto, 2),
    tipoAcciones: obtenerTexto(registro.tipoAcciones, registro.TipoAcciones),
    valorAcciones: formatearNumero(registro.valorAcciones, 2),
    obligacionBolsa: obtenerBooleano(registro.cotizaBolsa, registro.CotizaBolsa) ? "Si" : "No",
    tipoCambio: formatearNumero(registro.tipoCambio, 2),
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
    categoriaCiiu: obtenerTexto(registro.isicCategoria, registro.IsicCategoria, registro.categoriaCiiu, registro.CategoriaCiiu),
    claseCiiu: obtenerTexto(registro.isicClase, registro.IsicClase, registro.claseCiiu, registro.ClaseCiiu),
    actividadPrincipal: obtenerTexto(registro.actividadPrincipal, registro.ActividadPrincipal),
    ventasContadoPorcentaje: formatearNumero(registro.ventasContado, 2),
    ventasContadoDetalle: obtenerTexto(registro.ventasContadoText, registro.VentasContadoText),
    ventasCreditoPorcentaje: formatearNumero(registro.ventasCredito, 2),
    ventasCreditoDetalle: obtenerTexto(registro.ventasCreditoText, registro.VentasCreditoText),
    ventasCreditoSeleccion: obtenerTexto(registro.ventasCreditoSeleccion, registro.VentasCreditoSeleccion),
    territorioVentasPorcentaje: formatearNumero(
      registro.territorioVentas
        ?? registro.TerritorioVentas
        ?? registro.ventasNacionales
        ?? registro.VentasNacionales,
      2,
    ),
    territorioVentasDetalle: obtenerTexto(
      registro.territorioText,
      registro.TerritorioText,
      registro.ventasNacionalesText,
      registro.VentasNacionalesText,
    ),
    ventasExtranjeroPorcentaje: formatearNumero(registro.ventasInternacionales, 2),
    ventasExtranjeroDetalle: obtenerTexto(registro.ventasInternacionalesText, registro.VentasInternacionalesText),
    comprasNacionalesPorcentaje: formatearNumero(registro.comprasNacionales ?? registro.ComprasNacionales, 2),
    comprasNacionalesDetalle: obtenerTexto(registro.comprasNacionalesText, registro.ComprasNacionalesText),
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
      monto: formatearNumero(item.monto, 2),
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
      monto: formatearNumero(item.monto, 2),
      operaciones: formatearEntero(item.numOperaciones ?? item.NumOperaciones),
    }));

  datos.locales = obtenerLista(registro.locales, registro.Locales).map((item) => {
    const local = obtenerRegistro(item);
    const imagenes = obtenerLista(local.imagenes, local.Imagenes).map((imagen) => {
      const registroImagen = obtenerRegistro(imagen);
      return {
        nombre: obtenerTexto(registroImagen.nombre, registroImagen.Nombre, registroImagen.imagenURL, registroImagen.ImagenURL) || "archivo",
        url: obtenerTexto(registroImagen.url, registroImagen.Url, registroImagen.imagenURL, registroImagen.ImagenURL) || undefined,
        tipo: obtenerTexto(registroImagen.tipoArchivo, registroImagen.TipoArchivo, registroImagen.mimeType, registroImagen.MimeType) || undefined,
      };
    });

    return {
      tipoLocal: obtenerTexto(local.tipoLocal, local.TipoLocal),
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
    return {
      codigo: obtenerTexto(balance.codigo, balance.Codigo) || `${indice + 1}`,
      periodo: obtenerTexto(balance.periodo, balance.Periodo),
      fecha: obtenerTexto(balance.fechaTexto, balance.FechaTexto),
      fechaInicio: formatearFechaEntrada(obtenerTexto(balance.fechaBalance, balance.FechaBalance)) || undefined,
      fechaFin: formatearFechaEntrada(obtenerTexto(balance.fechaHasta, balance.FechaHasta)) || undefined,
      esActual: obtenerBooleano(balance.flgActualidad, balance.FlgActualidad),
      tipo: obtenerTexto(balance.tipo, balance.Tipo),
      tipoEstadoFinanciero: obtenerTexto(balance.tipoEstadoFinanciero, balance.TipoEstadoFinanciero),
      tipoCambio: formatearNumero(balance.tipoCambio, 2),
      operacionCambio: obtenerTexto(balance.moneda, balance.Moneda),
      tipoBalance: obtenerTexto(balance.tipoBalanceDescripcion, balance.TipoBalanceDescripcion, balance.tipoBalance, balance.TipoBalance),
      balanceGeneral: true,
      perdidaGanancia: true,
      cuentas: Object.keys(cuentaBalance).length > 0,
      detalleCuentas: Object.keys(cuentaBalance).length > 0
        ? {
            balanceGeneral: {
              totalCorrientes: formatearNumero(cuentaBalance.totalCorriente, 2),
              totalNoCorrientes: formatearNumero(cuentaBalance.totalNoCorriente, 2),
              otrosActivos: formatearNumero(cuentaBalance.otrosActivos, 2),
              totalActivos: formatearNumero(cuentaBalance.totalActivos, 2),
              totalPasivosCorrientes: formatearNumero(cuentaBalance.totalPasivosCorrientes, 2),
              totalPasivosNoCorrientes: formatearNumero(cuentaBalance.totalPasivosNoCorrientes, 2),
              otrosPasivos: formatearNumero(cuentaBalance.otrosPasivos, 2),
              totalPasivos: formatearNumero(cuentaBalance.totalPasivos, 2),
              patrimonio: formatearNumero(cuentaBalance.patrimonio, 2),
              totalPasivoPatrimonio: formatearNumero(cuentaBalance.totalPasivoPatrimonio, 2),
            },
            estadoGananciasPerdidas: {
              ventasNetas: formatearNumero(cuentaBalance.ventasNetas, 2),
              utilidadGanancia: formatearNumero(cuentaBalance.utilidadPerdida, 2),
            },
            ratios: {
              liquidez: formatearNumero(cuentaBalance.indiceLiquidez, 2),
              capitalTrabajo: formatearNumero(cuentaBalance.capitalTrabajo, 2),
              endeudamiento: formatearNumero(cuentaBalance.ratioEndeudamiento, 2),
              rentabilidad: formatearNumero(cuentaBalance.ratioRentabilidad, 2),
            },
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
    return {
      nombreEmpresa: obtenerTexto(proveedor.nombre, proveedor.Nombre, proveedor.nombreEmpresa, proveedor.NombreEmpresa),
      contacto: obtenerTexto(proveedor.contacto, proveedor.Contacto),
      tipoProveedor: obtenerTexto(proveedor.productos, proveedor.Productos, proveedor.tipoProveedor, proveedor.TipoProveedor),
      telefono: obtenerTexto(proveedor.telefono, proveedor.Telefono),
      tipoPersona: obtenerTexto(proveedor.tipoPersona, proveedor.TipoPersona),
      pais: obtenerTexto(proveedor.pais, proveedor.Pais),
      taxIdType: obtenerTexto(proveedor.tipoDocumento, proveedor.TipoDocumento, proveedor.taxIdType, proveedor.TaxIdType),
      taxIdNumber: obtenerTexto(proveedor.numeroDocumento, proveedor.NumeroDocumento, proveedor.taxNum, proveedor.TaxNum),
      tieneReferenciaComercial: obtenerBooleano(proveedor.tieneReferenciaComercial, proveedor.TieneReferenciaComercial),
      comienzoNegociaciones: formatearFechaEntrada(obtenerTexto(proveedor.fechaInicio, proveedor.FechaInicio)) || undefined,
      operacionCambioMoneda: obtenerTexto(proveedor.moneda, proveedor.Moneda),
      tipoCambio: formatearNumero(proveedor.tipoCambio, 2) || undefined,
      limiteCredito: obtenerTexto(proveedor.plazoCredito, proveedor.PlazoCredito),
      promedioMensual: formatearNumero(proveedor.promedioMensual, 2) || undefined,
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
      porcentaje: formatearNumero(ejecutivo.participacion, 2),
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
    idCiudadRegistro: obtenerNumeroOpcional(registro.idCiudadRegistro, registro.IdCiudadRegistro),
    idSector: obtenerNumeroOpcional(registro.idSector, registro.IdSector),
    idActividad: obtenerNumeroOpcional(registro.idActividad, registro.IdActividad),
    datosInvestigacion: datos,
    archivosInvestigacion,
  };
}

async function enriquecerRespuestaObtener(respuesta: InformeObtenerResponse): Promise<InformeObtenerResponse> {
  const sectores: EntradaTablaMaestra[] = await servicioTablaMaestra.list(TablaMaestraId.SECTOR_ECONOMICO)
    .catch(() => []);

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

  return {
    ...respuesta,
      datosInvestigacion: {
        ...respuesta.datosInvestigacion,
        companiasRelacionadas: companias,
        bancos,
        directorioEjecutivo: directorios,
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

  obtener: async ({ idInforme, idPedido }: InformeObtenerParams): Promise<InformeObtenerResponse> => {
    const { data } = await maximilianService.get<ApiResponse<unknown>>("/api/Informe/obtener", {
      params: {
        IdInforme: idInforme,
        IdPedido: idPedido,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, "/api/Informe/obtener")) {
      throw new Error(data.mensaje || "Error al obtener el informe");
    }

    return enriquecerRespuestaObtener(normalizarRespuestaObtener(data.result));
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
};
