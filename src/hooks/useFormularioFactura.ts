import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  esquemaFormularioFactura,
  type DatosFormularioAnulacionFactura,
  type DatosFormularioFactura,
} from "@maximilian/schemas";
import { facturacionService } from "@maximilian/services/facturacion.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type {
  DetalleFactura,
  EntradaCuotaFactura,
  EntradaProductoFacturable,
  EntradaProductoFactura,
} from "@maximilian/shared/types/facturacion.type";
import {
  calcularPrecioUnitarioFactura,
  concatenarCodigosOrdenCompra,
  construirPayloadGuardarBorradorFactura,
  construirPayloadGuardarCambiosFactura,
  limitarOrdenCompra,
} from "@maximilian/shared/utils/facturacion.util";
import { formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import {
  obtenerEtiquetaPrincipalSecundaria,
  obtenerSimboloTablaMaestra,
} from "@maximilian/shared/utils/tabla-maestra.util";
import {
  DESCRIPCION_UNIDAD_MEDIDA_PREDETERMINADA,
  ID_AFECTACION_IGV_EXTRANJERO,
  ID_AFECTACION_IGV_PERU,
  ID_FORMA_PAGO_CONTADO,
  ID_TIPO_COMPROBANTE_BOLETA,
  ID_TIPO_DOCUMENTO_SUNAT_RUC,
  ID_TIPO_OPERACION_SUNAT_EXPORTACION_SERVICIOS,
  ID_UNIDAD_MEDIDA_PREDETERMINADA,
  IDS_AFECTACION_IGV_DISPONIBLES,
  IDS_TIPO_COMPROBANTE_CLIENTE_RUC,
  PORCENTAJE_IGV_PREDETERMINADO,
} from "@maximilian/shared/constants/components/coordinador/facturacion.constants";

function obtenerDescuentosIniciales(factura: DetalleFactura | null) {
  return Object.fromEntries(
    (factura?.productos ?? []).map((producto) => [
      String(producto.idProductoFactura),
      producto.descuentoPorcentaje,
    ]),
  );
}

function obtenerPorcentajesIgvIniciales(factura: DetalleFactura | null) {
  return Object.fromEntries(
    (factura?.productos ?? []).map((producto) => [
      String(producto.idProductoFactura),
      producto.porcentajeIgv,
    ]),
  );
}

function obtenerAfectacionesIgvIniciales(factura: DetalleFactura | null) {
  return Object.fromEntries(
    (factura?.productos ?? []).map((producto) => [
      String(producto.idProductoFactura),
      Number(producto.idAfectacionIgvMaestro) || 0,
    ]),
  );
}

function obtenerUnidadesMedidaIniciales(factura: DetalleFactura | null) {
  return Object.fromEntries(
    (factura?.productos ?? []).map((producto) => [
      String(producto.idProductoFactura),
      Number(producto.idUnidadMedidaMaestro) || 0,
    ]),
  );
}

function crearProductoFactura(
  producto: EntradaProductoFacturable,
): EntradaProductoFactura {
  const valorUnitario = producto.precio;
  const descuentoPorcentaje = producto.descuentoPorcentaje;

  return {
    idProductoFactura: Date.now() + producto.idProductoFacturable,
    idPedido: producto.idProductoFacturable,
    codigo: producto.codigo,
    numeroLinea: 0,
    idLineaDocumentoElectronico: 0,
    productoSunatCodigo: null,
    idUnidadMedidaMaestro: ID_UNIDAD_MEDIDA_PREDETERMINADA,
    unidadMedidaDescripcion: DESCRIPCION_UNIDAD_MEDIDA_PREDETERMINADA,
    cantidad: 1,
    descripcion: `${producto.codigo} - ${producto.tipo === "express" ? "Express" : producto.tipo === "normal" ? "Normal" : "Super Flash"}`,
    descuentoPorcentaje,
    valorUnitario,
    precioUnitario: producto.precio,
    porcentajeIgv: PORCENTAJE_IGV_PREDETERMINADO,
    idAfectacionIgvMaestro: 0,
    afectacionIgvDescripcion: "",
    total: valorUnitario * (1 - descuentoPorcentaje / 100),
  };
}

export function useFormularioFactura(
  factura: DetalleFactura | null,
  onGuardado?: () => void,
  productosIniciales: EntradaProductoFacturable[] = [],
) {
  const queryClient = useQueryClient();
  const [detalle, setDetalle] = useState<DetalleFactura | null>(() =>
    factura
      ? {
          ...factura,
          ordenCompra: concatenarCodigosOrdenCompra(
            factura.ordenCompra,
            productosIniciales.map((producto) => producto.codigo),
          ),
          productos: [
            ...factura.productos,
            ...productosIniciales.map(crearProductoFactura),
          ],
        }
      : factura,
  );
  const [idProductoDescuentoEdicion, setIdProductoDescuentoEdicion] = useState<
    number | null
  >(null);
  const [idProductoIgvEdicion, setIdProductoIgvEdicion] = useState<
    number | null
  >(null);
  const formulario = useForm<DatosFormularioFactura>({
    resolver: zodResolver(esquemaFormularioFactura),
    mode: "onTouched",
    defaultValues: {
      idTipoDocumentoMaestro: detalle?.idTipoDocumentoMaestro ?? 0,
      idMonedaMaestro: detalle?.idMonedaMaestro ?? 0,
      idTipoOperacionMaestro:
        detalle?.idTipoOperacionMaestro
        || ID_TIPO_OPERACION_SUNAT_EXPORTACION_SERVICIOS,
      idFormaPago: detalle?.idFormaPago ?? 0,
      descuentos: obtenerDescuentosIniciales(detalle),

      porcentajesIgv: obtenerPorcentajesIgvIniciales(detalle),
      afectacionesIgv: obtenerAfectacionesIgvIniciales(detalle),
      unidadesMedida: obtenerUnidadesMedidaIniciales(detalle),
    },
  });
  const {
    clearErrors,
    getValues,
    setError,
    setValue,
    trigger,
    unregister,
  } = formulario;
  const descuentos = useWatch({
    control: formulario.control,
    name: "descuentos",
  });
  const afectacionesIgv = useWatch({
    control: formulario.control,
    name: "afectacionesIgv",
  });
  const unidadesMedida = useWatch({
    control: formulario.control,
    name: "unidadesMedida",
  });
  const porcentajesIgv = useWatch({
    control: formulario.control,
    name: "porcentajesIgv",
  });
  const idTipoDocumentoMaestro = useWatch({
    control: formulario.control,
    name: "idTipoDocumentoMaestro",
  });
  const idMonedaMaestro = useWatch({
    control: formulario.control,
    name: "idMonedaMaestro",
  });
  const idTipoOperacionMaestro = useWatch({
    control: formulario.control,
    name: "idTipoOperacionMaestro",
  });
  const idFormaPago = useWatch({
    control: formulario.control,
    name: "idFormaPago",
  });
  const { data: opcionesMoneda } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.MONEDA_SUNAT],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.MONEDA_SUNAT),
    enabled: detalle !== null,
    staleTime: Infinity,
  });
  const { data: opcionesTipoDocumentoBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_DOCUMENTO_COMPROBANTE],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_DOCUMENTO_COMPROBANTE),
    enabled: detalle !== null,
    staleTime: Infinity,
  });
  const { data: opcionesAfectacionIgvBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.AFECTACION_IGV_SUNAT],
    queryFn: () =>
      servicioTablaMaestra.list(TablaMaestraId.AFECTACION_IGV_SUNAT),
    enabled: detalle !== null,
    staleTime: Infinity,
  });
  const opcionesAfectacionIgv = useMemo(
    () =>
      opcionesAfectacionIgvBase?.filter(
        (opcion) =>
          opcion.num1 != null
          && (IDS_AFECTACION_IGV_DISPONIBLES as readonly number[]).includes(
            opcion.num1,
          ),
      ),
    [opcionesAfectacionIgvBase],
  );
  const idAfectacionIgvPredeterminada = detalle
    ? detalle.idTipoDocumentoSunat === ID_TIPO_DOCUMENTO_SUNAT_RUC
      ? ID_AFECTACION_IGV_PERU
      : ID_AFECTACION_IGV_EXTRANJERO
    : undefined;
  const opcionAfectacionIgvPredeterminada = opcionesAfectacionIgv?.find(
    (opcion) => opcion.num1 === idAfectacionIgvPredeterminada,
  );
  useEffect(() => {
    if (!idAfectacionIgvPredeterminada || !detalle) return;

    const afectacionesActuales = getValues("afectacionesIgv");
    const afectacionesCompletadas = { ...afectacionesActuales };
    let hayProductosSinAfectacion = false;

    detalle.productos.forEach((producto) => {
      const claveProducto = String(producto.idProductoFactura);
      if (afectacionesCompletadas[claveProducto]) return;

      afectacionesCompletadas[claveProducto] = idAfectacionIgvPredeterminada;
      hayProductosSinAfectacion = true;
    });

    if (!hayProductosSinAfectacion) return;

    setValue("afectacionesIgv", afectacionesCompletadas, {
      shouldValidate: true,
    });
  }, [detalle, getValues, idAfectacionIgvPredeterminada, setValue]);
  const opcionesTipoDocumento = useMemo(() => {
    const idsPermitidos = new Set<number>(
      detalle?.idTipoDocumentoSunat === ID_TIPO_DOCUMENTO_SUNAT_RUC
        ? IDS_TIPO_COMPROBANTE_CLIENTE_RUC
        : [ID_TIPO_COMPROBANTE_BOLETA],
    );

    return opcionesTipoDocumentoBase?.filter(
      (opcion) => opcion.num1 != null && idsPermitidos.has(opcion.num1),
    );
  }, [detalle?.idTipoDocumentoSunat, opcionesTipoDocumentoBase]);
  const simboloMoneda = obtenerSimboloTablaMaestra(
    opcionesMoneda,
    idMonedaMaestro || undefined,
  );
  const guardarFacturaMutation = useMutation({
    mutationFn: (datos: DatosFormularioFactura) => {
      if (!detalle) return Promise.resolve();
      if (detalle.idDocumentoElectronico !== null) {
        return facturacionService.guardarCambios(
          detalle.idDocumentoElectronico,
          construirPayloadGuardarCambiosFactura(detalle, datos),
        );
      }

      return facturacionService.guardarBorrador(
        construirPayloadGuardarBorradorFactura(detalle, datos),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["facturacion"] });
      onGuardado?.();
    },
  });

  const emitirFacturaMutation = useMutation({
    mutationFn: async (datos: DatosFormularioFactura) => {
      if (!detalle) return;

      let idDocumentoElectronico = detalle.idDocumentoElectronico;
      if (idDocumentoElectronico === null) {
        idDocumentoElectronico =
          await facturacionService.guardarBorrador(
            construirPayloadGuardarBorradorFactura(detalle, datos),
          );
      } else {
        await facturacionService.guardarCambios(
          idDocumentoElectronico,
          construirPayloadGuardarCambiosFactura(detalle, datos),
        );
      }

      await facturacionService.emitir(idDocumentoElectronico);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["facturacion"] });
      onGuardado?.();
    },
  });

  const anularFacturaMutation = useMutation({
    mutationFn: (datos: DatosFormularioAnulacionFactura) => {
      if (!detalle?.idDocumentoElectronico) return Promise.resolve();

      return facturacionService.anular({
        fechaReferencia: formatearFechaIsoLocal(datos.fechaReferencia),
        items: [
          {
            idDocumentoElectronico: detalle.idDocumentoElectronico,
            motivoDescripcion: datos.motivoDescripcion,
          },
        ],
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["facturacion"] });
      onGuardado?.();
    },
  });

  const obtenerDescuento = (producto: EntradaProductoFactura) =>
    descuentos?.[String(producto.idProductoFactura)] ??
    producto.descuentoPorcentaje;

  const obtenerPrecioUnitario = (producto: EntradaProductoFactura) => {
    const claveProducto = String(producto.idProductoFactura);

    return calcularPrecioUnitarioFactura(
      producto.valorUnitario,
      afectacionesIgv?.[claveProducto] ?? producto.idAfectacionIgvMaestro,
      porcentajesIgv?.[claveProducto] ?? producto.porcentajeIgv,
      obtenerDescuento(producto),
    );
  };

  // precioUnitario ya incluye el descuento (ver calcularPrecioUnitarioFactura) — no volver a aplicarlo acá.
  const obtenerTotalProducto = (producto: EntradaProductoFactura) =>
    producto.cantidad * obtenerPrecioUnitario(producto);

  const totalFactura = useMemo(
    () =>
      detalle?.productos.reduce((total, producto) => {
        const claveProducto = String(producto.idProductoFactura);
        const descuento =
          descuentos?.[claveProducto] ?? producto.descuentoPorcentaje;
        const precioUnitario = calcularPrecioUnitarioFactura(
          producto.valorUnitario,
          afectacionesIgv?.[claveProducto] ??
            producto.idAfectacionIgvMaestro,
          porcentajesIgv?.[claveProducto] ?? producto.porcentajeIgv,
          descuento,
        );

        return total + producto.cantidad * precioUnitario;
      }, 0) ?? 0,
    [
      afectacionesIgv,
      descuentos,
      detalle?.productos,
      porcentajesIgv,
    ],
  );

  const validarTotalCuotas = (datos: DatosFormularioFactura) => {
    if (!detalle || datos.idFormaPago === ID_FORMA_PAGO_CONTADO) {
      clearErrors("root.cuotas");
      return true;
    }

    const totalCuotas = detalle.cuotas.reduce(
      (total, cuota) => total + cuota.monto,
      0,
    );
    const coincidenImportes = Math.round(totalCuotas * 100)
      === Math.round(totalFactura * 100);

    if (!coincidenImportes) {
      setError("root.cuotas", {
        type: "custom",
        message: "La suma de las cuotas debe ser igual al total de la factura.",
      });
      return false;
    }

    clearErrors("root.cuotas");
    return true;
  };

  const agregarProductos = (productos: EntradaProductoFacturable[]) => {
    clearErrors("root.cuotas");
    const productosNuevos = productos.map(crearProductoFactura);
    const descuentosNuevos = Object.fromEntries(
      productosNuevos.map((producto) => [
        String(producto.idProductoFactura),
        producto.descuentoPorcentaje,
      ]),
    );

    const porcentajesIgvNuevos = Object.fromEntries(
      productosNuevos.map((producto) => [
        String(producto.idProductoFactura),
        producto.porcentajeIgv,
      ]),
    );
    const afectacionesIgvNuevas = Object.fromEntries(
      productosNuevos.map((producto) => [
        String(producto.idProductoFactura),
        Number(producto.idAfectacionIgvMaestro) || 0,
      ]),
    );
    const unidadesMedidaNuevas = Object.fromEntries(
      productosNuevos.map((producto) => [
        String(producto.idProductoFactura),
        Number(producto.idUnidadMedidaMaestro) || 0,
      ]),
    );

    setValue("descuentos", {
      ...getValues("descuentos"),
      ...descuentosNuevos,
    });

    setValue("porcentajesIgv", {
      ...getValues("porcentajesIgv"),
      ...porcentajesIgvNuevos,
    });
    setValue("afectacionesIgv", {
      ...getValues("afectacionesIgv"),
      ...afectacionesIgvNuevas,
    });
    setValue("unidadesMedida", {
      ...getValues("unidadesMedida"),
      ...unidadesMedidaNuevas,
    });
    setDetalle((actual) =>
      actual
        ? {
            ...actual,
            ordenCompra: concatenarCodigosOrdenCompra(
              actual.ordenCompra,
              productosNuevos.map((producto) => producto.codigo),
            ),
            productos: [...actual.productos, ...productosNuevos],
          }
        : actual,
    );
  };

  const quitarProducto = (producto: EntradaProductoFactura) => {
    clearErrors("root.cuotas");
    unregister(`descuentos.${producto.idProductoFactura}`);

    unregister(`porcentajesIgv.${producto.idProductoFactura}`);
    unregister(`afectacionesIgv.${producto.idProductoFactura}`);
    unregister(`unidadesMedida.${producto.idProductoFactura}`);
    setIdProductoDescuentoEdicion((idActual) =>
      idActual === producto.idProductoFactura ? null : idActual,
    );
    setIdProductoIgvEdicion((idActual) =>
      idActual === producto.idProductoFactura ? null : idActual,
    );
    setDetalle((actual) =>
      actual
        ? {
            ...actual,
            productos: actual.productos.filter(
              (productoActual) =>
                productoActual.idProductoFactura !== producto.idProductoFactura,
            ),
          }
        : actual,
    );
  };

  const guardarCuota = (cuota: EntradaCuotaFactura) => {
    clearErrors("root.cuotas");
    setDetalle((actual) => {
      if (!actual) return actual;
      const idCuotaFactura =
        cuota.idCuotaFactura ||
        Math.max(
          0,
          ...actual.cuotas.map((cuotaActual) => cuotaActual.idCuotaFactura),
        ) + 1;
      const cuotaGuardada = {
        ...cuota,
        idCuotaFactura,
        idCuotaDocumentoElectronico:
          cuota.idCuotaDocumentoElectronico || 0,
      };
      const existeCuota = actual.cuotas.some(
        (cuotaActual) => cuotaActual.idCuotaFactura === idCuotaFactura,
      );

      return {
        ...actual,
        cuotas: existeCuota
          ? actual.cuotas.map((cuotaActual) =>
              cuotaActual.idCuotaFactura === idCuotaFactura
                ? cuotaGuardada
                : cuotaActual,
            )
          : [...actual.cuotas, cuotaGuardada],
      };
    });
  };

  const quitarCuota = (idCuotaFactura: number) => {
    clearErrors("root.cuotas");
    setDetalle((actual) =>
      actual
        ? {
            ...actual,
            cuotas: actual.cuotas
              .filter(
                (cuotaActual) =>
                  cuotaActual.idCuotaFactura !== idCuotaFactura,
              )
              .map((cuotaActual, indice) => ({
                ...cuotaActual,
                numeroCuota: indice + 1,
              })),
          }
        : actual,
    );
  };

  const seleccionarAfectacionIgv = (
    idProductoFactura: number,
    valor: number,
  ) => {
    clearErrors("root.cuotas");
    setValue(
      "afectacionesIgv",
      {
        ...getValues("afectacionesIgv"),
        [String(idProductoFactura)]: valor,
      },
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const seleccionarUnidadMedida = (
    idProductoFactura: number,
    valor: number,
  ) => {
    setValue(
      "unidadesMedida",
      {
        ...getValues("unidadesMedida"),
        [String(idProductoFactura)]: valor,
      },
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const actualizarCampoFactura = (
    campo: "cliente" | "ni" | "ordenCompra",
    valor: string,
  ) => {
    const valorActualizado = campo === "ordenCompra"
      ? limitarOrdenCompra(valor)
      : valor;
    setDetalle((actual) =>
      actual ? { ...actual, [campo]: valorActualizado } : actual
    );
  };

  const iniciarEdicionDescuento = (producto: EntradaProductoFactura) => {
    if (
      idProductoDescuentoEdicion !== null
      || idProductoIgvEdicion !== null
    ) return;
    setIdProductoDescuentoEdicion(producto.idProductoFactura);
  };

  const cancelarEdicionDescuento = (producto: EntradaProductoFactura) => {
    const rutaDescuento = `descuentos.${producto.idProductoFactura}` as const;
    setValue(rutaDescuento, producto.descuentoPorcentaje);
    clearErrors(rutaDescuento);
    setIdProductoDescuentoEdicion(null);
  };

  const guardarEdicionDescuento = async (producto: EntradaProductoFactura) => {
    const rutaDescuento = `descuentos.${producto.idProductoFactura}` as const;
    const esValido = await trigger(rutaDescuento);
    if (!esValido) return;

    const descuentoPorcentaje = getValues(rutaDescuento);
    const total =
      producto.cantidad *
      producto.valorUnitario *
      (1 - descuentoPorcentaje / 100);

    clearErrors("root.cuotas");

    setDetalle((actual) =>
      actual
        ? {
            ...actual,
            productos: actual.productos.map((productoActual) =>
              productoActual.idProductoFactura === producto.idProductoFactura
                ? { ...productoActual, descuentoPorcentaje, total }
                : productoActual,
            ),
          }
        : actual,
    );
    setIdProductoDescuentoEdicion(null);
  };

  const iniciarEdicionIgv = (producto: EntradaProductoFactura) => {
    if (
      idProductoDescuentoEdicion !== null
      || idProductoIgvEdicion !== null
    ) return;
    setIdProductoIgvEdicion(producto.idProductoFactura);
  };

  const cancelarEdicionIgv = (producto: EntradaProductoFactura) => {
    const rutaIgv =
      `porcentajesIgv.${producto.idProductoFactura}` as const;
    setValue(rutaIgv, producto.porcentajeIgv);
    clearErrors(rutaIgv);
    setIdProductoIgvEdicion(null);
  };

  const guardarEdicionIgv = async (producto: EntradaProductoFactura) => {
    const rutaIgv =
      `porcentajesIgv.${producto.idProductoFactura}` as const;
    const esValido = await trigger(rutaIgv);
    if (!esValido) return;

    const porcentajeIgv = getValues(rutaIgv);
    clearErrors("root.cuotas");
    setDetalle((actual) =>
      actual
        ? {
            ...actual,
            productos: actual.productos.map((productoActual) =>
              productoActual.idProductoFactura === producto.idProductoFactura
                ? { ...productoActual, porcentajeIgv }
                : productoActual,
            ),
          }
        : actual,
    );
    setIdProductoIgvEdicion(null);
  };

  const hayEdicionProductoPendiente =
    idProductoDescuentoEdicion !== null
    || idProductoIgvEdicion !== null;

  return {
    afectacionesIgv,
    agregarProductos,
    anularFactura: (datos: DatosFormularioAnulacionFactura) =>
      anularFacturaMutation.mutate(datos),
    anularFacturaMutation,
    actualizarCampoFactura,
    cancelarEdicionDescuento,
    cancelarEdicionIgv,
    confirmarFormulario: (alConfirmar: () => void) =>
      formulario.handleSubmit((datos) => {
        if (validarTotalCuotas(datos)) alConfirmar();
      }),
    detalle,
    erroresFormulario: formulario.formState.errors,
    afectacionIgvPredeterminadaDescripcion:
      opcionAfectacionIgvPredeterminada
        ? obtenerEtiquetaPrincipalSecundaria(opcionAfectacionIgvPredeterminada)
        : "",
    emitirFactura: formulario.handleSubmit((datos) => {
      if (!validarTotalCuotas(datos)) return Promise.resolve();
      return emitirFacturaMutation.mutateAsync(datos);
    }),
    emitirFacturaMutation,
    guardarFactura: formulario.handleSubmit((datos) => {
      if (!validarTotalCuotas(datos)) return Promise.resolve();
      return guardarFacturaMutation.mutateAsync(datos);
    }),
    guardarFacturaMutation,
    guardarEdicionDescuento,
    guardarEdicionIgv,
    guardarCuota,
    hayEdicionProductoPendiente,
    idProductoDescuentoEdicion,
    idProductoIgvEdicion,
    iniciarEdicionDescuento,
    iniciarEdicionIgv,
    obtenerPrecioUnitario,
    obtenerTotalProducto,
    opcionesAfectacionIgv,
    opcionesMoneda,
    opcionesTipoDocumento,
    quitarCuota,
    quitarProducto,
    registrarDescuento: formulario.register,
    registrarPorcentajeIgv: formulario.register,

    seleccionarAfectacionIgv,
    seleccionarUnidadMedida,
    seleccionarFormaPago: (valor: number) => {
      clearErrors("root.cuotas");
      setValue("idFormaPago", valor, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    seleccionarMoneda: (valor: number) =>
      setValue("idMonedaMaestro", valor, {
        shouldDirty: true,
        shouldValidate: true,
      }),
    seleccionarTipoDocumento: (valor: number) =>
      setValue("idTipoDocumentoMaestro", valor, {
        shouldDirty: true,
        shouldValidate: true,
      }),
    seleccionarTipoOperacion: (valor: number) =>
      setValue("idTipoOperacionMaestro", valor, {
        shouldDirty: true,
        shouldValidate: true,
      }),
    valoresMaestros: {
      idFormaPago,
      idMonedaMaestro,
      idTipoDocumentoMaestro,
      idTipoOperacionMaestro,
    },
    totalFactura,
    simboloMoneda,
    unidadesMedida,
  };
}
