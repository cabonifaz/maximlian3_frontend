export const MasterTableId = {
  TIPO_PERSONA: 1,
  PAIS: 2,
  IDIOMA: 4,
  TIPO_TRAMITE: 6,
  ROLES: 8,
  TIPO_REG_TRIBUTARIO: 9,
  TIPO_FORMATO_INFORME: 11,
  MONEDA: 12,
  TIPO_CONTACTO: 14,
  AREA_TRABAJO: 35,
  ESTADO_CLIENTE: 36,
  PRODUCTO: 37,
  CLASE_INFORME: 37,
  EMPRESA_ATENCION: 38,
  PLANTILLA_INFORME: 39,
  TIPO_DOCUMENTO: 41,
  TIPO_PLAZO_CREDITO: 42,
  PAGINACION_FRACTAL: 99,
} as const;

export type MasterTableId = (typeof MasterTableId)[keyof typeof MasterTableId];

export type MasterTableEntry = {
  idEmpresa: number;
  idMasterTable: number | null;
  idMaster: number;
  descripcion: string;
  num1: number | null;
  num2: number | null;
  num3: number | null;
  string1: string | null;
  string2: string | null;
  string3: string | null;
  date1: string | null;
  date2: string | null;
  date3: string | null;
};

export type MasterTableResponse = MasterTableEntry[];
