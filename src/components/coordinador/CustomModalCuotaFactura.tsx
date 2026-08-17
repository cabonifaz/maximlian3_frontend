import { useEffect } from "react";
import { WalletCards, X } from "lucide-react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { CustomSelectorFecha } from "@maximilian/components/common/CustomSelectorFecha";
import {
  esquemaCuotaFactura,
  type DatosFormularioCuotaFactura,
} from "@maximilian/schemas";
import {
  ID_ESTADO_CUOTA_PAGADO,
  ID_ESTADO_CUOTA_PENDIENTE,
  OPCIONES_ESTADO_CUOTA,
} from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type { EntradaCuotaFactura } from "@maximilian/shared/types/facturacion.type";
import { convertirTextoAFecha, formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";

const resolverCuotaFactura: Resolver<DatosFormularioCuotaFactura> = async (...args) => {
  const resultado = await zodResolver(esquemaCuotaFactura)(...args);
  const [datos] = args;

  if (datos.estado === "pagado" && !datos.fechaPago) {
    resultado.errors = {
      ...resultado.errors,
      fechaPago: { type: "custom", message: "La fecha de pago es requerida" },
    };
  }

  return resultado;
};

interface CustomModalCuotaFacturaProps {
  abierto: boolean;
  numeroCuota: number;
  idMoneda: number;
  simboloMoneda: string;
  cuota?: EntradaCuotaFactura | null;
  soloEstado?: boolean;
  guardando?: boolean;
  onCerrar: () => void;
  onGuardar: (cuota: EntradaCuotaFactura) => void;
}

function obtenerValoresIniciales(
  idMoneda: number,
  cuota?: EntradaCuotaFactura | null,
): DatosFormularioCuotaFactura {
  return {
    idMoneda: cuota?.idMoneda ?? idMoneda,
    monto: cuota?.monto ?? 0,
    vencimiento: convertirTextoAFecha(cuota?.vencimiento ?? ""),
    estado: cuota?.estado ?? "pendiente",
    fechaPago: convertirTextoAFecha(cuota?.fechaPago ?? ""),
  } as DatosFormularioCuotaFactura;
}

export function CustomModalCuotaFactura({
  abierto,
  numeroCuota,
  idMoneda,
  simboloMoneda,
  cuota,
  soloEstado = false,
  guardando = false,
  onCerrar,
  onGuardar,
}: CustomModalCuotaFacturaProps) {
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<DatosFormularioCuotaFactura>({
    resolver: resolverCuotaFactura,
    mode: "onTouched",
    defaultValues: obtenerValoresIniciales(idMoneda, cuota),
  });
  const vencimiento = useWatch({ control, name: "vencimiento" });
  const estado = useWatch({ control, name: "estado" });
  const fechaPago = useWatch({ control, name: "fechaPago" });

  useEffect(() => {
    reset(obtenerValoresIniciales(idMoneda, cuota));
  }, [abierto, cuota, idMoneda, reset]);

  useEffect(() => {
    if (estado === "pagado") return;

    setValue("fechaPago", undefined);
    clearErrors("fechaPago");
  }, [clearErrors, estado, setValue]);

  if (!abierto) return null;

  const cerrar = () => {
    reset(obtenerValoresIniciales(idMoneda, cuota));
    onCerrar();
  };

  const guardar = (datos: DatosFormularioCuotaFactura) => {
    onGuardar({
      idCuotaFactura: cuota?.idCuotaFactura ?? 0,
      idCuotaDocumentoElectronico:
        cuota?.idCuotaDocumentoElectronico ?? 0,
      numeroCuota: cuota?.numeroCuota ?? numeroCuota,
      ...datos,
      vencimiento: formatearFechaIsoLocal(datos.vencimiento),
      fechaPago:
        datos.estado === "pagado" && datos.fechaPago
          ? datos.fechaPago.toISOString()
          : null,
    });
    reset();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit(guardar)}
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/25"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-brand-wine/5 px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <WalletCards size={19} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-black">
                {soloEstado ? "Actualizar estado de cuota" : cuota ? "Editar cuota" : "Nueva cuota"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {soloEstado
                  ? "Marca esta cuota como pagada o pendiente."
                  : cuota
                    ? "Actualiza las condiciones de esta cuota."
                    : "Define el monto y la fecha de vencimiento."}
              </p>
            </div>
          </div>
          <CustomButton type="button" variant="ghost" size="icon" onClick={cerrar} aria-label="Cerrar cuota">
            <X size={18} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="grid gap-5 bg-slate-50/60 px-7 py-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <CustomLabel htmlFor="monto-cuota" required>Monto</CustomLabel>
            <div
              className={`flex items-center gap-2 rounded-xl border bg-brand-white px-4 transition-all ${
                soloEstado
                  ? "cursor-not-allowed bg-slate-50"
                  : "focus-within:border-brand-wine focus-within:ring-4 focus-within:ring-brand-wine/10"
              } ${errors.monto ? "border-red-500" : "border-gray-200"}`}
            >
              <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-slate-500">
                {simboloMoneda || "?"}
              </span>
              <input
                id="monto-cuota"
                {...register("monto", { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                readOnly={soloEstado}
                className={`w-full border-0 bg-transparent py-2.5 text-sm outline-none ${
                  soloEstado ? "cursor-not-allowed text-slate-500" : "text-slate-700"
                }`}
              />
            </div>
            {errors.monto ? <p className="text-xs text-red-500">{errors.monto.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <CustomSelectorFecha
              label="Fecha Vencimiento"
              required
              value={vencimiento}
              disabled={soloEstado}
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
              value={estado === "pagado" ? ID_ESTADO_CUOTA_PAGADO : ID_ESTADO_CUOTA_PENDIENTE}
              onChange={(valor) => setValue(
                "estado",
                valor === ID_ESTADO_CUOTA_PAGADO ? "pagado" : "pendiente",
                { shouldDirty: true, shouldValidate: true },
              )}
              placeholder="Seleccione un estado"
              dropdownZIndexClassName="z-[111]"
              overlayZIndexClassName="z-[110]"
            />
          </div>

          {estado === "pagado" ? (
            <div className="space-y-1.5">
              <CustomSelectorFecha
                label="Fecha de pago"
                required
                value={fechaPago}
                onChange={(fecha) => setValue("fechaPago", fecha as Date, {
                  shouldDirty: true,
                  shouldValidate: true,
                })}
                error={errors.fechaPago?.message}
              />
            </div>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-white px-7 py-4">
          <CustomButton
            type="submit"
            variant="primary"
            size="compact"
            loading={guardando}
            loadingText="Guardando..."
          >
            {cuota ? "Guardar" : "Agregar"}
          </CustomButton>
        </div>
      </form>
    </div>
  );
}
