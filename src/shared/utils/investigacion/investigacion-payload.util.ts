import { esquemaDatosInvestigacion } from "@maximilian/schemas/investigacion.schema";
import type {
  InformeBalanceBancoRequest,
  InformeBalanceDesagregadoRequest,
  InformeBalanceSeguroRequest,
  InformeBalanceTotalizadoRequest,
  InformeBalanceTurquiaRequest,
  InformeCrearRequest,
} from "@maximilian/shared/types/informe.type";
import type {
  DatosInvestigacionAnalista,
  RegistroBalanceAnalista,
} from "@maximilian/shared/types/investigacion.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import {
  obtenerClaveEstadoFinanciero,
  obtenerValorCampoEstadoFinanciero,
} from "@maximilian/shared/utils/estados-financieros.util";
import {
  convertirFechaIso,
  esTextoAfirmativo,
  obtenerEnteroDesdeTexto,
  obtenerEnteroOpcionalDesdeTexto,
  obtenerIdCiiuPorValor,
  obtenerIdMoneda,
  obtenerIdPorTexto,
  obtenerIdPorTextoONumero,
  obtenerIdTipoArchivo,
  obtenerIdTipoBalance,
  obtenerNumeroDesdeTexto,
  obtenerNumeroMes,
  obtenerNumeroOpcionalDesdeTexto,
} from "@maximilian/shared/utils/investigacion/investigacion-formato.util";

type OpcionTablaMaestraBasica = { num1: number | null; string1: string | null };
type OpcionTablaMaestraConCodigo = OpcionTablaMaestraBasica & { string2?: string | null };

interface ParametrosConstruirPayloadCrearInforme {
  modoPayload?: "analista" | "traductor";
  idPedido: number;
  idInforme?: number;
  idFormatoFecha: number;
  idEstadoInforme: number;
  datosInvestigacion: DatosInvestigacionAnalista;
  opcionesTipoPersona: OpcionTablaMaestraBasica[] | undefined;
  opcionesPais: OpcionTablaMaestraBasica[] | undefined;
  opcionesEstadoCliente: OpcionTablaMaestraBasica[] | undefined;
  opcionesTipoRegTributario: OpcionTablaMaestraBasica[] | undefined;
  opcionesCiudad: OpcionTablaMaestraBasica[] | undefined;
  opcionesTipoEmpresa: OpcionTablaMaestraBasica[] | undefined;
  opcionesMoneda: OpcionTablaMaestraBasica[] | undefined;
  opcionesSectorEconomico: OpcionTablaMaestraBasica[] | undefined;
  opcionesActividadEconomica: OpcionTablaMaestraConCodigo[] | undefined;
  opcionesClaseCiiu: OpcionTablaMaestraConCodigo[] | undefined;
  opcionesTipoLocal: OpcionTablaMaestraBasica[] | undefined;
  opcionesTipoProveedor: OpcionTablaMaestraBasica[] | undefined;
  opcionesFormatoArchivo: EntradaTablaMaestra[] | undefined;
}

