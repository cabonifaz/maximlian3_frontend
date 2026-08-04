import type {
  DetalleFactura,
  AnularFacturaRequest,
  EntradaFacturaCliente,
  EntradaFacturacion,
  EntradaFacturacionApi,
  EntradaPedidoFacturacionApi,
  EntradaProductoFacturable,
  EntradaProductoFacturableApi,
  GuardarBorradorFacturaRequest,
  GuardarCambiosFacturaRequest,
  IdEstadoFacturacionActualizable,
  ParametrosListaFacturacion,
  ParametrosListaPedidosFacturacion,
  ParametrosListaProductosFacturables,
  ParametrosResumenFacturacion,
  RespuestaListaFacturasCliente,
  RespuestaListaFacturacion,
  RespuestaListaProductosFacturables,
  ResumenFacturacion,
  ResultadoListaFacturacionApi,
  ResultadoListaPedidosFacturacionApi,
  ResultadoListaProductosFacturablesApi,
  ResultadoGuardarBorradorFactura,
  ResultadoObtenerFacturaApi,
} from "@maximilian/shared/types/facturacion.type";
import { ENDPOINTS_FACTURACION } from "@maximilian/shared/constants/endpoints/facturacion.endpoint";
import {
  ErrorRespuestaApi,
  MessageType,
  type ApiResponse,
} from "@maximilian/shared/types/api.type";
import maximilianService from "./maximilian-service";
import {
  formatearFechaDdMmYyyy,
  formatearFechaIsoADdMmYyyy,
} from "@maximilian/shared/utils/fecha.util";
import {
  TablaMaestraId,
  type EntradaTablaMaestra,
} from "@maximilian/shared/types/tabla-maestra.type";
import { servicioCliente } from "./cliente.service";
import { servicioTablaMaestra } from "./tabla-maestra.service";

function mapearFacturacion(
  facturacion: EntradaFacturacionApi,
): EntradaFacturacion {
  const estados = {
    Finalizado: "finalizado",
    Pendiente: "pendiente",
    "En pre-factura": "en-pre-factura",
  } as const;

  return {
    idFacturacion: facturacion.idCliente,
    cliente: facturacion.nombre,
    prefacturable:
      facturacion.emitirPrefactura === null
        ? null
        : facturacion.emitirPrefactura === "Si",
    totalPedidos: facturacion.totalPedidos,
    totalFacturados: facturacion.pedidosFacturados,
    idioma: facturacion.idIdiomaFacturacion,
    estado: estados[facturacion.estadoFacturacion],
  };
}

function mapearPedidoFacturacion(
  pedido: EntradaPedidoFacturacionApi,
): EntradaFacturaCliente {
  const estados = {
    "Listo para facturación": {
      estado: "listo-para-facturacion",
      codigoEstado: 1,
    },
    "En pre-factura": { estado: "en-pre-factura", codigoEstado: 2 },
    "Pre-factura aprobada": {
      estado: "pre-factura-aprobada",
      codigoEstado: 3,
    },
    "Pre-factura rechazada": {
      estado: "pre-factura-rechazada",
      codigoEstado: 4,
    },
    Aprobado: { estado: "aprobado", codigoEstado: 5 },
    Rechazado: { estado: "rechazado", codigoEstado: 6 },
    "Pendiente Anulación": {
      estado: "pendiente-anulacion",
      codigoEstado: 7,
    },
    "Anulación Aprobada": {
      estado: "anulacion-aprobada",
      codigoEstado: 8,
    },
    "Anulación Rechazada": {
      estado: "anulacion-rechazada",
      codigoEstado: 9,
    },
    "Borrador Factura": {
      estado: "borrador-factura",
      codigoEstado: 10,
    },
  } as const;
  const estado = estados[pedido.estadoFacturacion];

  return {
    idFactura: pedido.idPedido,
    codigo: pedido.codigo,
    investigado: pedido.investigado ?? "",
    penalidad: pedido.aplicaPenalidad === "Si",
    codigoEstado: estado.codigoEstado,
    estado: estado.estado,
  };
}


