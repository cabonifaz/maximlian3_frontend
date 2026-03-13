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

maximilianService.interceptors.request.use(
  async (config) => {
    try {
      const { tokens } = await fetchAuthSession();
      const idToken = tokens?.idToken?.toString();
      const selectedRoleId = sessionStorage.getItem("selected_role_id");

      if (idToken) {
        config.headers.Authorization = `Bearer ${idToken}`;
      }

      if (selectedRoleId) {
        config.headers.idRol = selectedRoleId;
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
    if (
      data &&
      data.idTipoMensaje !== undefined &&
      data.idTipoMensaje !== MessageType.SUCCESS
    ) {
      const fallbackMessage =
        data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION
          ? "La operación no pudo completarse debido a una regla de negocio."
          : "Ha ocurrido un error inesperado en el sistema.";

      toast.error(data.mensaje || fallbackMessage);
    }

    return response;
  },
  (error) => {
    // Handle network or HTTP errors
    const errorMessage = error.response?.data?.mensaje || "Error de conexión con el servidor";
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default maximilianService;
