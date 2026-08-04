import { useEffect } from "react";
import { CircleX, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorFecha } from "@maximilian/components/common/CustomSelectorFecha";
import {
  esquemaAnulacionFactura,
  type DatosFormularioAnulacionFactura,
} from "@maximilian/schemas";

interface CustomModalAnularFacturaProps {
  abierto: boolean;
  cargando: boolean;
  onCerrar: () => void;
  onConfirmar: (datos: DatosFormularioAnulacionFactura) => void;
}

function obtenerValoresIniciales(): DatosFormularioAnulacionFactura {
  return {
    fechaReferencia: new Date(),
    motivoDescripcion: "",
  };
}

export function CustomModalAnularFactura({
  abierto,
  cargando,
  onCerrar,
  onConfirmar,
}: CustomModalAnularFacturaProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<DatosFormularioAnulacionFactura>({
    resolver: zodResolver(esquemaAnulacionFactura),
    mode: "onTouched",
    defaultValues: obtenerValoresIniciales(),
  });
  const fechaReferencia = useWatch({ control, name: "fechaReferencia" });

  useEffect(() => {
    if (abierto) reset(obtenerValoresIniciales());
  }, [abierto, reset]);

  if (!abierto) return null;

  const cerrar = () => {
    reset(obtenerValoresIniciales());
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit(onConfirmar)}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <CircleX size={19} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-black">Anular factura</h2>
              <p className="text-xs text-slate-500">Ingresa los datos requeridos para solicitar la anulación.</p>
            </div>
          </div>
          <CustomButton type="button" variant="ghost" size="icon" onClick={cerrar} disabled={cargando} aria-label="Cerrar anulación">
            <X size={18} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="space-y-5 px-7 py-6">
          <CustomSelectorFecha
            label="Fecha de referencia"
            required
            value={fechaReferencia}
            onChange={(fecha) => setValue("fechaReferencia", fecha as Date, {
              shouldDirty: true,
              shouldValidate: true,
            })}
            error={errors.fechaReferencia?.message}
          />

          <div className="space-y-1.5">
            <CustomLabel htmlFor="motivo-anulacion-factura" required>Motivo</CustomLabel>
            <textarea
              id="motivo-anulacion-factura"
              {...register("motivoDescripcion")}
              rows={4}
              placeholder="Describe el motivo de la anulación"
              className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10 ${
                errors.motivoDescripcion ? "border-red-500" : "border-slate-200"
              }`}
            />
            {errors.motivoDescripcion ? (
              <p className="text-xs text-red-500">{errors.motivoDescripcion.message}</p>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-7 py-5">
          <CustomButton type="button" variant="secondary" size="compact" onClick={cerrar} disabled={cargando}>
            Cancelar
          </CustomButton>
          <CustomButton type="submit" variant="wine" size="compact" loading={cargando} loadingText="Anulando...">
            Anular factura
          </CustomButton>
        </div>
      </form>
    </div>
  );
}
