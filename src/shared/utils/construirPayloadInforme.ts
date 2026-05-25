import type { InformeCrearRequest } from "@maximilian/shared/types/informe.type";
import type { DatosInvestigacionAnalista, RegistroBalanceAnalista } from "@maximilian/shared/types/investigacion.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

function obtenerNumeroDesdeTexto(valor?: string) {
  if (!valor) return 0;
  const numero = Number.parseFloat(valor.replace(/[^0-9,.-]/g, "").replace(",", ".").trim());
  return Number.isFinite(numero) ? numero : 0;
}

function obtenerNumeroOpcionalDesdeTexto(valor?: string) {
  if (!valor?.trim()) return null;
  const numero = Number.parseFloat(valor.replace(/[^0-9,.-]/g, "").replace(",", ".").trim());
  return Number.isFinite(numero) ? numero : null;
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

export function construirPayloadInforme({
  idPedido,
  idInforme,
  idEstadoInforme,
  idIdiomaPedido,
  datosInvestigacion,
  opcionesTipoPersona,
  opcionesPais,
  opcionesEstadoCliente,
}: {
  idPedido: number;
  idInforme?: number;
  idEstadoInforme: number;
  idIdiomaPedido: number;
  datosInvestigacion: DatosInvestigacionAnalista;
  opcionesTipoPersona: EntradaTablaMaestra[] | undefined;
  opcionesPais: EntradaTablaMaestra[] | undefined;
  opcionesEstadoCliente: EntradaTablaMaestra[] | undefined;
}): InformeCrearRequest {
  const { identificacion, aspectosLegales, operacionPrincipal, informacionFinanciera, referencias, datosGenerales } = datosInvestigacion;
  const esEdicion = typeof idInforme === "number" && idInforme > 0;

  return {
    ...(esEdicion ? { idInforme } : {}),
    idPedido,
    idTipoPersona: obtenerIdPorTexto(opcionesTipoPersona, identificacion.tipoPersona),
    nombre: identificacion.nombreEmpresa,
    nombreComercial: identificacion.nombreComercial,
    idPais: obtenerIdPorTexto(opcionesPais, identificacion.pais),
    operacionesTCMoneda: 0,
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
    idOperacionesCambioDivisas: 0,
    capitalInicial: obtenerNumeroDesdeTexto(aspectosLegales.capitalInicial),
    capitalPagado: obtenerNumeroDesdeTexto(aspectosLegales.capitalDesembolsado),
    fechaUltimoIncremento: convertirFechaIso(aspectosLegales.ultimaAmpliacion),
    idTipoIncremento: 0,
    patrimonioNeto: obtenerNumeroDesdeTexto(aspectosLegales.patrimonioNeto),
    tipoAcciones: aspectosLegales.tipoAcciones,
    valorAcciones: obtenerNumeroDesdeTexto(aspectosLegales.valorAcciones),
    cotizaBolsa: esTextoAfirmativo(aspectosLegales.obligacionBolsa),
    tipoCambio: obtenerNumeroDesdeTexto(aspectosLegales.tipoCambio),
    antecedentes: aspectosLegales.antecedentes,
    aspectosLegales: aspectosLegales.aspectosLegales,
    comentariosAspectoLegal: aspectosLegales.comentariosEmpresasRelacionadas,
    idSector: 0,
    idActividad: 0,
    idIsicCategoria: 0,
    idIsicClase: 0,
    actividadPrincipal: operacionPrincipal.actividadPrincipal,
    ventasContado: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.ventasContadoPorcentaje),
    ventasContadoText: operacionPrincipal.ventasContadoDetalle,
    ventasCredito: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.ventasCreditoPorcentaje),
    ventasCreditoText: operacionPrincipal.ventasCreditoDetalle,
    idVentasCreditoTiempo: 0,
    ventasNacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.territorioVentasPorcentaje),
    ventasNacionalesText: operacionPrincipal.territorioVentasDetalle,
    ventasInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.ventasExtranjeroPorcentaje),
    ventasInternacionalesText: operacionPrincipal.ventasExtranjeroDetalle,
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
    balances: datosInvestigacion.balances.map((balance) => ({
      ...(esEdicion ? { idInformeBalance: 0 } : {}),
      fechaBalance: convertirFechaIso(balance.fechaInicio ?? balance.fecha),
      fechaHasta: balance.esActual ? null : convertirFechaIso(balance.fechaFin),
      flgActualidad: balance.esActual ?? false,
      tipoCambio: obtenerNumeroDesdeTexto(balance.tipoCambio),
      idMoneda: obtenerIdMoneda(balance.operacionCambio ?? ""),
      tipoBalance: obtenerIdTipoBalance(balance.tipoBalance),
      cuentaBalance: construirCuentaBalance(balance.detalleCuentas),
    })),
    bancos: datosInvestigacion.bancos.map((banco) => ({
      ...(esEdicion ? { idInformeBanco: 0 } : {}),
      idBanco: banco.idBanco ?? 0,
      numeroCuenta: banco.numeroCuenta,
      idSector: 0,
      sectorista: banco.sectoristaJefeCuenta ?? "",
      referenciaBanco: banco.telefono,
    })),
    companiasRelacionadas: datosInvestigacion.companiasRelacionadas.map((empresa) => ({
      ...(esEdicion ? { idInformeCompaniaRelacionada: 0 } : {}),
      idCompania: empresa.idCompania ?? 0,
    })),
    exportacionesImportaciones: [
      ...datosInvestigacion.importaciones.map((registro) => ({
        ...(esEdicion ? { idInformeExportacionImportacion: 0 } : {}),
        anio: obtenerEnteroDesdeTexto(registro.anio),
        mesInicio: obtenerNumeroMes(registro.mes),
        mesFin: obtenerNumeroMes(registro.mes),
        idMoneda: obtenerIdMoneda(registro.moneda),
        paises: registro.paises,
        monto: obtenerNumeroDesdeTexto(registro.monto),
        productos: registro.productos,
        idTipoOperacion: 1,
        numOperaciones: obtenerEnteroDesdeTexto(registro.operaciones),
      })),
      ...datosInvestigacion.exportaciones.map((registro) => ({
        ...(esEdicion ? { idInformeExportacionImportacion: 0 } : {}),
        anio: obtenerEnteroDesdeTexto(registro.anio),
        mesInicio: obtenerNumeroMes(registro.mes),
        mesFin: obtenerNumeroMes(registro.mes),
        idMoneda: obtenerIdMoneda(registro.moneda),
        paises: registro.paises,
        monto: obtenerNumeroDesdeTexto(registro.monto),
        productos: registro.productos,
        idTipoOperacion: 2,
        numOperaciones: obtenerEnteroDesdeTexto(registro.operaciones),
      })),
    ],
    proveedores: datosInvestigacion.proveedores.map((proveedor) => ({
      ...(esEdicion ? { idInformeProveedor: 0 } : {}),
      idBancoProveedor: 0,
      idTipoPersona: obtenerIdPorTexto(opcionesTipoPersona, proveedor.tipoPersona),
      nombre: proveedor.nombreEmpresa,
      idPais: obtenerIdPorTexto(opcionesPais, proveedor.pais),
      idTipoDocumento: 0,
      numeroDocumento: proveedor.taxIdNumber,
      idMoneda: obtenerIdMoneda(proveedor.operacionCambioMoneda ?? ""),
      fechaInicio: convertirFechaIso(proveedor.comienzoNegociaciones),
      idLimiteCredito: 0,
      promedioMensual: obtenerNumeroDesdeTexto(proveedor.promedioMensual),
      plazoCredito: proveedor.limiteCredito ?? "",
      productos: proveedor.tipoProveedor,
      idCalificacion: 0,
      comentarios: [proveedor.contacto, proveedor.telefono].filter(Boolean).join(" - "),
    })),
    directoriosEjecutivos: datosInvestigacion.directorioEjecutivo.map((ejecutivo) => ({
      ...(esEdicion ? { idInformeDirectorioEjecutivo: 0 } : {}),
      idTipoPersona: obtenerIdPorTexto(opcionesTipoPersona, ejecutivo.tipoPersona),
      nombreCompleto: ejecutivo.nombreCompleto,
      idPais: obtenerIdPorTexto(opcionesPais, ejecutivo.pais),
      direccion: "",
      ubigeo: "",
      codigoPostal: "",
      idTipoDocumento: 0,
      numeroDocumento: "",
      taxIdType: 0,
      taxNum: "",
      idNacionalidad: 0,
      fechaNacimiento: null,
      idEstadoCivil: 0,
      idProfesion: 0,
      referencias: ejecutivo.descripcionBusqueda,
      cargos: ejecutivo.cargo,
      formularioVinculado: ejecutivo.vinculadoDesde,
      companiaAnterior: ejecutivo.companiaAnterior,
      participacion: obtenerNumeroDesdeTexto(ejecutivo.porcentaje),
      orden: obtenerEnteroDesdeTexto(ejecutivo.orden),
      esParticipanteDirectiva: ejecutivo.esParteDirectorio,
      apareceImpresoLista: ejecutivo.lista,
      imprimeDatosEjecutivos: ejecutivo.detalleEjecutivo,
    })),
    locales: datosInvestigacion.locales.map((local) => ({
      ...(esEdicion ? { idInformeLocal: 0 } : {}),
      idTipoLocal: 0,
      comentario: local.comentario,
      imagenUrl: local.imagenUrl ?? "",
      imagenes: (local.imagenes ?? []).map((imagen) => ({
        ...(esEdicion ? { idInformeLocalImagen: 0 } : {}),
        imagenURL: imagen.url ?? "",
        idTipoArchivo: obtenerIdTipoArchivo(imagen.tipo ?? local.imagenTipo),
      })),
    })),
    pedidos: [
      {
        ...(esEdicion ? { idInformePedido: 0 } : {}),
        idPedido,
        idIdioma: idIdiomaPedido,
        documentoWord: "",
        documentoExcel: "",
        idEstado: 0,
      },
    ],
  };
}