function mapearProductoFacturable(
  pedido: EntradaProductoFacturableApi,
): EntradaProductoFacturable {
  const tipoNormalizado = pedido.tipoTramite
    .trim()
    .toLowerCase()
    .replaceAll(" ", "-");
  const tipo = tipoNormalizado === "express" || tipoNormalizado === "super-flash"
    ? tipoNormalizado
    : "normal";

  return {
    idProductoFacturable: pedido.idPedido,
    codigo: pedido.codigo,
    investigado: pedido.investigado,
    aplicaPenalidad: pedido.aplicaPenalidad === "Si",
    tipo,
    fecha: pedido.fecha,
    penalidad: pedido.penalidad,
    precio: pedido.precio,
    descuentoPorcentaje: pedido.descuentoPorcentaje,
  };
}

function buscarOpcionTablaMaestra(
  opciones: EntradaTablaMaestra[],
  codigo: string,
) {
  const codigoNormalizado = codigo.trim().toLowerCase();

  return opciones.find((opcion) => {
    const etiqueta = [opcion.string1, opcion.string2]
      .filter(Boolean)
      .join(" - ")
      .trim()
      .toLowerCase();

    return opcion.string1?.trim().toLowerCase() === codigoNormalizado
      || opcion.string2?.trim().toLowerCase() === codigoNormalizado
      || etiqueta === codigoNormalizado;
  });
}

function obtenerEtiquetaTablaMaestra(opcion?: EntradaTablaMaestra) {
  return opcion
    ? [opcion.string1, opcion.string2].filter(Boolean).join(" - ")
    : "";
}

function obtenerIdPedidoLinea(
  codigoProducto: string,
  idPedidoCabecera: string,
) {
  const coincidencia = codigoProducto.match(/(d+)$/);
  return Number(coincidencia?.[1] ?? idPedidoCabecera);
}

