import type { IdSeccionInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";

export const FILAS_POR_PAGINA_INVESTIGACION = 5;

export const ID_ESTADO_PEDIDO_BORRADOR = 3;

export const ID_ESTADO_PEDIDO_FINALIZADO = 5;

export const CAMPOS_MONETARIOS_EXTRACCION = new Set([
  "aspectosLegales.capitalInicial",
  "aspectosLegales.capitalDesembolsado",
  "aspectosLegales.patrimonioNeto",
  "aspectosLegales.valorAcciones",
  "aspectosLegales.tipoCambio",
]);

export const CAMPOS_PORCENTAJE_EXTRACCION = new Set<CampoPorcentajeOperacion>([
  "ventasContadoPorcentaje",
  "ventasCreditoPorcentaje",
  "territorioVentasPorcentaje",
  "ventasExtranjeroPorcentaje",
  "comprasNacionalesPorcentaje",
  "comprasExtranjeroPorcentaje",
  "comprasContadoNacionalesPorcentaje",
  "comprasCreditoNacionalesPorcentaje",
  "comprasContadoInternacionalesPorcentaje",
  "comprasCreditoInternacionalesPorcentaje",
]);

export const CAMPOS_PORCENTAJE_COMPLEMENTARIO: Record<CampoPorcentajeOperacion, CampoPorcentajeOperacion> = {
  ventasContadoPorcentaje: "ventasCreditoPorcentaje",
  ventasCreditoPorcentaje: "ventasContadoPorcentaje",
  territorioVentasPorcentaje: "ventasExtranjeroPorcentaje",
  ventasExtranjeroPorcentaje: "territorioVentasPorcentaje",
  comprasNacionalesPorcentaje: "comprasExtranjeroPorcentaje",
  comprasExtranjeroPorcentaje: "comprasNacionalesPorcentaje",
  comprasContadoNacionalesPorcentaje: "comprasCreditoNacionalesPorcentaje",
  comprasCreditoNacionalesPorcentaje: "comprasContadoNacionalesPorcentaje",
  comprasContadoInternacionalesPorcentaje: "comprasCreditoInternacionalesPorcentaje",
  comprasCreditoInternacionalesPorcentaje: "comprasContadoInternacionalesPorcentaje",
};

export const ETIQUETAS_SECCIONES_EXTRACCION: Record<string, string> = {
  identificacion: "Identificación",
  legales: "Aspectos Legales",
  aspectosLegales: "Aspectos Legales",
  companiasRelacionadas: "Compañías Relacionadas",
  operacionPrincipal: "Ramo Operaciones",
  ramoOperaciones: "Ramo Operaciones",
  importaciones: "Importaciones",
  exportaciones: "Exportaciones",
  locales: "Locales",
  informacionFinanciera: "Información Financiera",
  balances: "Balances",
  referencias: "Referencias",
  proveedores: "Proveedores",
  bancos: "Bancos",
  datosGenerales: "Datos Generales",
  directorioEjecutivo: "Directorio Ejecutivo",
};

export const CONFIGURACION_EXTRACCION_POR_SECCION: Record<IdSeccionInvestigacionAnalista, Record<string, string[]>> = {
  identificacion: {
    identificacion: [
      "tipoPersona",
      "nombreEmpresa",
      "nombreComercial",
      "pais",
      "operacionesCambio",
      "tipoIdentificacionFiscal",
      "numeroIdentificacionFiscal",
      "direccionPrincipal",
      "ciudadEstadoProvincia",
      "numeroTelefono",
      "numeroFax",
      "correoElectronico",
      "paginaWeb",
      "estadoActual",
      "datosAdicionales",
    ],
  },
  "aspectos-legales": {
    legales: [
      "antecedentes",
      "aspectosLegales",
      "capitalDesembolsado",
      "capitalInicial",
      "ciudadRegistro",
      "comentariosEmpresasRelacionadas",
      "condiciones",
      "fechaConstitucion",
      "monedaTipoCambio",
      "notaria",
      "notario",
      "obligacionBolsa",
      "operacionesCambioDivisas",
      "patrimonioNeto",
      "registro",
      "tipoAcciones",
      "tipoCambio",
      "tipoEmpresa",
      "ultimaAmpliacion",
      "valorAcciones",
      "companiasRelacionadas",
    ],
  },
  "ramo-operaciones": {
    ramoOperaciones: [
      "actividad",
      "actividadPrincipal",
      "categoriaCiiu",
      "claseCiiu",
      "comentariosOperaciones",
      "comprasContadoInternacionalesDetalle",
      "comprasContadoInternacionalesPorcentaje",
      "comprasCreditoInternacionalesDetalle",
      "comprasCreditoInternacionalesPorcentaje",
      "comprasExtranjeroDetalles",
      "comprasExtranjeroPorcentaje",
      "comprasContadoNacionalesDetalle",
      "comprasContadoNacionalesPorcentaje",
      "comprasCreditoNacionalesDetalle",
      "comprasCreditoNacionalesPorcentaje",
      "comprasNacionalesDetalles",
      "comprasNacionalesPorcentaje",
      "direccion",
      "exportaciones",
      "importaciones",
      "locales",
      "numeroEmpleados",
      "numeroEmpleadosDetalle",
      "sector",
      "ventasContadoDetalle",
      "ventasContadoPorcentaje",
      "ventasCreditoDetalle",
      "ventasCreditoPorcentaje",
      "ventasNacionalesDetalle",
      "ventasNacionalesPorcentaje",
      "ventasExtranjeroDetalle",
      "ventasExtranjeroPorcentaje",
    ],
  },
  "informacion-financiera": {
    informacionFinanciera: ["contenido", "comentariosFinancieros", "activosFijos", "seguros"],
  },
  balances: {},
  "bancos-proveedores": {
    bancosProveedores: [
      "comentariosProveedores",
      "referenciasBancos",
      "litigios",
      "riesgoPrincipal",
      "superintendencia",
      "proveedores",
      "bancos",
    ],
  },
  "datos-generales": {
    datosGenerales: ["informacionGeneral", "opinionCredito"],
  },
  "directorio-ejecutivo": {
    directorioEjecutivo: [
      "ejecutivo",
      "cargoEjecutivo",
      "vinculadoDesde",
      "companiaAnterior",
      "participacion",
      "formaParteDirectorioEjecutivo",
      "figuraListadoEjecutivos",
      "existenDetallesEjecutivo",
    ],
  },
};

export const SECCIONES_LISTA_EXTRACCION = new Set([
  "companiasRelacionadas",
  "importaciones",
  "exportaciones",
  "locales",
  "proveedores",
  "bancos",
]);

export const ETIQUETAS_CAMPOS_EXTRACCION: Record<string, string> = {
  porcentaje: "Porcentaje de participacion",
  esParteDirectorio: "¿Forma parte del directorio Ejecutivo?",
  lista: "¿Figura en el listado de ejecutivos?",
  detalleEjecutivo: "¿Se tiene los detalles del Ejecutivo?",
};

export type CampoPorcentajeOperacion =
  | "ventasContadoPorcentaje"
  | "ventasCreditoPorcentaje"
  | "territorioVentasPorcentaje"
  | "ventasExtranjeroPorcentaje"
  | "comprasNacionalesPorcentaje"
  | "comprasExtranjeroPorcentaje"
  | "comprasContadoNacionalesPorcentaje"
  | "comprasCreditoNacionalesPorcentaje"
  | "comprasContadoInternacionalesPorcentaje"
  | "comprasCreditoInternacionalesPorcentaje";
