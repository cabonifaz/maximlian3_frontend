import { useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import {
  esquemaCuotaFactura,
  type DatosFormularioCuotaFactura,
} from "@maximilian/schemas";
import type { EntradaCuotaFactura } from "@maximilian/shared/types/facturacion.type";

interface CustomModalCuotaFacturaProps {
  abierto: boolean;
  numeroCuota: number;
  cuota?: EntradaCuotaFactura | null;
  onCerrar: () => void;
  onGuardar: (cuota: EntradaCuotaFactura) => void;
}

function obtenerValoresIniciales(cuota?: EntradaCuotaFactura | null): DatosFormularioCuotaFactura {
  return {
    moneda: cuota?.moneda ?? "Soles",
    monto: cuota?.monto ?? 0,
    vencimiento: cuota?.vencimiento ?? "",
    estado: cuota?.estado ?? "pendiente",
  };
}

export function CustomModalCuotaFactura({
  abierto,
  numeroCuota,
  cuota,
  onCerrar,
  onGuardar,
}: CustomModalCuotaFacturaProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<DatosFormularioCuotaFactura>({
    resolver: zodResolver(esquemaCuotaFactura),
    mode: "onTouched",
    defaultValues: obtenerValoresIniciales(cuota),
  });

  useEffect(() => {
    reset(obtenerValoresIniciales(cuota));
  }, [abierto, cuota, reset]);

  if (!abierto) return null;

  const cerrar = () => {
    reset(obtenerValoresIniciales(cuota));
    onCerrar();
  };

  const guardar = (datos: DatosFormularioCuotaFactura) => {
    onGuardar({
      idCuotaFactura: cuota?.idCuotaFactura ?? 0,
      numeroCuota: cuota?.numeroCuota ?? numeroCuota,
      ...datos,
    });
    reset();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit(guardar)}
        className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
          <h2 className="text-lg font-bold text-brand-black">
            {cuota ? "Editar cuota" : "Nueva cuota"}
          </h2>
          <CustomButton type="button" variant="ghost" size="icon" onClick={cerrar} aria-label="Cerrar cuota">
            <X size={18} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="grid gap-5 px-8 py-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <CustomLabel htmlFor="moneda-cuota" required>Moneda</CustomLabel>
            <div className="relative">
              <select
                id="moneda-cuota"
                {...register("moneda")}
                className={`w-full appearance-none border-b bg-white py-2 pr-8 text-sm text-slate-600 outline-none ${
                  errors.moneda ? "border-red-500" : "border-slate-200"
                }`}
              >
                <option value="Soles">Soles</option>
                <option value="Dolares">Dolares</option>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.moneda ? <p className="text-xs text-red-500">{errors.moneda.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <CustomLabel htmlFor="monto-cuota" required>Monto</CustomLabel>
            <input
              id="monto-cuota"
              {...register("monto", { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.01"
              className={`w-full border-b py-2 text-sm text-slate-600 outline-none ${
                errors.monto ? "border-red-500" : "border-slate-200"
              }`}
            />
            {errors.monto ? <p className="text-xs text-red-500">{errors.monto.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <CustomLabel htmlFor="vencimiento-cuota" required>Fecha Vencimiento</CustomLabel>
            <input
              id="vencimiento-cuota"
              {...register("vencimiento")}
              type="date"
              className={`w-full border-b py-2 text-sm text-slate-600 outline-none ${
                errors.vencimiento ? "border-red-500" : "border-slate-200"
              }`}
            />
            {errors.vencimiento ? <p className="text-xs text-red-500">{errors.vencimiento.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <CustomLabel htmlFor="estado-cuota" required>Estado</CustomLabel>
            <div className="relative">
              <select
                id="estado-cuota"
                {...register("estado")}
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
          <CustomButton type="submit" variant="primary" size="compact">
            {cuota ? "Guardar" : "Agregar"}
          </CustomButton>
        </div>
      </form>
    </div>
  );
}
