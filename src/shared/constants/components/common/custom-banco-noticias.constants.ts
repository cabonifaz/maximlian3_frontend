import type { DatosFormularioNoticiaBancoInformacionEntrada } from "@maximilian/schemas/banco-informacion.schema";

export const valoresIniciales: DatosFormularioNoticiaBancoInformacionEntrada = {
  idCompania: 0,
  titulo: "",
  descripcion: "",
  fechaNoticia: new Date().toISOString().slice(0, 10),
  categoria: "",
};
