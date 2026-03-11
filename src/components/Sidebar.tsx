import { NavLink, useNavigate } from "react-router";
import { LogOut, Shield, type LucideIcon } from "lucide-react";
import { authService } from "@maximilian/services/auth.service";
import LoadingScreen from "./LoadingScreen";
import { useState } from "react";

interface SidebarItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface SidebarProps {
  items: SidebarItem[];
}

export function Sidebar({ items }: SidebarProps) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 bg-brand-white border-r border-gray-200 flex flex-col h-full shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-brand-black p-2 rounded-lg">
          <Shield className="text-brand-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-brand-black">
          Safety Report
        </span>
      </div>

      <nav className="mt-6 flex-1 px-4 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-gray-100 text-brand-black font-semibold border-r-4 border-brand-black"
                  : "text-gray-500 hover:bg-gray-50 hover:text-brand-black"
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-gray-100">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-brand-wine hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {isLoggingOut && <LoadingScreen message="Cerrando sesión..." />}
    </aside>
  );
}
