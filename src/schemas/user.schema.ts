import { z } from "zod";

export const userSchema = z
  .object({
    firstName: z.string().min(1, "El nombre es requerido"),
    paternalLastName: z
      .string()
      .min(1, "El apellido paterno es requerido"),
    maternalLastName: z
      .string()
      .min(1, "El apellido materno es requerido"),
    username: z
      .string()
      .min(
        3,
        "El nombre de usuario debe tener al menos 3 caracteres",
      ),
    email: z.string().email("Email inválido"),
    roles: z
      .array(z.string())
      .min(1, "Debe seleccionar al menos un rol"),
    languages: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.roles.includes("Traductor")) {
        return data.languages && data.languages.length > 0;
      }
      return true;
    },
    {
      message:
        "Debe seleccionar al menos un idioma para el rol de Traductor",
      path: ["languages"],
    },
  );

export type UserFormData = z.infer<typeof userSchema>;
