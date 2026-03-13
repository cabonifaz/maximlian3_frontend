import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rateSchema, type RateFormData } from "@maximilian/schemas";

interface AddRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: RateFormData) => void;
}

export function AddRateModal({ isOpen, onClose, onConfirm }: AddRateModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RateFormData>({
    resolver: zodResolver(rateSchema),
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
          <h2 className="text-xl font-bold text-brand-black">Nueva Tarifa</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleConfirm)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Producto</label>
              <select 
                {...register("producto")}
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
              >
                <option value="">Selecciona un producto</option>
                <option value="Informe confidencial">Informe confidencial</option>
              </select>
              {errors.producto && <p className="text-xs text-red-500">{errors.producto.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">País</label>
              <select 
                {...register("pais")}
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
              >
                <option value="">Selecciona un país</option>
                <option value="Perú">Perú</option>
                <option value="Bolivia">Bolivia</option>
              </select>
              {errors.pais && <p className="text-xs text-red-500">{errors.pais.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Moneda</label>
              <select 
                {...register("moneda")}
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
              >
                <option value="">Selecciona moneda</option>
                <option value="Dólares">Dólares</option>
                <option value="Euros">Euros</option>
              </select>
              {errors.moneda && <p className="text-xs text-red-500">{errors.moneda.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Trámite</label>
              <select 
                {...register("tramite")}
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
              >
                <option value="">Selecciona trámite</option>
                <option value="XP">XP</option>
                <option value="Normal">Normal</option>
              </select>
              {errors.tramite && <p className="text-xs text-red-500">{errors.tramite.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Días Min.</label>
              <input 
                {...register("diasMin", { valueAsNumber: true })}
                type="number" 
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
              />
              {errors.diasMin && <p className="text-xs text-red-500">{errors.diasMin.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Días Max.</label>
              <input 
                {...register("diasMax", { valueAsNumber: true })}
                type="number" 
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
              />
              {errors.diasMax && <p className="text-xs text-red-500">{errors.diasMax.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Precio</label>
              <input 
                {...register("precio", { valueAsNumber: true })}
                type="number" 
                step="0.01"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
              />
              {errors.precio && <p className="text-xs text-red-500">{errors.precio.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Penalidad</label>
              <input 
                {...register("penalidad", { valueAsNumber: true })}
                type="number" 
                step="0.01"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
              />
              {errors.penalidad && <p className="text-xs text-red-500">{errors.penalidad.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Tarifario</label>
            <select 
              {...register("tarifario")}
              className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
            >
              <option value="">Selecciona tarifario</option>
              <option value="P">P</option>
              <option value="S">S</option>
            </select>
            {errors.tarifario && <p className="text-xs text-red-500">{errors.tarifario.message}</p>}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-brand-black text-brand-white rounded-xl font-bold hover:bg-brand-black/90 active:scale-[0.98] transition-all shadow-lg shadow-black/10"
            >
              <div className="w-2 h-2 rounded-full bg-brand-white" />
              <span>Confirmar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
