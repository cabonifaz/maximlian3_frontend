import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, User, LogOut } from "lucide-react";
import { authService } from "@maximilian/services/auth.service";
import LoadingScreen from "@maximilian/components/LoadingScreen";

const roles = [
  {
    id: "admin",
    title: "Administrador",
    description: "Acceso a configuracion de parametros y la gestion de usuarios",
  },
  {
    id: "coordinator",
    title: "Coordinador",
    description: "Gestion, supervision y revision de pedidos, clientes y facturas dentro del sistema",
  },
  {
    id: "analyst",
    title: "Analista",
    description: "Lectura de pedidos e investigacion de informes",
  },
];

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleRoleSelect = (roleId: string) => {
    console.log("Role selected:", roleId);
    if (roleId === "admin") {
      navigate("/admin");
    } else if (roleId === "coordinator") {
      navigate("/coordinator");
    } else {
      // Fallback for other roles
      navigate("/admin");
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      // Small artificial delay to make the transition feel smoother
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
      setIsLoggingOut(false);
    }
  };

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

        <p className="text-gray-400 text-center text-sm mb-10 leading-relaxed px-6">
          Credenciales validadas correctamente. Seleccione su rol para ingresar al sistema
        </p>

        <div className="w-full space-y-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              disabled={isLoggingOut}
              className="w-full p-5 bg-brand-white border border-gray-100 rounded-2xl flex items-center gap-4 hover:border-brand-black hover:border-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex-1">
                <h3 className="text-brand-black font-bold mb-1 group-hover:text-brand-wine transition-colors">
                  {role.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {role.description}
                </p>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-brand-wine transition-colors" size={20} />
            </button>
          ))}
        </div>

        <div className="w-full mt-10 pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <User size={20} />
            </div>
            <span className="text-sm font-bold text-brand-black">Juan Espinoza</span>
          </div>
          
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 text-brand-wine font-bold text-sm hover:opacity-80 hover:scale-[1.05] active:scale-95 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={18} />
            <span>Cerrar sesion</span>
          </button>
        </div>
      </div>

      {isLoggingOut && <LoadingScreen message="Cerrando sesión..." />}
    </div>
  );
}
