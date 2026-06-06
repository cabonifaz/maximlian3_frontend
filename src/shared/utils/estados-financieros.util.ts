export interface CampoEstadoFinancieroAnalista {
  id: string;
  etiqueta: string;
  tipoEntrada?: "numero" | "entero" | "fecha" | "selector-moneda-nombre" | "selector-moneda-codigo" | "selector-confiabilidad";
}

export interface SeccionEstadoFinancieroAnalista {
  id: string;
  titulo: string;
  campos: CampoEstadoFinancieroAnalista[];
}

function normalizarTextoEstadoFinanciero(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const configuracionEstadosFinancieros: Record<string, SeccionEstadoFinancieroAnalista[]> = {
  desagregado: [
    {
      id: "activo-corriente",
      titulo: "Activo Corriente",
      campos: [
        { id: "efectivo-equivalente", etiqueta: "Efectivo y Equivalente al Efectivo" },
        { id: "otros-activos-financieros-corriente", etiqueta: "Otros Activos Financieros" },
        { id: "cuentas-cobrar-corriente", etiqueta: "Cuentas por Cobrar Comerciales y Otras Cuentas por Cobrar" },
        { id: "inventarios-corriente", etiqueta: "Inventarios" },
        { id: "activos-biologicos-corriente", etiqueta: "Activos Biologicos" },
        { id: "activos-impuestos-ganancias", etiqueta: "Activos por Impuestos a las Ganancias" },
        { id: "otros-activos-no-financieros-corriente", etiqueta: "Otros Activos No Financieros" },
        { id: "total-activo-corriente", etiqueta: "Total Activo Corriente" },
      ],
    },
    {
      id: "activo-no-corriente",
      titulo: "Activo No Corriente",
      campos: [
        { id: "otros-activos-financieros-no-corriente", etiqueta: "Otros Activos Financieros" },
        { id: "inversiones-subsidiarias", etiqueta: "Inversiones en Subsidiarias, Negocios Conjuntos y Asociadas" },
        { id: "cuentas-cobrar-no-corriente", etiqueta: "Cuentas por Cobrar Comerciales y Otras Cuentas por Cobrar" },
        { id: "inventarios-no-corriente", etiqueta: "Inventarios" },
        { id: "activos-biologicos-no-corriente", etiqueta: "Activos Biologicos" },
        { id: "propiedades-inversion", etiqueta: "Propiedades de Inversion" },
        { id: "propiedades-planta-equipo", etiqueta: "Propiedades, Planta y Equipo" },
        { id: "intangibles", etiqueta: "Activos Intangibles Distintos de la Plusvalia" },
        { id: "activos-impuestos-diferidos", etiqueta: "Activos por Impuestos Diferidos" },
        { id: "activos-impuestos-corrientes", etiqueta: "Activos por Impuestos Corrientes, No Corrientes" },
        { id: "plusvalia", etiqueta: "Plusvalia" },
        { id: "otros-activos-no-financieros-no-corriente", etiqueta: "Otros Activos No Financieros" },
        { id: "total-activo-no-corriente", etiqueta: "Total Activo No Corriente" },
        { id: "total-activo", etiqueta: "Total Activo" },
      ],
    },
    {
      id: "pasivo-corriente",
      titulo: "Pasivo Corriente",
      campos: [
        { id: "otros-pasivos-financieros-corriente", etiqueta: "Otros Pasivos Financieros" },
        { id: "cuentas-pagar-corriente", etiqueta: "Cuentas por Pagar Comerciales y Otras Cuentas por Pagar" },
        { id: "beneficios-empleados-corriente", etiqueta: "Provision por Beneficios a los Empleados" },
        { id: "otras-provisiones-corriente", etiqueta: "Otras Provisiones" },
        { id: "impuestos-ganancias-corriente", etiqueta: "Pasivos por Impuestos a las Ganancias" },
        { id: "otros-pasivos-no-financieros-corriente", etiqueta: "Otros Pasivos No Financieros" },
        { id: "total-pasivo-corriente", etiqueta: "Total Pasivo Corriente" },
      ],
    },
    {
      id: "pasivo-no-corriente",
      titulo: "Pasivo No Corriente",
      campos: [
        { id: "otros-pasivos-financieros-no-corriente", etiqueta: "Otros Pasivos Financieros" },
        { id: "cuentas-pagar-no-corriente", etiqueta: "Cuentas por Pagar Comerciales y Otras Cuentas por Pagar" },
        { id: "beneficios-empleados-no-corriente", etiqueta: "Provision por Beneficios a los Empleados" },
        { id: "otras-provisiones-no-corriente", etiqueta: "Otras Provisiones" },
        { id: "impuestos-diferidos-no-corriente", etiqueta: "Pasivos por Impuestos Diferidos" },
        { id: "impuestos-corrientes-no-corriente", etiqueta: "Pasivos por Impuestos Corrientes, No Corrientes" },
        { id: "otros-pasivos-no-financieros-no-corriente", etiqueta: "Otros Pasivos No Financieros" },
        { id: "total-pasivo-no-corriente", etiqueta: "Total Pasivo No Corriente" },
        { id: "total-pasivos", etiqueta: "Total Pasivos" },
      ],
    },
    {
      id: "patrimonio",
      titulo: "Patrimonio",
      campos: [
        { id: "capital-emitido", etiqueta: "Capital Emitido" },
        { id: "primas-emision", etiqueta: "Primas de Emision" },
        { id: "acciones-inversion", etiqueta: "Acciones de Inversion" },
        { id: "acciones-cartera", etiqueta: "Acciones Propias en Cartera" },
        { id: "otras-reservas-capital", etiqueta: "Otras Reservas de Capital" },
        { id: "resultados-acumulados", etiqueta: "Resultados Acumulados" },
        { id: "otras-reservas-patrimonio", etiqueta: "Otras Reservas de Patrimonio" },
        { id: "total-patrimonio", etiqueta: "Total Patrimonio" },
        { id: "total-pasivo-patrimonio", etiqueta: "Total Pasivos + Patrimonio" },
      ],
    },
    {
      id: "resultados",
      titulo: "Estado de Resultado Integral",
      campos: [
        { id: "ingresos-ordinarios", etiqueta: "Ingresos de Actividades Ordinarias" },
        { id: "costo-ventas", etiqueta: "Costo de Ventas" },
        { id: "ganancia-bruta", etiqueta: "Ganancia (Perdida) Bruta" },
        { id: "gastos-ventas", etiqueta: "Gastos de Ventas y Distribucion" },
        { id: "gastos-administracion", etiqueta: "Gastos de Administracion" },
        { id: "otros-ingresos-operativos", etiqueta: "Otros Ingresos Operativos" },
        { id: "otros-gastos-operativos", etiqueta: "Otros Gastos Operativos" },
        { id: "otras-ganancias-perdidas", etiqueta: "Otras Ganancias (Perdidas)" },
        { id: "ganancia-operativa", etiqueta: "Ganancia (Perdida) Operativa" },
        { id: "ingresos-financieros", etiqueta: "Ingresos Financieros" },
        { id: "ingresos-intereses", etiqueta: "Ingresos por Intereses" },
        { id: "gastos-financieros", etiqueta: "Gastos Financieros" },
        { id: "deterioro-valor", etiqueta: "Ganancia (Perdida) por Deterioro de Valor" },
        { id: "otros-ingresos-subsidiarias", etiqueta: "Otros Ingresos (Gastos) de las Subsidiarias, Asociadas y Negocios Conjuntos" },
        { id: "diferencias-cambio", etiqueta: "Diferencias de Cambio Neto" },
        { id: "ganancia-antes-impuestos", etiqueta: "Ganancia (Perdida) Antes de Impuestos" },
        { id: "ingreso-gasto-impuesto", etiqueta: "Ingreso (Gasto) por Impuesto" },
        { id: "operaciones-descontinuadas", etiqueta: "Ganancia (Perdida) Procedente de Operaciones Descontinuadas, Neta de Impuesto" },
        { id: "ganancia-neta", etiqueta: "Ganancia (Perdida) Neta del Ejercicio" },
      ],
    },
    {
      id: "ratios",
      titulo: "Ratios",
      campos: [
        { id: "liquidity-ratio", etiqueta: "Liquidity Ratio" },
        { id: "working-capital-ratio", etiqueta: "Working Capital Ratio" },
        { id: "current-indebtedness-ratio", etiqueta: "Current Indebtedness Ratio" },
        { id: "profitability-ratio", etiqueta: "Profitability Ratio" },
      ],
    },
  ],
  totalizado: [
    {
      id: "totales-balance",
      titulo: "Balance General",
      campos: [
        { id: "total-activo-corriente", etiqueta: "Total Activo Corriente" },
        { id: "total-activo-no-corriente", etiqueta: "Total Activo No Corriente" },
        { id: "total-activo", etiqueta: "Total Activo" },
        { id: "total-pasivo-corriente", etiqueta: "Total Pasivo Corriente" },
        { id: "total-pasivo-no-corriente", etiqueta: "Total Pasivo No Corriente" },
        { id: "total-pasivos", etiqueta: "Total Pasivos" },
        { id: "total-patrimonio", etiqueta: "Total Patrimonio" },
        { id: "total-pasivo-patrimonio", etiqueta: "Total Pasivos + Patrimonio" },
      ],
    },
    {
      id: "resultados-totalizado",
      titulo: "Estado de Resultado Integral",
      campos: [
        { id: "ingresos-ordinarios-totalizado", etiqueta: "Ingresos de Actividades Ordinarias" },
        { id: "ganancia-neta-totalizado", etiqueta: "Ganancia (Perdida) Neta del Ejercicio" },
      ],
    },
    {
      id: "ratios-totalizado",
      titulo: "Ratios",
      campos: [
        { id: "liquidity-ratio-totalizado", etiqueta: "Indice de Liquidez (Liquidity Index)" },
        { id: "working-capital-ratio-totalizado", etiqueta: "Capital de Trabajo (Working Capital)" },
        { id: "current-indebtedness-ratio-totalizado", etiqueta: "Ratio de Endeudamiento (Indebtedness Ratio)" },
        { id: "profitability-ratio-totalizado", etiqueta: "Ratio de Rentabilidad (Profitability Ratio)" },
      ],
    },
  ],
  bancos: [
    {
      id: "activo-bancos",
      titulo: "Activo",
      campos: [
        { id: "disponible", etiqueta: "Disponible" },
        { id: "fondos-interbancarios-activo", etiqueta: "Fondos Interbancarios" },
        { id: "inversiones-valor-razonable", etiqueta: "Inversiones a Valor Razonable" },
        { id: "cartera-creditos", etiqueta: "Cartera de Créditos" },
        { id: "derivados-negociacion-activo", etiqueta: "Derivados para Negociacion" },
        { id: "derivados-cobertura-activo", etiqueta: "Derivados de Cobertura" },
        { id: "bienes-realizables", etiqueta: "Bienes Realizables" },
        { id: "participaciones-subsidiarias", etiqueta: "Participaciones en Subsidiarias y Asociadas" },
        { id: "inmueble-mobiliario-equipo", etiqueta: "Inmueble, Mobiliario y Equipo Neto" },
        { id: "impuesto-renta-diferido", etiqueta: "Impuesto a la Renta Diferido" },
        { id: "otros-activos-bancos", etiqueta: "Otros Activos" },
        { id: "total-activos-bancos", etiqueta: "Total Activos" },
      ],
    },
    {
      id: "pasivo-bancos",
      titulo: "Pasivo",
      campos: [
        { id: "obligaciones-publico", etiqueta: "Obligaciones con el Publico y Depositos del Sistema Financiero" },
        { id: "fondos-interbancarios-pasivo", etiqueta: "Fondos Interbancarios" },
        { id: "adeudos-financieras", etiqueta: "Adeudos y Obligaciones Financieras" },
        { id: "derivados-negociacion-pasivo", etiqueta: "Derivados para Negociacion" },
        { id: "derivados-cobertura-pasivo", etiqueta: "Derivados de Cobertura" },
        { id: "cuentas-pagar-provisiones", etiqueta: "Cuentas por Pagar, Provisiones y Otros Pasivos" },
        { id: "total-pasivo-bancos", etiqueta: "Total Pasivo" },
      ],
    },
    {
      id: "patrimonio-bancos",
      titulo: "Patrimonio",
      campos: [
        { id: "capital-social-bancos", etiqueta: "Capital Social" },
        { id: "reservas-bancos", etiqueta: "Reservas" },
        { id: "resultados-no-realizados", etiqueta: "Resultados No Realizados" },
        { id: "resultado-ejercicio-bancos", etiqueta: "Resultado del Ejercicio" },
        { id: "total-patrimonio-bancos", etiqueta: "Total Patrimonio" },
        { id: "total-pasivo-patrimonio-bancos", etiqueta: "Total Pasivo y Patrimonio" },
      ],
    },
    {
      id: "resultados-bancos",
      titulo: "Estados de Resultado",
      campos: [
        { id: "ingresos-intereses-bancos", etiqueta: "Ingresos por Intereses" },
        { id: "utilidad-ejercicio-bancos", etiqueta: "Utilidad del Ejercicio" },
      ],
    },
  ],
  seguros: [
    {
      id: "activo-seguros",
      titulo: "Activo",
      campos: [
        { id: "efectivo-disponible", etiqueta: "Efectivo y Disponible" },
        { id: "inversiones-financieras-seguros", etiqueta: "Inversiones Financieras" },
        { id: "prestamos-intereses-netos", etiqueta: "Préstamos e Intereses Netos" },
        { id: "primas-cobrar", etiqueta: "Primas por Cobrar" },
        { id: "deudas-reaseguradores", etiqueta: "Deudas a Cargo de Reaseguradores y Garantes" },
        { id: "activos-venta", etiqueta: "Activos Mantenidos para la Venta y Grupo de Activos para su Disposición" },
        { id: "propiedades-inversion-seguros", etiqueta: "Propiedades de Inversión" },
        { id: "propiedad-planta-equipo-seguros", etiqueta: "Propiedad, Planta y Equipo, Neto" },
        { id: "otros-activos-seguros", etiqueta: "Otros Activos" },
        { id: "total-activos-seguros", etiqueta: "Total Activos" },
      ],
    },
    {
      id: "pasivo-seguros",
      titulo: "Pasivo",
      campos: [
        { id: "obligaciones-asegurados", etiqueta: "Obligaciones con Asegurados" },
        { id: "reservas-siniestros", etiqueta: "Reservas por Siniestros" },
        { id: "reservas-tecnicas", etiqueta: "Reservas Técnicas y Matemáticas" },
        { id: "obligaciones-reaseguradores", etiqueta: "Obligaciones con Reaseguradores y Garantes" },
        { id: "obligaciones-financieras-seguros", etiqueta: "Obligaciones Financieras" },
        { id: "cuentas-pagar-seguros", etiqueta: "Cuentas por Pagar" },
        { id: "otros-pasivos-seguros", etiqueta: "Otros Pasivos" },
        { id: "total-pasivo-seguros", etiqueta: "Total Pasivo" },
      ],
    },
    {
      id: "patrimonio-seguros",
      titulo: "Patrimonio",
      campos: [
        { id: "capital-social-seguros", etiqueta: "Capital Social" },
        { id: "aportes-capital-no-capitalizados", etiqueta: "Aportes de Capital no Capitalizados" },
        { id: "resultados-acumulados-seguros", etiqueta: "Resultados Acumulados" },
        { id: "patrimonio-restringido", etiqueta: "Patrimonio Restringido no Distribuible" },
        { id: "total-patrimonio-seguros", etiqueta: "Total Patrimonio" },
        { id: "total-pasivo-patrimonio-seguros", etiqueta: "Total Pasivo y Patrimonio" },
      ],
    },
    {
      id: "resultados-seguros",
      titulo: "Estado de Resultado Integral",
      campos: [
        { id: "primas-ganadas-netas", etiqueta: "Primas Ganadas Netas" },
        { id: "utilidad-neta-seguros", etiqueta: "Utilidad Neta" },
      ],
    },
  ],
  turquia: [
    {
      id: "general-turquia",
      titulo: "General",
      campos: [
        { id: "year", etiqueta: "Ano (Year)", tipoEntrada: "entero" },
        { id: "balance-date", etiqueta: "Fecha de Balance (Balance Date)", tipoEntrada: "fecha" },
        { id: "currency", etiqueta: "Moneda (Currency)", tipoEntrada: "selector-moneda-nombre" },
        { id: "currency-iso", etiqueta: "ISO de Moneda (Currency ISO)", tipoEntrada: "selector-moneda-codigo" },
        { id: "length-period", etiqueta: "Duracion del Periodo (Length of Period)", tipoEntrada: "entero" },
        { id: "reliability-level", etiqueta: "Nivel de Confiabilidad (Reliability Level)", tipoEntrada: "selector-confiabilidad" },
        { id: "exchange-rate", etiqueta: "Tipo de Cambio (Exchange Rate)" },
      ],
    },
    {
      id: "balance-turquia",
      titulo: "Balance",
      campos: [
        { id: "cash", etiqueta: "Efectivo (Cash)" },
        { id: "stocks", etiqueta: "Existencias (Stocks)" },
        { id: "creditors", etiqueta: "Deudores (Debtors)" },
        { id: "current-total", etiqueta: "Total Corriente (Current Total)" },
        { id: "tangible-assets", etiqueta: "Bienes Tangibles (Tangible Assets)" },
        { id: "intangible-assets", etiqueta: "Activos Intangibles (Intangible Assets)" },
        { id: "net-fixed", etiqueta: "Activo Fijo Neto (Net Fixed)" },
        { id: "total-assets-turquia", etiqueta: "Total Activos (Total Assets)" },
        { id: "loans", etiqueta: "Prestamos (Loans)" },
        { id: "debtors", etiqueta: "Acreedores (Creditors)" },
        { id: "current-liabilities", etiqueta: "Pasivos Corrientes (Current Liabilities)" },
        { id: "non-current-liabilities", etiqueta: "Pasivos No Corrientes (Non Current Liabilities)" },
        { id: "long-term-liabilities", etiqueta: "Pasivos de Largo Plazo (Long Term Liabilities)" },
        { id: "total-non-current-liabilities", etiqueta: "Total Pasivos No Corrientes (Total Non-Current Liabilities)" },
        { id: "total-liabilities", etiqueta: "Total Pasivos (Total Liabilities)" },
        { id: "capital", etiqueta: "Capital (Capital)" },
        { id: "equity", etiqueta: "Patrimonio (Equity)" },
        { id: "total-equity", etiqueta: "Total Patrimonio (Total Equity)" },
        { id: "total-liabilities-equity", etiqueta: "Total Pasivos y Patrimonio (Total Liabilities and Equity)" },
      ],
    },
    {
      id: "perdidas-ganancias-turquia",
      titulo: "Pérdidas y Ganancias",
      campos: [
        { id: "balance-date-p", etiqueta: "Fecha de Balance (Balance Date)", tipoEntrada: "fecha" },
        { id: "currency-p", etiqueta: "Moneda (Currency)", tipoEntrada: "selector-moneda-nombre" },
        { id: "exchange-rate-p", etiqueta: "Tipo de Cambio (Exchange Rate)" },
        { id: "turnover", etiqueta: "Ventas Netas (Net Sales)" },
        { id: "costs-goods-sold", etiqueta: "Costo de Ventas (Costs of Good Sold)" },
        { id: "material-costs", etiqueta: "Costo de Materiales (Material Costs)" },
        { id: "gross-profit", etiqueta: "Ganancia Bruta (Gross Profit)" },
        { id: "other-operating-expenses", etiqueta: "Otros Gastos Operativos (Other Operating Expenses)" },
        { id: "costs-employees", etiqueta: "Costo de Empleados (Costs of Employees)" },
        { id: "depreciation", etiqueta: "Depreciacion (Depreciation)" },
        { id: "financial-revenue", etiqueta: "Ingresos Financieros (Financial Revenue)" },
        { id: "financial-expenses", etiqueta: "Gastos Financieros (Financial Expenses)" },
        { id: "interest-paid", etiqueta: "Intereses Pagados (Interest Paid)" },
        { id: "financial-pl", etiqueta: "P/L Financiero (Financial P/L)" },
        { id: "extra-other-revenue", etiqueta: "Ingresos Extraordinarios y Otros (Extr. and Other Revenue)" },
        { id: "extra-other-expenses", etiqueta: "Gastos Extraordinarios y Otros (Extr. and Other Expenses)" },
        { id: "extra-other-pl", etiqueta: "P/L Extraordinario y Otros (Extr. and Other P/L)" },
        { id: "profit-loss-before-taxes", etiqueta: "Ganancia(Pérdida) Antes de Impuestos (Profit(Loss) Before Taxes)" },
        { id: "taxation", etiqueta: "Impuestos (Taxation)" },
        { id: "profit-loss-after-taxes", etiqueta: "Ganancia/Pérdida Neta (NetProfitLoss)" },
        { id: "ebit", etiqueta: "EBIT (EBIT)" },
        { id: "ebitda", etiqueta: "EBITDA (EBITDA)" },
        { id: "profit", etiqueta: "Ganancia (Profit)" },
      ],
    },
    {
      id: "ratios-turquia",
      titulo: "Ratios",
      campos: [
        { id: "liquidity-index", etiqueta: "Indice de Liquidez (Liquidity Index)" },
        { id: "working-capital", etiqueta: "Capital de Trabajo (Working Capital)" },
        { id: "indebtedness-ratio", etiqueta: "Ratio de Endeudamiento (Indebtedness Ratio)" },
        { id: "profitability-ratio-turquia", etiqueta: "Ratio de Rentabilidad (Profitability Ratio)" },
      ],
    },
  ],
};

export function obtenerClaveEstadoFinanciero(tipoEstadoFinanciero?: string) {
  const texto = (tipoEstadoFinanciero ?? "").trim().toLowerCase();
  if (texto.includes("desagregado")) return "desagregado";
  if (texto.includes("totalizado")) return "totalizado";
  if (texto.includes("banco")) return "bancos";
  if (texto.includes("seguro")) return "seguros";
  if (texto.includes("turqu")) return "turquia";
  return "";
}

const aliasCamposEstadoFinanciero: Record<string, Record<string, string>> = {
  totalizado: {
    ingresosOrdinarios: "ingresos-ordinarios-totalizado",
    gananciaNeta: "ganancia-neta-totalizado",
    indiceLiquidez: "liquidity-ratio-totalizado",
    capitalTrabajo: "working-capital-ratio-totalizado",
    ratioEndeudamiento: "current-indebtedness-ratio-totalizado",
    ratioRentabilidad: "profitability-ratio-totalizado",
  },
  bancos: {
    fondosInterbancarios: "fondos-interbancarios-activo",
    inversionesValorRazonable: "inversiones-valor-razonable",
    carteraCreditos: "cartera-creditos",
    derivadosNegociacionActivo: "derivados-negociacion-activo",
    derivadosCoberturaActivo: "derivados-cobertura-activo",
    bienesRealizables: "bienes-realizables",
    participacionesSubsidiarias: "participaciones-subsidiarias",
    inmuebleMobiliarioEquipo: "inmueble-mobiliario-equipo",
    impuestoRentaDiferido: "impuesto-renta-diferido",
    otrosActivos: "otros-activos-bancos",
    totalActivos: "total-activos-bancos",
    obligacionesPublico: "obligaciones-publico",
    fondosInterbancariosPasivo: "fondos-interbancarios-pasivo",
    adeudosFinancieras: "adeudos-financieras",
    derivadosNegociacionPasivo: "derivados-negociacion-pasivo",
    derivadosCoberturaPasivo: "derivados-cobertura-pasivo",
    cuentasPagarProvisiones: "cuentas-pagar-provisiones",
    totalPasivo: "total-pasivo-bancos",
    capitalSocial: "capital-social-bancos",
    reservas: "reservas-bancos",
    resultadosNoRealizados: "resultados-no-realizados",
    resultadoEjercicio: "resultado-ejercicio-bancos",
    totalPatrimonio: "total-patrimonio-bancos",
    totalPasivoPatrimonio: "total-pasivo-patrimonio-bancos",
    ingresosIntereses: "ingresos-intereses-bancos",
    utilidadEjercicio: "utilidad-ejercicio-bancos",
  },
  seguros: {
    efectivoDisponible: "efectivo-disponible",
    inversionesFinancieras: "inversiones-financieras-seguros",
    prestamosInteresesNetos: "prestamos-intereses-netos",
    primasCobrar: "primas-cobrar",
    deudasReaseguradores: "deudas-reaseguradores",
    activosVenta: "activos-venta",
    propiedadesInversion: "propiedades-inversion-seguros",
    propiedadPlantaEquipo: "propiedad-planta-equipo-seguros",
    otrosActivos: "otros-activos-seguros",
    totalActivos: "total-activos-seguros",
    obligacionesAsegurados: "obligaciones-asegurados",
    reservasSiniestros: "reservas-siniestros",
    reservasTecnicas: "reservas-tecnicas",
    obligacionesReaseguradores: "obligaciones-reaseguradores",
    obligacionesFinancieras: "obligaciones-financieras-seguros",
    cuentasPagar: "cuentas-pagar-seguros",
    otrosPasivos: "otros-pasivos-seguros",
    totalPasivo: "total-pasivo-seguros",
    capitalSocial: "capital-social-seguros",
    aportesCapitalNoCapitalizados: "aportes-capital-no-capitalizados",
    resultadosAcumulados: "resultados-acumulados-seguros",
    patrimonioRestringido: "patrimonio-restringido",
    totalPatrimonio: "total-patrimonio-seguros",
    totalPasivoPatrimonio: "total-pasivo-patrimonio-seguros",
    primasGanadasNetas: "primas-ganadas-netas",
    utilidadNeta: "utilidad-neta-seguros",
  },
  turquia: {
    ano: "year",
    fechaBalance: "balance-date",
    idMoneda: "currency",
    duracionPeriodo: "length-period",
    idNivelConfiabilidad: "reliability-level",
    tipoCambio: "exchange-rate",
    efectivo: "cash",
    existencias: "stocks",
    deudores: "creditors",
    totalCorriente: "current-total",
    bienesTongibles: "tangible-assets",
    activosIntangibles: "intangible-assets",
    activoFijoNeto: "net-fixed",
    totalActivos: "total-assets-turquia",
    prestamos: "loans",
    acreedores: "debtors",
    pasivosCorrientes: "current-liabilities",
    pasivosNoCorrientes: "non-current-liabilities",
    pasivosLargoPlazo: "long-term-liabilities",
    totalPasivosNoCorrientes: "total-non-current-liabilities",
    totalPasivos: "total-liabilities",
    patrimonio: "equity",
    totalPatrimonio: "total-equity",
    totalPasivosPatrimonio: "total-liabilities-equity",
    ventasNetas: "turnover",
    costoVentas: "costs-goods-sold",
    costoMateriales: "material-costs",
    gananciaBruta: "gross-profit",
    otrosGastosOperativos: "other-operating-expenses",
    costoEmpleados: "costs-employees",
    depreciacion: "depreciation",
    ingresosFinancieros: "financial-revenue",
    gastosFinancieros: "financial-expenses",
    interesesPagados: "interest-paid",
    plFinanciero: "financial-pl",
    ingresosExtraordinarios: "extra-other-revenue",
    gastosExtraordinarios: "extra-other-expenses",
    plExtraordinario: "extra-other-pl",
    gananciaAntesImpuestos: "profit-loss-before-taxes",
    impuestos: "taxation",
    gananciaNeta: "profit-loss-after-taxes",
    ganancia: "profit",
    indiceLiquidez: "liquidity-index",
    capitalTrabajo: "working-capital",
    ratioEndeudamiento: "indebtedness-ratio",
    ratioRentabilidad: "profitability-ratio-turquia",
  },
};

export function obtenerValorCampoEstadoFinanciero(
  registros: Record<string, string>,
  campoApi: string,
  tipoEstadoFinanciero?: string,
) {
  const claveTipo = obtenerClaveEstadoFinanciero(tipoEstadoFinanciero);
  const alias = aliasCamposEstadoFinanciero[claveTipo]?.[campoApi];
  const claveKebab = campoApi.replace(/[A-Z]/g, (letra) => `-${letra.toLowerCase()}`);
  return registros[campoApi] ?? (alias ? registros[alias] : undefined) ?? registros[claveKebab] ?? "";
}

export function obtenerConfiguracionEstadoFinanciero(tipoEstadoFinanciero?: string) {
  const clave = obtenerClaveEstadoFinanciero(tipoEstadoFinanciero);
  return clave ? configuracionEstadosFinancieros[clave] ?? [] : [];
}

export function obtenerTipoEntradaCampoEstadoFinanciero(campo: CampoEstadoFinancieroAnalista) {
  if (campo.tipoEntrada) return campo.tipoEntrada;

  const textoNormalizado = normalizarTextoEstadoFinanciero(`${campo.id} ${campo.etiqueta}`);

  if (/(^|[\s-])(year|ano)([\s-]|$)/.test(textoNormalizado)) {
    return "entero";
  }

  if (/(balance date|fecha de balance)/.test(textoNormalizado)) {
    return "fecha";
  }

  if (/(currency iso|iso de moneda)/.test(textoNormalizado)) {
    return "selector-moneda-codigo";
  }

  if (/(^|[\s-])(currency|moneda)([\s-]|$)/.test(textoNormalizado)) {
    return "selector-moneda-nombre";
  }

  if (/(length of period|duracion del periodo)/.test(textoNormalizado)) {
    return "entero";
  }

  if (/(reliability level|nivel de confiabilidad)/.test(textoNormalizado)) {
    return "selector-confiabilidad";
  }

  return "numero";
}
