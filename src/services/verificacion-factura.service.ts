import axios from "axios";
import { ENDPOINTS_VERIFICACION_FACTURA } from "@maximilian/shared/constants/endpoints/verificacion-factura.endpoint";
import {
  ErrorRespuestaApi,
  MessageType,
  type ApiResponse,
} from "@maximilian/shared/types/api.type";
import type {
  FormatoDescargaFactura,
  PedidoRelacionadoFacturaApi,
  ResultadoPedidosRelacionadosFacturaApi,
} from "@maximilian/shared/types/facturacion.type";
import type { ResultadoVerificacionFacturaApi } from "@maximilian/shared/types/verificacion-factura.type";
import {
  obtenerRegistro,
  obtenerTexto,
} from "@maximilian/shared/utils/normalizacion-respuesta.util";

const TIPO_ARCHIVO_DESCARGA_FACTURA: Record<FormatoDescargaFactura, "Pdf" | "Xml"> = {
  pdf: "Pdf",
  xml: "Xml",
};

const clienteVerificacionFactura = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL
    || "https://maximilianbackendpreprod-f9haawdbdna5h9gx.canadacentral-01.azurewebsites.net",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const verificacionFacturaService = {
  obtenerFactura: async (
    token: string,
  ): Promise<ResultadoVerificacionFacturaApi> => {
    const { data } = await clienteVerificacionFactura.get<
      ApiResponse<ResultadoVerificacionFacturaApi>
    >(ENDPOINTS_VERIFICACION_FACTURA.obtenerFactura(token));

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return data.result;
  },

  obtenerUrlDescarga: async (
    token: string,
    formato: FormatoDescargaFactura,
  ): Promise<string> => {
    const { data } = await clienteVerificacionFactura.get<ApiResponse<unknown>>(
      ENDPOINTS_VERIFICACION_FACTURA.obtenerUrlDescarga(token),
      { params: { tipoArchivo: TIPO_ARCHIVO_DESCARGA_FACTURA[formato] } },
    );

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    const registro = obtenerRegistro(data.result);
    const urlDescarga = obtenerTexto(
      typeof data.result === "string" ? data.result : undefined,
      registro.downloadUrl,
      registro.DownloadUrl,
      registro.url,
      registro.Url,
    );

    if (!urlDescarga) throw new Error("La respuesta de descarga es invalida");

    return urlDescarga;
  },

  obtenerPedidosRelacionados: async (
    token: string,
  ): Promise<PedidoRelacionadoFacturaApi[]> => {
    const { data } = await clienteVerificacionFactura.get<
      ApiResponse<ResultadoPedidosRelacionadosFacturaApi>
    >(ENDPOINTS_VERIFICACION_FACTURA.obtenerPedidosRelacionados(token));

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return data.result.pedidos;
  },
};
