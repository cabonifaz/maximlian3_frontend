import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  esquemaFormularioFactura,
  type DatosFormularioAnulacionFactura,
  type DatosFormularioFactura,
} from "@maximilian/schemas";
import { facturacionService } from "@maximilian/services/facturacion.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type {
  CampoExtraLineaFactura,
  DetalleFactura,
  EntradaCuotaFactura,
  EntradaProductoFacturable,
  EntradaProductoFactura,
} from "@maximilian/shared/types/facturacion.type";
import {
  calcularPrecioUnitarioFactura,
  concatenarCodigosOrdenCompra,
  construirPayloadEditarNotaCreditoDebito,
  construirPayloadGuardarBorradorFactura,
  construirPayloadGuardarCambiosFactura,
  construirPayloadNotaCreditoDebito,
  limitarOrdenCompra,
} from "@maximilian/shared/utils/facturacion.util";
import { formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";
import {
  TablaMaestraId,
  type EntradaTablaMaestra,
} from "@maximilian/shared/types/tabla-maestra.type";
import {
  obtenerEtiquetaPrincipalSecundaria,
  obtenerSimboloTablaMaestra,
} from "@maximilian/shared/utils/tabla-maestra.util";
import {
  CODIGO_MONEDA_SUNAT_SOLES,
  DESCRIPCION_UNIDAD_MEDIDA_PREDETERMINADA,
  ID_AFECTACION_IGV_EXTRANJERO,
  ID_AFECTACION_IGV_PERU,
  ID_FORMA_PAGO_CONTADO,
  ID_TIPO_DOCUMENTO_SUNAT_RUC,
  ID_TIPO_OPERACION_SUNAT_EXPORTACION_SERVICIOS,
  ID_UNIDAD_MEDIDA_PREDETERMINADA,
  ID_TIPO_NOTA_DEBITO,
  IDS_AFECTACION_IGV_DISPONIBLES,
  IDS_TIPO_COMPROBANTE_CLIENTE_RUC,
  PORCENTAJE_IGV_PREDETERMINADO,
} from "@maximilian/shared/constants/components/coordinador/facturacion.constants";

export type ModoFormularioFactura =
  | "emitir"
  | "detalle"
  | "notaCreditoDebito"
  | "editarNotaCreditoDebito";

const resolverFormularioFactura = (
  esNotaCreditoDebito: boolean,
): Resolver<DatosFormularioFactura> => async (...args) => {
  const resultado = await zodResolver(esquemaFormularioFactura)(...args);
  const [datos] = args;

  if (esNotaCreditoDebito) {
    if (!datos.idMotivoMaestro || datos.idMotivoMaestro <= 0) {
      resultado.errors = {
        ...resultado.errors,
        idMotivoMaestro: { type: "custom", message: "El código de motivo es requerido" },
      };
    }
  } else if (!datos.idFormaPago || datos.idFormaPago <= 0) {
    resultado.errors = {
      ...resultado.errors,
      idFormaPago: { type: "custom", message: "La forma de pago es requerida" },
    };
  }

  return resultado;
};

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

function obtenerDescripcionesIniciales(factura: DetalleFactura | null) {
  return Object.fromEntries(
    (factura?.productos ?? []).map((producto) => [
      String(producto.idProductoFactura),
      producto.descripcion,
    ]),
  );
}

function obtenerValoresUnitariosIniciales(factura: DetalleFactura | null) {
  return Object.fromEntries(
    (factura?.productos ?? []).map((producto) => [
      String(producto.idProductoFactura),
      producto.valorUnitario,
    ]),
  );
}

function obtenerCodigosProductoIniciales(factura: DetalleFactura | null) {
  return Object.fromEntries(
    (factura?.productos ?? []).map((producto) => [
      String(producto.idProductoFactura),
      producto.codigo,
    ]),
  );
}

let contadorLineaNota = 0;

function crearLineaNotaVacia(): EntradaProductoFactura {
  return {
    idProductoFactura: Date.now() + contadorLineaNota++,
    idPedido: 0,
    codigo: "",
    numeroLinea: 0,
    idLineaDocumentoElectronico: 0,
    productoSunatCodigo: null,
    idUnidadMedidaMaestro: ID_UNIDAD_MEDIDA_PREDETERMINADA,
    unidadMedidaDescripcion: DESCRIPCION_UNIDAD_MEDIDA_PREDETERMINADA,
    cantidad: 1,
    descripcion: "",
    descuentoPorcentaje: 0,
    valorUnitario: 0,
    precioUnitario: 0,
    porcentajeIgv: PORCENTAJE_IGV_PREDETERMINADO,
    idAfectacionIgvMaestro: 0,
    afectacionIgvDescripcion: "",
    total: 0,
  };
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
  modo: ModoFormularioFactura = "emitir",
  onGuardado?: () => void,
  productosIniciales: EntradaProductoFacturable[] = [],
) {
  const esCreacionNotaCreditoDebito = modo === "notaCreditoDebito";
  const esEdicionNotaCreditoDebito = modo === "editarNotaCreditoDebito";
  const esVistaNotaCreditoDebito =
    modo === "detalle" && Boolean(factura?.esNotaCreditoDebito);
  const esNotaCreditoDebito =
    esCreacionNotaCreditoDebito || esEdicionNotaCreditoDebito || esVistaNotaCreditoDebito;
  const queryClient = useQueryClient();
  const [detalle, setDetalle] = useState<DetalleFactura | null>(() =>
    factura
      ? {
          ...factura,
          ordenCompra: concatenarCodigosOrdenCompra(
            factura.ordenCompra,
            productosIniciales.map((producto) => producto.codigo),
          ),
          productos: esCreacionNotaCreditoDebito
            ? []
            : [
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
    resolver: resolverFormularioFactura(esNotaCreditoDebito),
    mode: "onTouched",
    defaultValues: {
      idTipoDocumentoMaestro: esCreacionNotaCreditoDebito
        ? 0
        : detalle?.idTipoDocumentoMaestro ?? 0,
      idMonedaMaestro: detalle?.idMonedaMaestro ?? 0,
      tipoCambio: detalle?.tipoCambio || undefined,
      idTipoOperacionMaestro:
        detalle?.idTipoOperacionMaestro
        || ID_TIPO_OPERACION_SUNAT_EXPORTACION_SERVICIOS,
      idFormaPago: detalle?.idFormaPago ?? 0,
      descuentos: obtenerDescuentosIniciales(detalle),

      porcentajesIgv: obtenerPorcentajesIgvIniciales(detalle),
      afectacionesIgv: obtenerAfectacionesIgvIniciales(detalle),
      unidadesMedida: obtenerUnidadesMedidaIniciales(detalle),
      descripciones: obtenerDescripcionesIniciales(detalle),
      valoresUnitarios: obtenerValoresUnitariosIniciales(detalle),
      codigosProducto: obtenerCodigosProductoIniciales(detalle),
      idMotivoMaestro: esCreacionNotaCreditoDebito
        ? 0
        : detalle?.idMotivoMaestro ?? 0,
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
  const descripciones = useWatch({
    control: formulario.control,
    name: "descripciones",
  });
  const porcentajesIgv = useWatch({
    control: formulario.control,
    name: "porcentajesIgv",
  });
  const valoresUnitarios = useWatch({
    control: formulario.control,
    name: "valoresUnitarios",
  });
  const codigosProducto = useWatch({
    control: formulario.control,
    name: "codigosProducto",
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
  const idMotivoMaestro = useWatch({
    control: formulario.control,
    name: "idMotivoMaestro",
  });
  const { data: opcionesMoneda } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.MONEDA_SUNAT],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.MONEDA_SUNAT),
    enabled: detalle !== null,
    staleTime: Infinity,
  });
  const idMaestroTipoDocumento = esNotaCreditoDebito
    ? TablaMaestraId.TIPO_NOTA_CREDITO_DEBITO
    : TablaMaestraId.TIPO_DOCUMENTO_COMPROBANTE;
  const { data: opcionesTipoDocumentoBase } = useQuery({
    queryKey: ["masterTable", idMaestroTipoDocumento],
    queryFn: () => servicioTablaMaestra.list(idMaestroTipoDocumento),
    enabled: detalle !== null,
    staleTime: Infinity,
  });
  const { data: datosParaNota } = useQuery({
    queryKey: ["facturaParaNota", detalle?.idDocumentoElectronico],
    queryFn: () =>
      facturacionService.obtenerDatosParaNota(detalle!.idDocumentoElectronico!),
    enabled:
      (esCreacionNotaCreditoDebito || esEdicionNotaCreditoDebito)
      && Boolean(detalle?.idDocumentoElectronico),
  });
  const clienteNotaCreditoDebito = datosParaNota?.cliente;
  const [opcionesCodigoPersonalizadas, setOpcionesCodigoPersonalizadas] =
    useState<EntradaTablaMaestra[]>([]);
  const contadorOpcionCodigoRef = useRef(0);
  const crearOpcionCodigoNota = (numero1: number, codigo: string): EntradaTablaMaestra => ({
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: codigo,
    num1: numero1,
    num2: null,
    num3: null,
    string1: codigo,
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  });
  const opcionesCodigoNota = useMemo(() => {
    const opcionesBase = (datosParaNota?.productos ?? []).map((producto, indice) =>
      crearOpcionCodigoNota(indice + 1, producto.productoCodigo));

    return [...opcionesBase, ...opcionesCodigoPersonalizadas];
  }, [datosParaNota, opcionesCodigoPersonalizadas]);
  const obtenerOpcionesCodigoDisponibles = (idProductoFactura: number) => {
    const claveLineaActual = String(idProductoFactura);
    const codigosUsadosEnOtrasLineas = new Set(
      Object.entries(codigosProducto ?? {})
        .filter(([claveLinea, codigo]) => claveLinea !== claveLineaActual && codigo)
        .map(([, codigo]) => codigo),
    );

    return opcionesCodigoNota.filter(
      (opcion) => !codigosUsadosEnOtrasLineas.has(opcion.string1 ?? ""),
    );
  };
  const agregarCodigoPersonalizadoNota = (
    idProductoFactura: number,
    codigo: string,
  ) => {
    const nuevoId = 1000000 + contadorOpcionCodigoRef.current++;
    setOpcionesCodigoPersonalizadas((actual) => [
      ...actual,
      crearOpcionCodigoNota(nuevoId, codigo),
    ]);
    setValue(`codigosProducto.${idProductoFactura}`, codigo, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  const seleccionarCodigoProducto = (
    idProductoFactura: number,
    valor: number,
  ) => {
    const opcion = opcionesCodigoNota.find((opcionCodigo) => opcionCodigo.num1 === valor);
    setValue(`codigosProducto.${idProductoFactura}`, opcion?.string1 ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  const agregarLineaNota = () => {
    const lineaNueva = crearLineaNotaVacia();
    const clave = String(lineaNueva.idProductoFactura);

    setValue("descuentos", { ...getValues("descuentos"), [clave]: 0 });
    setValue("porcentajesIgv", {
      ...getValues("porcentajesIgv"),
      [clave]: PORCENTAJE_IGV_PREDETERMINADO,
    });
    setValue("afectacionesIgv", { ...getValues("afectacionesIgv"), [clave]: 0 });
    setValue("unidadesMedida", {
      ...getValues("unidadesMedida"),
      [clave]: ID_UNIDAD_MEDIDA_PREDETERMINADA,
    });
    setValue("descripciones", { ...getValues("descripciones"), [clave]: "" });
    setValue("valoresUnitarios", { ...getValues("valoresUnitarios"), [clave]: 0 });
    setValue("codigosProducto", { ...getValues("codigosProducto"), [clave]: "" });
    setDetalle((actual) =>
      actual ? { ...actual, productos: [...actual.productos, lineaNueva] } : actual);
  };
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
    if (esNotaCreditoDebito) return opcionesTipoDocumentoBase;

    const idsPermitidos = new Set<number>(IDS_TIPO_COMPROBANTE_CLIENTE_RUC);

    return opcionesTipoDocumentoBase?.filter(
      (opcion) => opcion.num1 != null && idsPermitidos.has(opcion.num1),
    );
  }, [esNotaCreditoDebito, opcionesTipoDocumentoBase]);
  const esTipoDocumentoNotaDebito = idTipoDocumentoMaestro === ID_TIPO_NOTA_DEBITO;
  const idMaestroMotivo = esTipoDocumentoNotaDebito
    ? TablaMaestraId.SUNAT_MOTIVO_NOTA_DEBITO
    : TablaMaestraId.SUNAT_MOTIVO_NOTA_CREDITO;
  const { data: opcionesMotivo } = useQuery({
    queryKey: ["masterTable", idMaestroMotivo],
    queryFn: () => servicioTablaMaestra.list(idMaestroMotivo),
    enabled: esNotaCreditoDebito,
    staleTime: Infinity,
  });
  const idMaestroMotivoAnteriorRef = useRef(idMaestroMotivo);
  useEffect(() => {
    if (!esNotaCreditoDebito) return;
    if (idMaestroMotivoAnteriorRef.current === idMaestroMotivo) return;

    idMaestroMotivoAnteriorRef.current = idMaestroMotivo;
    setValue("idMotivoMaestro", 0);
    clearErrors("idMotivoMaestro");
  }, [clearErrors, esNotaCreditoDebito, idMaestroMotivo, setValue]);
  const simboloMoneda = obtenerSimboloTablaMaestra(
    opcionesMoneda,
    idMonedaMaestro || undefined,
  );
  const monedaSeleccionada = opcionesMoneda?.find(
    (opcion) => opcion.num1 === idMonedaMaestro,
  );
  const requiereTipoCambio = Boolean(
    monedaSeleccionada
    && monedaSeleccionada.string1?.trim().toUpperCase() !== CODIGO_MONEDA_SUNAT_SOLES,
  );
  const simboloSoles = opcionesMoneda?.find(
    (opcion) => opcion.string1?.trim().toUpperCase() === CODIGO_MONEDA_SUNAT_SOLES,
  )?.string3?.trim() ?? "";
  useEffect(() => {
    if (!opcionesMoneda || requiereTipoCambio) return;

    setValue("tipoCambio", undefined);
    clearErrors("tipoCambio");
  }, [clearErrors, opcionesMoneda, requiereTipoCambio, setValue]);
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

  const guardarNotaCreditoDebitoMutation = useMutation({
    mutationFn: (datos: DatosFormularioFactura): Promise<number | undefined> => {
      if (!detalle) return Promise.resolve(undefined);

      if (esEdicionNotaCreditoDebito) {
        if (!detalle.idDocumentoElectronico) return Promise.resolve(undefined);

        return facturacionService
          .guardarCambiosNotaCreditoDebito(
            detalle.idDocumentoElectronico,
            construirPayloadEditarNotaCreditoDebito(detalle, datos),
          )
          .then(() => detalle.idDocumentoElectronico ?? undefined);
      }

      if (!clienteNotaCreditoDebito || detalle.productos.length === 0) {
        return Promise.resolve(undefined);
      }

      return facturacionService.guardarBorradorNotaCreditoDebito(
        construirPayloadNotaCreditoDebito(detalle, datos, clienteNotaCreditoDebito),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["facturacion"] });
      onGuardado?.();
    },
  });

  const emitirNotaCreditoDebitoMutation = useMutation({
    mutationFn: async (datos: DatosFormularioFactura) => {
      if (!detalle) return;

      let idDocumentoElectronicoNota: number;
      if (esEdicionNotaCreditoDebito) {
        if (!detalle.idDocumentoElectronico) return;

        idDocumentoElectronicoNota = detalle.idDocumentoElectronico;
        await facturacionService.guardarCambiosNotaCreditoDebito(
          idDocumentoElectronicoNota,
          construirPayloadEditarNotaCreditoDebito(detalle, datos),
        );
      } else {
        if (!clienteNotaCreditoDebito || detalle.productos.length === 0) return;

        idDocumentoElectronicoNota =
          await facturacionService.guardarBorradorNotaCreditoDebito(
            construirPayloadNotaCreditoDebito(detalle, datos, clienteNotaCreditoDebito),
          );
      }

      await facturacionService.emitir(idDocumentoElectronicoNota);
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

  const obtenerValorUnitario = (producto: EntradaProductoFactura) =>
    valoresUnitarios?.[String(producto.idProductoFactura)] ??
    producto.valorUnitario;

  const obtenerPrecioUnitario = (producto: EntradaProductoFactura) => {
    const claveProducto = String(producto.idProductoFactura);

    return calcularPrecioUnitarioFactura(
      obtenerValorUnitario(producto),
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
        const valorUnitario =
          valoresUnitarios?.[claveProducto] ?? producto.valorUnitario;
        const precioUnitario = calcularPrecioUnitarioFactura(
          valorUnitario,
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
      valoresUnitarios,
    ],
  );

  const validarTotalCuotas = (datos: DatosFormularioFactura) => {
    if (!detalle || esNotaCreditoDebito || datos.idFormaPago === ID_FORMA_PAGO_CONTADO) {
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

  const validarTipoCambio = (datos: DatosFormularioFactura) => {
    if (!requiereTipoCambio) {
      clearErrors("tipoCambio");
      return true;
    }

    if (!datos.tipoCambio || datos.tipoCambio <= 0) {
      setError("tipoCambio", {
        type: "custom",
        message: "El tipo de cambio es requerido",
      });
      return false;
    }

    clearErrors("tipoCambio");
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
    const descripcionesNuevas = Object.fromEntries(
      productosNuevos.map((producto) => [
        String(producto.idProductoFactura),
        producto.descripcion,
      ]),
    );
    const valoresUnitariosNuevos = Object.fromEntries(
      productosNuevos.map((producto) => [
        String(producto.idProductoFactura),
        producto.valorUnitario,
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
    setValue("descripciones", {
      ...getValues("descripciones"),
      ...descripcionesNuevas,
    });
    setValue("valoresUnitarios", {
      ...getValues("valoresUnitarios"),
      ...valoresUnitariosNuevos,
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
    unregister(`descripciones.${producto.idProductoFactura}`);
    unregister(`valoresUnitarios.${producto.idProductoFactura}`);
    unregister(`codigosProducto.${producto.idProductoFactura}`);
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

  const actualizarCamposExtra = (camposExtra: CampoExtraLineaFactura[]) => {
    setDetalle((actual) => (actual ? { ...actual, camposExtra } : actual));
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
    actualizarCamposExtra,
    cancelarEdicionDescuento,
    cancelarEdicionIgv,
    confirmarFormulario: (alConfirmar: () => void) =>
      formulario.handleSubmit((datos) => {
        const cuotasValidas = validarTotalCuotas(datos);
        const tipoCambioValido = validarTipoCambio(datos);
        if (cuotasValidas && tipoCambioValido) alConfirmar();
      }),
    detalle,
    erroresFormulario: formulario.formState.errors,
    envioIntentado: formulario.formState.isSubmitted,
    afectacionIgvPredeterminadaDescripcion:
      opcionAfectacionIgvPredeterminada
        ? obtenerEtiquetaPrincipalSecundaria(opcionAfectacionIgvPredeterminada)
        : "",
    emitirFactura: formulario.handleSubmit((datos) => {
      if (esNotaCreditoDebito) {
        return emitirNotaCreditoDebitoMutation.mutateAsync(datos);
      }
      if (!validarTotalCuotas(datos) || !validarTipoCambio(datos)) return Promise.resolve();
      return emitirFacturaMutation.mutateAsync(datos);
    }),
    emitirFacturaMutation: esNotaCreditoDebito
      ? emitirNotaCreditoDebitoMutation
      : emitirFacturaMutation,
    cargandoClienteNotaCreditoDebito:
      esCreacionNotaCreditoDebito && !clienteNotaCreditoDebito,
    requiereSeleccionProducto:
      esCreacionNotaCreditoDebito && (detalle?.productos.length ?? 0) === 0,
    guardarFactura: formulario.handleSubmit((datos) => {
      if (esNotaCreditoDebito) {
        return guardarNotaCreditoDebitoMutation.mutateAsync(datos);
      }
      if (!validarTotalCuotas(datos) || !validarTipoCambio(datos)) return Promise.resolve();
      return guardarFacturaMutation.mutateAsync(datos);
    }),
    guardarFacturaMutation: esNotaCreditoDebito
      ? guardarNotaCreditoDebitoMutation
      : guardarFacturaMutation,
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
    opcionesMotivo,
    opcionesTipoDocumento,
    opcionesCodigoNota,
    obtenerOpcionesCodigoDisponibles,
    agregarCodigoPersonalizadoNota,
    seleccionarCodigoProducto,
    agregarLineaNota,
    quitarCuota,
    quitarProducto,
    requiereTipoCambio,
    descripciones,
    codigosProducto,
    esNotaCreditoDebito,
    registrarDescripcion: formulario.register,
    registrarDescuento: formulario.register,
    registrarPorcentajeIgv: formulario.register,
    registrarTipoCambio: formulario.register,
    registrarValorUnitario: formulario.register,

    seleccionarAfectacionIgv,
    seleccionarUnidadMedida,
    seleccionarMotivo: (valor: number) =>
      setValue("idMotivoMaestro", valor, {
        shouldDirty: true,
        shouldValidate: true,
      }),
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
    simboloSoles,
    valoresMaestros: {
      idFormaPago,
      idMonedaMaestro,
      idMotivoMaestro,
      idTipoDocumentoMaestro,
      idTipoOperacionMaestro,
    },
    totalFactura,
    simboloMoneda,
    unidadesMedida,
    valoresUnitarios,
  };
}
