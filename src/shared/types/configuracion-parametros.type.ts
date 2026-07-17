export type ModoFormularioParametro = "crear" | "editar";

export interface FormularioParametro {
  codigo: string;
  referencia: string;
  descripcion: string;
  detalle: string;
  traduccionIngles1: string;
  traduccionIngles2: string;
  traduccionPortugues1: string;
  traduccionPortugues2: string;
}

export interface FilaFormularioParametro {
  modo: ModoFormularioParametro;
  claveRegistro?: string;
  idTablaMaestra?: number;
  valores: FormularioParametro;
}

export interface ConfiguracionCamposParametro {
  etiquetaCodigo?: string;
  codigoRequerido?: boolean;
  etiquetaReferencia?: string;
  referenciaRequerida?: boolean;
  idMaestroReferencia?: number;
  mostrarReferenciaConCodigo?: boolean;
  etiquetaDetalle?: string;
  etiquetaDescripcion?: string;
  codigoDespuesDescripcion?: boolean;
}

export interface ColumnasVisiblesParametro {
  codigo: boolean;
  referencia: boolean;
  detalle: boolean;
  ingles: boolean;
  portugues: boolean;
}
