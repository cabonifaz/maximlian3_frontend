import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { EntradaCuotaFactura } from "@maximilian/shared/types/facturacion.type";

interface CustomModalCuotaFacturaProps {
  abierto: boolean;
  numeroCuota: number;
  onCerrar: () => void;
  onAgregar: (cuota: EntradaCuotaFactura) => void;
}

export function CustomModalCuotaFactura({
  abierto,
  numeroCuota,
  onCerrar,
  onAgregar,
}: CustomModalCuotaFacturaProps) {
  const [moneda, setMoneda] = useState("Soles");
  const [monto, setMonto] = useState("0.00");
  const [vencimiento, setVencimiento] = useState("");
  const [estado, setEstado] = useState<EntradaCuotaFactura["estado"]>("pendiente");

  if (!abierto) return null;

  const agregarCuota = () => {
    onAgregar({
      idCuotaFactura: Date.now(),
      numeroCuota,
      moneda,
      monto: Number(monto) || 0,
      vencimiento,
      estado,
    });
    setMoneda("Soles");
    setMonto("0.00");
    setVencimiento("");
    setEstado("pendiente");
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
          <h2 className="text-lg font-bold text-brand-black">Nueva cuota</h2>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar cuota">
            <X size={18} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="grid gap-5 px-8 py-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-700">Moneda</p>
            <select
              value={moneda}
              onChange={(event) => setMoneda(event.target.value)}
              className="w-full border-b border-slate-200 bg-white py-2 text-sm text-slate-600 outline-none"
            >
              <option>Soles</option>
              <option>Dolares</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-700">Monto</p>
            <input
              value={monto}
              onChange={(event) => setMonto(event.target.value)}
              inputMode="decimal"
              className="w-full border-b border-slate-200 py-2 text-sm text-slate-600 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-700">Fecha Vencimiento</p>
            <input
              type="date"
              value={vencimiento}
              onChange={(event) => setVencimiento(event.target.value)}
              className="w-full border-b border-slate-200 py-2 text-sm text-slate-600 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-700">Estado</p>
            <div className="relative">
              <select
                value={estado}
                onChange={(event) => setEstado(event.target.value as EntradaCuotaFactura["estado"])}
                className="w-full appearance-none border-b border-slate-200 bg-white py-2 pr-8 text-sm text-slate-600 outline-none"
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-8 py-5">
          <CustomButton variant="primary" size="compact" onClick={agregarCuota}>
            Agregar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
