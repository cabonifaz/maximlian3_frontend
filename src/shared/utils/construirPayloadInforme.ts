import type { InformeCrearRequest } from "@maximilian/shared/types/informe.type";
import type { DatosInvestigacionAnalista, RegistroBalanceAnalista } from "@maximilian/shared/types/investigacion.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import {
  obtenerNumeroDesdeMonto,
  obtenerNumeroOpcionalDesdeMonto,
} from "@maximilian/shared/utils/formato-monto.util";

function obtenerNumeroDesdeTexto(valor?: string) {
  return obtenerNumeroDesdeMonto(valor);
}

function obtenerNumeroOpcionalDesdeTexto(valor?: string) {
  return obtenerNumeroOpcionalDesdeMonto(valor);
}

function obtenerEnteroDesdeTexto(valor?: string) {
  if (!valor) return 0;
  const numero = Number.parseInt(valor.replace(/\D/g, ""), 10);
  return Number.isFinite(numero) ? numero : 0;
}

function convertirFechaIso(valor?: string) {
  if (!valor?.trim()) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return `${valor}T00:00:00.000Z`;

  const partes = valor.split("/");
  if (partes.length !== 3) return null;

  const [dia, mes, ano] = partes;
  if (!dia || !mes || !ano) return null;

  return `${ano.padStart(4, "0")}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}T00:00:00.000Z`;
}

function obtenerIdPorTexto(opciones: EntradaTablaMaestra[] | undefined, valor: string) {
  return opciones?.find((opcion) => opcion.string1?.trim().toLowerCase() === valor.trim().toLowerCase())?.num1 ?? 0;
}

function obtenerIdPorTextoONumero(opciones: EntradaTablaMaestra[] | undefined, valor: string) {
  const numero = Number.parseInt(valor.trim(), 10);
  if (Number.isFinite(numero) && (!opciones || opciones.some((opcion) => opcion.num1 === numero))) return numero;

  return obtenerIdPorTexto(opciones, valor);
}

function obtenerIdMoneda(valor: string) {
  const monedaNormalizada = valor.trim().toLowerCase();
  if (monedaNormalizada === "us dollar") return 1;
  if (monedaNormalizada === "euro") return 2;
  if (monedaNormalizada === "sol") return 3;
  return 0;
}

function obtenerIdTipoBalance(valor?: string) {
  const texto = valor?.trim().toLowerCase() ?? "";
  if (texto === "balance general") return 1;
  if (texto === "balance consolidado") return 2;
  return 0;
}

function obtenerIdTipoArchivo(valor?: string) {
  const texto = valor?.trim().toLowerCase() ?? "";
  if (texto.startsWith("image/")) return 1;
  if (texto === "application/pdf") return 2;
  return 0;
}

