import { useState } from "react";
import { ChevronDown, LogOut, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { servicioAutenticacion } from "@maximilian/services/autenticacion.service";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";
import type { UserSession } from "@maximilian/shared/types/autenticacion.type";

interface PropsEncabezado {
  role?: string;
}

export function Encabezado({ role: initialRole }: PropsEncabezado) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Initialize state from sessionStorage to avoid useEffect setState
  const [sesionUsuario] = useState<UserSession | null>(() => {
    const session = sessionStorage.getItem("user_session");
    return session ? JSON.parse(session) : null;
  });

  const [selectedRole, setSelectedRole] = useState<string>(() => {
    return sessionStorage.getItem("selected_role") || initialRole || "";
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await servicioAutenticacion.logout();
      sessionStorage.clear();
      // Small artificial delay to make the transition feel smoother
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate("/iniciar-sesion");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
      setIsLoggingOut(false);
    }
  };

  const handleRoleChange = async (roleName: string) => {
    if (roleName === selectedRole) {
      setIsOpen(false);
      return;
    }

    setIsChangingRole(true);
    setIsOpen(false);

    try {
      const role = sesionUsuario?.roles.find((r) => r.rol === roleName);
      if (role) {
        sessionStorage.setItem("selected_role", role.rol);
        sessionStorage.setItem("selected_role_id", role.idRol.toString());
        setSelectedRole(roleName);
      }

      // Small delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 800));

      const roleNormalized = roleName.toUpperCase();
      if (roleNormalized === "ADMINISTRADOR") {
        navigate("/administrador");
      } else if (roleNormalized === "COORDINADOR") {
        navigate("/coordinador");
      } else {
        navigate("/administrador");
      }
    } finally {
      setIsChangingRole(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const userName = sesionUsuario?.nombres || "Usuario";
  const userInitials = getInitials(userName);
  const availableRoles = sesionUsuario?.roles || [];

  return (
    <>
      <header className="h-16 bg-brand-white border-b border-gray-100 px-8 flex items-center justify-end gap-6 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-4 border-l pl-6 border-gray-100 h-10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-brand-black leading-tight truncate max-w-[150px]">
              {userName}
            </p>
            <p className="text-[10px] text-gray-500 capitalize">
              {selectedRole.toLowerCase()}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 bg-gray-50 p-1.5 pr-3 rounded-full border border-gray-100 cursor-pointer hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-full bg-brand-wine flex items-center justify-center text-brand-white font-bold text-xs shrink-0">
                {userInitials}
              </div>
              <span className="text-sm font-medium text-gray-700 capitalize hidden md:block">
                {selectedRole.toLowerCase()}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-brand-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Cambiar rol
                    </p>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {availableRoles.map((role) => (
                      <button
                        key={role.idRol}
                        onClick={() => handleRoleChange(role.rol)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <span
                          className={`capitalize ${selectedRole === role.rol ? "font-bold text-brand-wine" : ""}`}
                        >
                          {role.rol.toLowerCase()}
                        </span>
                        {selectedRole === role.rol && (
                          <Check size={16} className="text-brand-wine" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-50 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {isChangingRole && <PantallaCarga message="Cambiando de rol..." />}
      {isLoggingOut && <PantallaCarga message="Cerrando sesión..." />}
    </>
  );
}
