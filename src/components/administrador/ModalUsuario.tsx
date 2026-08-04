import {
  X,
  Check,
  Globe,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { DatosFormularioUsuario } from "@maximilian/schemas";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { useModalUsuario } from "@maximilian/hooks/useModalUsuario";

interface ModalUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (datosUsuario: DatosFormularioUsuario, reset: () => void) => void;
  modo: "crear" | "editar";
  datosIniciales?: DatosFormularioUsuario | null;
  isSubmitting?: boolean;
}

export function ModalUsuario({
  isOpen,
  onClose,
  onConfirm,
  modo,
  datosIniciales = null,
  isSubmitting = false,
}: ModalUsuarioProps) {
  const datosModal = useModalUsuario({
    isOpen,
    onClose,
    onConfirm,
    modo,
    datosIniciales,
  });
  const {
    register,
    handleSubmit,
  } = datosModal.formulario;
  const {
    alternarSeleccion,
    cerrar,
    enviar,
    errores,
    esModoEdicion,
    estaSeleccionadoTraductor,
    idiomasData,
    idiomasSeleccionados,
    isErrorLanguages,
    isErrorRoles,
    isLoadingLanguages,
    isLoadingRoles,
    refetchLanguages,
    refetchRoles,
    rolesData,
    rolesSeleccionados,
    setTabActiva,
    tabActiva,
    tieneErroresInfo,
    tieneErroresRoles,
  } = datosModal;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh w-screen items-center justify-center overflow-y-auto bg-brand-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full overflow-hidden rounded-xl bg-brand-white shadow-2xl animate-in zoom-in-95 duration-200 transition-all ${estaSeleccionadoTraductor && tabActiva === "roles" ? "max-w-4xl" : "max-w-2xl"}`}
      >
        <form onSubmit={handleSubmit(enviar)}>
          <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
            <h2 className="text-xl font-bold text-brand-black">
              {tabActiva === "info"
                ? esModoEdicion
                  ? "Editar Usuario"
                  : "Agrega un Usuario"
                : "Roles de Usuario"}
            </h2>
            <button
              type="button"
              onClick={cerrar}
              className="cursor-pointer text-gray-400 transition-colors hover:text-brand-black"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mt-6 px-8">
            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setTabActiva("info")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                  tabActiva === "info"
                    ? "border-b-2 border-brand-black bg-brand-white text-brand-black shadow-sm"
                    : "text-gray-500 hover:text-brand-black"
                }`}
              >
                <span>Información</span>
                {tieneErroresInfo && (
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setTabActiva("roles")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                  tabActiva === "roles"
                    ? "border-b-2 border-brand-black bg-brand-white text-brand-black shadow-sm"
                    : "text-gray-500 hover:text-brand-black"
                }`}
              >
                <span>Roles</span>
                {tieneErroresRoles && (
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            </div>
          </div>

          <div className="min-h-80 p-4 sm:p-8">
            {tabActiva === "info" ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <CustomLabel required className="text-sm font-semibold text-brand-black">
                    Nombre
                  </CustomLabel>
                  <input
                    {...register("nombres")}
                    type="text"
                    placeholder="Nombre"
                    className={`w-full rounded-lg border bg-brand-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/20 ${errores.nombres ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errores.nombres && (
                    <p className="text-xs text-red-500">{errores.nombres.message}</p>
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
                    className={`w-full rounded-lg border bg-brand-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/20 ${errores.apellidoPaterno ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errores.apellidoPaterno && (
                    <p className="text-xs text-red-500">{errores.apellidoPaterno.message}</p>
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
                    className={`w-full rounded-lg border bg-brand-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/20 ${errores.apellidoMaterno ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errores.apellidoMaterno && (
                    <p className="text-xs text-red-500">{errores.apellidoMaterno.message}</p>
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
                        : `w-full rounded-lg border bg-brand-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/20 ${errores.usuarioCreacion ? "border-red-500" : "border-gray-200"}`
                    }
                  />
                  {errores.usuarioCreacion && (
                    <p className="text-xs text-red-500">{errores.usuarioCreacion.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
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
                        : `w-full rounded-lg border bg-brand-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/20 ${errores.correo ? "border-red-500" : "border-gray-200"}`
                    }
                  />
                  {errores.correo && (
                    <p className="text-xs text-red-500">{errores.correo.message}</p>
                  )}
                </div>

                {esModoEdicion && (
                  <div className="flex items-center gap-3 md:col-span-2">
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
                className={`grid transition-all duration-300 ${estaSeleccionadoTraductor ? "grid-cols-1 gap-8 md:grid-cols-2 md:gap-12" : "grid-cols-1"}`}
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
                          onClick={() => alternarSeleccion("roles", role.num1!, rolesSeleccionados)}
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                              rolesSeleccionados.includes(role.num1!)
                                ? "border-brand-black bg-brand-black"
                                : "border-gray-300 group-hover:border-brand-black"
                            }`}
                          >
                            {rolesSeleccionados.includes(role.num1!) && (
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
                  {errores.roles && (
                    <p className="mt-2 text-xs text-red-500">{errores.roles.message}</p>
                  )}
                </div>

                {estaSeleccionadoTraductor && (
                  <div className="animate-in space-y-4 border-t border-gray-100 pt-8 fade-in slide-in-from-left-4 duration-300 md:border-l md:border-t-0 md:pl-12 md:pt-0">
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
                              alternarSeleccion("idiomas", language.num1!, idiomasSeleccionados)
                            }
                          >
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                                idiomasSeleccionados.includes(language.num1!)
                                  ? "border-brand-wine bg-brand-wine"
                                  : "border-gray-300 group-hover:border-brand-wine"
                              }`}
                            >
                              {idiomasSeleccionados.includes(language.num1!) && (
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
                    {errores.idiomas && (
                      <p className="mt-2 text-xs text-red-500">{errores.idiomas.message}</p>
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
