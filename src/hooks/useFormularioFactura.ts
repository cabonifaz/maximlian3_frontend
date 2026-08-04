import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  esquemaFormularioFactura,
  type DatosFormularioAnulacionFactura,
  type DatosFormularioFactura,
} from "@maximilian/schemas";
import { facturacionService } from "@maximilian/services/facturacion.service";
import type {
  DetalleFactura,
  EntradaCuotaFactura,
  EntradaProductoFacturable,
  EntradaProductoFactura,
} from "@maximilian/shared/types/facturacion.type";
import {
  calcularPrecioUnitarioFactura,
  construirPayloadGuardarBorradorFactura,
  construirPayloadGuardarCambiosFactura,
} from "@maximilian/shared/utils/facturacion.util";
import { formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";
import {
  ID_FORMA_PAGO_CONTADO,
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
    numeroLinea: 0,
    idLineaDocumentoElectronico: 0,
    productoSunatCodigo: null,
    idUnidadMedidaMaestro: 0,
    unidadMedidaDescripcion: "",
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
) {
  const queryClient = useQueryClient();
  const [detalle, setDetalle] = useState<DetalleFactura | null>(factura);
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
      idTipoDocumentoMaestro: factura?.idTipoDocumentoMaestro ?? 0,
      idMonedaMaestro: factura?.idMonedaMaestro ?? 0,
      idTipoOperacionMaestro: factura?.idTipoOperacionMaestro ?? 0,
      idFormaPago: factura?.idFormaPago ?? 0,
      descuentos: obtenerDescuentosIniciales(factura),

      porcentajesIgv: obtenerPorcentajesIgvIniciales(factura),
      afectacionesIgv: obtenerAfectacionesIgvIniciales(factura),
      unidadesMedida: obtenerUnidadesMedidaIniciales(factura),
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
    setDetalle((actual) => (actual ? { ...actual, [campo]: valor } : actual));
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
    unidadesMedida,
  };
}
