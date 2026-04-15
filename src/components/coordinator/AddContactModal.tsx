import { X } from "lucide-react";
import { useEffect } from "react";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { useForm, type Resolver } from "react-hook-form";
import { SearchableSelect } from "@maximilian/components/common/SearchableSelect";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@maximilian/schemas";
import { MasterTableId } from "@maximilian/shared/types/master-table.type";

const contactResolver: Resolver<ContactFormData> = async (...args) => {
  const result = await zodResolver(contactSchema)(...args);
  const { tipoContacto, tipoContactoNuevo } = args[0];
  if (tipoContacto === 0 && !tipoContactoNuevo?.trim()) {
    result.errors = {
      ...result.errors,
      tipoContacto: { type: "custom", message: "El tipo de contacto es requerido" },
    };
  }
  return result;
};

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
    watch,
    setValue,
  } = useForm<ContactFormData>({
    resolver: contactResolver,
  });

  useEffect(() => {
    reset(defaultValues ?? { enviarCorreo: false } as ContactFormData);
  }, [isOpen]);


  if (!isOpen) return null;

  const watchedTipoPersona = watch("tipoPersona");
  const watchedTipoContacto = watch("tipoContacto");
  const watchedTipoContactoNuevo = watch("tipoContactoNuevo");
  const watchedAreaTrabajo = watch("areaTrabajo");

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
          <CustomButton variant="ghost" size="icon" onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </CustomButton>
        </div>

        <form onSubmit={handleSubmit(handleConfirm)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SearchableSelect
              label="Tipo Persona"
              required
              idMaster={MasterTableId.TIPO_PERSONA}
              value={watchedTipoPersona}
              onChange={(val) =>
                setValue("tipoPersona", val, { shouldValidate: true })
              }
              error={errors.tipoPersona?.message}
            />

            <SearchableSelect
              label="Tipo de Contacto"
              required
              idMaster={MasterTableId.TIPO_CONTACTO}
              value={watchedTipoContacto}
              onChange={(val) => {
                setValue("tipoContacto", val, { shouldValidate: true });
                if (val !== 0) setValue("tipoContactoNuevo", undefined);
              }}
              onAddNew={(term) => {
                setValue("tipoContacto", 0, { shouldValidate: true });
                setValue("tipoContactoNuevo", term, { shouldValidate: true });
              }}
              displayValue={watchedTipoContacto === 0 ? watchedTipoContactoNuevo : undefined}
              error={errors.tipoContacto?.message}
            />

            <div className="space-y-2">
              <CustomLabel optional>Código de Contacto</CustomLabel>
              <input
                {...register("codigoContacto")}
                type="text"
                placeholder="Código"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
              />
              {errors.codigoContacto && <p className="text-xs text-red-500">{errors.codigoContacto.message}</p>}
            </div>

            <div className="space-y-2">
              <CustomLabel required>Nombre</CustomLabel>
              <input
                {...register("nombre")}
                type="text"
                placeholder="Nombre"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
              />
              {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <CustomLabel required>Email</CustomLabel>
              <input
                {...register("correo")}
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
              />
              {errors.correo && <p className="text-xs text-red-500">{errors.correo.message}</p>}
            </div>

            <div className="space-y-2">
              <CustomLabel optional>Teléfono</CustomLabel>
              <input
                {...register("telefono")}
                type="text"
                placeholder="Teléfono"
                className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
              />
              {errors.telefono && <p className="text-xs text-red-500">{errors.telefono.message}</p>}
            </div>

            <div className="md:col-span-2">
              <SearchableSelect
                label="Área de Trabajo"
                required
                idMaster={MasterTableId.AREA_TRABAJO}
                value={watchedAreaTrabajo}
                onChange={(val) =>
                  setValue("areaTrabajo", val, { shouldValidate: true })
                }
                error={errors.areaTrabajo?.message}
              />
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="enviarCorreo"
                {...register("enviarCorreo")}
                className="w-4 h-4 accent-brand-wine cursor-pointer"
              />
              <label htmlFor="enviarCorreo" className="text-sm text-gray-700 cursor-pointer">
                Enviar informe al correo
              </label>
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