function construirListasDetalleBalance(balances: RegistroBalanceAnalista[]) {
  const lstBalancesDesagregado: InformeBalanceDesagregadoRequest[] = [];
  const lstBalancesTotalizado: InformeBalanceTotalizadoRequest[] = [];
  const lstBalancesBanco: InformeBalanceBancoRequest[] = [];
  const lstBalancesSeguro: InformeBalanceSeguroRequest[] = [];
  const lstBalancesTurquia: InformeBalanceTurquiaRequest[] = [];

  balances.forEach((balance, index) => {
    const id = index + 1;
    const tipoEstadoFinanciero = balance.tipoEstadoFinanciero
      || ({ 1: "desagregado", 2: "totalizado", 3: "bancos", 4: "seguros", 5: "turquia" }[balance.idTipoEstadoFinanciero ?? 0] ?? balance.tipo);
    const tipo = balance.idTipoEstadoFinanciero ?? ({
      desagregado: 1,
      totalizado: 2,
      bancos: 3,
      seguros: 4,
      turquia: 5,
    } as Record<string, number>)[obtenerClaveEstadoFinanciero(tipoEstadoFinanciero)];
    const registros = balance.detalleCuentas?.registrosEstadoFinanciero ?? {};
    const decimal = (campo: string, ...alternativos: Array<string | undefined>) => obtenerNumeroOpcionalDesdeTexto(
      obtenerValorCampoEstadoFinanciero(registros, campo, tipoEstadoFinanciero)
        || alternativos.find((valor) => valor?.trim()),
    ) ?? 0;
    const entero = (campo: string): number | null => {
      const valor = obtenerValorCampoEstadoFinanciero(registros, campo, tipoEstadoFinanciero);
      if (!valor) return null;
      const numero = Number.parseInt(valor.replace(/[^\d-]/g, ""), 10);
      return Number.isFinite(numero) ? numero : null;
    };

    if (tipo === 1) {
      lstBalancesDesagregado.push({
        id,
        efectivoEquivalente: decimal("efectivoEquivalente"),
        otrosActivosFinancierosCorriente: decimal("otrosActivosFinancierosCorriente"),
        cuentasCobrarCorriente: decimal("cuentasCobrarCorriente"),
        inventariosCorriente: decimal("inventariosCorriente"),
        activosBiologicosCorriente: decimal("activosBiologicosCorriente"),
        activosImpuestosGanancias: decimal("activosImpuestosGanancias"),
        otrosActivosNoFinancierosCorriente: decimal("otrosActivosNoFinancierosCorriente"),
        totalActivoCorriente: decimal("totalActivoCorriente"),
        otrosActivosFinancierosNoCorriente: decimal("otrosActivosFinancierosNoCorriente"),
        inversionesSubsidiarias: decimal("inversionesSubsidiarias"),
        cuentasCobrarNoCorriente: decimal("cuentasCobrarNoCorriente"),
        inventariosNoCorriente: decimal("inventariosNoCorriente"),
        activosBiologicosNoCorriente: decimal("activosBiologicosNoCorriente"),
        propiedadesInversion: decimal("propiedadesInversion"),
        propiedadesPlantaEquipo: decimal("propiedadesPlantaEquipo"),
        intangibles: decimal("intangibles"),
        activosImpuestosDiferidos: decimal("activosImpuestosDiferidos"),
        activosImpuestosCorrientes: decimal("activosImpuestosCorrientes"),
        plusvalia: decimal("plusvalia"),
        otrosActivosNoFinancierosNoCorriente: decimal("otrosActivosNoFinancierosNoCorriente"),
        totalActivoNoCorriente: decimal("totalActivoNoCorriente"),
        totalActivo: decimal("totalActivo", balance.detalleCuentas?.balanceGeneral.totalActivos),
        otrosPasivosFinancierosCorriente: decimal("otrosPasivosFinancierosCorriente"),
        cuentasPagarCorriente: decimal("cuentasPagarCorriente"),
        beneficiosEmpleadosCorriente: decimal("beneficiosEmpleadosCorriente"),
        otrasProvisionesCorriente: decimal("otrasProvisionesCorriente"),
        impuestosGananciasCorriente: decimal("impuestosGananciasCorriente"),
        otrosPasivosNoFinancierosCorriente: decimal("otrosPasivosNoFinancierosCorriente"),
        totalPasivoCorriente: decimal("totalPasivoCorriente"),
        otrosPasivosFinancierosNoCorriente: decimal("otrosPasivosFinancierosNoCorriente"),
        cuentasPagarNoCorriente: decimal("cuentasPagarNoCorriente"),
        beneficiosEmpleadosNoCorriente: decimal("beneficiosEmpleadosNoCorriente"),
        otrasProvisionesNoCorriente: decimal("otrasProvisionesNoCorriente"),
        impuestosDiferidosNoCorriente: decimal("impuestosDiferidosNoCorriente"),
        impuestosCorrientesNoCorriente: decimal("impuestosCorrientesNoCorriente"),
        otrosPasivosNoFinancierosNoCorriente: decimal("otrosPasivosNoFinancierosNoCorriente"),
        totalPasivoNoCorriente: decimal("totalPasivoNoCorriente"),
        totalPasivos: decimal("totalPasivos", balance.detalleCuentas?.balanceGeneral.totalPasivos),
        capitalEmitido: decimal("capitalEmitido"),
        primasEmision: decimal("primasEmision"),
        accionesInversion: decimal("accionesInversion"),
        accionesCartera: decimal("accionesCartera"),
        otrasReservasCapital: decimal("otrasReservasCapital"),
        resultadosAcumulados: decimal("resultadosAcumulados"),
        otrasReservasPatrimonio: decimal("otrasReservasPatrimonio"),
        totalPatrimonio: decimal("totalPatrimonio"),
        totalPasivoPatrimonio: decimal("totalPasivoPatrimonio", balance.detalleCuentas?.balanceGeneral.totalPasivoPatrimonio),
        ingresosOrdinarios: decimal("ingresosOrdinarios"),
        costoVentas: decimal("costoVentas"),
        gananciaBruta: decimal("gananciaBruta"),
        gastosVentas: decimal("gastosVentas"),
        gastosAdministracion: decimal("gastosAdministracion"),
        otrosIngresosOperativos: decimal("otrosIngresosOperativos"),
        otrosGastosOperativos: decimal("otrosGastosOperativos"),
        otrasGananciasPerdidas: decimal("otrasGananciasPerdidas"),
        gananciaOperativa: decimal("gananciaOperativa"),
        ingresosFinancieros: decimal("ingresosFinancieros"),
        ingresosIntereses: decimal("ingresosIntereses"),
        gastosFinancieros: decimal("gastosFinancieros"),
        deterioroValor: decimal("deterioroValor"),
        otrosIngresosSubsidiarias: decimal("otrosIngresosSubsidiarias"),
        diferenciasCambio: decimal("diferenciasCambio"),
        gananciaAntesImpuestos: decimal("gananciaAntesImpuestos"),
        ingresoGastoImpuesto: decimal("ingresoGastoImpuesto"),
        operacionesDescontinuadas: decimal("operacionesDescontinuadas"),
        gananciaNeta: decimal("gananciaNeta"),
        indiceLiquidez: decimal("indiceLiquidez", balance.detalleCuentas?.ratios.liquidez),
        capitalTrabajo: decimal("capitalTrabajo", balance.detalleCuentas?.ratios.capitalTrabajo),
        ratioEndeudamiento: decimal("ratioEndeudamiento", balance.detalleCuentas?.ratios.endeudamiento),
        ratioRentabilidad: decimal("ratioRentabilidad", balance.detalleCuentas?.ratios.rentabilidad),
      });
    } else if (tipo === 2) {
      lstBalancesTotalizado.push({
        id,
        totalActivoCorriente: decimal("totalActivoCorriente", balance.detalleCuentas?.balanceGeneral.totalCorrientes),
        totalActivoNoCorriente: decimal("totalActivoNoCorriente", balance.detalleCuentas?.balanceGeneral.totalNoCorrientes),
        totalActivo: decimal("totalActivo", balance.detalleCuentas?.balanceGeneral.totalActivos),
        totalPasivoCorriente: decimal("totalPasivoCorriente", balance.detalleCuentas?.balanceGeneral.totalPasivosCorrientes),
        totalPasivoNoCorriente: decimal("totalPasivoNoCorriente", balance.detalleCuentas?.balanceGeneral.totalPasivosNoCorrientes),
        totalPasivos: decimal("totalPasivos", balance.detalleCuentas?.balanceGeneral.totalPasivos),
        totalPatrimonio: decimal("totalPatrimonio", balance.detalleCuentas?.balanceGeneral.patrimonio),
        totalPasivoPatrimonio: decimal("totalPasivoPatrimonio", balance.detalleCuentas?.balanceGeneral.totalPasivoPatrimonio),
        ingresosOrdinarios: decimal("ingresosOrdinarios", balance.detalleCuentas?.estadoGananciasPerdidas.ventasNetas),
        gananciaNeta: decimal("gananciaNeta", balance.detalleCuentas?.estadoGananciasPerdidas.utilidadGanancia),
        indiceLiquidez: decimal("indiceLiquidez", balance.detalleCuentas?.ratios.liquidez),
        capitalTrabajo: decimal("capitalTrabajo", balance.detalleCuentas?.ratios.capitalTrabajo),
        ratioEndeudamiento: decimal("ratioEndeudamiento", balance.detalleCuentas?.ratios.endeudamiento),
        ratioRentabilidad: decimal("ratioRentabilidad", balance.detalleCuentas?.ratios.rentabilidad),
      });
    } else if (tipo === 3) {
      lstBalancesBanco.push({
        id,
        disponible: decimal("disponible"),
        fondosInterbancarios: decimal("fondosInterbancarios"),
        inversionesValorRazonable: decimal("inversionesValorRazonable"),
        carteraCreditos: decimal("carteraCreditos"),
        derivadosNegociacionActivo: decimal("derivadosNegociacionActivo"),
        derivadosCoberturaActivo: decimal("derivadosCoberturaActivo"),
        bienesRealizables: decimal("bienesRealizables"),
        participacionesSubsidiarias: decimal("participacionesSubsidiarias"),
        inmuebleMobiliarioEquipo: decimal("inmuebleMobiliarioEquipo"),
        impuestoRentaDiferido: decimal("impuestoRentaDiferido"),
        otrosActivos: decimal("otrosActivos"),
        totalActivos: decimal("totalActivos"),
        obligacionesPublico: decimal("obligacionesPublico"),
        fondosInterbancariosPasivo: decimal("fondosInterbancariosPasivo"),
        adeudosFinancieras: decimal("adeudosFinancieras"),
        derivadosNegociacionPasivo: decimal("derivadosNegociacionPasivo"),
        derivadosCoberturaPasivo: decimal("derivadosCoberturaPasivo"),
        cuentasPagarProvisiones: decimal("cuentasPagarProvisiones"),
        totalPasivo: decimal("totalPasivo"),
        capitalSocial: decimal("capitalSocial"),
        reservas: decimal("reservas"),
        resultadosNoRealizados: decimal("resultadosNoRealizados"),
        resultadoEjercicio: decimal("resultadoEjercicio"),
        totalPatrimonio: decimal("totalPatrimonio"),
        totalPasivoPatrimonio: decimal("totalPasivoPatrimonio"),
        ingresosIntereses: decimal("ingresosIntereses"),
        utilidadEjercicio: decimal("utilidadEjercicio"),
      });
    } else if (tipo === 4) {
      lstBalancesSeguro.push({
        id,
        efectivoDisponible: decimal("efectivoDisponible"),
        inversionesFinancieras: decimal("inversionesFinancieras"),
        prestamosInteresesNetos: decimal("prestamosInteresesNetos"),
        primasCobrar: decimal("primasCobrar"),
        deudasReaseguradores: decimal("deudasReaseguradores"),
        activosVenta: decimal("activosVenta"),
        propiedadesInversion: decimal("propiedadesInversion"),
        propiedadPlantaEquipo: decimal("propiedadPlantaEquipo"),
        otrosActivos: decimal("otrosActivos"),
        totalActivos: decimal("totalActivos"),
        obligacionesAsegurados: decimal("obligacionesAsegurados"),
        reservasSiniestros: decimal("reservasSiniestros"),
        reservasTecnicas: decimal("reservasTecnicas"),
        obligacionesReaseguradores: decimal("obligacionesReaseguradores"),
        obligacionesFinancieras: decimal("obligacionesFinancieras"),
        cuentasPagar: decimal("cuentasPagar"),
        otrosPasivos: decimal("otrosPasivos"),
        totalPasivo: decimal("totalPasivo"),
        capitalSocial: decimal("capitalSocial"),
        aportesCapitalNoCapitalizados: decimal("aportesCapitalNoCapitalizados"),
        resultadosAcumulados: decimal("resultadosAcumulados"),
        patrimonioRestringido: decimal("patrimonioRestringido"),
        totalPatrimonio: decimal("totalPatrimonio"),
        totalPasivoPatrimonio: decimal("totalPasivoPatrimonio"),
        primasGanadasNetas: decimal("primasGanadasNetas"),
        utilidadNeta: decimal("utilidadNeta"),
      });
    } else if (tipo === 5) {
      const numeroTurquia = (campo: string) => decimal(campo) ?? 0;
      lstBalancesTurquia.push({
        id,
        ano: entero("ano"),
        fechaBalance: convertirFechaIso(
          obtenerValorCampoEstadoFinanciero(registros, "fechaBalance", tipoEstadoFinanciero),
        ),
        idMoneda: balance.idMoneda ?? entero("idMoneda"),
        duracionPeriodo: entero("duracionPeriodo"),
        idNivelConfiabilidad: {
          ACTUAL: 1,
          PRELIMINAR: 2,
          ESTIMADO: 3,
        }[obtenerValorCampoEstadoFinanciero(registros, "idNivelConfiabilidad", tipoEstadoFinanciero).toUpperCase()] ?? entero("idNivelConfiabilidad"),
        tipoCambio: numeroTurquia("tipoCambio"),
        efectivo: numeroTurquia("efectivo"),
        existencias: numeroTurquia("existencias"),
        deudores: numeroTurquia("deudores"),
        totalCorriente: numeroTurquia("totalCorriente"),
        bienesTongibles: numeroTurquia("bienesTongibles"),
        activosIntangibles: numeroTurquia("activosIntangibles"),
        activoFijoNeto: numeroTurquia("activoFijoNeto"),
        totalActivos: numeroTurquia("totalActivos"),
        prestamos: numeroTurquia("prestamos"),
        acreedores: numeroTurquia("acreedores"),
        pasivosCorrientes: numeroTurquia("pasivosCorrientes"),
        pasivosNoCorrientes: numeroTurquia("pasivosNoCorrientes"),
        pasivosLargoPlazo: numeroTurquia("pasivosLargoPlazo"),
        totalPasivosNoCorrientes: numeroTurquia("totalPasivosNoCorrientes"),
        totalPasivos: numeroTurquia("totalPasivos"),
        capital: numeroTurquia("capital"),
        reservas: numeroTurquia("reservas"),
        resultadosAcumulados: numeroTurquia("resultadosAcumulados"),
        resultadoEjercicio: numeroTurquia("resultadoEjercicio"),
        otrasCuentas: numeroTurquia("otrasCuentas"),
        patrimonio: numeroTurquia("totalPatrimonio"),
        totalPatrimonio: numeroTurquia("totalPatrimonio"),
        totalPasivosPatrimonio: numeroTurquia("totalPasivosPatrimonio"),
        ventasNetas: numeroTurquia("ventasNetas"),
        costoVentas: numeroTurquia("costoVentas"),
        costoMateriales: numeroTurquia("costoMateriales"),
        gananciaBruta: numeroTurquia("gananciaBruta"),
        otrosGastosOperativos: numeroTurquia("otrosGastosOperativos"),
        costoEmpleados: numeroTurquia("costoEmpleados"),
        depreciacion: numeroTurquia("depreciacion"),
        ingresosFinancieros: numeroTurquia("ingresosFinancieros"),
        gastosFinancieros: numeroTurquia("gastosFinancieros"),
        interesesPagados: numeroTurquia("interesesPagados"),
        plFinanciero: numeroTurquia("plFinanciero"),
        ingresosExtraordinarios: numeroTurquia("ingresosExtraordinarios"),
        gastosExtraordinarios: numeroTurquia("gastosExtraordinarios"),
        plExtraordinario: numeroTurquia("plExtraordinario"),
        gananciaAntesImpuestos: numeroTurquia("gananciaAntesImpuestos"),
        impuestos: numeroTurquia("impuestos"),
        gananciaNeta: numeroTurquia("gananciaNeta"),
        ebit: numeroTurquia("ebit"),
        ebitda: numeroTurquia("ebitda"),
        ganancia: numeroTurquia("ganancia"),
        indiceLiquidez: numeroTurquia("indiceLiquidez"),
        capitalTrabajo: numeroTurquia("capitalTrabajo"),
        ratioEndeudamiento: numeroTurquia("ratioEndeudamiento"),
        ratioRentabilidad: numeroTurquia("ratioRentabilidad"),
      });
    }
  });

  return { lstBalancesDesagregado, lstBalancesTotalizado, lstBalancesBanco, lstBalancesSeguro, lstBalancesTurquia };
}

