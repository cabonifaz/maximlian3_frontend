import { z } from "zod";

export const userSchema = z
  .object({
    firstName: z.string().min(1, "El nombre es requerido"),
    paternalLastName: z
      .string()
      .min(1, "El apellido paterno es requerido"),
    maternalLastName: z.string().optional(),
    username: z
      .string()
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    roles: z
      .array(z.union([z.string(), z.number()]))
      .min(1, "Debe seleccionar al menos un rol"),
    languages: z.array(z.union([z.string(), z.number()])).optional(),
  })
  .refine(
    (data) => {
      // Check for Traductor by string (case-insensitive) or ID 4
      const isTraductor = data.roles.some((role) => {
        if (typeof role === "string") {
          return role.toUpperCase() === "TRADUCTOR";
        }
        return role === 4;
      });

      if (isTraductor) {
        return Array.isArray(data.languages) && data.languages.length > 0;
      }
      return true;
    },
    {
      message: "Debe seleccionar al menos un idioma para el rol de Traductor",
      path: ["languages"],
    },
  );

export type UserFormData = z.infer<typeof userSchema>;
