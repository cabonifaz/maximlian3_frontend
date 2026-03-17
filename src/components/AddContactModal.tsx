import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { contactSchema, type ContactFormData } from "@maximilian/schemas";
import { masterTableService } from "@maximilian/services/masterTable.service";
import { MasterTableId } from "@maximilian/shared/types/master-table.type";

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ContactFormData) => void;
  defaultValues?: ContactFormData;
}

export function AddContactModal({ isOpen, onClose, onConfirm, defaultValues }: AddContactModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    if (isOpen) reset(defaultValues ?? ({} as ContactFormData));
  }, [isOpen]);

  const { data: tiposPersona } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_PERSONA],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_PERSONA),
    enabled: isOpen,
  });

  const { data: tiposContacto } = useQuery({
    queryKey: ["masterTable", MasterTableId.TIPO_CONTACTO],
    queryFn: () => masterTableService.list(MasterTableId.TIPO_CONTACTO),
    enabled: isOpen,
  });

  const { data: areasTrabajo } = useQuery({
    queryKey: ["masterTable", MasterTableId.AREA_TRABAJO],
    queryFn: () => masterTableService.list(MasterTableId.AREA_TRABAJO),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const handleConfirm = (data: ContactFormData) => {
    onConfirm(data);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-black">{defaultValues ? "Editar Contacto" : "Nuevo Contacto"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleConfirm)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Tipo Persona</label>
              <select
                {...register("tipoPersona")}
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
              >
                <option value="">Selecciona tipo persona</option>
                {(tiposPersona ?? []).map((e) => (
                  <option key={e.num1} value={e.num1 ?? ""}>
                    {e.string1}
                  </option>
                ))}
              </select>
              {errors.tipoPersona && <p className="text-xs text-red-500">{errors.tipoPersona.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Tipo de Contacto</label>
              <select
                {...register("tipoContacto")}
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
              >
                <option value="">Selecciona tipo de contacto</option>
                {(tiposContacto ?? []).map((e) => (
                  <option key={e.num1} value={e.num1 ?? ""}>
                    {e.string1}
                  </option>
                ))}
              </select>
              {errors.tipoContacto && <p className="text-xs text-red-500">{errors.tipoContacto.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Código de Contacto</label>
              <input
                {...register("codigoContacto")}
                type="text"
                placeholder="Código"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
              />
              {errors.codigoContacto && <p className="text-xs text-red-500">{errors.codigoContacto.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nombre</label>
              <input
                {...register("nombre")}
                type="text"
                placeholder="Nombre"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
              />
              {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Teléfono</label>
              <input
                {...register("telefono")}
                type="text"
                placeholder="Teléfono"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
              />
              {errors.telefono && <p className="text-xs text-red-500">{errors.telefono.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700">Área de Trabajo</label>
              <select
                {...register("areaTrabajo")}
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
              >
                <option value="">Selecciona área de trabajo</option>
                {(areasTrabajo ?? []).map((e) => (
                  <option key={e.num1} value={e.num1 ?? ""}>
                    {e.string1}
                  </option>
                ))}
              </select>
              {errors.areaTrabajo && <p className="text-xs text-red-500">{errors.areaTrabajo.message}</p>}
            </div>
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
