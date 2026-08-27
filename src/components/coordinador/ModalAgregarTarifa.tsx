import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { useModalAgregarTarifa } from "@maximilian/hooks/useModalAgregarTarifa";
import type { DatosFormularioTarifa } from "@maximilian/schemas";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { obtenerEtiquetaPrincipalSecundaria } from "@maximilian/shared/utils/tabla-maestra.util";

interface ModalAgregarTarifaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: DatosFormularioTarifa) => boolean | void;
  defaultValues?: Partial<DatosFormularioTarifa>;
}

export function ModalAgregarTarifa({
  isOpen,
  onClose,
  onConfirm,
  defaultValues,
}: ModalAgregarTarifaProps) {
  const {
    confirmarSubmit,
    errors,
    register,
    setValue,
    trigger,
    valores,
  } = useModalAgregarTarifa({
    estaAbierto: isOpen,
    onCerrar: onClose,
    onConfirmar: onConfirm,
    valoresIniciales: defaultValues,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-black">
            {defaultValues ? "Editar Tarifa" : "Nueva Tarifa"}
          </h2>
          <CustomButton variant="ghost" size="icon" onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </CustomButton>
        </div>

        <form onSubmit={confirmarSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomSelectorBuscable
              label="Producto"
              required
              idMaster={TablaMaestraId.PRODUCTO}
              value={valores.producto as number | undefined}
              onChange={(valor) =>
                setValue("producto", valor, { shouldValidate: true })
              }
              onBlur={() => trigger("producto")}
              autoSeleccionarOpcionUnica
              error={errors.producto?.message}
              placeholder="Selecciona un producto"
            />

            <CustomSelectorBuscable
              label="País"
              required
              idMaster={TablaMaestraId.PAIS}
              value={valores.pais as number | undefined}
              onChange={(valor) =>
                setValue("pais", valor, { shouldValidate: true })
              }
              onBlur={() => trigger("pais")}
              autoSeleccionarOpcionUnica
              error={errors.pais?.message}
              placeholder="Selecciona un país"
            />

            <CustomSelectorBuscable
              label="Moneda"
              required
              idMaster={TablaMaestraId.MONEDA_SUNAT}
              value={valores.moneda as number | undefined}
              obtenerEtiquetaOpcion={obtenerEtiquetaPrincipalSecundaria}
              onChange={(valor) =>
                setValue("moneda", valor, { shouldValidate: true })
              }
              onBlur={() => trigger("moneda")}
              autoSeleccionarOpcionUnica
              error={errors.moneda?.message}
              placeholder="Selecciona moneda"
            />

            <CustomSelectorBuscable
              label="Trámite"
              required
              idMaster={TablaMaestraId.TIPO_TRAMITE}
              value={valores.tramite as number | undefined}
              onChange={(valor) =>
                setValue("tramite", valor, { shouldValidate: true })
              }
              onBlur={() => trigger("tramite")}
              autoSeleccionarOpcionUnica
              error={errors.tramite?.message}
              placeholder="Selecciona trámite"
            />

            <div className="space-y-2">
              <CustomLabel required>Días mín.</CustomLabel>
              <input
                {...register("diasMin", {
                  valueAsNumber: true,
                  onBlur: () => void trigger(["diasMin", "diasMax"]),
                })}
                type="number"
                className={`w-full px-4 py-2.5 bg-brand-white border ${errors.diasMin ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
              />
              {errors.diasMin && (
                <p className="text-xs text-red-500">
                  {errors.diasMin.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <CustomLabel required>Días máx.</CustomLabel>
              <input
                {...register("diasMax", {
                  valueAsNumber: true,
                  onBlur: () => void trigger(["diasMin", "diasMax"]),
                })}
                type="number"
                className={`w-full px-4 py-2.5 bg-brand-white border ${errors.diasMax ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
              />
              {errors.diasMax && (
                <p className="text-xs text-red-500">
                  {errors.diasMax.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <CustomLabel required>Precio</CustomLabel>
              <input
                {...register("precio", {
                  valueAsNumber: true,
                  onBlur: () => void trigger(["precio", "penalidad"]),
                })}
                type="number"
                step="0.01"
                className={`w-full px-4 py-2.5 bg-brand-white border ${errors.precio ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
              />
              {errors.precio && (
                <p className="text-xs text-red-500">
                  {errors.precio.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <CustomLabel optional>Penalidad</CustomLabel>
              <input
                {...register("penalidad", {
                  valueAsNumber: true,
                  onBlur: () => void trigger(["precio", "penalidad"]),
                })}
                type="number"
                step="0.01"
                className={`w-full px-4 py-2.5 bg-brand-white border ${errors.penalidad ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
              />
              {errors.penalidad && (
                <p className="text-xs text-red-500">
                  {errors.penalidad.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <CustomButton type="submit">
              <div className="w-2 h-2 rounded-full bg-brand-white" />
              <span>Confirmar</span>
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
}
