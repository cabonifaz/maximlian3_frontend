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
