import { useState, useEffect } from "react";
import {
  X,
  Check,
  Globe,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { userSchema, type UserFormData } from "@maximilian/schemas";
import { masterTableService } from "@maximilian/services/masterTable.service";
import { MasterTableId } from "@maximilian/shared/types/master-table.type";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userData: UserFormData, reset: () => void) => void;
  isSubmitting?: boolean;
}

type Tab = "info" | "roles";

export function CreateUserModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}: CreateUserModalProps) {
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
    defaultValues: {
      firstName: "",
      paternalLastName: "",
      maternalLastName: "",
      usernameCreacion: "",
      email: "",
      roles: [],
      languages: [],
    },
  });

  // Fetch roles from MasterTable
  const {
    data: rolesData,
    isLoading: isLoadingRoles,
    isError: isErrorRoles,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ["masterTable", MasterTableId.ROLES],
    queryFn: () => masterTableService.list(MasterTableId.ROLES),
    enabled: isOpen,
    retry: 1,
  });

  // Fetch languages from MasterTable
  const {
    data: languagesData,
    isLoading: isLoadingLanguages,
    isError: isErrorLanguages,
    refetch: refetchLanguages,
  } = useQuery({
    queryKey: ["masterTable", MasterTableId.IDIOMA],
    queryFn: () => masterTableService.list(MasterTableId.IDIOMA),
    enabled: isOpen,
    retry: 1,
  });

  const firstName = watch("firstName");
  const paternalLastName = watch("paternalLastName");
  const selectedRoles = (watch("roles") || []) as (string | number)[];
  const selectedLanguages = (watch("languages") || []) as (string | number)[];

  useEffect(() => {
    if (firstName || paternalLastName) {
      const firstLetter = firstName?.charAt(0) ?? "";
      const lastName = paternalLastName?.replace(/\s+/g, "") ?? "";
      setValue("usernameCreacion", `${firstLetter}${lastName}`.toLowerCase(), {
        shouldValidate: true,
      });
    }
  }, [firstName, paternalLastName]);

  if (!isOpen) return null;

  const handleToggle = (
    field: "roles" | "languages",
    value: string | number,
    currentValues: (string | number)[],
  ) => {
    const isSelected = currentValues.includes(value);
    const newValues = isSelected
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    setValue(field, newValues, { shouldValidate: true });

    // If we deselect Traductor (using num1 from rolesData)
    if (field === "roles" && isSelected) {
      const roleObj = rolesData?.find((r) => r.num1 === value);
      if (roleObj?.string1?.toUpperCase() === "TRADUCTOR") {
        setValue("languages", [], { shouldValidate: true });
      }
    }
  };

  const onSubmit = (data: UserFormData) => {
    onConfirm(data, reset);
  };

  // Check if "TRADUCTOR" is selected
  const isTranslatorSelected = selectedRoles.some((roleValue) => {
    const roleObj = rolesData?.find((r) => r.num1 === roleValue);
    return roleObj?.string1?.toUpperCase() === "TRADUCTOR";
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`bg-brand-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-all ${isTranslatorSelected && activeTab === "roles" ? "max-w-4xl w-full" : "max-w-2xl w-full"}`}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-xl font-bold text-brand-black">
              {activeTab === "info" ? "Agrega un Usuario" : "Roles de Usuario"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-brand-black transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="px-8 mt-6">
            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                  activeTab === "info"
                    ? "bg-brand-white text-brand-black shadow-sm border-b-2 border-brand-black"
                    : "text-gray-500 hover:text-brand-black"
                }`}
              >
                <span>Información</span>
                {(errors.firstName ||
                  errors.paternalLastName ||
                  errors.maternalLastName ||
                  errors.usernameCreacion ||
                  errors.email) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("roles")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                  activeTab === "roles"
                    ? "bg-brand-white text-brand-black shadow-sm border-b-2 border-brand-black"
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

          {/* Content */}
          <div className="p-8 min-h-80">
            {activeTab === "info" ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-black">
                    Nombre <span className="text-red-500">*</span>
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
                    Apellido Paterno <span className="text-red-500">*</span>
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
                    Nombre de Usuario <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("usernameCreacion")}
                    type="text"
                    placeholder="Nombre de Usuario"
                    className={`w-full px-4 py-2 bg-brand-white border ${
                      errors.usernameCreacion ? "border-red-500" : "border-gray-200"
                    } rounded-lg text-sm focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all`}
                  />
                  {errors.usernameCreacion && (
                    <p className="text-xs text-red-500">
                      {errors.usernameCreacion.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-semibold text-brand-black">
                    Email <span className="text-red-500">*</span>
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
                    <p className="text-xs text-brand-wine">
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
                    Seleccionar Roles <span className="text-red-500">*</span>
                  </p>
                  {isLoadingRoles ? (
                    <div className="flex items-center gap-2 text-gray-400 py-4">
                      <Loader2 size={18} className="animate-spin" />
                      <span className="text-xs font-medium">
                        Cargando roles...
                      </span>
                    </div>
                  ) : isErrorRoles ? (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col items-center gap-2 text-center">
                      <AlertCircle className="text-red-500" size={20} />
                      <p className="text-xs text-red-700 font-medium">
                        No se pudieron cargar los roles
                      </p>
                      <button
                        type="button"
                        onClick={() => refetchRoles()}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        <RefreshCw size={10} />
                        <span>REINTENTAR</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rolesData?.map((role) => (
                        <div
                          key={role.num1}
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() =>
                            handleToggle("roles", role.num1!, selectedRoles)
                          }
                        >
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                              selectedRoles.includes(role.num1!)
                                ? "bg-brand-black border-brand-black"
                                : "border-gray-300 group-hover:border-brand-black"
                            }`}
                          >
                            {selectedRoles.includes(role.num1!) && (
                              <Check size={14} className="text-brand-white" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-700 font-medium capitalize">
                              {role.string1?.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                        Idiomas del Traductor <span className="text-red-500">*</span>
                      </p>
                    </div>
                    {isLoadingLanguages ? (
                      <div className="flex items-center gap-2 text-gray-400 py-4">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-xs font-medium">
                          Cargando idiomas...
                        </span>
                      </div>
                    ) : isErrorLanguages ? (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col items-center gap-2 text-center">
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-xs text-red-700 font-medium">
                          No se pudieron cargar los idiomas
                        </p>
                        <button
                          type="button"
                          onClick={() => refetchLanguages()}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                        >
                          <RefreshCw size={10} />
                          <span>REINTENTAR</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {languagesData?.map((language) => (
                          <div
                            key={language.num1}
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() =>
                              handleToggle(
                                "languages",
                                language.num1!,
                                selectedLanguages,
                              )
                            }
                          >
                            <div
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                selectedLanguages.includes(language.num1!)
                                  ? "bg-brand-wine border-brand-wine"
                                  : "border-gray-300 group-hover:border-brand-wine"
                              }`}
                            >
                              {selectedLanguages.includes(language.num1!) && (
                                <Check size={14} className="text-brand-white" />
                              )}
                            </div>
                            <span className="text-sm text-gray-700 font-medium capitalize">
                              {language.string1?.toLowerCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-2.5 bg-brand-black text-brand-white rounded-lg text-sm font-bold hover:bg-brand-black/90 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed min-w-32 justify-center"
              disabled={isLoadingRoles || isLoadingLanguages || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-brand-white" />
                  <span>Confirmar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