function depurarPayloadInforme(valor: unknown): unknown {
  if (Array.isArray(valor)) {
    return valor
      .map((item) => depurarPayloadInforme(item))
      .filter((item) => item !== undefined);
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

export function construirPayloadCrearInforme({
  modoPayload = "analista",
  idPedido,
  idInforme,
  idFormatoFecha,
  idEstadoInforme,
  datosInvestigacion,
  opcionesTipoPersona,
  opcionesPais,
  opcionesEstadoCliente,
  opcionesTipoRegTributario,
  opcionesCiudad,
  opcionesTipoEmpresa,
  opcionesMoneda,
  opcionesSectorEconomico,
  opcionesActividadEconomica,
  opcionesClaseCiiu,
  opcionesTipoLocal,
  opcionesTipoProveedor,
  opcionesFormatoArchivo,
}: ParametrosConstruirPayloadCrearInforme): InformeCrearRequest {
  const datosValidados = esquemaDatosInvestigacion.parse(datosInvestigacion) as DatosInvestigacionAnalista;
  const { identificacion, aspectosLegales, operacionPrincipal, informacionFinanciera, referencias, datosGenerales } = datosValidados;
  const esEdicion = typeof idInforme === "number" && idInforme > 0;
  const esPayloadTraductor = modoPayload === "traductor";

  return depurarPayloadInforme({
    ...(esPayloadTraductor ? (esEdicion ? { idInforme } : {}) : { idInforme: esEdicion ? idInforme : 0 }),
    idPedido,
    idFormatoFecha,
    idTipoPersona: obtenerIdPorTexto(opcionesTipoPersona, identificacion.tipoPersona),
    nombre: identificacion.nombreEmpresa,
    nombreComercial: identificacion.nombreComercial,
    idPais: obtenerIdPorTexto(opcionesPais, identificacion.pais),
    operacionesTCMoneda: obtenerIdPorTextoONumero(opcionesMoneda, aspectosLegales.operacionesCambioDivisas),
    taxIdType: obtenerIdPorTexto(opcionesTipoRegTributario, identificacion.tipoIdentificacionFiscal),
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
    idTipoEmpresa: obtenerIdPorTexto(opcionesTipoEmpresa, aspectosLegales.tipoEmpresa),
    fechaConstitucion: convertirFechaIso(aspectosLegales.fechaConstitucion),
    idCiudadRegistro: obtenerIdPorTexto(opcionesCiudad, aspectosLegales.ciudadRegistro),
    idNotaria: aspectosLegales.notaria,
    idNotario: aspectosLegales.notario,
    idRegistro: aspectosLegales.registro,
    idPlazo: aspectosLegales.condiciones,
    idOperacionesCambioDivisas: obtenerIdPorTextoONumero(opcionesMoneda, aspectosLegales.operacionesCambioDivisas),
    capitalInicial: obtenerNumeroOpcionalDesdeTexto(aspectosLegales.capitalInicial) ?? undefined,
    capitalPagado: obtenerNumeroOpcionalDesdeTexto(aspectosLegales.capitalDesembolsado) ?? undefined,
    fechaUltimoIncremento: convertirFechaIso(aspectosLegales.ultimaAmpliacion),
    idTipoIncremento: 0,
    patrimonioNeto: obtenerNumeroOpcionalDesdeTexto(aspectosLegales.patrimonioNeto) ?? undefined,
    tipoAcciones: aspectosLegales.tipoAcciones,
    valorAcciones: obtenerNumeroOpcionalDesdeTexto(aspectosLegales.valorAcciones) ?? undefined,
    cotizaBolsa: esTextoAfirmativo(aspectosLegales.obligacionBolsa),
    idTipoCambio: obtenerIdPorTextoONumero(opcionesMoneda, aspectosLegales.monedaTipoCambio),
    tipoCambio: obtenerNumeroOpcionalDesdeTexto(aspectosLegales.tipoCambio) ?? undefined,
    antecedentes: aspectosLegales.antecedentes,
    aspectosLegales: aspectosLegales.aspectosLegales,
    comentariosAspectoLegal: aspectosLegales.comentariosEmpresasRelacionadas,
    idSector: obtenerIdPorTexto(opcionesSectorEconomico, operacionPrincipal.sector),
    actividad: operacionPrincipal.actividad,
    idIsicCategoria: obtenerIdCiiuPorValor(opcionesActividadEconomica, operacionPrincipal.categoriaCiiu) || undefined,
    idIsicClase: obtenerIdCiiuPorValor(opcionesClaseCiiu, operacionPrincipal.claseCiiu) || undefined,
    actividadPrincipal: operacionPrincipal.actividadPrincipal,
    ventasContado: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.ventasContadoPorcentaje),
    ventasContadoText: operacionPrincipal.ventasContadoDetalle,
    ventasCredito: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.ventasCreditoPorcentaje),
    ventasCreditoText: operacionPrincipal.ventasCreditoDetalle,
    idVentasCreditoTiempo: obtenerEnteroOpcionalDesdeTexto(operacionPrincipal.ventasCreditoTiempo),
    ventasNacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.territorioVentasPorcentaje),
    ventasNacionalesText: operacionPrincipal.territorioVentasDetalle,
    ventasInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.ventasExtranjeroPorcentaje),
    ventasInternacionalesText: operacionPrincipal.ventasExtranjeroDetalle,
    comprasNacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasNacionalesPorcentaje),
    comprasNacionalesText: operacionPrincipal.comprasNacionalesDetalle,
    comprasContadoNacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasContadoNacionalesPorcentaje),
    comprasContadoNacionalesText: operacionPrincipal.comprasContadoNacionalesDetalle,
    comprasCreditoNacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasCreditoNacionalesPorcentaje),
    comprasCreditoNacionalesText: operacionPrincipal.comprasCreditoNacionalesDetalle,
    idComprasCreditoNacionalesTiempo: obtenerEnteroOpcionalDesdeTexto(operacionPrincipal.comprasCreditoNacionalesTiempo),
    comprasInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasExtranjeroPorcentaje),
    comprasInternacionalesText: operacionPrincipal.comprasExtranjeroDetalle,
    comprasContadoInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasContadoInternacionalesPorcentaje),
    comprasContadoInternacionalesText: operacionPrincipal.comprasContadoInternacionalesDetalle,
    comprasCreditoInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasCreditoInternacionalesPorcentaje),
    comprasCreditoInternacionalesText: operacionPrincipal.comprasCreditoInternacionalesDetalle,
    idComprasCreditoInternacionalesTiempo: obtenerEnteroOpcionalDesdeTexto(operacionPrincipal.comprasCreditoInternacionalesTiempo),
    numeroEmpleados: obtenerEnteroOpcionalDesdeTexto(operacionPrincipal.numeroEmpleados),
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
      idMoneda: balance.idMoneda ?? (obtenerIdPorTexto(opcionesMoneda, balance.operacionCambio ?? "") || obtenerIdMoneda(balance.operacionCambio ?? "")),
      idTipoBalance: (balance.idTipoBalance ?? obtenerIdPorTextoONumero(undefined, balance.tipoBalance ?? "")) || obtenerIdTipoBalance(balance.tipoBalance),
      idTipoEstadoFinanciero: balance.idTipoEstadoFinanciero ?? ({
        desagregado: 1,
        totalizado: 2,
        bancos: 3,
        seguros: 4,
        turquia: 5,
      } as Record<string, number>)[obtenerClaveEstadoFinanciero(balance.tipoEstadoFinanciero ?? balance.tipo)] ?? 0,
    })),
    ...construirListasDetalleBalance(datosInvestigacion.balances),
    lstBancos: datosInvestigacion.bancos.map((banco) => ({
      ...(esEdicion ? { idInformeBanco: banco.idInformeBanco ?? 0 } : {}),
      idBanco: banco.idBanco ?? 0,
      numeroCuenta: banco.numeroCuenta,
      idSector: banco.idSector ?? obtenerIdPorTexto(opcionesSectorEconomico, banco.sector),
      sectorista: banco.sectoristaJefeCuenta ?? "",
      referenciaBanco: banco.telefono,
    })),
    lstCompaniasRelacionadas: datosInvestigacion.companiasRelacionadas.map((empresa) => ({
      ...(esEdicion ? { idInformeCompaniaRelacionada: esPayloadTraductor ? 0 : empresa.idInformeCompaniaRelacionada ?? 0 } : {}),
      idCompania: empresa.idCompania ?? 0,
    })),
    lstExportacionesImportaciones: [
      ...datosInvestigacion.importaciones.map((registro) => ({
        ...(esEdicion ? { idInformeExportacionImportacion: 0 } : {}),
        anio: obtenerEnteroDesdeTexto(registro.anio),
        mesInicio: registro.idMesInicio ?? obtenerNumeroMes(registro.mes),
        mesFin: registro.idMesFin ?? registro.idMesInicio ?? obtenerNumeroMes(registro.mes),
        idMoneda: (registro.idMoneda ?? obtenerIdPorTexto(opcionesMoneda, registro.moneda)) || obtenerIdMoneda(registro.moneda),
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
        idMoneda: (registro.idMoneda ?? obtenerIdPorTexto(opcionesMoneda, registro.moneda)) || obtenerIdMoneda(registro.moneda),
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
      idTipoPersona: proveedor.idTipoProveedor ?? obtenerIdPorTextoONumero(opcionesTipoProveedor, proveedor.tipoProveedor),
      nombre: proveedor.nombreEmpresa,
      idPais: proveedor.idPais ?? obtenerIdPorTexto(opcionesPais, proveedor.pais),
      idTipoDocumento: proveedor.idTipoDocumento ?? obtenerIdPorTextoONumero(opcionesTipoRegTributario, proveedor.taxIdType),
      numeroDocumento: proveedor.taxIdNumber,
      idMoneda: proveedor.idMoneda ?? (obtenerIdPorTexto(opcionesMoneda, proveedor.operacionCambioMoneda ?? "") || obtenerIdMoneda(proveedor.operacionCambioMoneda ?? "")),
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
      ...(esEdicion ? { idInformeDirectorioEjecutivo: esPayloadTraductor ? 0 : ejecutivo.idInformeDirectorioEjecutivo ?? 0 } : {}),
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
      idInformeLocal: esPayloadTraductor ? local.idInformeLocal ?? 0 : esEdicion ? local.idInformeLocal ?? 0 : 0,
      idTipoLocal: local.idTipoLocal ?? (
        esPayloadTraductor
          ? obtenerIdPorTexto(opcionesTipoLocal, local.tipoLocal)
          : obtenerIdPorTextoONumero(opcionesTipoLocal, local.tipoLocal)
      ),
      comentario: local.comentario,
      imagenes: (local.imagenes ?? []).map((imagen) => ({
        idInformeLocalImagen: imagen.idInformeLocalImagen ?? 0,
        idTipoArchivo:
          imagen.idTipoArchivo ??
          obtenerIdTipoArchivoPorMime(
            opcionesFormatoArchivo,
            imagen.tipo ?? local.imagenTipo,
          ),
        nombre: imagen.nombre,
      })),
    })),
  }) as InformeCrearRequest;
}

