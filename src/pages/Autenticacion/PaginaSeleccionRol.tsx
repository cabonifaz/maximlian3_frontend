import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, User, LogOut, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { servicioAutenticacion } from "@maximilian/services/autenticacion.service";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";
import type { Role } from "@maximilian/shared/types/autenticacion.type";

export default function PaginaSeleccionRol() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userRoles"],
    queryFn: () => servicioAutenticacion.getUserRoles(),
    retry: 1,
  });

  const handleRoleSelect = (role: Role) => {
    const roleNormalized = role.rol.toUpperCase();
    
    // Save selection and available roles to sessionStorage
    sessionStorage.setItem("selected_role", role.rol);
    sessionStorage.setItem("selected_role_id", role.idRol.toString());
    sessionStorage.setItem("user_session", JSON.stringify(userData));

    if (roleNormalized === "ADMINISTRADOR") {
      navigate("/administrador");
    } else if (roleNormalized === "COORDINADOR") {
      navigate("/coordinador");
    } else {
      // Fallback for other roles (Analyst/Translator)
      navigate("/administrador");
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await servicioAutenticacion.logout();
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate("/iniciar-sesion");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return <PantallaCarga message="Cargando roles disponibles..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-brand-white w-full max-w-md p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/safety-logo.jpg"
            alt="Safety Report Logo"
            className="h-24 object-contain"
          />
        </div>

        {isError ? (
          <div className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center text-center gap-2 mb-6">
            <AlertCircle className="text-red-500" size={24} />
            <p className="text-red-700 text-sm font-medium">
              {(error as Error).message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-red-600 text-xs font-bold hover:underline cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <p className="text-gray-400 text-center text-sm mb-10 leading-relaxed px-6">
            Credenciales validadas correctamente. Seleccione su rol para
            ingresar al sistema
          </p>
        )}

        <div className="w-full space-y-4">
          {userData?.roles.map((role) => (
            <button
              key={role.idRol}
              onClick={() => handleRoleSelect(role)}
              disabled={isLoggingOut}
              className="w-full p-5 bg-brand-white border border-gray-100 rounded-2xl flex items-center gap-4 hover:border-brand-black hover:border-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex-1">
                <h3 className="text-brand-black font-bold mb-1 group-hover:text-brand-wine transition-colors capitalize">
                  {role.rol.toLowerCase()}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                  {role.descripcion}
                </p>
              </div>
              <ChevronRight
                className="text-gray-300 group-hover:text-brand-wine transition-colors"
                size={20}
              />
            </button>
          ))}

          {!isLoading &&
            !isError &&
            (!userData || userData.roles.length === 0) && (
              <p className="text-center text-gray-400 text-sm py-4">
                No se encontraron roles asignados para su usuario.
              </p>
            )}
        </div>

        <div className="w-full mt-10 pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
              <User size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-brand-black truncate">
                {userData?.nombres || "Usuario"}
              </span>
              <span className="text-[10px] text-gray-400 truncate">
                {userData?.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 text-brand-wine font-bold text-sm hover:opacity-80 hover:scale-[1.05] active:scale-95 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <LogOut size={18} />
            <span>Cerrar sesion</span>
          </button>
        </div>
      </div>

      {isLoggingOut && <PantallaCarga message="Cerrando sesión..." />}
    </div>
  );
}
