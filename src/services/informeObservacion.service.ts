import { ENDPOINTS_INFORME_OBSERVACION } from "@maximilian/shared/constants/endpoints/informe-observacion.endpoint";
import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilianService";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  InformeEditarObservacionRequest,
  InformeEliminarObservacionRequest,
  InformeInsertarObservacionesLoteRequest,
  InformeObservacion,
} from "@maximilian/shared/types/informe.type";

interface InformeObservacionListarParams {
  idPedido: number;
  idInforme?: number;
}

function obtenerRegistro(...valores: unknown[]): Record<string, unknown> {
  for (const v of valores) {
    if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  }
  return {};
}

function obtenerNumero(...valores: unknown[]): number {
  for (const v of valores) {
    if (typeof v === "number" && !isNaN(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
}

function obtenerTexto(...valores: unknown[]): string {
  for (const v of valores) {
    if (typeof v === "string") return v;
  }
  return "";
}

function obtenerBooleano(...valores: unknown[]): boolean {
  for (const v of valores) {
    if (typeof v === "boolean") return v;
  }
  return false;
}

function obtenerLista(...valores: unknown[]): unknown[] {
  for (const v of valores) {
    if (Array.isArray(v)) return v;
  }
  return [];
}

function normalizarObservacionesInforme(resultado: unknown): InformeObservacion[] {
  const registro = obtenerRegistro(resultado);
  const observaciones = Array.isArray(resultado)
    ? resultado
    : obtenerLista(
        registro.observaciones,
        registro.Observaciones,
        registro.lstObservaciones,
        registro.LstObservaciones,
        registro.result,
      );

  return observaciones.map((item) => {
    const observacion = obtenerRegistro(item);
    return {
      idInformeObservacion: obtenerNumero(
        observacion.idInformeObservacion,
        observacion.IdInformeObservacion,
      ),
      observacion: obtenerTexto(observacion.observacion, observacion.Observacion),
      checked: obtenerBooleano(observacion.checked, observacion.Checked),
    };
  });
}

export const servicioInformeObservacion = {
  listar: async (
    parametros: number | InformeObservacionListarParams,
  ): Promise<InformeObservacion[]> => {
    const idPedido =
      typeof parametros === "number" ? parametros : parametros.idPedido;
    const idInforme =
      typeof parametros === "number" ? undefined : parametros.idInforme;
    const ruta = ENDPOINTS_INFORME_OBSERVACION.listar;
    const { data } = await maximilianService.get<ApiResponse<unknown>>(ruta, {
      params: {
        IdPedido: idPedido,
        IdInforme: idInforme && idInforme > 0 ? idInforme : undefined,
      },
    });

    if (!esRespuestaOkCompatibilidad(data, ruta)) {
      throw new ErrorRespuestaApi(data);
    }

    return normalizarObservacionesInforme(data.result);
  },

  insertarLote: async (
    payload: InformeInsertarObservacionesLoteRequest,
  ): Promise<void> => {
    const ruta = ENDPOINTS_INFORME_OBSERVACION.insertarLote;
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ruta, payload);

    if (!esRespuestaOkCompatibilidad(data, ruta)) {
      throw new ErrorRespuestaApi(data);
    }
  },

  editar: async (payload: InformeEditarObservacionRequest): Promise<void> => {
    const ruta = ENDPOINTS_INFORME_OBSERVACION.editar;
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ruta, payload);

    if (!esRespuestaOkCompatibilidad(data, ruta)) {
      throw new ErrorRespuestaApi(data);
    }
  },

  eliminar: async (payload: InformeEliminarObservacionRequest): Promise<void> => {
    const ruta = ENDPOINTS_INFORME_OBSERVACION.eliminar;
    const { data } = await maximilianService.delete<ApiResponse<unknown>>(ruta, { data: payload });

    if (!esRespuestaOkCompatibilidad(data, ruta)) {
      throw new ErrorRespuestaApi(data);
    }
  },
};
