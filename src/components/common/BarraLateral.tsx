import {
  LogOut,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router";
import { useCerrarSesion } from "@maximilian/hooks/useCerrarSesion";
import { CustomButton } from "./CustomButton";
import PantallaCarga from "./PantallaCarga";

interface ElementoBarraLateral {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface PropsBarraLateral {
  items: ElementoBarraLateral[];
  estaColapsada: boolean;
}

export function BarraLateral({ items, estaColapsada }: PropsBarraLateral) {
  const { cerrarSesion, estaCerrandoSesion } = useCerrarSesion();

  return (
    <aside
      aria-label="Navegación principal"
      className={`flex h-full shrink-0 flex-col border-r border-gray-200 bg-brand-white transition-[width] duration-300 ease-in-out ${estaColapsada ? "w-20" : "w-64"}`}
    >
      <div
        className={`flex items-center py-6 ${estaColapsada ? "justify-center px-3" : "gap-3 px-6"}`}
      >
        <div className="bg-brand-black p-2 rounded-lg">
          <Shield className="text-brand-white w-6 h-6" />
        </div>
        {!estaColapsada && (
          <span className="whitespace-nowrap text-xl font-bold tracking-tight text-brand-black">
            Safety Report
          </span>
        )}
      </div>

      <nav
        aria-label="Secciones"
        className={`mt-6 flex-1 space-y-2 overflow-y-auto ${estaColapsada ? "px-3" : "px-4"}`}
      >
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            aria-label={item.name}
            title={estaColapsada ? item.name : undefined}
            className={({ isActive }) =>
              `flex min-h-11 items-center rounded-lg py-3 transition-all duration-200 ${estaColapsada ? "justify-center px-3" : "gap-3 px-4"} ${
                isActive
                  ? estaColapsada
                    ? "bg-gray-100 text-brand-black ring-1 ring-gray-200"
                    : "border-r-4 border-brand-black bg-gray-100 font-semibold text-brand-black"
                  : "text-gray-500 hover:bg-gray-50 hover:text-brand-black"
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            {!estaColapsada && (
              <span
                className="min-w-0 flex-1 truncate"
                onMouseEnter={(evento) => {
                  evento.currentTarget.title =
                    evento.currentTarget.scrollWidth > evento.currentTarget.clientWidth
                      ? item.name
                      : "";
                }}
              >
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        className={`mt-auto border-t border-gray-100 ${estaColapsada ? "p-3" : "p-4"}`}
      >
        <CustomButton
          type="button"
          variant="ghost"
          size={estaColapsada ? "icon" : "md"}
          onClick={cerrarSesion}
          disabled={estaCerrandoSesion}
          aria-label="Cerrar sesión"
          title={estaColapsada ? "Cerrar sesión" : undefined}
          className={`text-gray-500 hover:bg-red-50 hover:text-brand-wine ${estaColapsada ? "mx-auto" : "w-full justify-start rounded-lg px-4 py-3"}`}
        >
          <LogOut size={20} className="shrink-0" />
          {!estaColapsada && <span>Cerrar sesión</span>}
        </CustomButton>
      </div>

      {estaCerrandoSesion && <PantallaCarga message="Cerrando sesión..." />}
    </aside>
  );
}
