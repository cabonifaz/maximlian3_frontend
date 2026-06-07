import type {
  DatosInvestigacionAnalista,
  EstadoInvestigacionAnalista,
  IdSeccionInvestigacionAnalista,
  ModoInvestigacionAnalista,
  RegistroBandejaAnalista,
  TarjetaResumenAnalista,
} from "@maximilian/shared/types/investigacion.type";

export const seccionesInvestigacionAnalista: Array<{
  id: IdSeccionInvestigacionAnalista;
  titulo: string;
  indice: number;
}> = [
  { id: "identificacion", titulo: "Identificación", indice: 1 },
  { id: "aspectos-legales", titulo: "Aspectos Legales", indice: 2 },
  { id: "ramo-operaciones", titulo: "Ramo Operaciones", indice: 3 },
  { id: "informacion-financiera", titulo: "Información Financiera", indice: 4 },
  { id: "balances", titulo: "Balances", indice: 5 },
  { id: "bancos-proveedores", titulo: "Bancos-Proveedores", indice: 6 },
  { id: "datos-generales", titulo: "Datos generales", indice: 7 },
  { id: "directorio-ejecutivo", titulo: "Directorio Ejecutivo", indice: 8 },
];

export const tarjetasResumenAnalista: TarjetaResumenAnalista[] = [
  { id: "asignados", titulo: "Asignados", valor: 8, colorIcono: "text-slate-500" },
  { id: "en-proceso", titulo: "En Proceso", valor: 5, colorIcono: "text-blue-500" },
  { id: "aprobado", titulo: "Aprobado", valor: 12, colorIcono: "text-green-500" },
  { id: "rechazado", titulo: "Rechazado", valor: 3, colorIcono: "text-red-500" },
];

export const registrosBandejaAnalista: RegistroBandejaAnalista[] = [
  {
    idInforme: 1,
    idPedido: 82,
    codigo: "#SR-2024-082",
    investigado: "Generation & Power SA",
    pais: "México",
    fecha: "12/05/24",
    tipo: "Normal",
    estado: "asignado",
    accion: "iniciar",
  },
  {
    idInforme: 2,
    idPedido: 42,
    codigo: "#SR-2024-042",
    investigado: "Andina Rental SAC",
    pais: "Colombia",
    fecha: "14/05/24",
    tipo: "Express",
    estado: "en-proceso",
    accion: "continuar",
  },
  {
    idInforme: 3,
    idPedido: 58,
    codigo: "#SR-2024-058",
    investigado: "Grupo R. Valdez",
    pais: "Perú",
    fecha: "15/05/24",
    tipo: "Normal",
    estado: "pendiente-aprobacion",
    accion: "detalle",
  },
  {
    idInforme: 4,
    idPedido: 61,
    codigo: "#SR-2024-061",
    investigado: "Nexa Comercial",
    pais: "Chile",
    fecha: "16/05/24",
    tipo: "Super Flash",
    estado: "aprobado",
    accion: "detalle",
  },
  {
    idInforme: 5,
    idPedido: 89,
    codigo: "#SR-2024-089",
    investigado: "Innova Logistic",
    pais: "México",
    fecha: "17/05/24",
    tipo: "Normal",
    estado: "rechazado",
    accion: "detalle",
  },
];

export function obtenerColorEstadoAnalista(estado: EstadoInvestigacionAnalista) {
  switch (estado) {
    case "asignado":
      return "bg-slate-100 text-slate-500";
    case "en-proceso":
      return "bg-orange-50 text-orange-500";
    case "pendiente-aprobacion":
      return "bg-amber-50 text-amber-600";
    case "aprobado":
      return "bg-green-50 text-green-600";
    case "rechazado":
      return "bg-red-50 text-red-500";
  }
}

export function obtenerTextoEstadoAnalista(estado: EstadoInvestigacionAnalista) {
  switch (estado) {
    case "asignado":
      return "Asignado";
    case "en-proceso":
      return "En Proceso";
    case "pendiente-aprobacion":
      return "Pendiente Aprobación";
    case "aprobado":
      return "Aprobado";
    case "rechazado":
      return "Rechazado";
  }
}

