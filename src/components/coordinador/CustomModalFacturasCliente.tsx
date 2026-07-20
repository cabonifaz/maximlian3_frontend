import { useState } from "react";
import { Edit, Eye, MoreHorizontal, Plus, SlidersHorizontal, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type {
  EntradaFacturaCliente,
  EstadoFacturacion,
} from "@maximilian/shared/types/facturacion.type";

interface CustomModalFacturasClienteProps {
  abierto: boolean;
  cliente: string;
  facturas: EntradaFacturaCliente[];
  onCerrar: () => void;
  onAgregarFactura: () => void;
  onVerFactura: (factura: EntradaFacturaCliente) => void;
  onEditarFactura: (factura: EntradaFacturaCliente) => void;
}

const ESTILOS_ESTADO: Record<EstadoFacturacion, { texto: string; clase: string }> = {
  finalizado: { texto: "Finalizado", clase: "bg-emerald-100 text-emerald-600" },
  pendiente: { texto: "Pendiente", clase: "bg-orange-100 text-orange-600" },
  "en-pre-factura": { texto: "En pre-factura", clase: "bg-blue-100 text-blue-600" },
  "pre-factura-aprobada": { texto: "Pre-factura aprobada", clase: "bg-cyan-100 text-cyan-700" },
  "pre-factura-rechazada": { texto: "Pre-factura rechazada", clase: "bg-red-100 text-red-600" },
};

function EstadoFacturaBadge({ estado }: { estado: EstadoFacturacion }) {
  const configuracion = ESTILOS_ESTADO[estado];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${configuracion.clase}`}>
      {configuracion.texto}
    </span>
  );
}

export function CustomModalFacturasCliente({
  abierto,
  cliente,
  facturas,
  onCerrar,
  onAgregarFactura,
  onVerFactura,
  onEditarFactura,
}: CustomModalFacturasClienteProps) {
  const [idMenuActivo, setIdMenuActivo] = useState<number | null>(null);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-8 py-5">
          <h2 className="text-xl font-bold text-brand-black">Facturas</h2>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar facturas">
            <X size={18} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="flex items-center justify-between px-8 pb-4">
          <p className="text-sm font-bold text-slate-700">
            Cliente: <span className="font-bold">{cliente}</span>
          </p>
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-50">
              <SlidersHorizontal size={15} />
            </button>
            <CustomButton variant="secondary" size="sm">
              Estado
            </CustomButton>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-8">
          <table className="w-full text-left text-sm">
            <thead className="border-y border-slate-100 text-xs font-bold uppercase text-slate-400">
              <tr>
                <th className="px-1 py-4">ID</th>
                <th className="px-4 py-4">Investigado</th>
                <th className="px-4 py-4">Penalidad</th>
                <th className="px-4 py-4 text-center">Estado</th>
                <th className="px-1 py-4 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {facturas.map((factura) => (
                <tr key={factura.idFactura} className="hover:bg-slate-50/70">
                  <td className="px-1 py-4 text-xs font-bold text-slate-500">{factura.codigo}</td>
                  <td className="px-4 py-4 font-bold text-brand-black">{factura.investigado}</td>
                  <td className="px-4 py-4 text-slate-600">{factura.penalidad ? "Sí" : "No"}</td>
                  <td className="px-4 py-4 text-center">
                    <EstadoFacturaBadge estado={factura.estado} />
                  </td>
                  <td className="relative px-1 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setIdMenuActivo(idMenuActivo === factura.idFactura ? null : factura.idFactura)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-black"
                      aria-label={`Acciones de ${factura.codigo}`}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                    {idMenuActivo === factura.idFactura ? (
                      <div className="absolute right-0 top-11 z-10 w-44 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setIdMenuActivo(null);
                            onVerFactura(factura);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Eye size={14} />
                          Ver factura
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIdMenuActivo(null);
                            onEditarFactura(factura);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Edit size={14} />
                          Editar factura
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-8 py-5">
          <div className="flex flex-1 justify-center gap-2 text-xs">
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500">{"<"}</button>
            <button className="h-8 w-8 rounded-lg bg-brand-black font-bold text-white">1</button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500">2</button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500">3</button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500">{">"}</button>
          </div>
          <CustomButton variant="primary" size="compact" onClick={onAgregarFactura}>
            <Plus size={14} />
            Agregar factura
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
