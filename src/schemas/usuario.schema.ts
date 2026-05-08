import { z } from "zod";

export const esquemaUsuario = z
  .object({
    nombres: z.string().min(1, "El nombre es requerido"),
    apellidoPaterno: z.string().min(1, "El apellido paterno es requerido"),
    apellidoMaterno: z.string().optional(),
    usuarioCreacion: z
      .string()
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
    correo: z.string().email("Correo inválido"),
    roles: z
      .array(z.union([z.string(), z.number()]))
      .min(1, "Debe seleccionar al menos un rol"),
    idiomas: z.array(z.union([z.string(), z.number()])).optional(),
    activo: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Check for Traductor by string (case-insensitive) or ID 3
      const isTraductor = data.roles.some((role) => {
        if (typeof role === "string") {
          return role.toUpperCase() === "TRADUCTOR";
        }
        return role === 3;
      });

      if (isTraductor) {
        return Array.isArray(data.idiomas) && data.idiomas.length > 0;
      }
      return true;
    },
    {
      message: "Debe seleccionar al menos un idioma para el rol de Traductor",
      path: ["idiomas"],
    },
  );

export type DatosFormularioUsuario = z.infer<typeof esquemaUsuario>;