const datosVaciosInvestigacionAnalista: DatosInvestigacionAnalista = {
  resumen: {
    codigo: "#SR-2024-082",
    nombreSolicitado: "Generation & Power SA",
    pais: "México",
    prioridad: "Investigación Normal",
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

const datosEjemploInvestigacionAnalista: DatosInvestigacionAnalista = {
  resumen: {
    codigo: "#SR-2024-082",
    nombreSolicitado: "Generation & Power SA",
    pais: "México",
    prioridad: "Investigación Normal",
    archivos: 1,
    ultimaActualizacion: "Hoy, 10:45 AM",
  },
  identificacion: {
    tipoPersona: "Jurídica",
    nombreEmpresa: "Generation & Power SA",
    nombreComercial: "GBP",
    pais: "México",
    operacionesCambio: "de divisas US Dollar",
    tipoIdentificacionFiscal: "RFC",
    numeroIdentificacionFiscal: "20118201401",
    direccionPrincipal: "De La Masa. Blvd. Emilio Arizpe de la M",
    ciudadEstadoProvincia: "C.P. 25093 Saltillo, Coahuilas",
    numeroTelefono: "(52-844)111.8068/181.1192",
    numeroFax: "",
    correoElectronico: "ventas@generationandpower.com.mx",
    paginaWeb: "http://generationandpower.com.mx",
    estadoActual: "Activo",
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
    monedaTipoCambio: "US Dollar",
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
  companiasRelacionadas: [
    { empresa: "Fibrecon Pacific Marine SAC", idFiscal: "RUC - 20543938554", pais: "Perú" },
    { empresa: "RD Rental S.A.C.", idFiscal: "RUC - 20517668657", pais: "Perú" },
    { empresa: "Juan Valdez SA", idFiscal: "NIT - 13545-89", pais: "Colombia" },
  ],
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
    comprasExtranjeroPorcentaje: "",
    comprasExtranjeroDetalle: "",
    numeroEmpleados: "",
    numeroEmpleadosDetalle: "",
    comentariosOperaciones: "",
  },
  importaciones: [
    {
      anio: "2025",
      mes: "Diciembre",
      moneda: "US Dollar",
      paises: "Sweden, China, Japan, Brazil, India, Estados Unidos, Turkey, Czech Republic, Lithuania, Morocco, Taiwan, Italy, South Korea",
      productos: "Sin datos de productos",
      monto: "4,046,766.00",
      operaciones: "485",
    },
  ],
  exportaciones: [
    {
      anio: "2025",
      mes: "Noviembre",
      moneda: "US Dollar",
      paises: "Ecuador",
      productos: "Sin datos de productos",
      monto: "6,250.00",
      operaciones: "1",
    },
  ],
  locales: [
    {
      tipoLocal: "Sede Principal",
      direccion: "Centro empresarial de Saltillo",
      comentario: "Ubicada en el centro empresarial de Saltillo, cuenta con 3 niveles y depósitos.",
      imagen: "fachada-sede-principal.jpg",
      imagenUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      imagenTipo: "image/jpeg",
      imagenes: [
        {
          nombre: "fachada-sede-principal.jpg",
          url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
          tipo: "image/jpeg",
        },
      ],
    },
  ],
  informacionFinanciera: {
    contenido: "",
    comentariosFinancieros: "",
    activosFijos: "",
    seguros: "",
  },
  balances: [
    {
      codigo: "23120",
      periodo: "2024",
      fecha: "01/01/2024 - 31/12/2024",
      fechaInicio: "01/01/2024",
      fechaFin: "31/12/2024",
      esActual: false,
      tipo: "GN-PG",
      tipoEstadoFinanciero: "Desagregado",
      tipoCambio: "0.00",
      operacionCambio: "US Dollar",
      tipoBalance: "Balance general",
      balanceGeneral: true,
      perdidaGanancia: true,
      cuentas: true,
      detalleCuentas: {
        balanceGeneral: {
          totalCorrientes: "0.00",
          totalNoCorrientes: "0.00",
          otrosActivos: "0.00",
          totalActivos: "0.00",
          totalPasivosCorrientes: "0.00",
          totalPasivosNoCorrientes: "0.00",
          otrosPasivos: "0.00",
          totalPasivos: "0.00",
          patrimonio: "0.00",
          totalPasivoPatrimonio: "0.00",
        },
        estadoGananciasPerdidas: {
          ventasNetas: "0.00",
          utilidadGanancia: "0.00",
        },
        ratios: {
          liquidez: "0.00",
          capitalTrabajo: "0.00",
          endeudamiento: "0.00",
          rentabilidad: "0.00",
        },
      },
    },
  ],
  referencias: {
    comentariosProveedores: "",
    referenciasBancos: "",
    litigios: "",
    riesgoPrincipal: "",
    superintendencia: "",
  },
  proveedores: [
    {
      nombreEmpresa: "Suministros Industriales MX",
      contacto: "Ing. Roberto Gomez",
      tipoProveedor: "Nacional",
      telefono: "+52 55 4123 8890",
      tipoPersona: "Jurídica",
      pais: "México",
      taxIdType: "RFC",
      taxIdNumber: "SIM241200MX1",
      tieneReferenciaComercial: true,
      comienzoNegociaciones: "Desde hace 4 años",
      operacionCambioMoneda: "US Dollar",
      tipoCambio: "0.00",
      limiteCredito: "Sin límite operativo",
      promedioMensual: "",
    },
    {
      nombreEmpresa: "Global Logistics Corp.",
      contacto: "Sarah Jenkins",
      tipoProveedor: "Extranjero",
      telefono: "+1 305 555 0199",
      tipoPersona: "Jurídica",
      pais: "Estados Unidos",
      taxIdType: "Tax ID",
      taxIdNumber: "GLC984320",
      tieneReferenciaComercial: false,
    },
    {
      nombreEmpresa: "Energia y Potencia del Norte",
      contacto: "Lic. Alberto Mayaguila",
      tipoProveedor: "Nacional",
      telefono: "+52 81 8345 6712",
      tipoPersona: "Jurídica",
      pais: "México",
      taxIdType: "RFC",
      taxIdNumber: "EPN102938",
      tieneReferenciaComercial: true,
      comienzoNegociaciones: "Desde hace 2 años",
      operacionCambioMoneda: "Divisa",
      tipoCambio: "$ 0.00",
      limiteCredito: "Sin límite operativo",
      promedioMensual: "",
    },
    {
      nombreEmpresa: "Tech Solutions Ltd.",
      contacto: "David Chen",
      tipoProveedor: "Extranjero",
      telefono: "+44 20 7946 0123",
      tipoPersona: "Jurídica",
      pais: "Reino Unido",
      taxIdType: "Tax ID",
      taxIdNumber: "TSL778812",
      tieneReferenciaComercial: false,
    },
  ],
  bancos: [
    {
      banco: "BBVA México",
      numeroCuenta: "**** **** 4598",
      sector: "Finanzas",
      telefono: "+52 55 2526 2663",
      sectoristaJefeCuenta: "María Gómez",
    },
    {
      banco: "Santander Corp",
      numeroCuenta: "**** **** 8821",
      sector: "Comercio Exterior",
      telefono: "+52 55 5123 0019",
      sectoristaJefeCuenta: "Juan Rivera",
    },
    {
      banco: "HSBC Business",
      numeroCuenta: "**** **** 3341",
      sector: "Energía",
      telefono: "+52 81 1234 5678",
      sectoristaJefeCuenta: "Sandra López",
    },
    {
      banco: "Banorte",
      numeroCuenta: "**** **** 6819",
      sector: "Manufactura",
      telefono: "+52 55 8000 2000",
      sectoristaJefeCuenta: "Carlos Peña",
    },
  ],
  datosGenerales: {
    informacionGeneral: "",
    opinionCredito: "",
  },
  directorioEjecutivo: [
    {
      id: 1,
      ejecutivo: "ALICORP SAN...",
      cargo: "Sharehol...",
      porcentaje: "-",
      lista: true,
      detalleEjecutivo: true,
      orden: "12",
      vinculadoDesde: "",
      companiaAnterior: "",
      esParteDirectorio: true,
      pais: "México",
      tipoPersona: "Jurídica",
      descripcionBusqueda: "ALICORP SAN...",
      nombreCompleto: "ALICORP SAN...",
    },
    {
      id: 2,
      ejecutivo: "REYES, ANDR...",
      cargo: "General ...",
      porcentaje: "-",
      lista: true,
      detalleEjecutivo: false,
      orden: "1",
      vinculadoDesde: "",
      companiaAnterior: "",
      esParteDirectorio: true,
      pais: "México",
      tipoPersona: "Natural",
      descripcionBusqueda: "REYES, ANDR...",
      nombreCompleto: "REYES, ANDR...",
    },
  ],
};

export function obtenerDatosInvestigacionAnalista(modo: ModoInvestigacionAnalista) {
  if (modo === "iniciar") {
    return structuredClone(datosVaciosInvestigacionAnalista);
  }

  return structuredClone(datosEjemploInvestigacionAnalista);
}
