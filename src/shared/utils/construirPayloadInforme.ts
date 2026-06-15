import type {
  InformeBalanceBancoRequest,
  InformeBalanceDesagregadoRequest,
  InformeBalanceSeguroRequest,
  InformeBalanceTotalizadoRequest,
  InformeBalanceTurquiaRequest,
  InformeCrearRequest,
} from "@maximilian/shared/types/informe.type";
import type { DatosInvestigacionAnalista, RegistroBalanceAnalista } from "@maximilian/shared/types/investigacion.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import {
  obtenerClaveEstadoFinanciero,
  obtenerValorCampoEstadoFinanciero,
} from "@maximilian/shared/utils/estados-financieros.util";
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
    const r = balance.detalleCuentas?.registrosEstadoFinanciero ?? {};
    const d = (campo: string, ...alternativos: Array<string | undefined>) => obtenerNumeroOpcionalDesdeTexto(
      obtenerValorCampoEstadoFinanciero(r, campo, tipoEstadoFinanciero)
        || alternativos.find((valor) => valor?.trim()),
    ) ?? 0;
    const i = (campo: string): number | null => {
      const v = obtenerValorCampoEstadoFinanciero(r, campo, tipoEstadoFinanciero);
      if (!v) return null;
      const num = Number.parseInt(v.replace(/[^\d-]/g, ""), 10);
      return Number.isFinite(num) ? num : null;
    };

    if (tipo === 1) {
      lstBalancesDesagregado.push({
        id,
        efectivoEquivalente: d("efectivoEquivalente"),
        otrosActivosFinancierosCorriente: d("otrosActivosFinancierosCorriente"),
        cuentasCobrarCorriente: d("cuentasCobrarCorriente"),
        inventariosCorriente: d("inventariosCorriente"),
        activosBiologicosCorriente: d("activosBiologicosCorriente"),
        activosImpuestosGanancias: d("activosImpuestosGanancias"),
        otrosActivosNoFinancierosCorriente: d("otrosActivosNoFinancierosCorriente"),
        totalActivoCorriente: d("totalActivoCorriente"),
        otrosActivosFinancierosNoCorriente: d("otrosActivosFinancierosNoCorriente"),
        inversionesSubsidiarias: d("inversionesSubsidiarias"),
        cuentasCobrarNoCorriente: d("cuentasCobrarNoCorriente"),
        inventariosNoCorriente: d("inventariosNoCorriente"),
        activosBiologicosNoCorriente: d("activosBiologicosNoCorriente"),
        propiedadesInversion: d("propiedadesInversion"),
        propiedadesPlantaEquipo: d("propiedadesPlantaEquipo"),
        intangibles: d("intangibles"),
        activosImpuestosDiferidos: d("activosImpuestosDiferidos"),
        activosImpuestosCorrientes: d("activosImpuestosCorrientes"),
        plusvalia: d("plusvalia"),
        otrosActivosNoFinancierosNoCorriente: d("otrosActivosNoFinancierosNoCorriente"),
        totalActivoNoCorriente: d("totalActivoNoCorriente"),
        totalActivo: d("totalActivo", balance.detalleCuentas?.balanceGeneral.totalActivos),
        otrosPasivosFinancierosCorriente: d("otrosPasivosFinancierosCorriente"),
        cuentasPagarCorriente: d("cuentasPagarCorriente"),
        beneficiosEmpleadosCorriente: d("beneficiosEmpleadosCorriente"),
        otrasProvisionesCorriente: d("otrasProvisionesCorriente"),
        impuestosGananciasCorriente: d("impuestosGananciasCorriente"),
        otrosPasivosNoFinancierosCorriente: d("otrosPasivosNoFinancierosCorriente"),
        totalPasivoCorriente: d("totalPasivoCorriente"),
        otrosPasivosFinancierosNoCorriente: d("otrosPasivosFinancierosNoCorriente"),
        cuentasPagarNoCorriente: d("cuentasPagarNoCorriente"),
        beneficiosEmpleadosNoCorriente: d("beneficiosEmpleadosNoCorriente"),
        otrasProvisionesNoCorriente: d("otrasProvisionesNoCorriente"),
        impuestosDiferidosNoCorriente: d("impuestosDiferidosNoCorriente"),
        impuestosCorrientesNoCorriente: d("impuestosCorrientesNoCorriente"),
        otrosPasivosNoFinancierosNoCorriente: d("otrosPasivosNoFinancierosNoCorriente"),
        totalPasivoNoCorriente: d("totalPasivoNoCorriente"),
        totalPasivos: d("totalPasivos", balance.detalleCuentas?.balanceGeneral.totalPasivos),
        capitalEmitido: d("capitalEmitido"),
        primasEmision: d("primasEmision"),
        accionesInversion: d("accionesInversion"),
        accionesCartera: d("accionesCartera"),
        otrasReservasCapital: d("otrasReservasCapital"),
        resultadosAcumulados: d("resultadosAcumulados"),
        otrasReservasPatrimonio: d("otrasReservasPatrimonio"),
        totalPatrimonio: d("totalPatrimonio"),
        totalPasivoPatrimonio: d("totalPasivoPatrimonio", balance.detalleCuentas?.balanceGeneral.totalPasivoPatrimonio),
        ingresosOrdinarios: d("ingresosOrdinarios"),
        costoVentas: d("costoVentas"),
        gananciaBruta: d("gananciaBruta"),
        gastosVentas: d("gastosVentas"),
        gastosAdministracion: d("gastosAdministracion"),
        otrosIngresosOperativos: d("otrosIngresosOperativos"),
        otrosGastosOperativos: d("otrosGastosOperativos"),
        otrasGananciasPerdidas: d("otrasGananciasPerdidas"),
        gananciaOperativa: d("gananciaOperativa"),
        ingresosFinancieros: d("ingresosFinancieros"),
        ingresosIntereses: d("ingresosIntereses"),
        gastosFinancieros: d("gastosFinancieros"),
        deterioroValor: d("deterioroValor"),
        otrosIngresosSubsidiarias: d("otrosIngresosSubsidiarias"),
        diferenciasCambio: d("diferenciasCambio"),
        gananciaAntesImpuestos: d("gananciaAntesImpuestos"),
        ingresoGastoImpuesto: d("ingresoGastoImpuesto"),
        operacionesDescontinuadas: d("operacionesDescontinuadas"),
        gananciaNeta: d("gananciaNeta"),
        indiceLiquidez: d("indiceLiquidez", balance.detalleCuentas?.ratios.liquidez),
        capitalTrabajo: d("capitalTrabajo", balance.detalleCuentas?.ratios.capitalTrabajo),
        ratioEndeudamiento: d("ratioEndeudamiento", balance.detalleCuentas?.ratios.endeudamiento),
        ratioRentabilidad: d("ratioRentabilidad", balance.detalleCuentas?.ratios.rentabilidad),
      });
    } else if (tipo === 2) {
      lstBalancesTotalizado.push({
        id,
        totalActivoCorriente: d("totalActivoCorriente", balance.detalleCuentas?.balanceGeneral.totalCorrientes),
        totalActivoNoCorriente: d("totalActivoNoCorriente", balance.detalleCuentas?.balanceGeneral.totalNoCorrientes),
        totalActivo: d("totalActivo", balance.detalleCuentas?.balanceGeneral.totalActivos),
        totalPasivoCorriente: d("totalPasivoCorriente", balance.detalleCuentas?.balanceGeneral.totalPasivosCorrientes),
        totalPasivoNoCorriente: d("totalPasivoNoCorriente", balance.detalleCuentas?.balanceGeneral.totalPasivosNoCorrientes),
        totalPasivos: d("totalPasivos", balance.detalleCuentas?.balanceGeneral.totalPasivos),
        totalPatrimonio: d("totalPatrimonio", balance.detalleCuentas?.balanceGeneral.patrimonio),
        totalPasivoPatrimonio: d("totalPasivoPatrimonio", balance.detalleCuentas?.balanceGeneral.totalPasivoPatrimonio),
        ingresosOrdinarios: d("ingresosOrdinarios", balance.detalleCuentas?.estadoGananciasPerdidas.ventasNetas),
        gananciaNeta: d("gananciaNeta", balance.detalleCuentas?.estadoGananciasPerdidas.utilidadGanancia),
        indiceLiquidez: d("indiceLiquidez", balance.detalleCuentas?.ratios.liquidez),
        capitalTrabajo: d("capitalTrabajo", balance.detalleCuentas?.ratios.capitalTrabajo),
        ratioEndeudamiento: d("ratioEndeudamiento", balance.detalleCuentas?.ratios.endeudamiento),
        ratioRentabilidad: d("ratioRentabilidad", balance.detalleCuentas?.ratios.rentabilidad),
      });
    } else if (tipo === 3) {
      lstBalancesBanco.push({
        id,
        disponible: d("disponible"),
        fondosInterbancarios: d("fondosInterbancarios"),
        inversionesValorRazonable: d("inversionesValorRazonable"),
        carteraCreditos: d("carteraCreditos"),
        derivadosNegociacionActivo: d("derivadosNegociacionActivo"),
        derivadosCoberturaActivo: d("derivadosCoberturaActivo"),
        bienesRealizables: d("bienesRealizables"),
        participacionesSubsidiarias: d("participacionesSubsidiarias"),
        inmuebleMobiliarioEquipo: d("inmuebleMobiliarioEquipo"),
        impuestoRentaDiferido: d("impuestoRentaDiferido"),
        otrosActivos: d("otrosActivos"),
        totalActivos: d("totalActivos"),
        obligacionesPublico: d("obligacionesPublico"),
        fondosInterbancariosPasivo: d("fondosInterbancariosPasivo"),
        adeudosFinancieras: d("adeudosFinancieras"),
        derivadosNegociacionPasivo: d("derivadosNegociacionPasivo"),
        derivadosCoberturaPasivo: d("derivadosCoberturaPasivo"),
        cuentasPagarProvisiones: d("cuentasPagarProvisiones"),
        totalPasivo: d("totalPasivo"),
        capitalSocial: d("capitalSocial"),
        reservas: d("reservas"),
        resultadosNoRealizados: d("resultadosNoRealizados"),
        resultadoEjercicio: d("resultadoEjercicio"),
        totalPatrimonio: d("totalPatrimonio"),
        totalPasivoPatrimonio: d("totalPasivoPatrimonio"),
        ingresosIntereses: d("ingresosIntereses"),
        utilidadEjercicio: d("utilidadEjercicio"),
      });
    } else if (tipo === 4) {
      lstBalancesSeguro.push({
        id,
        efectivoDisponible: d("efectivoDisponible"),
        inversionesFinancieras: d("inversionesFinancieras"),
        prestamosInteresesNetos: d("prestamosInteresesNetos"),
        primasCobrar: d("primasCobrar"),
        deudasReaseguradores: d("deudasReaseguradores"),
        activosVenta: d("activosVenta"),
        propiedadesInversion: d("propiedadesInversion"),
        propiedadPlantaEquipo: d("propiedadPlantaEquipo"),
        otrosActivos: d("otrosActivos"),
        totalActivos: d("totalActivos"),
        obligacionesAsegurados: d("obligacionesAsegurados"),
        reservasSiniestros: d("reservasSiniestros"),
        reservasTecnicas: d("reservasTecnicas"),
        obligacionesReaseguradores: d("obligacionesReaseguradores"),
        obligacionesFinancieras: d("obligacionesFinancieras"),
        cuentasPagar: d("cuentasPagar"),
        otrosPasivos: d("otrosPasivos"),
        totalPasivo: d("totalPasivo"),
        capitalSocial: d("capitalSocial"),
        aportesCapitalNoCapitalizados: d("aportesCapitalNoCapitalizados"),
        resultadosAcumulados: d("resultadosAcumulados"),
        patrimonioRestringido: d("patrimonioRestringido"),
        totalPatrimonio: d("totalPatrimonio"),
        totalPasivoPatrimonio: d("totalPasivoPatrimonio"),
        primasGanadasNetas: d("primasGanadasNetas"),
        utilidadNeta: d("utilidadNeta"),
      });
    } else if (tipo === 5) {
      lstBalancesTurquia.push({
        id,
        tipoBalanceTurquia: balance.detalleCuentas?.tipoBalanceTurquia ?? "I",
        ano: i("ano"),
        fechaBalance: obtenerValorCampoEstadoFinanciero(r, "fechaBalance", tipoEstadoFinanciero) || null,
        idMoneda: balance.idMoneda ?? i("idMoneda"),
        duracionPeriodo: i("duracionPeriodo"),
        idNivelConfiabilidad: {
          ACTUAL: 1,
          PRELIMINAR: 2,
          ESTIMADO: 3,
        }[obtenerValorCampoEstadoFinanciero(r, "idNivelConfiabilidad", tipoEstadoFinanciero).toUpperCase()] ?? i("idNivelConfiabilidad"),
        tipoCambio: d("tipoCambio"),
        efectivo: d("efectivo"),
        existencias: d("existencias"),
        deudores: d("deudores"),
        totalCorriente: d("totalCorriente"),
        bienesTongibles: d("bienesTongibles"),
        activosIntangibles: d("activosIntangibles"),
        activoFijoNeto: d("activoFijoNeto"),
        totalActivos: d("totalActivos"),
        prestamos: d("prestamos"),
        acreedores: d("acreedores"),
        pasivosCorrientes: d("pasivosCorrientes"),
        pasivosNoCorrientes: d("pasivosNoCorrientes"),
        pasivosLargoPlazo: d("pasivosLargoPlazo"),
        totalPasivosNoCorrientes: d("totalPasivosNoCorrientes"),
        totalPasivos: d("totalPasivos"),
        capital: d("capital"),
        reservas: d("reservas"),
        resultadosAcumulados: d("resultadosAcumulados"),
        resultadoEjercicio: d("resultadoEjercicio"),
        otrasCuentas: d("otrasCuentas"),
        totalPatrimonio: d("totalPatrimonio"),
        totalPasivosPatrimonio: d("totalPasivosPatrimonio"),
        ventasNetas: d("ventasNetas"),
        costoVentas: d("costoVentas"),
        costoMateriales: d("costoMateriales"),
        gananciaBruta: d("gananciaBruta"),
        otrosGastosOperativos: d("otrosGastosOperativos"),
        costoEmpleados: d("costoEmpleados"),
        depreciacion: d("depreciacion"),
        ingresosFinancieros: d("ingresosFinancieros"),
        gastosFinancieros: d("gastosFinancieros"),
        interesesPagados: d("interesesPagados"),
        plFinanciero: d("plFinanciero"),
        ingresosExtraordinarios: d("ingresosExtraordinarios"),
        gastosExtraordinarios: d("gastosExtraordinarios"),
        plExtraordinario: d("plExtraordinario"),
        gananciaAntesImpuestos: d("gananciaAntesImpuestos"),
        impuestos: d("impuestos"),
        gananciaNeta: d("gananciaNeta"),
        ebit: d("ebit"),
        ebitda: d("ebitda"),
        ganancia: d("ganancia"),
        indiceLiquidez: d("indiceLiquidez"),
        capitalTrabajo: d("capitalTrabajo"),
        ratioEndeudamiento: d("ratioEndeudamiento"),
        ratioRentabilidad: d("ratioRentabilidad"),
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
    comprasContadoNacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasContadoNacionalesPorcentaje),
    comprasContadoNacionalesText: operacionPrincipal.comprasContadoNacionalesDetalle,
    comprasCreditoNacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasCreditoNacionalesPorcentaje),
    comprasCreditoNacionalesText: operacionPrincipal.comprasCreditoNacionalesDetalle,
    idComprasCreditoNacionalesTiempo: obtenerEnteroDesdeTexto(operacionPrincipal.comprasCreditoNacionalesTiempo),
    comprasInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasExtranjeroPorcentaje),
    comprasInternacionalesText: operacionPrincipal.comprasExtranjeroDetalle,
    comprasContadoInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasContadoInternacionalesPorcentaje),
    comprasContadoInternacionalesText: operacionPrincipal.comprasContadoInternacionalesDetalle,
    comprasCreditoInternacionales: obtenerNumeroOpcionalDesdeTexto(operacionPrincipal.comprasCreditoInternacionalesPorcentaje),
    comprasCreditoInternacionalesText: operacionPrincipal.comprasCreditoInternacionalesDetalle,
    idComprasCreditoInternacionalesTiempo: obtenerEnteroDesdeTexto(operacionPrincipal.comprasCreditoInternacionalesTiempo),
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
