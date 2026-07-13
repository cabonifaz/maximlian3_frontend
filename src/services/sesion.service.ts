import { signOut } from "aws-amplify/auth";
import { clienteConsultas } from "@maximilian/lib/clienteConsultas";

const MENSAJE_SESION_EXPIRADA = "La sesion ha expirado";
const CLAVE_MENSAJE_SESION = "auth_message";

let redireccionEnCurso = false;
let ultimoErrorCargaDinamica: unknown;

window.addEventListener("vite:preloadError", (evento) => {
  ultimoErrorCargaDinamica = (evento as Event & { payload?: unknown }).payload;
});

export function guardarMensajeSesionExpirada() {
  sessionStorage.setItem(CLAVE_MENSAJE_SESION, MENSAJE_SESION_EXPIRADA);
}

export function consumirMensajeSesion() {
  const mensaje = sessionStorage.getItem(CLAVE_MENSAJE_SESION);
  sessionStorage.removeItem(CLAVE_MENSAJE_SESION);
  return mensaje;
}

export function limpiarDatosSesionLocal() {
  clienteConsultas.clear();
  sessionStorage.removeItem("selected_role");
  sessionStorage.removeItem("selected_role_id");
  sessionStorage.removeItem("user_session");
}

export async function cerrarSesionExpirada() {
  if (redireccionEnCurso) return;
  redireccionEnCurso = true;

  guardarMensajeSesionExpirada();

  try {
    await signOut();
  } catch (error) {
    console.error("Error al cerrar sesion expirada:", error);
  } finally {
    limpiarDatosSesionLocal();
    window.location.assign("/iniciar-sesion");
  }
}

export function esErrorCargaDinamica(error: unknown) {
  return ultimoErrorCargaDinamica !== undefined && Object.is(error, ultimoErrorCargaDinamica);
}
