import { z } from "zod";

const selectorRequerido = (mensaje: string) => z.number().int().positive(mensaje);

export const esquemaAltaMigracionInforme = z.object({
  idPlantilla: selectorRequerido("La plantilla es requerida"),
  idIdiomaOrigen: selectorRequerido("El idioma de origen es requerido"),
  idIdiomaDestino: z.number().int().positive().optional(),
  idFormatoFecha: selectorRequerido("El formato de fecha es requerido"),
});

export const esquemaLoteMigracionInforme = esquemaAltaMigracionInforme.extend({
  nombre: z.string().trim().min(1, "El nombre del lote es requerido").max(120),
  archivos: z
    .array(z.instanceof(File))
    .min(1, "Seleccione al menos un documento")
    .max(100, "Puede cargar como máximo 100 documentos por lote")
    .refine(
      (archivos) => archivos.every((archivo) =>
        archivo.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        || archivo.name.toLowerCase().endsWith(".docx")),
      "Solo se permiten documentos DOCX",
    ),
}).superRefine((datos, contexto) => {
  if (datos.idIdiomaDestino && datos.idIdiomaDestino === datos.idIdiomaOrigen) {
    contexto.addIssue({
      code: "custom",
      path: ["idIdiomaDestino"],
      message: "El idioma de destino debe ser diferente al idioma de origen",
    });
  }
});

export type DatosAltaMigracionInforme = z.infer<typeof esquemaAltaMigracionInforme>;
export type DatosLoteMigracionInforme = z.infer<typeof esquemaLoteMigracionInforme>;
