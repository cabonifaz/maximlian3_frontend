import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";
import { toast } from "sonner";
import { MessageType } from "@maximilian/shared/types/api.type";
import type { ApiResponse } from "@maximilian/shared/types/api.type";

const maximilianService = axios.create({
  baseURL: import.meta.env.VITE_API_URL!,
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

maximilianService.interceptors.request.use(
  async (config) => {
    try {
      const { tokens } = await fetchAuthSession();
      const accessToken = tokens?.accessToken?.toString();
      const selectedRoleId = sessionStorage.getItem("selected_role_id");
      const userSession = sessionStorage.getItem("user_session");
      const session = userSession ? JSON.parse(userSession) : null;

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      if (selectedRoleId) {
        config.headers.idRol = selectedRoleId;
      }

      if (session?.idUsuario) {
        config.headers.idUsuario = session.idUsuario;
      }

      if (session?.idEmpresa) {
        config.headers.idEmpresa = session.idEmpresa;
      }
    } catch (error) {
      console.error("Error fetching Cognito token:", error);
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
      if (data.idTipoMensaje !== MessageType.SUCCESS) {
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
    // Handle network or HTTP errors
    const errorMessage =
      obtenerMensajeAmigableUsuario(error.config?.url) ||
      error.response?.data?.mensaje ||
      "Error de conexión con el servidor";
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default maximilianService;