async function obtenerFacturaRegistrada(
  idPedido: number,
  idCliente: number,
  codigoEstadoFacturacion: number,
): Promise<DetalleFactura> {
  const [{ data }, opcionesPorMaestro] = await Promise.all([
    maximilianService.get<ApiResponse<ResultadoObtenerFacturaApi>>(
      ENDPOINTS_FACTURACION.obtenerFactura(idPedido),
    ),
    servicioTablaMaestra.listarPorIds([
      TablaMaestraId.TIPO_DOCUMENTO_COMPROBANTE,
      TablaMaestraId.TIPO_OPERACION_SUNAT,
      TablaMaestraId.MONEDA_SUNAT,
      TablaMaestraId.FORMA_PAGO_SUNAT,
      TablaMaestraId.AFECTACION_IGV_SUNAT,
      TablaMaestraId.UNIDAD_MEDIDA_SUNAT,
    ]),
  ]);

  if (data.idTipoMensaje !== MessageType.SUCCESS) {
    throw new ErrorRespuestaApi(data);
  }

  const { cabecera, lineas, cuotas } = data.result;
  const opcionTipoDocumento = buscarOpcionTablaMaestra(
    opcionesPorMaestro[TablaMaestraId.TIPO_DOCUMENTO_COMPROBANTE] ?? [],
    cabecera.tipoDocumentoCodigo,
  );
  const opcionTipoOperacion = buscarOpcionTablaMaestra(
    opcionesPorMaestro[TablaMaestraId.TIPO_OPERACION_SUNAT] ?? [],
    cabecera.tipoOperacionCodigo,
  );
  const opcionMoneda = buscarOpcionTablaMaestra(
    opcionesPorMaestro[TablaMaestraId.MONEDA_SUNAT] ?? [],
    cabecera.monedaCodigo,
  );
  const opcionFormaPago = buscarOpcionTablaMaestra(
    opcionesPorMaestro[TablaMaestraId.FORMA_PAGO_SUNAT] ?? [],
    cabecera.formaPagoCodigo,
  );
  const opcionesAfectacionIgv =
    opcionesPorMaestro[TablaMaestraId.AFECTACION_IGV_SUNAT] ?? [];
  const opcionesUnidadMedida =
    opcionesPorMaestro[TablaMaestraId.UNIDAD_MEDIDA_SUNAT] ?? [];

  return {
    idFactura: idPedido,
    codigoEstadoFacturacion,
    idDocumentoElectronico: cabecera.idDocumentoElectronico,
    idCliente,
    idTipoDocumentoMaestro: opcionTipoDocumento?.num1 ?? 0,
    idMonedaMaestro: opcionMoneda?.num1 ?? 0,
    idTipoOperacionMaestro: opcionTipoOperacion?.num1 ?? 0,
    idFormaPago: opcionFormaPago?.num1 ?? 0,
    tipoDocumentoDescripcion:
      obtenerEtiquetaTablaMaestra(opcionTipoDocumento),
    monedaDescripcion: obtenerEtiquetaTablaMaestra(opcionMoneda),
    tipoOperacionDescripcion:
      obtenerEtiquetaTablaMaestra(opcionTipoOperacion),
    formaPagoDescripcion: obtenerEtiquetaTablaMaestra(opcionFormaPago),
    cliente: cabecera.clienteNombre,
    ni: cabecera.clienteNumeroDocumento,
    ordenCompra: cabecera.numeroReferencia ?? "",
    fechaEmision: formatearFechaIsoADdMmYyyy(cabecera.fechaEmision),
    productos: lineas.map((linea) => {
      const subtotal = linea.cantidad * linea.valorUnitario;
      const opcionAfectacionIgv = buscarOpcionTablaMaestra(
        opcionesAfectacionIgv,
        linea.afectacionIgvCodigo,
      );
      const opcionUnidadMedida = buscarOpcionTablaMaestra(
        opcionesUnidadMedida,
        linea.unidadMedidaCodigo,
      );

      return {
        idProductoFactura: linea.idLineaDocumentoElectronico,
        idPedido: obtenerIdPedidoLinea(
          linea.productoCodigo,
          cabecera.idExterno,
        ),
        numeroLinea: linea.numeroLinea,
        idLineaDocumentoElectronico:
          linea.idLineaDocumentoElectronico,
        productoSunatCodigo: linea.productoSunatCodigo,
        idUnidadMedidaMaestro: opcionUnidadMedida?.num1 ?? 0,
        unidadMedidaDescripcion:
          obtenerEtiquetaTablaMaestra(opcionUnidadMedida),
        cantidad: linea.cantidad,
        descripcion: [linea.productoCodigo, linea.descripcion]
          .filter(Boolean)
          .join(" - "),
        descuentoPorcentaje:
          subtotal > 0 ? linea.montoDescuento / subtotal * 100 : 0,
        valorUnitario: linea.valorUnitario,
        precioUnitario: linea.precioUnitario,
        porcentajeIgv: linea.porcentajeIgv,
        idAfectacionIgvMaestro: opcionAfectacionIgv?.num1 ?? 0,
        afectacionIgvDescripcion:
          obtenerEtiquetaTablaMaestra(opcionAfectacionIgv),
        total: linea.totalLinea,
      };
    }),
    cuotas: cuotas.map((cuota) => ({
      idCuotaFactura: cuota.idCuotaDocumentoElectronico,
      idCuotaDocumentoElectronico:
        cuota.idCuotaDocumentoElectronico,
      numeroCuota: cuota.numeroCuota,
      idMoneda: opcionMoneda?.num1 ?? 0,
      monto: cuota.monto,
      vencimiento: cuota.fechaVencimiento,
      estado: "pendiente",
    })),
  };
}

function crearDetalleFactura(
  idCliente: number,
  cliente: string,
  numeroIdentificacion: string,
  factura?: EntradaFacturaCliente | null,
): DetalleFactura {
  return {
    idFactura: factura?.idFactura ?? null,
    codigoEstadoFacturacion: factura?.codigoEstado ?? null,
    idDocumentoElectronico: null,
    idCliente,
    idTipoDocumentoMaestro: 0,
    idMonedaMaestro: 0,
    idTipoOperacionMaestro: 0,
    idFormaPago: 0,
    tipoDocumentoDescripcion: "",
    monedaDescripcion: "",
    tipoOperacionDescripcion: "",
    formaPagoDescripcion: "",
    cliente,
    ni: numeroIdentificacion,
    ordenCompra: "",
    fechaEmision: formatearFechaDdMmYyyy(new Date()),
    productos: [],
    cuotas: [],
  };
}

