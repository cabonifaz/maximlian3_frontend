import { useState } from "react";
import { CircleX, FilePenLine, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { CustomModalCuotaFactura } from "@maximilian/components/coordinador/CustomModalCuotaFactura";
import { CustomListaCamposExtraFactura } from "@maximilian/components/coordinador/CustomListaCamposExtraFactura";
import { CustomModalAnularFactura } from "@maximilian/components/coordinador/CustomModalAnularFactura";
import { CustomModalProductosFactura } from "@maximilian/components/coordinador/CustomModalProductosFactura";
import { useFormularioFactura } from "@maximilian/hooks/useFormularioFactura";
import type {
  DetalleFactura,
  EntradaCuotaFactura,
  EntradaProductoFacturable,
} from "@maximilian/shared/types/facturacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { formatearMontoConSimbolo } from "@maximilian/shared/utils/formato-monto.util";
import {
  obtenerEtiquetaPrincipalSecundaria,
  obtenerSimboloTablaMaestra,
} from "@maximilian/shared/utils/tabla-maestra.util";
import {
  ID_ESTADO_FACTURA_APROBADA,
  ID_FORMA_PAGO_CONTADO,
} from "@maximilian/shared/constants/components/coordinador/facturacion.constants";

interface CustomModalFacturaProps {
  abierto: boolean;
  modo: "emitir" | "detalle";
  factura: DetalleFactura | null;
  productosIniciales?: EntradaProductoFacturable[];
  abrirAnulacionInicial?: boolean;
  onCerrar: () => void;
}

function EstadoCuotaBadge({ estado }: { estado: EntradaCuotaFactura["estado"] }) {
  const clase = estado === "pagado" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600";
  const texto = estado === "pagado" ? "Pagado" : "Pendiente";

  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${clase}`}>{texto}</span>;
}

export function CustomModalFactura({
  abierto,
  modo,
  factura,
  productosIniciales = [],
  abrirAnulacionInicial = false,
  onCerrar,
}: CustomModalFacturaProps) {
  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);
  const [configuracionModalCuota, setConfiguracionModalCuota] = useState<{
    cuota?: EntradaCuotaFactura;
  } | null>(null);
  const [confirmacionSunatAbierta, setConfirmacionSunatAbierta] = useState(false);
  const [confirmacionAnulacionAbierta, setConfirmacionAnulacionAbierta] =
    useState(abrirAnulacionInicial);
  const {
    afectacionIgvPredeterminadaDescripcion,
    afectacionesIgv,
    agregarProductos: agregarProductosFormulario,
    anularFactura,
    anularFacturaMutation,
    actualizarCampoFactura,
    actualizarCamposExtra,
    cancelarEdicionDescuento,
    cancelarEdicionIgv,
    confirmarFormulario,
    detalle,
    emitirFactura,
    emitirFacturaMutation,
    erroresFormulario,
    guardarFactura,
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
    registrarDescripcion,
    registrarDescuento,
    registrarPorcentajeIgv,
    registrarTipoCambio,
    requiereTipoCambio,

    seleccionarAfectacionIgv,
    seleccionarUnidadMedida,
    seleccionarFormaPago,
    seleccionarMoneda,
    seleccionarTipoDocumento,
    seleccionarTipoOperacion,
    simboloMoneda,
    simboloSoles,
    totalFactura,
    unidadesMedida,
    valoresMaestros,
  } = useFormularioFactura(factura, onCerrar, productosIniciales);

  const soloLectura = modo === "detalle";

  if (!abierto || !detalle) return null;

  const puedeAnularFactura =
    detalle.codigoEstadoFacturacion === ID_ESTADO_FACTURA_APROBADA;

  const agregarProductos = (productos: EntradaProductoFacturable[]) => {
    agregarProductosFormulario(productos);
    setModalProductosAbierto(false);
  };

  const guardarCuotaFactura = (cuota: EntradaCuotaFactura) => {
    guardarCuota(cuota);
    setConfiguracionModalCuota(null);
  };

  const abrirProductosFacturables = () => {
    setModalProductosAbierto(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
        <form
          onSubmit={guardarFactura}
          className="flex max-h-[92dvh] w-full max-w-[95vw] flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/20"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-brand-wine/5 px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
                <FilePenLine size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-black">
                  {soloLectura
                    ? "Detalle de Factura"
                    : detalle.idFactura
                      ? "Editar Factura"
                      : "Emitir Factura"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {soloLectura
                    ? "Consulta los productos, descuentos y cuotas registradas."
                    : "Completa la información y revisa los importes antes de confirmar."}
                </p>
              </div>
            </div>
            <CustomButton variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar factura">
              <X size={18} className="text-slate-400" />
            </CustomButton>
          </div>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-slate-50/60 px-8 py-6">
            <div className="grid gap-x-8 gap-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
              <CampoFactura
                etiqueta="Cliente"
                valor={detalle.cliente}
                soloLectura={
                  soloLectura || detalle.idDocumentoElectronico !== null
                }
                onChange={(valor) => actualizarCampoFactura("cliente", valor)}
              />
              <CampoFactura
                etiqueta="NI"
                valor={detalle.ni}
                soloLectura
                onChange={(valor) => actualizarCampoFactura("ni", valor)}
              />
              <CustomSelectorBuscable
                label="Tipo de comprobante"
                required
                options={opcionesTipoDocumento}
                value={valoresMaestros.idTipoDocumentoMaestro || undefined}
                onChange={seleccionarTipoDocumento}
                autoSeleccionarOpcionUnica={!soloLectura}
                obtenerEtiquetaOpcion={(opcion) => [opcion.string1, opcion.string2]
                  .filter(Boolean)
                  .join(" - ")}
                displayValue={detalle.tipoDocumentoDescripcion}
                disabled={
                  soloLectura || detalle.idDocumentoElectronico !== null
                }
                error={erroresFormulario.idTipoDocumentoMaestro?.message}
              />
              <CustomSelectorBuscable
                label="Tipo de operación"
                required
                idMaster={TablaMaestraId.TIPO_OPERACION_SUNAT}
                value={valoresMaestros.idTipoOperacionMaestro || undefined}
                onChange={seleccionarTipoOperacion}
                obtenerEtiquetaOpcion={(opcion) => [opcion.string1, opcion.string2]
                  .filter(Boolean)
                  .join(" - ")}
                displayValue={detalle.tipoOperacionDescripcion}
                disabled={soloLectura}
                error={erroresFormulario.idTipoOperacionMaestro?.message}
              />
              <CustomSelectorBuscable
                label="Moneda"
                required
                options={opcionesMoneda}
                value={valoresMaestros.idMonedaMaestro || undefined}
                onChange={seleccionarMoneda}
                obtenerEtiquetaOpcion={obtenerEtiquetaPrincipalSecundaria}
                displayValue={detalle.monedaDescripcion}
                disabled={soloLectura}
                error={erroresFormulario.idMonedaMaestro?.message}
              />
              {requiereTipoCambio ? (
                <div className="space-y-1.5">
                  <CustomLabel htmlFor="factura-tipo-cambio" required>
                    Tipo de cambio
                  </CustomLabel>
                  <div
                    className={`flex items-center gap-2 rounded-xl border bg-brand-white px-4 transition-all ${
                      soloLectura
                        ? "cursor-not-allowed bg-slate-50"
                        : "focus-within:border-brand-wine focus-within:ring-4 focus-within:ring-brand-wine/10"
                    } ${erroresFormulario.tipoCambio ? "border-red-500" : "border-gray-200"}`}
                  >
                    <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-slate-500">
                      {simboloMoneda || "?"} 1 = {simboloSoles || "?"}
                    </span>
                    <input
                      id="factura-tipo-cambio"
                      type="number"
                      min="0"
                      step="0.001"
                      readOnly={soloLectura}
                      {...registrarTipoCambio("tipoCambio", { valueAsNumber: true })}
                      className={`w-full border-0 bg-transparent py-2.5 text-sm outline-none ${
                        soloLectura ? "cursor-not-allowed text-slate-500" : "text-slate-700"
                      }`}
                    />
                  </div>
                  {erroresFormulario.tipoCambio ? (
                    <p className="text-xs font-medium text-red-500">
                      {erroresFormulario.tipoCambio.message}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <CustomSelectorBuscable
                label="Forma de pago"
                required
                idMaster={TablaMaestraId.FORMA_PAGO_SUNAT}
                value={valoresMaestros.idFormaPago || undefined}
                onChange={seleccionarFormaPago}
                displayValue={detalle.formaPagoDescripcion}
                disabled={soloLectura}
                error={erroresFormulario.idFormaPago?.message}
              />
              <CampoFactura
                etiqueta="Emisión"
                valor={detalle.fechaEmision}
                soloLectura
                onChange={() => undefined}
              />
              <CustomListaCamposExtraFactura
                camposExtra={detalle.camposExtra}
                soloLectura={soloLectura}
                onChange={actualizarCamposExtra}
              />
            </div>

            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-brand-black">Productos y servicios</h3>
                  <p className="mt-0.5 text-xs text-slate-400">Detalle de conceptos incluidos en la factura.</p>
                </div>
                {!soloLectura ? (
                  <CustomButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={abrirProductosFacturables}
                  >
                    <Plus size={14} />
                    Agregar productos
                  </CustomButton>
                ) : null}
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[1400px] text-center text-sm">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-center">Cantidad</th>
                      <th className="px-4 py-3 text-center">Descripción</th>
                      <th className="w-48 min-w-48 max-w-48 px-4 py-3 text-center">Unidad de medida</th>
                      <th className="px-4 py-3 text-center">Dscto. %</th>
                      <th className="px-4 py-3 text-center">Valor U.</th>
                      <th className="px-4 py-3 text-center">Precio U.</th>
                      <th className="w-48 min-w-48 max-w-48 px-4 py-3 text-center">Afectacion IGV</th>
                      <th className="px-4 py-3 text-center">IGV %</th>
                      <th className="px-4 py-3 text-center">Total</th>
                      {!soloLectura ? <th className="px-4 py-3 text-center">Acciones</th> : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.productos.map((producto) => {
                      const claveProducto = String(producto.idProductoFactura);
                      const errorDescuento = erroresFormulario.descuentos?.[claveProducto];

                      const errorPorcentajeIgv = erroresFormulario.porcentajesIgv?.[claveProducto];
                      const errorAfectacionIgv = erroresFormulario.afectacionesIgv?.[claveProducto];
                      const errorUnidadMedida = erroresFormulario.unidadesMedida?.[claveProducto];
                      const errorDescripcion = erroresFormulario.descripciones?.[claveProducto];

                      return (
                      <tr key={producto.idProductoFactura}>
                        <td className="px-4 py-3 text-center text-slate-600">{producto.cantidad}</td>
                        <td className="px-4 py-3 text-left">
                          {soloLectura ? (
                            <span className="font-medium text-slate-700">
                              {producto.descripcion}
                            </span>
                          ) : (
                            <>
                              <input
                                {...registrarDescripcion(
                                  `descripciones.${producto.idProductoFactura}`,
                                )}
                                aria-label={`Descripción de ${producto.descripcion}`}
                                className={`w-full rounded-md border px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-brand-wine ${
                                  errorDescripcion ? "border-red-500" : "border-slate-200"
                                }`}
                              />
                              {errorDescripcion ? (
                                <p className="mt-1 text-left text-[10px] text-red-500">
                                  {errorDescripcion.message}
                                </p>
                              ) : null}
                            </>
                          )}
                        </td>
                        <td className="w-48 min-w-48 max-w-48 px-4 py-3">
                          {soloLectura ? (
                            <span className="text-slate-600">
                              {producto.unidadMedidaDescripcion
                                || producto.idUnidadMedidaMaestro}
                            </span>
                          ) : (
                            <CustomSelectorBuscable
                              idMaster={TablaMaestraId.UNIDAD_MEDIDA_SUNAT}
                              value={unidadesMedida?.[claveProducto] || undefined}
                              displayValue={producto.unidadMedidaDescripcion}
                              onChange={(valor) =>
                                seleccionarUnidadMedida(
                                  producto.idProductoFactura,
                                  valor,
                                )}
                              placeholder="Seleccione unidad"
                              required
                              ordenarPorNum1
                              obtenerEtiquetaOpcion={(opcion) =>
                                [opcion.string1, opcion.string2]
                                  .filter(Boolean)
                                  .join(" - ")}
                              error={errorUnidadMedida?.message}
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {soloLectura ? (
                            `${producto.descuentoPorcentaje}%`
                          ) : idProductoDescuentoEdicion !== producto.idProductoFactura ? (
                            <div className="flex items-center justify-center gap-1">
                              <span>{producto.descuentoPorcentaje}%</span>
                              <CustomButton
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => iniciarEdicionDescuento(producto)}
                                disabled={hayEdicionProductoPendiente}
                                aria-label={`Editar descuento de ${producto.descripcion}`}
                              >
                                <Pencil size={14} />
                              </CustomButton>
                            </div>
                          ) : (
                            <div className="mx-auto w-40">
                              <div className="flex items-center justify-center gap-1">
                                <div className="relative w-20">
                                  <input
                                    {...registrarDescuento(`descuentos.${producto.idProductoFactura}`, {
                                      valueAsNumber: true,
                                    })}
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    autoFocus
                                    aria-label={`Descuento de ${producto.descripcion}`}
                                    className={`w-full rounded-md border py-1.5 pl-2 pr-6 text-right text-sm outline-none focus:border-brand-wine ${
                                      errorDescuento ? "border-red-500" : "border-slate-200"
                                    }`}
                                  />
                                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                                </div>
                                <CustomButton
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-emerald-600"
                                  onClick={() => void guardarEdicionDescuento(producto)}
                                  aria-label={`Guardar descuento de ${producto.descripcion}`}
                                >
                                  <Save size={15} />
                                </CustomButton>
                                <CustomButton
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500"
                                  onClick={() => cancelarEdicionDescuento(producto)}
                                  aria-label={`Cancelar descuento de ${producto.descripcion}`}
                                >
                                  <X size={15} />
                                </CustomButton>
                              </div>
                              {errorDescuento ? (
                                <p className="mt-1 text-left text-[10px] text-red-500">
                                  {errorDescuento.message}
                                </p>
                              ) : null}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">{formatearMontoConSimbolo(producto.valorUnitario, simboloMoneda)}</td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {formatearMontoConSimbolo(obtenerPrecioUnitario(producto), simboloMoneda)}
                        </td>
                        <td className="w-48 min-w-48 max-w-48 px-4 py-3">
                          {soloLectura ? (
                            <span className="text-slate-600">
                              {producto.afectacionIgvDescripcion
                                || afectacionIgvPredeterminadaDescripcion
                                || producto.idAfectacionIgvMaestro}
                            </span>
                          ) : (
                            <CustomSelectorBuscable
                              options={opcionesAfectacionIgv}
                              value={afectacionesIgv?.[claveProducto] || undefined}
                              displayValue={producto.afectacionIgvDescripcion}
                              onChange={(valor) =>
                                seleccionarAfectacionIgv(
                                  producto.idProductoFactura,
                                  valor,
                                )}
                              placeholder="Seleccione afectacion"
                              required
                              obtenerEtiquetaOpcion={(opcion) =>
                                [opcion.string1, opcion.string2]
                                  .filter(Boolean)
                                  .join(" - ")}
                              ordenarOpciones={false}
                              error={errorAfectacionIgv?.message}
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {soloLectura ? (
                            `${producto.porcentajeIgv}%`
                          ) : idProductoIgvEdicion !== producto.idProductoFactura ? (
                            <div className="flex items-center justify-center gap-1">
                              <span>{producto.porcentajeIgv}%</span>
                              <CustomButton
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => iniciarEdicionIgv(producto)}
                                disabled={hayEdicionProductoPendiente}
                                aria-label={`Editar IGV de ${producto.descripcion}`}
                              >
                                <Pencil size={14} />
                              </CustomButton>
                            </div>
                          ) : (
                            <div className="mx-auto w-40">
                              <div className="flex items-center justify-center gap-1">
                                <div className="relative w-20">
                                  <input
                                    {...registrarPorcentajeIgv(
                                      `porcentajesIgv.${producto.idProductoFactura}`,
                                      { valueAsNumber: true },
                                    )}
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    autoFocus
                                    aria-label={`IGV de ${producto.descripcion}`}
                                    className={`w-full rounded-md border py-1.5 pl-2 pr-6 text-right text-sm outline-none focus:border-brand-wine ${
                                      errorPorcentajeIgv
                                        ? "border-red-500"
                                        : "border-slate-200"
                                    }`}
                                  />
                                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                    %
                                  </span>
                                </div>
                                <CustomButton
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-emerald-600"
                                  onClick={() => void guardarEdicionIgv(producto)}
                                  aria-label={`Guardar IGV de ${producto.descripcion}`}
                                >
                                  <Save size={15} />
                                </CustomButton>
                                <CustomButton
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500"
                                  onClick={() => cancelarEdicionIgv(producto)}
                                  aria-label={`Cancelar IGV de ${producto.descripcion}`}
                                >
                                  <X size={15} />
                                </CustomButton>
                              </div>
                              {errorPorcentajeIgv ? (
                                <p className="mt-1 text-left text-[10px] text-red-500">
                                  {errorPorcentajeIgv.message}
                                </p>
                              ) : null}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-slate-700">
                          {formatearMontoConSimbolo(soloLectura ? producto.total : obtenerTotalProducto(producto), simboloMoneda)}
                        </td>
                        {!soloLectura ? (
                          <td className="px-4 py-3 text-center">
                            <CustomButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="mx-auto h-7 w-7 text-red-500"
                              onClick={() => quitarProducto(producto)}
                              aria-label={`Quitar ${producto.descripcion} de la factura`}
                              title="Quitar de la lista"
                            >
                              <Trash2 size={14} />
                            </CustomButton>
                          </td>
                        ) : null}
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {valoresMaestros.idFormaPago !== ID_FORMA_PAGO_CONTADO ? (
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-brand-black">Cuotas</h3>
                  <p className="mt-0.5 text-xs text-slate-400">Programa y controla el vencimiento de los pagos.</p>
                </div>
                {!soloLectura ? (
                  <CustomButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfiguracionModalCuota({})}
                  >
                    <Plus size={14} />
                    Agregar cuota
                  </CustomButton>
                ) : null}
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Nro. Cuota</th>
                      <th className="px-4 py-3 text-right">Monto</th>
                      <th className="px-4 py-3 text-center">Venc.</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                      {!soloLectura ? <th className="px-4 py-3 text-center">Acciones</th> : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.cuotas.map((cuota) => (
                      <tr key={cuota.idCuotaFactura}>
                        <td className="px-4 py-3 text-slate-600">{cuota.numeroCuota}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          {formatearMontoConSimbolo(
                            cuota.monto,
                            obtenerSimboloTablaMaestra(opcionesMoneda, cuota.idMoneda),
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">{cuota.vencimiento}</td>
                        <td className="px-4 py-3 text-center"><EstadoCuotaBadge estado={cuota.estado} /></td>
                        {!soloLectura ? (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <CustomButton
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setConfiguracionModalCuota({ cuota })}
                                aria-label={`Editar cuota ${cuota.numeroCuota}`}
                                title="Editar cuota"
                              >
                                <Pencil size={14} />
                              </CustomButton>
                              <CustomButton
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500"
                                onClick={() => quitarCuota(cuota.idCuotaFactura)}
                                aria-label={`Quitar cuota ${cuota.numeroCuota}`}
                                title="Quitar de la lista"
                              >
                                <Trash2 size={14} />
                              </CustomButton>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {erroresFormulario.root?.cuotas?.message ? (
                <p className="text-xs font-medium text-red-500">
                  {erroresFormulario.root.cuotas.message}
                </p>
              ) : null}
            </section>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-8 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total de la factura</p>
              <p className="text-lg font-black text-brand-black">{formatearMontoConSimbolo(totalFactura, simboloMoneda)}</p>
            </div>
            <div className="flex items-center gap-3">
            {puedeAnularFactura ? (
              <CustomButton
                type="button"
                variant="wine"
                size="compact"
                onClick={() => setConfirmacionAnulacionAbierta(true)}
              >
                <CircleX size={14} />
                Anular factura
              </CustomButton>
            ) : null}
            {soloLectura ? (
              <CustomButton variant="secondary" size="compact" onClick={onCerrar}>
                Cerrar
              </CustomButton>
            ) : (
              <>
                <CustomButton
                  type="submit"
                  variant="secondary"
                  size="compact"
                  disabled={
                    hayEdicionProductoPendiente
                    || emitirFacturaMutation.isPending
                  }
                  loading={guardarFacturaMutation.isPending}
                  loadingText="Guardando..."
                >
                  Guardar
                </CustomButton>
                <CustomButton
                  type="button"
                  variant="primary"
                  size="compact"
                  onClick={confirmarFormulario(() => setConfirmacionSunatAbierta(true))}
                  disabled={
                    hayEdicionProductoPendiente
                    || guardarFacturaMutation.isPending
                    || emitirFacturaMutation.isPending
                  }
                >
                  Emitir Factura
                </CustomButton>
              </>
            )}
            </div>
          </div>
        </form>
      </div>

      <CustomModalProductosFactura
        abierto={modalProductosAbierto}
        idCliente={detalle.idCliente}
        idsProductosAgregados={detalle.productos.map(
          (producto) => producto.idPedido,
        )}
        onCerrar={() => setModalProductosAbierto(false)}
        onConfirmar={agregarProductos}
      />
      <CustomModalCuotaFactura
        abierto={configuracionModalCuota !== null}
        numeroCuota={detalle.cuotas.length + 1}
        cuota={configuracionModalCuota?.cuota}
        onCerrar={() => setConfiguracionModalCuota(null)}
        onGuardar={guardarCuotaFactura}
      />
      <CustomModalAnularFactura
        abierto={confirmacionAnulacionAbierta}
        cargando={anularFacturaMutation.isPending}
        onCerrar={() => setConfirmacionAnulacionAbierta(false)}
        onConfirmar={anularFactura}
      />

      <CustomModalConfirmacionAccion
        isOpen={confirmacionSunatAbierta}
        onClose={() => setConfirmacionSunatAbierta(false)}
        onConfirm={() => void emitirFactura()}
        title="Confirmar emisión"
        descripcion="Está a punto de emitir la factura a SUNAT. ¿Desea continuar el proceso?"
        isSubmitting={emitirFacturaMutation.isPending}
        textoConfirmar="Emitir"
        textoCargandoConfirmar="Emitiendo..."
        varianteConfirmar="primary"
        anchoMaximoClassName="max-w-sm"
        zIndexClassName="z-[95]"
      >
        <p className="text-sm text-slate-700">Total: {formatearMontoConSimbolo(totalFactura, simboloMoneda)}</p>
      </CustomModalConfirmacionAccion>
    </>
  );
}

function CampoFactura({
  etiqueta,
  valor,
  soloLectura,
  opcional = false,
  maxLength,
  onChange,
}: {
  etiqueta: string;
  valor: string;
  soloLectura: boolean;
  opcional?: boolean;
  maxLength?: number;
  onChange: (valor: string) => void;
}) {
  const idCampo = `factura-${etiqueta.toLowerCase().replaceAll("/", "-")}`;

  return (
    <div className="space-y-1.5">
      <CustomLabel htmlFor={idCampo} required={!opcional} optional={opcional}>
        {etiqueta}
      </CustomLabel>
      <input
        id={idCampo}
        value={valor}
        maxLength={maxLength}
        readOnly={soloLectura}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border border-gray-200 bg-brand-white px-4 py-2.5 text-sm outline-none transition-all ${
          soloLectura
            ? "cursor-not-allowed bg-slate-50 text-slate-500"
            : "text-slate-700 focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
        }`}
      />
    </div>
  );
}
