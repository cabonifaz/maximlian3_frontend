import type { UserSession } from "@maximilian/shared/types/autenticacion.type";

export function obtenerRutaPorRol(rol?: string | null) {
  const rolNormalizado = rol?.toUpperCase();

  if (rolNormalizado === "ADMINISTRADOR") return "/administrador";
  if (rolNormalizado === "ANALISTA") return "/analista";
  if (rolNormalizado === "TRADUCTOR") return "/traductor";
  if (rolNormalizado === "COORDINADOR") return "/coordinador";
  if (rolNormalizado === "GERENTE") return "/gerente";

  return "/seleccionar-rol";
}

export function obtenerSesionUsuarioGuardada() {
  const sesionGuardada = sessionStorage.getItem("user_session");

  if (!sesionGuardada) {
    return null;
  }

  try {
    return JSON.parse(sesionGuardada) as UserSession;
  } catch {
    return null;
  }
}

export function limpiarSesionLocal() {
  sessionStorage.removeItem("selected_role");
  sessionStorage.removeItem("selected_role_id");
  sessionStorage.removeItem("user_session");
}

export function obtenerInicialesUsuario(nombre: string) {
  return nombre
    .split(" ")
    .map((parteNombre) => parteNombre[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}
