import { z } from "zod";

export const esquemaInicioSesion = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
  recordarme: z.boolean(),
});

export type DatosFormularioInicioSesion = z.infer<typeof esquemaInicioSesion>;

export const esquemaNuevaContrasena = z.object({
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type DatosFormularioNuevaContrasena = z.infer<typeof esquemaNuevaContrasena>;

export const esquemaOlvideContrasena = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
});

export type DatosFormularioOlvideContrasena = z.infer<typeof esquemaOlvideContrasena>;

export const esquemaRestablecerContrasena = z.object({
  code: z.string().min(1, "El código de confirmación es requerido"),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type DatosFormularioRestablecerContrasena = z.infer<typeof esquemaRestablecerContrasena>;


