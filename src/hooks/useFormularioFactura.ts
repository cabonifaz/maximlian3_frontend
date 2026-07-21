import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  esquemaDescuentosFactura,
  type DatosFormularioDescuentosFactura,
} from "@maximilian/schemas";
import type {
  DetalleFactura,
  EntradaCuotaFactura,
  EntradaProductoFacturable,
  EntradaProductoFactura,
} from "@maximilian/shared/types/facturacion.type";

function obtenerDescuentosIniciales(factura: DetalleFactura | null) {
  return Object.fromEntries(
    (factura?.productos ?? []).map((producto) => [
      String(producto.idProductoFactura),
      producto.descuentoPorcentaje,
    ]),
  );
}

function crearProductoFactura(producto: EntradaProductoFacturable): EntradaProductoFactura {
  const valorUnitario = 10256.09;

  return {
    idProductoFactura: Date.now() + producto.idProductoFacturable,
    cantidad: 1,
    descripcion: `${producto.codigo} - ${producto.tipo === "express" ? "Express" : producto.tipo === "normal" ? "Normal" : "Super Flash"}`,
    descuentoPorcentaje: 0,
    valorUnitario,
    total: valorUnitario,
  };
}

export function useFormularioFactura(factura: DetalleFactura | null) {
  const [detalle, setDetalle] = useState<DetalleFactura | null>(factura);
  const [idProductoDescuentoEdicion, setIdProductoDescuentoEdicion] = useState<number | null>(null);
  const formulario = useForm<DatosFormularioDescuentosFactura>({
    resolver: zodResolver(esquemaDescuentosFactura),
    mode: "onTouched",
    defaultValues: { descuentos: obtenerDescuentosIniciales(factura) },
  });
  const { clearErrors, getValues, setValue, trigger } = formulario;
  const descuentos = useWatch({ control: formulario.control, name: "descuentos" });

  const obtenerDescuento = (producto: EntradaProductoFactura) =>
    descuentos?.[String(producto.idProductoFactura)] ?? producto.descuentoPorcentaje;

  const obtenerTotalProducto = (producto: EntradaProductoFactura) => {
    const subtotal = producto.cantidad * producto.valorUnitario;
    return subtotal * (1 - obtenerDescuento(producto) / 100);
  };

  const totalFactura = useMemo(
    () => detalle?.productos.reduce(
      (total, producto) => {
        const descuento = descuentos?.[String(producto.idProductoFactura)]
          ?? producto.descuentoPorcentaje;
        return total + producto.cantidad * producto.valorUnitario * (1 - descuento / 100);
      },
      0,
    ) ?? 0,
    [descuentos, detalle?.productos],
  );

  const agregarProductos = (productos: EntradaProductoFacturable[]) => {
    const productosNuevos = productos.map(crearProductoFactura);
    productosNuevos.forEach((producto) => {
      setValue(`descuentos.${producto.idProductoFactura}`, 0);
    });
    setDetalle((actual) => actual ? {
      ...actual,
      productos: [...actual.productos, ...productosNuevos],
    } : actual);
  };

  const guardarCuota = (cuota: EntradaCuotaFactura) => {
    setDetalle((actual) => {
      if (!actual) return actual;
      const idCuotaFactura = cuota.idCuotaFactura || (
        Math.max(0, ...actual.cuotas.map((cuotaActual) => cuotaActual.idCuotaFactura)) + 1
      );
      const cuotaGuardada = { ...cuota, idCuotaFactura };
      const existeCuota = actual.cuotas.some(
        (cuotaActual) => cuotaActual.idCuotaFactura === idCuotaFactura,
      );

      return {
        ...actual,
        cuotas: existeCuota
          ? actual.cuotas.map((cuotaActual) =>
              cuotaActual.idCuotaFactura === idCuotaFactura ? cuotaGuardada : cuotaActual,
            )
          : [...actual.cuotas, cuotaGuardada],
      };
    });
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
    const total = producto.cantidad
      * producto.valorUnitario
      * (1 - descuentoPorcentaje / 100);

    setDetalle((actual) => actual ? {
      ...actual,
      productos: actual.productos.map((productoActual) =>
        productoActual.idProductoFactura === producto.idProductoFactura
          ? { ...productoActual, descuentoPorcentaje, total }
          : productoActual,
      ),
    } : actual);
    setIdProductoDescuentoEdicion(null);
  };

  return {
    agregarProductos,
    cancelarEdicionDescuento,
    confirmarDescuentos: formulario.handleSubmit,
    detalle,
    erroresDescuentos: formulario.formState.errors.descuentos,
    guardarEdicionDescuento,
    guardarCuota,
    idProductoDescuentoEdicion,
    iniciarEdicionDescuento,
    obtenerTotalProducto,
    registrarDescuento: formulario.register,
    totalFactura,
  };
}
