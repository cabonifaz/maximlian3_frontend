import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";
import { toast } from "sonner";
import { MessageType } from "@maximilian/shared/types/api.type";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { cerrarSesionExpirada } from "./sesion.service";

const maximilianService = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://maximilianbackendpreprod-f9haawdbdna5h9gx.canadacentral-01.azurewebsites.net",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

function obtenerMensajeAmigableUsuario(url?: string) {
  if (!url) return null;
  if (url.includes("/api/Usuario/obtener")) {
    return "No se pudo cargar la información del usuario. Intenta nuevamente.";
  }
  if (url.includes("/api/Usuario/editar")) {
    return "No se pudieron guardar los cambios del usuario. Revisa los datos e intenta nuevamente.";
  }
  return null;
}

function esRespuestaOkCompatibilidad(data: ApiResponse<unknown>, url?: string) {
  if (data.idTipoMensaje === MessageType.SUCCESS) return true;
  if (!url) return false;

  const esEndpointAsignacion =
    url.includes("/api/Asignacion/bandeja")
    || url.includes("/api/Asignacion/listar");
  const esEndpointInformeGuardar =
    url.includes("/api/Informe/crear")
    || url.includes("/api/Informe/editar");

  if (esEndpointAsignacion && data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION && data.mensaje === "OK") {
    return true;
  }

  if (esEndpointInformeGuardar && data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION) {
    return data.mensaje === "Informe registrado correctamente." || data.mensaje === "Informe actualizado correctamente.";
  }

  return false;
}

export { esRespuestaOkCompatibilidad };

maximilianService.interceptors.request.use(
  async (config) => {
    try {
      const { tokens } = await fetchAuthSession();
      const tokenAcceso = tokens?.accessToken?.toString();
      const idRolSeleccionado = sessionStorage.getItem("selected_role_id");
      const sesionUsuario = sessionStorage.getItem("user_session");
      const session = sesionUsuario ? JSON.parse(sesionUsuario) : null;

      if (tokenAcceso) {
        config.headers.Authorization = `Bearer ${tokenAcceso}`;
      }

      if (idRolSeleccionado) {
        config.headers.idRol = idRolSeleccionado;
      }

      if (session?.idUsuario) {
        config.headers.idUsuario = session.idUsuario;
      }

      if (session?.idEmpresa) {
        config.headers.idEmpresa = session.idEmpresa;
      }
    } catch (error) {
      console.error("Error fetching Cognito token:", error);
      void cerrarSesionExpirada();
      return Promise.reject(error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Global response interceptor for snackbar notifications
maximilianService.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse<unknown>;

    // If it's a standard API response with idTipoMensaje
    if (data && data.idTipoMensaje !== undefined) {
      if (!esRespuestaOkCompatibilidad(data, response.config.url)) {
        const fallbackMessage =
          data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION
            ? "La operación no pudo completarse debido a una regla de negocio."
            : "Ha ocurrido un error inesperado en el sistema.";

        const mensajeAmigable = obtenerMensajeAmigableUsuario(response.config.url);
        toast.error(mensajeAmigable || data.mensaje || fallbackMessage);
      } else if (response.config.method !== "get") {
        toast.success(data.mensaje);
      }
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      void cerrarSesionExpirada();
      return Promise.reject(error);
    }

    // Handle network or HTTP errors
    const errorMessage =
      obtenerMensajeAmigableUsuario(error.config?.url) ||
      error.response?.data?.mensaje ||
      "Error de conexión con el servidor";
    toast.error(errorMessage);
    return Promise.reject(error);
  },
);

export default maximilianService;
