import maximilianService, { esRespuestaOkCompatibilidad } from "./maximilianService";
import type { ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  InformeEditarObservacionRequest,
  InformeEliminarObservacionRequest,
  InformeInsertarObservacionesLoteRequest,
  InformeObservacion,
} from "@maximilian/shared/types/informe.type";

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
  listar: async (idPedido: number): Promise<InformeObservacion[]> => {
    const ruta = "/api/informeObservacion/listar";
    const { data } = await maximilianService.get<ApiResponse<unknown>>(ruta, {
      params: { IdPedido: idPedido },
    });

    if (!esRespuestaOkCompatibilidad(data, ruta)) {
      throw new Error(data.mensaje || "No se pudieron obtener las observaciones del informe");
    }

    return normalizarObservacionesInforme(data.result);
  },

  insertarLote: async (
    payload: InformeInsertarObservacionesLoteRequest,
  ): Promise<void> => {
    const ruta = "/api/informeObservacion/insertarLote";
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ruta, payload);

    if (!esRespuestaOkCompatibilidad(data, ruta)) {
      throw new Error(data.mensaje || "No se pudieron registrar las observaciones");
    }
  },

  editar: async (payload: InformeEditarObservacionRequest): Promise<void> => {
    const ruta = "/api/informeObservacion/editar";
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ruta, payload);

    if (!esRespuestaOkCompatibilidad(data, ruta)) {
      throw new Error(data.mensaje || "No se pudo editar la observación");
    }
  },

  eliminar: async (payload: InformeEliminarObservacionRequest): Promise<void> => {
    const ruta = "/api/informeObservacion/eliminar";
    const { data } = await maximilianService.post<ApiResponse<unknown>>(ruta, payload);

    if (!esRespuestaOkCompatibilidad(data, ruta)) {
      throw new Error(data.mensaje || "No se pudo eliminar la observación");
    }
  },
};
