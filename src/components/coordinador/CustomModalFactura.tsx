import { useState } from "react";
import { FilePenLine, MoreHorizontal, Pencil, Plus, Save, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import { CustomSelectorFecha } from "@maximilian/components/common/CustomSelectorFecha";
import { CustomModalCuotaFactura } from "@maximilian/components/coordinador/CustomModalCuotaFactura";
import { CustomModalProductosFactura } from "@maximilian/components/coordinador/CustomModalProductosFactura";
import { useFormularioFactura } from "@maximilian/hooks/useFormularioFactura";
import type {
  DetalleFactura,
  EntradaCuotaFactura,
  EntradaProductoFacturable,
} from "@maximilian/shared/types/facturacion.type";
import { convertirTextoAFecha } from "@maximilian/shared/utils/fecha.util";

interface CustomModalFacturaProps {
  abierto: boolean;
  modo: "emitir" | "detalle";
  factura: DetalleFactura | null;
  productosFacturables: EntradaProductoFacturable[];
  onCerrar: () => void;
}

function formatearMonto(valor: number) {
  return `S/ ${valor.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  productosFacturables,
  onCerrar,
}: CustomModalFacturaProps) {
  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);
  const [configuracionModalCuota, setConfiguracionModalCuota] = useState<{
    cuota?: EntradaCuotaFactura;
  } | null>(null);
  const [confirmacionSunatAbierta, setConfirmacionSunatAbierta] = useState(false);
  const {
    agregarProductos: agregarProductosFormulario,
    actualizarCampoFactura,
    actualizarFechaFactura,
    cancelarEdicionDescuento,
    confirmarDescuentos,
    detalle,
    erroresDescuentos,
    guardarEdicionDescuento,
    guardarCuota,
    idProductoDescuentoEdicion,
    iniciarEdicionDescuento,
    obtenerTotalProducto,
    registrarDescuento,
    totalFactura,
  } = useFormularioFactura(factura);

  const soloLectura = modo === "detalle";

  if (!abierto || !detalle) return null;

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
          onSubmit={confirmarDescuentos(() => onCerrar())}
          className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/20"
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
                soloLectura={soloLectura}
                onChange={(valor) => actualizarCampoFactura("cliente", valor)}
              />
              <CampoFactura
                etiqueta="NI"
                valor={detalle.ni}
                soloLectura={soloLectura}
                onChange={(valor) => actualizarCampoFactura("ni", valor)}
              />
              <CampoFactura
                etiqueta="OC/OS"
                valor={detalle.ordenCompra}
                soloLectura={soloLectura}
                onChange={(valor) => actualizarCampoFactura("ordenCompra", valor)}
              />
              <CustomSelectorFecha
                label="Emisión"
                required
                disabled={soloLectura}
                value={convertirTextoAFecha(detalle.fechaEmision)}
                onChange={(fecha) => actualizarFechaFactura("fechaEmision", fecha)}
              />
              <CustomSelectorFecha
                label="Vencimiento"
                required
                disabled={soloLectura}
                value={convertirTextoAFecha(detalle.fechaVencimiento)}
                onChange={(fecha) => actualizarFechaFactura("fechaVencimiento", fecha)}
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
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Cantidad</th>
                      <th className="px-4 py-3">Descripción</th>
                      <th className="px-4 py-3 text-center">Dscto. %</th>
                      <th className="px-4 py-3 text-right">Valor U.</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      {!soloLectura ? <th className="w-10 px-4 py-3" /> : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.productos.map((producto) => {
                      const errorDescuento = erroresDescuentos?.[String(producto.idProductoFactura)];

                      return (
                      <tr key={producto.idProductoFactura}>
                        <td className="px-4 py-3 text-slate-600">{producto.cantidad}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{producto.descripcion}</td>
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
                                disabled={idProductoDescuentoEdicion !== null}
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
                        <td className="px-4 py-3 text-right text-slate-600">{formatearMonto(producto.valorUnitario)}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          {formatearMonto(soloLectura ? producto.total : obtenerTotalProducto(producto))}
                        </td>
                        {!soloLectura ? (
                          <td className="px-4 py-3 text-right text-slate-400">
                            <MoreHorizontal size={16} />
                          </td>
                        ) : null}
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

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
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Nro. Cuota</th>
                      <th className="px-4 py-3 text-right">Monto</th>
                      <th className="px-4 py-3 text-center">Venc.</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                      {!soloLectura ? <th className="w-10 px-4 py-3" /> : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.cuotas.map((cuota) => (
                      <tr key={cuota.idCuotaFactura}>
                        <td className="px-4 py-3 text-slate-600">{cuota.numeroCuota}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">{formatearMonto(cuota.monto)}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{cuota.vencimiento}</td>
                        <td className="px-4 py-3 text-center"><EstadoCuotaBadge estado={cuota.estado} /></td>
                        {!soloLectura ? (
                          <td className="px-4 py-3 text-right text-slate-400">
                            <CustomButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="ml-auto h-7 w-7"
                              onClick={() => setConfiguracionModalCuota({ cuota })}
                              aria-label={`Editar cuota ${cuota.numeroCuota}`}
                            >
                              <Pencil size={14} />
                            </CustomButton>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-8 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total de la factura</p>
              <p className="text-lg font-black text-brand-black">{formatearMonto(totalFactura)}</p>
            </div>
            <div className="flex items-center gap-3">
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
                  disabled={idProductoDescuentoEdicion !== null}
                >
                  Guardar
                </CustomButton>
                <CustomButton
                  type="button"
                  variant="primary"
                  size="compact"
                  onClick={confirmarDescuentos(() => setConfirmacionSunatAbierta(true))}
                  disabled={idProductoDescuentoEdicion !== null}
                >
                  Confirmar con SUNAT
                </CustomButton>
              </>
            )}
            </div>
          </div>
        </form>
      </div>

      <CustomModalProductosFactura
        abierto={modalProductosAbierto}
        productos={productosFacturables}
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
      <CustomModalConfirmacionAccion
        isOpen={confirmacionSunatAbierta}
        onClose={() => setConfirmacionSunatAbierta(false)}
        onConfirm={() => {
          setConfirmacionSunatAbierta(false);
          onCerrar();
        }}
        title="Confirmar emisión"
        descripcion="Está a punto de emitir la factura a SUNAT. ¿Desea continuar el proceso?"
        textoConfirmar="Sí"
        textoCargandoConfirmar="Confirmando..."
        varianteConfirmar="primary"
        anchoMaximoClassName="max-w-sm"
        zIndexClassName="z-[95]"
      >
        <p className="text-sm text-slate-700">Total: {formatearMonto(totalFactura)}</p>
      </CustomModalConfirmacionAccion>
    </>
  );
}

function CampoFactura({
  etiqueta,
  valor,
  soloLectura,
  onChange,
}: {
  etiqueta: string;
  valor: string;
  soloLectura: boolean;
  onChange: (valor: string) => void;
}) {
  const idCampo = `factura-${etiqueta.toLowerCase().replaceAll("/", "-")}`;

  return (
    <div className="space-y-1.5">
      <CustomLabel htmlFor={idCampo} required>{etiqueta}</CustomLabel>
      <input
        id={idCampo}
        value={valor}
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