function obtenerNumeroMes(valor: string) {
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

function esTextoAfirmativo(valor?: string) {
  const texto = valor?.trim().toLowerCase() ?? "";
  return texto === "si" || texto === "sí" || texto === "true" || texto === "1";
}

function construirCuentaBalance(detalle?: RegistroBalanceAnalista["detalleCuentas"]) {
  if (!detalle) return null;

  return {
    totalCorriente: obtenerNumeroDesdeTexto(detalle.balanceGeneral.totalCorrientes),
    totalNoCorriente: obtenerNumeroDesdeTexto(detalle.balanceGeneral.totalNoCorrientes),
    otrosActivos: obtenerNumeroDesdeTexto(detalle.balanceGeneral.otrosActivos),
    totalActivos: obtenerNumeroDesdeTexto(detalle.balanceGeneral.totalActivos),
    totalPasivosCorrientes: obtenerNumeroDesdeTexto(detalle.balanceGeneral.totalPasivosCorrientes),
    totalPasivosNoCorrientes: obtenerNumeroDesdeTexto(detalle.balanceGeneral.totalPasivosNoCorrientes),
    otrosPasivos: obtenerNumeroDesdeTexto(detalle.balanceGeneral.otrosPasivos),
    totalPasivos: obtenerNumeroDesdeTexto(detalle.balanceGeneral.totalPasivos),
    patrimonio: obtenerNumeroDesdeTexto(detalle.balanceGeneral.patrimonio),
    totalPasivoPatrimonio: obtenerNumeroDesdeTexto(detalle.balanceGeneral.totalPasivoPatrimonio),
    ventasNetas: obtenerNumeroDesdeTexto(detalle.estadoGananciasPerdidas.ventasNetas),
    utilidadPerdida: obtenerNumeroDesdeTexto(detalle.estadoGananciasPerdidas.utilidadGanancia),
    indiceLiquidez: obtenerNumeroDesdeTexto(detalle.ratios.liquidez),
    capitalTrabajo: obtenerNumeroDesdeTexto(detalle.ratios.capitalTrabajo),
    ratioEndeudamiento: obtenerNumeroDesdeTexto(detalle.ratios.endeudamiento),
    ratioRentabilidad: obtenerNumeroDesdeTexto(detalle.ratios.rentabilidad),
  };
}

function depurarPayloadInforme(valor: unknown): unknown {
  if (Array.isArray(valor)) {
    const lista = valor
      .map((item) => depurarPayloadInforme(item))
      .filter((item) => item !== undefined);
    return lista.length > 0 ? lista : undefined;
  }

  if (valor && typeof valor === "object") {
    const entradas = Object.entries(valor)
      .map(([clave, contenido]) => [clave, depurarPayloadInforme(contenido)] as const)
      .filter(([, contenido]) => contenido !== undefined);

    if (entradas.length === 0) return undefined;
    return Object.fromEntries(entradas);
  }

  if (typeof valor === "string") {
    const texto = valor.trim();
    return texto ? texto : undefined;
  }

  if (valor == null) return undefined;

  return valor;
}

export function construirPayloadInforme({
  idPedido,
  idInforme,
  idEstadoInforme,
  datosInvestigacion,
  opcionesTipoPersona,
  opcionesPais,
  opcionesEstadoCliente,
  opcionesMoneda,
  opcionesSectorEconomico,
}: {
  idPedido: number;
  idInforme?: number;
  idEstadoInforme: number;
  datosInvestigacion: DatosInvestigacionAnalista;
  opcionesTipoPersona: EntradaTablaMaestra[] | undefined;
  opcionesPais: EntradaTablaMaestra[] | undefined;
  opcionesEstadoCliente: EntradaTablaMaestra[] | undefined;
  opcionesMoneda?: EntradaTablaMaestra[] | undefined;
  opcionesSectorEconomico: EntradaTablaMaestra[] | undefined;
}): InformeCrearRequest {
  const { identificacion, aspectosLegales, operacionPrincipal, informacionFinanciera, referencias, datosGenerales } = datosInvestigacion;
  const esEdicion = typeof idInforme === "number" && idInforme > 0;

  return depurarPayloadInforme({
    ...(esEdicion ? { idInforme } : {}),
    idPedido,
    idTipoPersona: obtenerIdPorTexto(opcionesTipoPersona, identificacion.tipoPersona),
    nombre: identificacion.nombreEmpresa,
    nombreComercial: identificacion.nombreComercial,
    idPais: obtenerIdPorTexto(opcionesPais, identificacion.pais),
    operacionesTCMoneda: obtenerNumeroDesdeTexto(identificacion.operacionesCambio),
    taxIdType: 0,
    taxNum: identificacion.numeroIdentificacionFiscal,
    direccion: identificacion.direccionPrincipal,
    ubigeo: identificacion.ciudadEstadoProvincia,
    codigoPostal: "",
    telefono: identificacion.numeroTelefono,
    fax: identificacion.numeroFax,
    email: identificacion.correoElectronico,
    paginaWeb: identificacion.paginaWeb,
    idEstadoManual: obtenerIdPorTexto(opcionesEstadoCliente, identificacion.estadoActual),
    idEstadoInforme,
    datosAdicionales: identificacion.datosAdicionales,
    observacionesIdentificacion: "",
    idTipoEmpresa: 0,
    fechaConstitucion: convertirFechaIso(aspectosLegales.fechaConstitucion),
    idCiudadRegistro: 0,
    idNotaria: aspectosLegales.notaria,
    idNotario: aspectosLegales.notario,
    idRegistro: aspectosLegales.registro,
    idPlazo: aspectosLegales.condiciones,
    idOperacionesCambioDivisas: obtenerEnteroDesdeTexto(aspectosLegales.operacionesCambioDivisas),
    capitalInicial: obtenerNumeroDesdeTexto(aspectosLegales.capitalInicial),
    capitalPagado: obtenerNumeroDesdeTexto(aspectosLegales.capitalDesembolsado),
    fechaUltimoIncremento: convertirFechaIso(aspectosLegales.ultimaAmpliacion),
    idTipoIncremento: 0,
    patrimonioNeto: obtenerNumeroDesdeTexto(aspectosLegales.patrimonioNeto),
    tipoAcciones: aspectosLegales.tipoAcciones,
    valorAcciones: obtenerNumeroDesdeTexto(aspectosLegales.valorAcciones),
    cotizaBolsa: esTextoAfirmativo(aspectosLegales.obligacionBolsa),
    idTipoCambio: obtenerIdPorTextoONumero(opcionesMoneda, aspectosLegales.monedaTipoCambio),
    tipoCambio: obtenerNumeroDesdeTexto(aspectosLegales.tipoCambio),
    antecedentes: aspectosLegales.antecedentes,
    aspectosLegales: aspectosLegales.aspectosLegales,
    comentariosAspectoLegal: aspectosLegales.comentariosEmpresasRelacionadas,
    idSector: 0,
    idActividad: 0,
    idIsicCategoria: obtenerEnteroDesdeTexto(operacionPrincipal.categoriaCiiu),
    idIsicClase: obtenerEnteroDesdeTexto(operacionPrincipal.claseCiiu),
    actividadPrincipal: operacionPrincipal.actividadPrincipal,
    ventasContado: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.ventasContadoPorcentaje),
    ventasContadoText: operacionPrincipal.ventasContadoDetalle,
    ventasCredito: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.ventasCreditoPorcentaje),
    ventasCreditoText: operacionPrincipal.ventasCreditoDetalle,
    idVentasCreditoTiempo: obtenerEnteroDesdeTexto(operacionPrincipal.ventasCreditoTiempo),
    ventasNacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.territorioVentasPorcentaje),
    ventasNacionalesText: operacionPrincipal.territorioVentasDetalle,
    ventasInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.ventasExtranjeroPorcentaje),
    ventasInternacionalesText: operacionPrincipal.ventasExtranjeroDetalle,
    comprasNacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasNacionalesPorcentaje),
    comprasNacionalesText: operacionPrincipal.comprasNacionalesDetalle,
    comprasInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasExtranjeroPorcentaje),
    comprasInternacionalesText: operacionPrincipal.comprasExtranjeroDetalle,
    numeroEmpleados: obtenerEnteroDesdeTexto(operacionPrincipal.numeroEmpleados),
    numeroEmpleadosText: operacionPrincipal.numeroEmpleadosDetalle,
    comentariosOperaciones: operacionPrincipal.comentariosOperaciones,
    contenidoInformacionFinanciera: informacionFinanciera.contenido,
    comentarioInformacionFinanciera: informacionFinanciera.comentariosFinancieros,
    activosFijos: informacionFinanciera.activosFijos,
    seguros: informacionFinanciera.seguros,
    comentarioProveedor: referencias.comentariosProveedores,
    referenciaBanco: referencias.referenciasBancos,
    litigios: referencias.litigios,
    riesgoPrincipal: referencias.riesgoPrincipal,
    superintendecia: referencias.superintendencia,
    informacionGeneral: datosGenerales.informacionGeneral,
    opinionCredito: datosGenerales.opinionCredito,
    flgTieneInformacion: true,
    lstBalances: datosInvestigacion.balances.map((balance) => ({
      ...(esEdicion ? { idInformeBalance: balance.idInformeBalance ?? 0 } : {}),
      fechaBalance: convertirFechaIso(balance.fechaInicio ?? balance.fecha),
      fechaHasta: balance.esActual ? null : convertirFechaIso(balance.fechaFin),
      flgActualidad: balance.esActual ?? false,
      tipoCambio: obtenerNumeroDesdeTexto(balance.tipoCambio),
      idMoneda: balance.idMoneda ?? obtenerIdMoneda(balance.operacionCambio ?? ""),
      idTipoBalance: (balance.idTipoBalance ?? obtenerIdPorTextoONumero(undefined, balance.tipoBalance ?? "")) || obtenerIdTipoBalance(balance.tipoBalance),
      idTipoEstadoFinanciero: balance.idTipoEstadoFinanciero ?? obtenerIdPorTextoONumero(undefined, balance.tipoEstadoFinanciero ?? balance.tipo ?? ""),
      cuentaBalance: construirCuentaBalance(balance.detalleCuentas),
    })),
    lstBancos: datosInvestigacion.bancos.map((banco) => ({
      ...(esEdicion ? { idInformeBanco: banco.idInformeBanco ?? 0 } : {}),
      idBanco: banco.idBanco ?? 0,
      numeroCuenta: banco.numeroCuenta,
      idSector: banco.idSector ?? obtenerIdPorTexto(opcionesSectorEconomico, banco.sector ?? ""),
      sectorista: banco.sectoristaJefeCuenta ?? "",
      referenciaBanco: banco.telefono,
    })),
    lstCompaniasRelacionadas: datosInvestigacion.companiasRelacionadas.map((empresa) => ({
      ...(esEdicion ? { idInformeCompaniaRelacionada: 0 } : {}),
      idCompania: empresa.idCompania ?? 0,
    })),
    lstExportacionesImportaciones: [
      ...datosInvestigacion.importaciones.map((registro) => ({
        ...(esEdicion ? { idInformeExportacionImportacion: 0 } : {}),
        anio: obtenerEnteroDesdeTexto(registro.anio),
        mesInicio: registro.idMesInicio ?? obtenerNumeroMes(registro.mes),
        mesFin: registro.idMesFin ?? registro.idMesInicio ?? obtenerNumeroMes(registro.mes),
        idMoneda: registro.idMoneda ?? obtenerIdMoneda(registro.moneda),
        paises: registro.paises,
        monto: obtenerNumeroDesdeTexto(registro.monto),
        productos: registro.productos,
        idTipoOperacion: 1,
        numOperaciones: obtenerEnteroDesdeTexto(registro.operaciones),
      })),
      ...datosInvestigacion.exportaciones.map((registro) => ({
        ...(esEdicion ? { idInformeExportacionImportacion: 0 } : {}),
        anio: obtenerEnteroDesdeTexto(registro.anio),
        mesInicio: registro.idMesInicio ?? obtenerNumeroMes(registro.mes),
        mesFin: registro.idMesFin ?? registro.idMesInicio ?? obtenerNumeroMes(registro.mes),
        idMoneda: registro.idMoneda ?? obtenerIdMoneda(registro.moneda),
        paises: registro.paises,
        monto: obtenerNumeroDesdeTexto(registro.monto),
        productos: registro.productos,
        idTipoOperacion: 2,
        numOperaciones: obtenerEnteroDesdeTexto(registro.operaciones),
      })),
    ],
    lstProveedores: datosInvestigacion.proveedores.map((proveedor) => ({
      ...(esEdicion ? { idInformeProveedor: proveedor.idInformeProveedor ?? 0 } : {}),
      idBancoProveedor: 0,
      idTipoPersona: proveedor.idTipoProveedor ?? obtenerIdPorTextoONumero(undefined, proveedor.tipoProveedor),
      nombre: proveedor.nombreEmpresa,
      idPais: proveedor.idPais ?? obtenerIdPorTexto(opcionesPais, proveedor.pais),
      idTipoDocumento: proveedor.idTipoDocumento ?? 0,
      numeroDocumento: proveedor.taxIdNumber,
      idMoneda: proveedor.idMoneda ?? obtenerIdMoneda(proveedor.operacionCambioMoneda ?? ""),
      fechaInicio: convertirFechaIso(proveedor.comienzoNegociaciones),
      idLimiteCredito: proveedor.idLimiteCredito ?? proveedor.idPlazoCredito ?? 0,
      promedioMensual: obtenerNumeroDesdeTexto(proveedor.promedioMensual),
      tipoCambio: obtenerNumeroDesdeTexto(proveedor.tipoCambio),
      plazoCredito: proveedor.limiteCredito ?? "",
      productos: proveedor.tipoProveedor,
      idCalificacion: 0,
      comentarios: "",
      esTieneReferenciaComercial: proveedor.esTieneReferenciaComercial ?? proveedor.tieneReferenciaComercial,
      nombreContacto: proveedor.contacto,
      telefono: proveedor.telefono,
      comienzoNegociaciones: proveedor.comienzoNegociaciones ?? "",
      idPlazoCredito: proveedor.idPlazoCredito ?? proveedor.idLimiteCredito ?? 0,
    })),
    lstDirectoriosEjecutivos: datosInvestigacion.directorioEjecutivo.map((ejecutivo) => ({
      ...(esEdicion ? { idInformeDirectorioEjecutivo: 0 } : {}),
      idDirectorioEjecutivo: ejecutivo.idDirectorioEjecutivo ?? ejecutivo.id,
      idCargo: ejecutivo.idCargo ?? 0,
      vinculadoDesde: convertirFechaIso(ejecutivo.vinculadoDesde),
      companiaAnterior: ejecutivo.companiaAnterior,
      participacion: obtenerNumeroDesdeTexto(ejecutivo.porcentaje),
      orden: obtenerEnteroDesdeTexto(ejecutivo.orden),
      esParticipanteDirectiva: ejecutivo.esParteDirectorio,
      apareceImpresoLista: ejecutivo.lista,
      imprimeDatosEjecutivos: ejecutivo.detalleEjecutivo,
    })),
    lstLocales: datosInvestigacion.locales.map((local) => ({
      ...(esEdicion ? { idInformeLocal: local.idInformeLocal ?? 0 } : {}),
      idTipoLocal: local.idTipoLocal ?? obtenerIdPorTextoONumero(undefined, local.tipoLocal),
      comentario: local.comentario,
      imagenUrl: local.imagenUrl ?? "",
      imagenes: (local.imagenes ?? []).map((imagen) => ({
        ...(esEdicion ? { idInformeLocalImagen: 0 } : {}),
        imagenURL: imagen.url ?? "",
        idTipoArchivo: obtenerIdTipoArchivo(imagen.tipo ?? local.imagenTipo),
      })),
    })),
  }) as InformeCrearRequest;
}
