import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Plus, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import { CustomModalCuotaFactura } from "@maximilian/components/coordinador/CustomModalCuotaFactura";
import { CustomModalProductosFactura } from "@maximilian/components/coordinador/CustomModalProductosFactura";
import type {
  DetalleFactura,
  EntradaCuotaFactura,
  EntradaProductoFacturable,
  EntradaProductoFactura,
} from "@maximilian/shared/types/facturacion.type";

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
  const [detalle, setDetalle] = useState<DetalleFactura | null>(factura);
  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);
  const [modalCuotaAbierto, setModalCuotaAbierto] = useState(false);
  const [confirmacionSunatAbierta, setConfirmacionSunatAbierta] = useState(false);

  const soloLectura = modo === "detalle";

  useEffect(() => {
    setDetalle(factura);
  }, [factura]);

  const totalFactura = useMemo(
    () => detalle?.productos.reduce((total, producto) => total + producto.total, 0) ?? 0,
    [detalle?.productos],
  );

  if (!abierto || !detalle) return null;

  const agregarProductos = (productos: EntradaProductoFacturable[]) => {
    setDetalle((actual) => {
      if (!actual) return actual;
      const productosNuevos = productos.map(crearProductoFactura);
      return {
        ...actual,
        productos: [...actual.productos, ...productosNuevos],
      };
    });
    setModalProductosAbierto(false);
  };

  const agregarCuota = (cuota: EntradaCuotaFactura) => {
    setDetalle((actual) => actual ? { ...actual, cuotas: [...actual.cuotas, cuota] } : actual);
    setModalCuotaAbierto(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
        <div className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
            <h2 className="text-lg font-bold text-brand-black">
              {soloLectura ? "Detalle de Factura" : "Agregar Factura"}
            </h2>
            <CustomButton variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar factura">
              <X size={18} className="text-slate-400" />
            </CustomButton>
          </div>

          <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-8 py-6">
            <div className="grid gap-x-12 gap-y-5 md:grid-cols-2">
              <CampoFactura etiqueta="Cliente" valor={detalle.cliente} soloLectura={soloLectura} />
              <CampoFactura etiqueta="NI" valor={detalle.ni} soloLectura={soloLectura} />
              <CampoFactura etiqueta="OC/OS" valor={detalle.ordenCompra} soloLectura={soloLectura} />
              <CampoFactura etiqueta="Emision" valor={detalle.fechaEmision} soloLectura={soloLectura} />
              <CampoFactura etiqueta="Vencimiento" valor={detalle.fechaVencimiento} soloLectura={soloLectura} />
            </div>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wide text-brand-black">Productos/Servicios</h3>
                {!soloLectura ? (
                  <CustomButton variant="secondary" size="sm" onClick={() => setModalProductosAbierto(true)}>
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
                      <th className="px-4 py-3">Descripcion</th>
                      <th className="px-4 py-3 text-center">Dscto. %</th>
                      <th className="px-4 py-3 text-right">Valor U.</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      {!soloLectura ? <th className="w-10 px-4 py-3" /> : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.productos.map((producto) => (
                      <tr key={producto.idProductoFactura}>
                        <td className="px-4 py-3 text-slate-600">{producto.cantidad}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{producto.descripcion}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{producto.descuentoPorcentaje.toFixed(2)}%</td>
                        <td className="px-4 py-3 text-right text-slate-600">{formatearMonto(producto.valorUnitario)}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">{formatearMonto(producto.total)}</td>
                        {!soloLectura ? (
                          <td className="px-4 py-3 text-right text-slate-400">
                            <MoreHorizontal size={16} />
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wide text-brand-black">Cuotas</h3>
                {!soloLectura ? (
                  <CustomButton variant="secondary" size="sm" onClick={() => setModalCuotaAbierto(true)}>
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
                            <MoreHorizontal size={16} />
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-8 py-5">
            {soloLectura ? (
              <CustomButton variant="secondary" size="compact" onClick={onCerrar}>
                Cerrar
              </CustomButton>
            ) : (
              <>
                <CustomButton variant="secondary" size="compact" onClick={onCerrar}>
                  Guardar
                </CustomButton>
                <CustomButton variant="primary" size="compact" onClick={() => setConfirmacionSunatAbierta(true)}>
                  Confirmar con SUNAT
                </CustomButton>
              </>
            )}
          </div>
        </div>
      </div>

      <CustomModalProductosFactura
        abierto={modalProductosAbierto}
        productos={productosFacturables}
        onCerrar={() => setModalProductosAbierto(false)}
        onConfirmar={agregarProductos}
      />
      <CustomModalCuotaFactura
        abierto={modalCuotaAbierto}
        numeroCuota={detalle.cuotas.length + 1}
        onCerrar={() => setModalCuotaAbierto(false)}
        onAgregar={agregarCuota}
      />
      <CustomModalConfirmacionAccion
        isOpen={confirmacionSunatAbierta}
        onClose={() => setConfirmacionSunatAbierta(false)}
        onConfirm={() => {
          setConfirmacionSunatAbierta(false);
          onCerrar();
        }}
        title="Confirmar emision"
        descripcion="Esta a punto de emitir la factura a SUNAT, ¿Desea continuar el proceso?"
        textoConfirmar="Si"
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
}: {
  etiqueta: string;
  valor: string;
  soloLectura: boolean;
}) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs font-bold text-slate-700">{etiqueta}</span>
      <input
        value={valor}
        readOnly={soloLectura}
        onChange={() => undefined}
        className={`w-full border-b border-slate-200 py-2 text-sm outline-none ${
          soloLectura ? "bg-white text-slate-600" : "text-slate-700 focus:border-brand-wine"
        }`}
      />
    </label>
  );
}
