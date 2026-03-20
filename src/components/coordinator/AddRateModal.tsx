import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { rateSchema, type RateFormData } from "@maximilian/schemas";
import { masterTableService } from "@maximilian/services/masterTable.service";
import { MasterTableId } from "@maximilian/shared/types/master-table.type";
import { SearchableSelect } from "@maximilian/components/common/SearchableSelect";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomButton } from "@maximilian/components/common/CustomButton";

interface AddRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: RateFormData) => void;
  defaultValues?: RateFormData;
}

export function AddRateModal({ isOpen, onClose, onConfirm, defaultValues }: AddRateModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    clearErrors,
  } = useForm<RateFormData>({
    resolver: zodResolver(rateSchema),
    mode: "onSubmit",
  });

  const watchedProducto = watch("producto");
  const watchedPais = watch("pais");
  const watchedMoneda = watch("moneda");
  const watchedTramite = watch("tramite");

  useEffect(() => {
    reset(defaultValues ?? ({} as RateFormData));
  }, [isOpen]);

  const { data: productos } = useQuery({
    queryKey: ["masterTable", MasterTableId.PRODUCTO],
    queryFn: () => masterTableService.list(MasterTableId.PRODUCTO),
    enabled: isOpen,
  });

  const { data: paises } = useQuery({
    queryKey: ["masterTable", MasterTableId.PAIS],
    queryFn: () => masterTableService.list(MasterTableId.PAIS),
    enabled: isOpen,
  });

  const { data: monedas } = useQuery({
    queryKey: ["masterTable", MasterTableId.MONEDA],
    queryFn: () => masterTableService.list(MasterTableId.MONEDA),
    enabled: isOpen,
  });

  const { data: tiposTramite } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_TRAMITE],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_TRAMITE),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const handleConfirm = (data: RateFormData) => {
    onConfirm(data);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-black">{defaultValues ? "Editar Tarifa" : "Nueva Tarifa"}</h2>
          <CustomButton variant="ghost" size="icon" onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </CustomButton>
        </div>

        <form onSubmit={handleSubmit(handleConfirm)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SearchableSelect
              label="Producto"
              required
              options={productos}
              value={watchedProducto as number | undefined}
              onChange={(val) => setValue("producto", val)}
              error={errors.producto?.message}
              placeholder="Selecciona un producto"
            />

            <SearchableSelect
              label="País"
              required
              options={paises}
              value={watchedPais as number | undefined}
              onChange={(val) => setValue("pais", val)}
              error={errors.pais?.message}
              placeholder="Selecciona un país"
            />

            <SearchableSelect
              label="Moneda"
              required
              options={monedas}
              value={watchedMoneda as number | undefined}
              onChange={(val) => setValue("moneda", val)}
              error={errors.moneda?.message}
              placeholder="Selecciona moneda"
            />

            <SearchableSelect
              label="Trámite"
              required
              options={tiposTramite}
              value={watchedTramite as number | undefined}
              onChange={(val) => setValue("tramite", val)}
              error={errors.tramite?.message}
              placeholder="Selecciona trámite"
            />

            <div className="space-y-2">
              <CustomLabel required>Días Min.</CustomLabel>
              <input
                {...register("diasMin", { valueAsNumber: true, onChange: () => clearErrors(["diasMin", "diasMax"]) })}
                type="number"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
              />
              {errors.diasMin && <p className="text-xs text-red-500">{errors.diasMin.message}</p>}
            </div>

            <div className="space-y-2">
              <CustomLabel required>Días Max.</CustomLabel>
              <input
                {...register("diasMax", { valueAsNumber: true, onChange: () => clearErrors(["diasMin", "diasMax"]) })}
                type="number"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
              />
              {errors.diasMax && <p className="text-xs text-red-500">{errors.diasMax.message}</p>}
            </div>

            <div className="space-y-2">
              <CustomLabel required>Precio</CustomLabel>
              <input
                {...register("precio", { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
              />
              {errors.precio && <p className="text-xs text-red-500">{errors.precio.message}</p>}
            </div>

            <div className="space-y-2">
              <CustomLabel required>Penalidad</CustomLabel>
              <input
                {...register("penalidad", { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
              />
              {errors.penalidad && <p className="text-xs text-red-500">{errors.penalidad.message}</p>}
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
