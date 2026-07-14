import { valoresPorDefecto } from "@maximilian/shared/constants/components/administrador/ModalUsuario.constants";
import { useEffect, useState } from "react";
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
import { esquemaUsuario, type DatosFormularioUsuario } from "@maximilian/schemas";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";

interface ModalUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (datosUsuario: DatosFormularioUsuario, reset: () => void) => void;
  modo: "crear" | "editar";
  datosIniciales?: DatosFormularioUsuario | null;
  isSubmitting?: boolean;
}

type Tab = "info" | "roles";

export function ModalUsuario({
  isOpen,
  onClose,
  onConfirm,
  modo,
  datosIniciales = null,
  isSubmitting = false,
}: ModalUsuarioProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const esModoEdicion = modo === "editar";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<DatosFormularioUsuario>({
    resolver: zodResolver(esquemaUsuario),
    defaultValues: valoresPorDefecto,
  });

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("info");
    reset(esModoEdicion && datosIniciales ? datosIniciales : valoresPorDefecto);
  }, [datosIniciales, esModoEdicion, isOpen, reset]);

  const {
    data: rolesData,
    isLoading: isLoadingRoles,
    isError: isErrorRoles,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ROLES],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ROLES),
    enabled: isOpen,
    staleTime: Infinity,
    retry: 1,
  });

  const {
    data: idiomasData,
    isLoading: isLoadingLanguages,
    isError: isErrorLanguages,
    refetch: refetchLanguages,
  } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.IDIOMA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.IDIOMA),
    enabled: isOpen,
    staleTime: Infinity,
    retry: 1,
  });

  const nombres = watch("nombres");
  const apellidoPaterno = watch("apellidoPaterno");
  const selectedRoles = (watch("roles") || []) as (string | number)[];
  const selectedLanguages = (watch("idiomas") || []) as (string | number)[];

  useEffect(() => {
    if (esModoEdicion) return;
    if (!nombres && !apellidoPaterno) {
      setValue("usuarioCreacion", "", { shouldValidate: true });
      return;
    }

    const firstLetter = nombres?.charAt(0) ?? "";
    const lastName = apellidoPaterno?.replace(/\s+/g, "") ?? "";
    setValue("usuarioCreacion", `${firstLetter}${lastName}`.toLowerCase(), {
      shouldValidate: true,
    });
  }, [esModoEdicion, nombres, apellidoPaterno, setValue]);

  if (!isOpen) return null;

  const handleClose = () => {
    reset(valoresPorDefecto);
    setActiveTab("info");
    onClose();
  };

  const handleToggle = (
    campo: "roles" | "idiomas",
    valor: string | number,
    valoresActuales: (string | number)[],
  ) => {
    const estaSeleccionado = valoresActuales.includes(valor);
    const nuevosValores = estaSeleccionado
      ? valoresActuales.filter((v) => v !== valor)
      : [...valoresActuales, valor];

    setValue(campo, nuevosValores, { shouldValidate: true });

    if (campo === "roles" && estaSeleccionado) {
      const rol = rolesData?.find((item) => item.num1 === valor);
      if (rol?.string1?.toUpperCase() === "TRADUCTOR") {
        setValue("idiomas", [], { shouldValidate: true });
      }
    }
  };

  const onSubmit = (data: DatosFormularioUsuario) => {
    onConfirm(data, () => reset(valoresPorDefecto));
  };

  const isTranslatorSelected = selectedRoles.some((roleValue) => {
    const roleObj = rolesData?.find((r) => r.num1 === roleValue);
    return roleObj?.string1?.toUpperCase() === "TRADUCTOR";
  });

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh w-screen items-center justify-center overflow-y-auto bg-brand-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full overflow-hidden rounded-xl bg-brand-white shadow-2xl animate-in zoom-in-95 duration-200 transition-all ${isTranslatorSelected && activeTab === "roles" ? "max-w-4xl" : "max-w-2xl"}`}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
            <h2 className="text-xl font-bold text-brand-black">
              {activeTab === "info"
                ? esModoEdicion
                  ? "Editar Usuario"
                  : "Agrega un Usuario"
                : "Roles de Usuario"}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer text-gray-400 transition-colors hover:text-brand-black"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mt-6 px-8">
            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                  activeTab === "info"
                    ? "border-b-2 border-brand-black bg-brand-white text-brand-black shadow-sm"
                    : "text-gray-500 hover:text-brand-black"
                }`}
              >
                <span>Información</span>
                {(errors.nombres ||
                  errors.apellidoPaterno ||
                  errors.apellidoMaterno ||
                  errors.usuarioCreacion ||
                  errors.correo ||
                  errors.activo) && (
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("roles")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                  activeTab === "roles"
                    ? "border-b-2 border-brand-black bg-brand-white text-brand-black shadow-sm"
                    : "text-gray-500 hover:text-brand-black"
                }`}
              >
                <span>Roles</span>
                {(errors.roles || errors.idiomas) && (
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            </div>
          </div>

          <div className="min-h-80 p-8">
            {activeTab === "info" ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <CustomLabel required className="text-sm font-semibold text-brand-black">
                    Nombre
                  </CustomLabel>
                  <input
                    {...register("nombres")}
                    type="text"
                    placeholder="Nombre"
                    className={`w-full rounded-lg border bg-brand-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/20 ${errors.nombres ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.nombres && (
                    <p className="text-xs text-red-500">{errors.nombres.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <CustomLabel required className="text-sm font-semibold text-brand-black">
                    Apellido Paterno
                  </CustomLabel>
                  <input
                    {...register("apellidoPaterno")}
                    type="text"
                    placeholder="Apellido Paterno"
                    className={`w-full rounded-lg border bg-brand-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/20 ${errors.apellidoPaterno ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.apellidoPaterno && (
                    <p className="text-xs text-red-500">{errors.apellidoPaterno.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <CustomLabel optional className="text-sm font-semibold text-brand-black">
                    Apellido Materno
                  </CustomLabel>
                  <input
                    {...register("apellidoMaterno")}
                    type="text"
                    placeholder="Apellido Materno"
                    className={`w-full rounded-lg border bg-brand-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/20 ${errors.apellidoMaterno ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.apellidoMaterno && (
                    <p className="text-xs text-red-500">{errors.apellidoMaterno.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <CustomLabel
                    required={!esModoEdicion}
                    className="text-sm font-semibold text-brand-black"
                  >
                    Nombre de Usuario
                  </CustomLabel>
                  <input
                    {...register("usuarioCreacion")}
                    type="text"
                    placeholder="Nombre de Usuario"
                    disabled={esModoEdicion}
                    className={
                      esModoEdicion
                        ? "w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500 outline-none transition-all"
                        : `w-full rounded-lg border bg-brand-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/20 ${errors.usuarioCreacion ? "border-red-500" : "border-gray-200"}`
                    }
                  />
                  {errors.usuarioCreacion && (
                    <p className="text-xs text-red-500">{errors.usuarioCreacion.message}</p>
                  )}
                </div>

                <div className="col-span-2 space-y-2">
                  <CustomLabel
                    required={!esModoEdicion}
                    className="text-sm font-semibold text-brand-black"
                  >
                    Correo Electrónico
                  </CustomLabel>
                  <input
                    {...register("correo")}
                    type="email"
                    placeholder="Correo Electrónico"
                    disabled={esModoEdicion}
                    className={
                      esModoEdicion
                        ? "w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500 outline-none transition-all"
                        : `w-full rounded-lg border bg-brand-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/20 ${errors.correo ? "border-red-500" : "border-gray-200"}`
                    }
                  />
                  {errors.correo && (
                    <p className="text-xs text-red-500">{errors.correo.message}</p>
                  )}
                </div>

                {esModoEdicion && (
                  <div className="col-span-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...register("activo")}
                      id="editar-usuario-activo"
                      className="h-4 w-4 cursor-pointer accent-brand-wine"
                    />
                    <label
                      htmlFor="editar-usuario-activo"
                      className="cursor-pointer text-sm font-semibold text-brand-black"
                    >
                      Activo
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`grid transition-all duration-300 ${isTranslatorSelected ? "grid-cols-2 gap-12" : "grid-cols-1"}`}
              >
                <div className="space-y-4">
                  <CustomLabel required as="p" className="mb-4 text-sm font-semibold text-brand-black">
                    Seleccionar Roles
                  </CustomLabel>
                  {isLoadingRoles ? (
                    <div className="flex items-center gap-2 py-4 text-gray-400">
                      <Loader2 size={18} className="animate-spin" />
                      <span className="text-xs font-medium">Cargando roles...</span>
                    </div>
                  ) : isErrorRoles ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-center">
                      <AlertCircle className="text-red-500" size={20} />
                      <p className="text-xs font-medium text-red-700">
                        No se pudieron cargar los roles
                      </p>
                      <button
                        type="button"
                        onClick={() => refetchRoles()}
                        className="flex cursor-pointer items-center gap-1.5 text-[10px] font-bold text-red-600 hover:underline"
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
                          className="group flex cursor-pointer items-center gap-3"
                          onClick={() => handleToggle("roles", role.num1!, selectedRoles)}
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                              selectedRoles.includes(role.num1!)
                                ? "border-brand-black bg-brand-black"
                                : "border-gray-300 group-hover:border-brand-black"
                            }`}
                          >
                            {selectedRoles.includes(role.num1!) && (
                              <Check size={14} className="text-brand-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium capitalize text-gray-700">
                            {role.string1?.toLowerCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.roles && (
                    <p className="mt-2 text-xs text-red-500">{errors.roles.message}</p>
                  )}
                </div>

                {isTranslatorSelected && (
                  <div className="space-y-4 border-l border-gray-100 pl-12 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="mb-4 flex items-center gap-2">
                      <Globe size={18} className="text-brand-wine" />
                      <CustomLabel required as="p" className="text-sm font-semibold text-brand-black">
                        Idiomas del Traductor
                      </CustomLabel>
                    </div>
                    {isLoadingLanguages ? (
                      <div className="flex items-center gap-2 py-4 text-gray-400">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-xs font-medium">Cargando idiomas...</span>
                      </div>
                    ) : isErrorLanguages ? (
                      <div className="flex flex-col items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-center">
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-xs font-medium text-red-700">
                          No se pudieron cargar los idiomas
                        </p>
                        <button
                          type="button"
                          onClick={() => refetchLanguages()}
                          className="flex cursor-pointer items-center gap-1.5 text-[10px] font-bold text-red-600 hover:underline"
                        >
                          <RefreshCw size={10} />
                          <span>REINTENTAR</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {idiomasData?.map((language) => (
                          <div
                            key={language.num1}
                            className="group flex cursor-pointer items-center gap-3"
                            onClick={() =>
                              handleToggle("idiomas", language.num1!, selectedLanguages)
                            }
                          >
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                                selectedLanguages.includes(language.num1!)
                                  ? "border-brand-wine bg-brand-wine"
                                  : "border-gray-300 group-hover:border-brand-wine"
                              }`}
                            >
                              {selectedLanguages.includes(language.num1!) && (
                                <Check size={14} className="text-brand-white" />
                              )}
                            </div>
                            <span className="text-sm font-medium capitalize text-gray-700">
                              {language.string1?.toLowerCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.idiomas && (
                      <p className="mt-2 text-xs text-red-500">{errors.idiomas.message}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-8 py-6">
            <button
              type="submit"
              className="flex min-w-32 items-center justify-center gap-2 rounded-lg bg-brand-black px-8 py-2.5 text-sm font-bold text-brand-white shadow-lg shadow-black/10 transition-all hover:scale-[1.02] hover:bg-brand-black/90 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoadingRoles || isLoadingLanguages || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{esModoEdicion ? "Guardando..." : "Procesando..."}</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-brand-white" />
                  <span>{esModoEdicion ? "Guardar Cambios" : "Confirmar"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