function normalizarMime(valor?: string | null) {
  return valor?.trim().toUpperCase() ?? "";
}

function obtenerIdTipoArchivoPorMime(
  opcionesFormatoArchivo: EntradaTablaMaestra[] | undefined,
  mimeType?: string,
) {
  const mimeNormalizado = normalizarMime(mimeType);
  if (!mimeNormalizado) return 0;

  return (
    opcionesFormatoArchivo?.find(
      (opcion) => normalizarMime(opcion.string3) === mimeNormalizado,
    )?.num1 ??
    obtenerIdTipoArchivo(mimeType)
  );
}

export function prepararDatosParaNuevoInforme(
  datos: DatosInvestigacionAnalista,
): DatosInvestigacionAnalista {
  return {
    ...datos,
    balances: datos.balances.map((balance) => ({
      ...balance,
      idInformeBalance: undefined,
    })),
    bancos: datos.bancos.map((banco) => ({
      ...banco,
      idInformeBanco: undefined,
    })),
    companiasRelacionadas: datos.companiasRelacionadas.map((compania) => ({
      ...compania,
      idInformeCompaniaRelacionada: undefined,
    })),
    importaciones: datos.importaciones.map((registro) => ({
      ...registro,
      idInformeExportacionImportacion: undefined,
    })),
    exportaciones: datos.exportaciones.map((registro) => ({
      ...registro,
      idInformeExportacionImportacion: undefined,
    })),
    proveedores: datos.proveedores.map((proveedor) => ({
      ...proveedor,
      idInformeProveedor: undefined,
    })),
    directorioEjecutivo: datos.directorioEjecutivo.map((ejecutivo) => ({
      ...ejecutivo,
      idInformeDirectorioEjecutivo: undefined,
    })),
    locales: datos.locales.map((local) => ({
      ...local,
      idInformeLocal: undefined,
    })),
  };
}
