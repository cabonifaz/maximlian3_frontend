import { useState, useEffect } from "react";
import { X, Check, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, type UserFormData } from "@maximilian/schemas";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userData: UserFormData) => void;
  initialData: UserFormData | null;
}

type Tab = "info" | "roles";

export function EditUserModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
}: EditUserModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const selectedRoles = watch("roles") || [];
  const selectedLanguages = watch("languages") || [];

  if (!isOpen) return null;

  const rolesOptions = [
    "Analista",
    "Traductor",
    "Coordinador",
    "Administrador",
  ];
  const languagesOptions = [
    "Inglés",
    "Español",
    "Portugués",
    "Francés",
    "Alemán",
  ];

  const handleRoleToggle = (role: string) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter((r) => r !== role)
      : [...selectedRoles, role];

    if (role === "Traductor" && selectedRoles.includes("Traductor")) {
      setValue("languages", [], { shouldValidate: true });
    }

    setValue("roles", newRoles, { shouldValidate: true });
  };

  const handleLanguageToggle = (language: string) => {
    const newLanguages = selectedLanguages.includes(language)
      ? selectedLanguages.filter((l) => l !== language)
      : [...selectedLanguages, language];
    setValue("languages", newLanguages, { shouldValidate: true });
  };

  const onSubmit = (data: UserFormData) => {
    onConfirm(data);
    onClose();
  };

  const isTranslatorSelected = selectedRoles.includes("Traductor");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`bg-brand-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-all ${isTranslatorSelected && activeTab === "roles" ? "max-w-4xl w-full" : "max-w-2xl w-full"}`}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-xl font-bold text-brand-black">
              {activeTab === "info" ? "Editar Usuario" : "Roles de Usuario"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-brand-black transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          <div className="px-8 mt-6">
            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                  activeTab === "info"
                    ? "bg-brand-white text-brand-black shadow-sm"
                    : "text-gray-500 hover:text-brand-black"
                }`}
              >
                <span>Información</span>
                {(errors.firstName ||
                  errors.paternalLastName ||
                  errors.maternalLastName ||
                  errors.username ||
                  errors.email) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("roles")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                  activeTab === "roles"
                    ? "bg-brand-white text-brand-black shadow-sm"
                    : "text-gray-500 hover:text-brand-black"
                }`}
              >
                <span>Roles</span>
                {(errors.roles || errors.languages) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            </div>
          </div>

          <div className="p-8 min-h-[320px]">
            {activeTab === "info" ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-black">
                    Nombre
                  </label>
                  <input
                    {...register("firstName")}
                    type="text"
                    placeholder="Nombre"
                    className={`w-full px-4 py-2 bg-brand-white border ${
                      errors.firstName ? "border-red-500" : "border-gray-200"
                    } rounded-lg text-sm focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all`}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-black">
                    Apellido Paterno
                  </label>
                  <input
                    {...register("paternalLastName")}
                    type="text"
                    placeholder="Apellido Paterno"
                    className={`w-full px-4 py-2 bg-brand-white border ${
                      errors.paternalLastName
                        ? "border-red-500"
                        : "border-gray-200"
                    } rounded-lg text-sm focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all`}
                  />
                  {errors.paternalLastName && (
                    <p className="text-xs text-red-500">
                      {errors.paternalLastName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-black">
                    Apellido Materno
                  </label>
                  <input
                    {...register("maternalLastName")}
                    type="text"
                    placeholder="Apellido Materno"
                    className={`w-full px-4 py-2 bg-brand-white border ${
                      errors.maternalLastName
                        ? "border-red-500"
                        : "border-gray-200"
                    } rounded-lg text-sm focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all`}
                  />
                  {errors.maternalLastName && (
                    <p className="text-xs text-red-500">
                      {errors.maternalLastName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-black">
                    Nombre de Usuario
                  </label>
                  <input
                    {...register("username")}
                    type="text"
                    placeholder="Nombre de Usuario"
                    className={`w-full px-4 py-2 bg-brand-white border ${
                      errors.username ? "border-red-500" : "border-gray-200"
                    } rounded-lg text-sm focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all`}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-semibold text-brand-black">
                    Email
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="Email"
                    className={`w-full px-4 py-2 bg-brand-white border ${
                      errors.email ? "border-red-500" : "border-gray-200"
                    } rounded-lg text-sm focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 text-brand-wine">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`grid ${isTranslatorSelected ? "grid-cols-2 gap-12" : "grid-cols-1"} transition-all duration-300`}
              >
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-brand-black mb-4">
                    Seleccionar Roles
                  </p>
                  <div className="space-y-3">
                    {rolesOptions.map((role) => (
                      <label
                        key={role}
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => handleRoleToggle(role)}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            selectedRoles?.includes(role)
                              ? "bg-brand-black border-brand-black"
                              : "border-gray-300 group-hover:border-brand-black"
                          }`}
                        >
                          {selectedRoles?.includes(role) && (
                            <Check size={14} className="text-brand-white" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">
                          {role}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.roles && (
                    <p className="text-xs text-red-500 mt-2">
                      {errors.roles.message}
                    </p>
                  )}
                </div>

                {isTranslatorSelected && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300 border-l border-gray-100 pl-12">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe size={18} className="text-brand-wine" />
                      <p className="text-sm font-semibold text-brand-black">
                        Idiomas del Traductor
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {languagesOptions.map((language) => (
                        <label
                          key={language}
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => handleLanguageToggle(language)}
                        >
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                              selectedLanguages?.includes(language)
                                ? "bg-brand-wine border-brand-wine"
                                : "border-gray-300 group-hover:border-brand-wine"
                            }`}
                          >
                            {selectedLanguages?.includes(language) && (
                              <Check size={14} className="text-brand-white" />
                            )}
                          </div>
                          <span className="text-sm text-gray-700 font-medium">
                            {language}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.languages && (
                      <p className="text-xs text-red-500 mt-2">
                        {errors.languages.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-2.5 bg-brand-black text-brand-white rounded-lg text-sm font-bold hover:bg-brand-black/90 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10"
            >
              <div className="w-2 h-2 rounded-full bg-brand-white" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
