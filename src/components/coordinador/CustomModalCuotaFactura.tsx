import { useEffect } from "react";
import { X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { CustomSelectorFecha } from "@maximilian/components/common/CustomSelectorFecha";
import {
  esquemaCuotaFactura,
  type DatosFormularioCuotaFactura,
} from "@maximilian/schemas";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import { OPCIONES_ESTADO_CUOTA } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type { EntradaCuotaFactura } from "@maximilian/shared/types/facturacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { convertirTextoAFecha, formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";

interface CustomModalCuotaFacturaProps {
  abierto: boolean;
  numeroCuota: number;
  cuota?: EntradaCuotaFactura | null;
  onCerrar: () => void;
  onGuardar: (cuota: EntradaCuotaFactura) => void;
}

function obtenerValoresIniciales(cuota?: EntradaCuotaFactura | null): DatosFormularioCuotaFactura {
  return {
    idMoneda: cuota?.idMoneda ?? 0,
    monto: cuota?.monto ?? 0,
    vencimiento: convertirTextoAFecha(cuota?.vencimiento ?? ""),
    estado: cuota?.estado ?? "pendiente",
  } as DatosFormularioCuotaFactura;
}

export function CustomModalCuotaFactura({
  abierto,
  numeroCuota,
  cuota,
  onCerrar,
  onGuardar,
}: CustomModalCuotaFacturaProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    trigger,
  } = useForm<DatosFormularioCuotaFactura>({
    resolver: zodResolver(esquemaCuotaFactura),
    mode: "onTouched",
    defaultValues: obtenerValoresIniciales(cuota),
  });
  const idMoneda = useWatch({ control, name: "idMoneda" });
  const vencimiento = useWatch({ control, name: "vencimiento" });
  const estado = useWatch({ control, name: "estado" });
  const { data: opcionesMoneda } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.MONEDA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.MONEDA),
    enabled: abierto,
    staleTime: Infinity,
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
      vencimiento: formatearFechaIsoLocal(datos.vencimiento),
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
            <CustomSelectorBuscable
              label="Moneda"
              required
              options={opcionesMoneda}
              value={idMoneda || undefined}
              onChange={(valor) => setValue("idMoneda", valor, {
                shouldDirty: true,
                shouldValidate: true,
              })}
              onBlur={() => void trigger("idMoneda")}
              error={errors.idMoneda?.message}
              placeholder="Seleccione una moneda"
              dropdownZIndexClassName="z-[111]"
              overlayZIndexClassName="z-[110]"
            />
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
            <CustomSelectorFecha
              label="Fecha Vencimiento"
              required
              value={vencimiento}
              onChange={(fecha) => setValue("vencimiento", fecha as Date, {
                shouldDirty: true,
                shouldValidate: true,
              })}
              error={errors.vencimiento?.message}
            />
          </div>

          <div className="space-y-1.5">
            <CustomSelectorBuscable
              label="Estado"
              required
              options={OPCIONES_ESTADO_CUOTA}
              value={estado === "pagado" ? 2 : 1}
              onChange={(valor) => setValue(
                "estado",
                valor === 2 ? "pagado" : "pendiente",
                { shouldDirty: true, shouldValidate: true },
              )}
              placeholder="Seleccione un estado"
              dropdownZIndexClassName="z-[111]"
              overlayZIndexClassName="z-[110]"
            />
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
