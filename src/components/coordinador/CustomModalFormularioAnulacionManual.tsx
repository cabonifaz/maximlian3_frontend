import { useEffect } from "react";
import { CircleX, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorFecha } from "@maximilian/components/common/CustomSelectorFecha";
import {
  esquemaAnulacionManualFactura,
  type DatosFormularioAnulacionManualFactura,
} from "@maximilian/schemas";
import { convertirTextoAFecha } from "@maximilian/shared/utils/fecha.util";

interface CustomModalFormularioAnulacionManualProps {
  abierto: boolean;
  cargando: boolean;
  fechaEmision?: string | null;
  numeroFactura?: string;
  onCerrar: () => void;
  onConfirmar: (datos: DatosFormularioAnulacionManualFactura) => void;
}

function obtenerValoresIniciales(
  fechaEmision?: string | null,
): DatosFormularioAnulacionManualFactura {
  return {
    fechaAnulacion: convertirTextoAFecha(fechaEmision ?? "") ?? new Date(),
    motivo: "",
  };
}

export function CustomModalFormularioAnulacionManual({
  abierto,
  cargando,
  fechaEmision,
  numeroFactura,
  onCerrar,
  onConfirmar,
}: CustomModalFormularioAnulacionManualProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<DatosFormularioAnulacionManualFactura>({
    resolver: zodResolver(esquemaAnulacionManualFactura),
    mode: "onTouched",
    defaultValues: obtenerValoresIniciales(fechaEmision),
  });
  const fechaAnulacion = useWatch({ control, name: "fechaAnulacion" });

  useEffect(() => {
    if (abierto) reset(obtenerValoresIniciales(fechaEmision));
  }, [abierto, fechaEmision, reset]);

  if (!abierto) return null;

  const cerrar = () => {
    reset(obtenerValoresIniciales(fechaEmision));
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit(onConfirmar)}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <CircleX size={19} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-black">Anular manualmente</h2>
              <p className="text-xs text-slate-500">
                {numeroFactura ? `Comprobante: ${numeroFactura}` : "Ingresa los datos de la anulación."}
              </p>
            </div>
          </div>
          <CustomButton type="button" variant="ghost" size="icon" onClick={cerrar} disabled={cargando} aria-label="Cerrar anulación manual">
            <X size={18} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="space-y-5 px-7 py-6">
          <CustomSelectorFecha
            label="Fecha de anulación"
            required
            value={fechaAnulacion}
            onChange={(fecha) => setValue("fechaAnulacion", fecha as Date, {
              shouldDirty: true,
              shouldValidate: true,
            })}
            error={errors.fechaAnulacion?.message}
          />

          <div className="space-y-1.5">
            <CustomLabel htmlFor="motivo-anulacion-manual" required>Motivo</CustomLabel>
            <textarea
              id="motivo-anulacion-manual"
              {...register("motivo")}
              rows={4}
              placeholder="Describe el motivo de la anulación"
              className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10 ${
                errors.motivo ? "border-red-500" : "border-slate-200"
              }`}
            />
            {errors.motivo ? (
              <p className="text-xs text-red-500">{errors.motivo.message}</p>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-7 py-5">
          <CustomButton type="button" variant="secondary" size="compact" onClick={cerrar} disabled={cargando}>
            Cancelar
          </CustomButton>
          <CustomButton type="submit" variant="danger" size="compact" loading={cargando} loadingText="Anulando...">
            Anular manualmente
          </CustomButton>
        </div>
      </form>
    </div>
  );
}
