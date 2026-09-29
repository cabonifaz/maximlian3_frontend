import { z } from "zod";

export function crearEsquemaIrAPagina(totalPaginas: number) {
  return z.object({
    paginaDestino: z
      .string()
      .trim()
      .regex(/^\d+$/, "Ingresa un número de página")
      .refine(
        (valor) => Number(valor) >= 1 && Number(valor) <= totalPaginas,
        `Ingresa una página entre 1 y ${totalPaginas}`,
      ),
  });
}

export type DatosFormularioIrAPagina = z.infer<
  ReturnType<typeof crearEsquemaIrAPagina>
>;
