import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  esquemaFormularioFactura,
  type DatosFormularioFactura,
} from "@maximilian/schemas";
import { facturacionService } from "@maximilian/services/facturacion.service";
import type {
  DetalleFactura,
  EntradaCuotaFactura,
  EntradaProductoFacturable,
  EntradaProductoFactura,
} from "@maximilian/shared/types/facturacion.type";
import { construirPayloadGuardarBorradorFactura } from "@maximilian/shared/utils/facturacion.util";

function obtenerDescuentosIniciales(factura: DetalleFactura | null) {
  return Object.fromEntries(
    (factura?.productos ?? []).map((producto) => [
      String(producto.idProductoFactura),
      producto.descuentoPorcentaje,
    ]),
  );
}

function obtenerPreciosIniciales(factura: DetalleFactura | null) {
  return Object.fromEntries(
    (factura?.productos ?? []).map((producto) => [
      String(producto.idProductoFactura),
      producto.precioUnitario,
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

function crearProductoFactura(
  producto: EntradaProductoFacturable,
): EntradaProductoFactura {
  const valorUnitario = 10.09;

  return {
    idProductoFactura: Date.now() + producto.idProductoFacturable,
    idPedido: producto.idProductoFacturable,
    cantidad: 1,
    descripcion: `${producto.codigo} - ${producto.tipo === "express" ? "Express" : producto.tipo === "normal" ? "Normal" : "Super Flash"}`,
    descuentoPorcentaje: 0,
    valorUnitario,
    precioUnitario: 0,
    porcentajeIgv: 0,
    total: valorUnitario,
  };
}

export function useFormularioFactura(
  factura: DetalleFactura | null,
  onGuardado?: () => void,
) {
  const [detalle, setDetalle] = useState<DetalleFactura | null>(factura);
  const [idProductoDescuentoEdicion, setIdProductoDescuentoEdicion] = useState<
    number | null
  >(null);
  const formulario = useForm<DatosFormularioFactura>({
    resolver: zodResolver(esquemaFormularioFactura),
    mode: "onTouched",
    defaultValues: {
      idTipoDocumentoMaestro: 0,
      idMonedaMaestro: 0,
      idTipoOperacionMaestro: 0,
      idFormaPago: 0,
      descuentos: obtenerDescuentosIniciales(factura),
      preciosUnitarios: obtenerPreciosIniciales(factura),
      porcentajesIgv: obtenerPorcentajesIgvIniciales(factura),
    },
  });
  const { clearErrors, getValues, setValue, trigger } = formulario;
  const descuentos = useWatch({
    control: formulario.control,
    name: "descuentos",
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
  const guardarBorradorMutation = useMutation({
    mutationFn: (datos: DatosFormularioFactura) => {
      if (!detalle) return Promise.resolve();
      return facturacionService.guardarBorrador(
        construirPayloadGuardarBorradorFactura(detalle, datos),
      );
    },
    onSuccess: onGuardado,
  });

  const obtenerDescuento = (producto: EntradaProductoFactura) =>
    descuentos?.[String(producto.idProductoFactura)] ??
    producto.descuentoPorcentaje;

  const obtenerTotalProducto = (producto: EntradaProductoFactura) => {
    const subtotal = producto.cantidad * producto.valorUnitario;
    return subtotal * (1 - obtenerDescuento(producto) / 100);
  };

  const totalFactura = useMemo(
    () =>
      detalle?.productos.reduce((total, producto) => {
        const descuento =
          descuentos?.[String(producto.idProductoFactura)] ??
          producto.descuentoPorcentaje;
        return (
          total +
          producto.cantidad * producto.valorUnitario * (1 - descuento / 100)
        );
      }, 0) ?? 0,
    [descuentos, detalle?.productos],
  );

  const agregarProductos = (productos: EntradaProductoFacturable[]) => {
    const productosNuevos = productos.map(crearProductoFactura);
    productosNuevos.forEach((producto) => {
      setValue(`descuentos.${producto.idProductoFactura}`, 0);
      setValue(`preciosUnitarios.${producto.idProductoFactura}`, 0);
      setValue(`porcentajesIgv.${producto.idProductoFactura}`, 0);
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

  const guardarCuota = (cuota: EntradaCuotaFactura) => {
    setDetalle((actual) => {
      if (!actual) return actual;
      const idCuotaFactura =
        cuota.idCuotaFactura ||
        Math.max(
          0,
          ...actual.cuotas.map((cuotaActual) => cuotaActual.idCuotaFactura),
        ) + 1;
      const cuotaGuardada = { ...cuota, idCuotaFactura };
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

  const actualizarCampoFactura = (
    campo: "cliente" | "ni" | "ordenCompra",
    valor: string,
  ) => {
    setDetalle((actual) => (actual ? { ...actual, [campo]: valor } : actual));
  };

  const iniciarEdicionDescuento = (producto: EntradaProductoFactura) => {
    if (idProductoDescuentoEdicion !== null) return;
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

  return {
    agregarProductos,
    actualizarCampoFactura,
    cancelarEdicionDescuento,
    confirmarFormulario: formulario.handleSubmit,
    detalle,
    erroresFormulario: formulario.formState.errors,
    guardarBorrador: formulario.handleSubmit((datos) =>
      guardarBorradorMutation.mutateAsync(datos),
    ),
    guardarBorradorMutation,
    guardarEdicionDescuento,
    guardarCuota,
    idProductoDescuentoEdicion,
    iniciarEdicionDescuento,
    obtenerTotalProducto,
    registrarDescuento: formulario.register,
    registrarPorcentajeIgv: formulario.register,
    registrarPrecioUnitario: formulario.register,
    seleccionarFormaPago: (valor: number) =>
      setValue("idFormaPago", valor, {
        shouldDirty: true,
        shouldValidate: true,
      }),
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
  };
}
