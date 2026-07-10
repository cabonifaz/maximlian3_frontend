import type {
  DatosInvestigacionAnalista,
  EstadoInvestigacionAnalista,
  IdSeccionInvestigacionAnalista,
} from "@maximilian/shared/types/investigacion.type";

export const seccionesInvestigacionAnalista: Array<{
  id: IdSeccionInvestigacionAnalista;
  titulo: string;
  indice: number;
}> = [
  { id: "identificacion", titulo: "Identificacion", indice: 1 },
  { id: "aspectos-legales", titulo: "Aspectos Legales", indice: 2 },
  { id: "ramo-operaciones", titulo: "Ramo Operaciones", indice: 3 },
  { id: "informacion-financiera", titulo: "Informacion Financiera", indice: 4 },
  { id: "balances", titulo: "Balances", indice: 5 },
  { id: "bancos-proveedores", titulo: "Bancos-Proveedores", indice: 6 },
  { id: "datos-generales", titulo: "Datos generales", indice: 7 },
  { id: "directorio-ejecutivo", titulo: "Directorio Ejecutivo", indice: 8 },
];

export function obtenerColorEstadoAnalista(estado: EstadoInvestigacionAnalista) {
  switch (estado) {
    case "asignado":
      return "bg-slate-100 text-slate-500";
    case "en-proceso":
      return "bg-blue-50 text-blue-600";
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
      return "Pendiente Aprobacion";
    case "aprobado":
      return "Aprobado";
    case "rechazado":
      return "Rechazado";
  }
}

export function crearDatosInvestigacionVacios(): DatosInvestigacionAnalista {
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