export const facturacionService = {
  list: async (
    params: ParametrosListaFacturacion,
  ): Promise<RespuestaListaFacturacion> => {
    const { data } = await maximilianService.get<
      ApiResponse<ResultadoListaFacturacionApi>
    >(ENDPOINTS_FACTURACION.listar, {
      params: {
        numPag: params.numPag,
        busqueda: params.busqueda,
        emitirPrefactura: params.emitirPrefactura,
        idIdiomaFacturacion: params.idIdiomaFacturacion,
        estadoFacturacion: params.estadoFacturacion,
      },
    });

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return {
      lstFacturacion: data.result.lstClientes.map(mapearFacturacion),
      totalRegistros: data.result.totalRegistros,
      totalPaginas: data.result.totalPaginas,
    };
  },

  listarFacturasCliente: async (
    params: ParametrosListaPedidosFacturacion,
  ): Promise<RespuestaListaFacturasCliente> => {
    const { data } = await maximilianService.get<
      ApiResponse<ResultadoListaPedidosFacturacionApi>
    >(ENDPOINTS_FACTURACION.listarPedidos, {
      params: {
        idCliente: params.idCliente,
        busqueda: params.busqueda,
        numPag: params.numPag,
      },
    });

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return {
      lstFacturas: data.result.lstPedidos.map(mapearPedidoFacturacion),
      totalRegistros: data.result.totalRegistros,
      totalPaginas: data.result.totalPaginas,
    };
  },

  obtenerDetalleFactura: async (
    idCliente: number,
    cliente: string,
    factura?: EntradaFacturaCliente | null,
  ): Promise<DetalleFactura> => {
    if (factura) {
      return obtenerFacturaRegistrada(
        factura.idFactura,
        idCliente,
        factura.codigoEstado,
      );
    }

    const detalleCliente = await servicioCliente.getById(idCliente);
    return crearDetalleFactura(
      idCliente,
      cliente,
      detalleCliente.numRegistroTributario ?? "",
      factura,
    );
  },

  listarProductosFacturables: async (
    parametros: ParametrosListaProductosFacturables,
  ): Promise<RespuestaListaProductosFacturables> => {
    const { data } = await maximilianService.get<
      ApiResponse<ResultadoListaProductosFacturablesApi>
    >(ENDPOINTS_FACTURACION.listarPedidosFacturables, { params: parametros });

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return {
      productos: data.result.pedidos.map(mapearProductoFacturable),
      totalRegistros: data.result.totalRegistros,
      totalPaginas: data.result.totalPaginas,
    };
  },

  actualizarEstado: async (
    idPedido: number,
    idEstadoFacturacion: IdEstadoFacturacionActualizable,
  ): Promise<unknown> => {
    const { data } = await maximilianService.put<ApiResponse<unknown>>(
      ENDPOINTS_FACTURACION.actualizarEstado(idPedido),
      undefined,
      {
        params: { idEstadoFacturacion },
      },
    );

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return data.result;
  },

  anular: async (payload: AnularFacturaRequest): Promise<unknown> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      ENDPOINTS_FACTURACION.anular,
      payload,
    );

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return data.result;
  },

  obtenerResumen: async (
    parametros: ParametrosResumenFacturacion = {},
    senal?: AbortSignal,
  ): Promise<ResumenFacturacion> => {
    const { data } = await maximilianService.get<
      ApiResponse<ResumenFacturacion>
    >(ENDPOINTS_FACTURACION.resumen, {
      params: parametros,
      signal: senal,
    });

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return data.result;
  },

  guardarCambios: async (
    idDocumentoElectronico: number,
    solicitud: GuardarCambiosFacturaRequest,
  ): Promise<unknown> => {
    const { data } = await maximilianService.put<ApiResponse<unknown>>(
      ENDPOINTS_FACTURACION.guardarCambios(idDocumentoElectronico),
      solicitud,
    );

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return data.result;
  },

  guardarBorrador: async (
    solicitud: GuardarBorradorFacturaRequest,
  ): Promise<number> => {
    const { data } = await maximilianService.post<
      ApiResponse<ResultadoGuardarBorradorFactura>
    >(
      ENDPOINTS_FACTURACION.guardarBorrador,
      solicitud,
    );

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return data.result.idDocumentoElectronico;
  },

  emitir: async (idDocumentoElectronico: number): Promise<unknown> => {
    const { data } = await maximilianService.post<ApiResponse<unknown>>(
      ENDPOINTS_FACTURACION.emitir(idDocumentoElectronico),
    );

    if (data.idTipoMensaje !== MessageType.SUCCESS) {
      throw new ErrorRespuestaApi(data);
    }

    return data.result;
  },
};
