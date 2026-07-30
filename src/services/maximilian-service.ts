import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";
import { toast } from "sonner";
import { MessageType } from "@maximilian/shared/types/api.type";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import { cerrarSesionExpirada } from "./sesion.service";
import type {
  AxiosError,
  CancelTokenSource,
  InternalAxiosRequestConfig,
} from "axios";
import { ENDPOINTS_ASIGNACION } from "@maximilian/shared/constants/endpoints/asignacion.endpoint";
import { ENDPOINTS_BANCO } from "@maximilian/shared/constants/endpoints/banco.endpoint";
import { ENDPOINTS_COMPANIA } from "@maximilian/shared/constants/endpoints/compania.endpoint";
import { ENDPOINTS_COMPANIA_NOTICIA } from "@maximilian/shared/constants/endpoints/compania-noticia.endpoint";
import { ENDPOINTS_COMPANIA_NOTICIA_BALANCE } from "@maximilian/shared/constants/endpoints/compania-noticia-balance.endpoint";
import { ENDPOINTS_COMPANIA_NOTICIA_DETALLE } from "@maximilian/shared/constants/endpoints/compania-noticia-detalle.endpoint";
import { ENDPOINTS_DIRECTORIO_EJECUTIVO } from "@maximilian/shared/constants/endpoints/directorio-ejecutivo.endpoint";
import { ENDPOINTS_INFORME } from "@maximilian/shared/constants/endpoints/informe.endpoint";

type ConfiguracionAutenticada = InternalAxiosRequestConfig & {
  fuenteCancelacionCambioRol?: CancelTokenSource;
  reintentoAutenticacion?: boolean;
};

const fuentesSolicitudesPendientes = new Set<CancelTokenSource>();
let cambioRolEnCurso = false;

const maximilianService = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://maximilianbackendpreprod-f9haawdbdna5h9gx.canadacentral-01.azurewebsites.net",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

function retirarSolicitudPendiente(config?: ConfiguracionAutenticada) {
  if (config?.fuenteCancelacionCambioRol) {
    fuentesSolicitudesPendientes.delete(config.fuenteCancelacionCambioRol);
  }
}

export function iniciarTransicionSolicitudesPorCambioRol() {
  cambioRolEnCurso = true;
  fuentesSolicitudesPendientes.forEach((fuente) => {
    fuente.cancel("Solicitud cancelada por cambio de rol");
  });
  fuentesSolicitudesPendientes.clear();
}

export function finalizarTransicionSolicitudesPorCambioRol() {
  cambioRolEnCurso = false;
}

function esRespuestaOkCompatibilidad(data: ApiResponse<unknown>, url?: string) {
  if (data.idTipoMensaje === MessageType.SUCCESS) return true;
  if (!url) return false;

  const esEndpointAsignacion =
    url.includes(ENDPOINTS_ASIGNACION.bandeja)
    || url.includes(ENDPOINTS_ASIGNACION.listar);
  const esEndpointInformeGuardar =
    url.includes(ENDPOINTS_INFORME.crear)
    || url.includes(ENDPOINTS_INFORME.editar);
  const esEndpointInformeObtener = url.includes(ENDPOINTS_INFORME.obtener);
  const esEndpointInformeExtraccion =
    url.includes(ENDPOINTS_INFORME.obtenerUrlPrefirmada)
    || url.includes(ENDPOINTS_INFORME.autocompletar)
    || url.includes(ENDPOINTS_INFORME.extraerDocumento)
    || url.includes(ENDPOINTS_INFORME.traducir);
  const esEndpointDirectorioEjecutivo = url.includes(ENDPOINTS_DIRECTORIO_EJECUTIVO.base);
  const esEndpointBanco = url.includes(ENDPOINTS_BANCO.base);
  const esEndpointCompania = url.includes(ENDPOINTS_COMPANIA.base);
  const esEndpointCompaniaNoticia = url.includes(ENDPOINTS_COMPANIA_NOTICIA.base);
  const esEndpointCompaniaNoticiaBalance = url.includes(ENDPOINTS_COMPANIA_NOTICIA_BALANCE.base);
  const esEndpointCompaniaNoticiaDetalle = url.includes(ENDPOINTS_COMPANIA_NOTICIA_DETALLE.base);

  if (esEndpointAsignacion && data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION && data.mensaje === "OK") {
    return true;
  }

  if (esEndpointInformeGuardar && data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION) {
    return data.mensaje === "Informe registrado correctamente." || data.mensaje === "Informe actualizado correctamente.";
  }

  if (esEndpointInformeObtener && data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION) {
    return data.mensaje === "OK" && Boolean(data.result);
  }

  if (esEndpointInformeExtraccion && data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION) {
    return Boolean(data.result);
  }

  if (esEndpointDirectorioEjecutivo && data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION) {
    return data.mensaje === "OK" || Boolean(data.result);
  }

  if (esEndpointBanco && data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION) {
    return data.mensaje === "OK" || Boolean(data.result);
  }

  if (esEndpointCompania && data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION) {
    return data.mensaje === "OK" || Boolean(data.result);
  }

  if (esEndpointCompaniaNoticia && data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION) {
    return data.mensaje === "OK" || Boolean(data.result);
  }

  if (esEndpointCompaniaNoticiaBalance && data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION) {
    return data.mensaje === "OK" || Boolean(data.result);
  }

  if (esEndpointCompaniaNoticiaDetalle && data.idTipoMensaje === MessageType.BUSINESS_RULE_VIOLATION) {
    return data.mensaje === "OK" || Boolean(data.result);
  }

  return false;
}

export { esRespuestaOkCompatibilidad };

async function aplicarEncabezadosAutenticacion(
  config: InternalAxiosRequestConfig,
  forzarRefresco = false,
) {
  const idRolSeleccionado = sessionStorage.getItem("selected_role_id");
  const sesionUsuario = sessionStorage.getItem("user_session");
  const sesion = sesionUsuario ? JSON.parse(sesionUsuario) : null;
  const { tokens } = await fetchAuthSession({ forceRefresh: forzarRefresco });
  const tokenAcceso = tokens?.accessToken?.toString();

  if (tokenAcceso) {
    config.headers.Authorization = `Bearer ${tokenAcceso}`;
  }

  if (idRolSeleccionado) {
    config.headers.idRol = idRolSeleccionado;
  }

  if (sesion?.idUsuario) {
    config.headers.idUsuario = sesion.idUsuario;
  }

  if (sesion?.idEmpresa) {
    config.headers.idEmpresa = sesion.idEmpresa;
  }

  return config;
}

maximilianService.interceptors.request.use(
  async (config) => {
    if (cambioRolEnCurso) {
      return Promise.reject(
        new axios.CanceledError("Solicitud cancelada durante el cambio de rol"),
      );
    }

    const configAutenticada = config as ConfiguracionAutenticada;
    const fuenteCancelacionCambioRol = axios.CancelToken.source();
    configAutenticada.cancelToken = fuenteCancelacionCambioRol.token;
    configAutenticada.fuenteCancelacionCambioRol = fuenteCancelacionCambioRol;
    fuentesSolicitudesPendientes.add(fuenteCancelacionCambioRol);

    try {
      await aplicarEncabezadosAutenticacion(configAutenticada);
    } catch (error) {
      retirarSolicitudPendiente(configAutenticada);
      console.error("Error fetching Cognito token:", error);
      void cerrarSesionExpirada();
      return Promise.reject(error);
    }
    return configAutenticada;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Global response interceptor for snackbar notifications
maximilianService.interceptors.response.use(
  (response) => {
    retirarSolicitudPendiente(response.config as ConfiguracionAutenticada);
    const data = response.data as ApiResponse<unknown>;

    // If it's a standard API response with idTipoMensaje
    if (data && data.idTipoMensaje !== undefined) {
      if (!esRespuestaOkCompatibilidad(data, response.config.url)) {
        if (data.mensaje) {
          toast.error(data.mensaje);
        }
      } else if (
        response.config.method !== "get"
        && !response.config.url?.includes(ENDPOINTS_INFORME.obtenerUrlPrefirmada)
        && !response.config.url?.includes(ENDPOINTS_INFORME.autocompletar)
        && !response.config.url?.includes(ENDPOINTS_INFORME.extraerDocumento)
        && !response.config.url?.includes(ENDPOINTS_INFORME.traducir)
      ) {
        if (data.mensaje) {
          toast.success(data.mensaje);
        }
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const configOriginal = error.config as ConfiguracionAutenticada | undefined;
    retirarSolicitudPendiente(configOriginal);

    if (
      error.response?.status === 401
      && configOriginal
      && !configOriginal.reintentoAutenticacion
    ) {
      configOriginal.reintentoAutenticacion = true;

      try {
        await aplicarEncabezadosAutenticacion(configOriginal, true);
        return maximilianService(configOriginal);
      } catch (errorRefresco) {
        console.error("Error refreshing Cognito token:", errorRefresco);
        void cerrarSesionExpirada();
        return Promise.reject(errorRefresco);
      }
    }

    if (error.response?.status === 401) {
      void cerrarSesionExpirada();
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      const data = error.response.data as Partial<ApiResponse<unknown>> | undefined;
      if (data?.mensaje) {
        toast.error(data.mensaje);
      }
      return Promise.reject(error);
    }

    const mensaje = (error.response?.data as Partial<ApiResponse<unknown>> | undefined)?.mensaje;
    if (mensaje) {
      toast.error(mensaje);
    }
    return Promise.reject(error);
  },
);

export default maximilianService;
