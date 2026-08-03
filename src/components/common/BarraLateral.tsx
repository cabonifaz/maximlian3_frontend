import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
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
  estaAbiertaMobile: boolean;
  alAlternarBarraLateral: () => void;
  alCerrarBarraLateralMobile: () => void;
}

export function BarraLateral({
  items,
  estaColapsada,
  estaAbiertaMobile,
  alAlternarBarraLateral,
  alCerrarBarraLateralMobile,
}: PropsBarraLateral) {
  const { cerrarSesion, estaCerrandoSesion } = useCerrarSesion();

  return (
    <>
      {estaAbiertaMobile ? (
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-slate-950/35 backdrop-blur-[1px] md:hidden"
          onClick={alCerrarBarraLateralMobile}
          aria-label="Cerrar menú lateral"
        />
      ) : null}

      <aside
        aria-label="Navegación principal"
        className={`fixed inset-y-0 left-0 z-[60] flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-brand-white transition-[transform,width] duration-300 ease-in-out md:static md:z-auto md:translate-x-0 ${
          estaAbiertaMobile ? "translate-x-0" : "-translate-x-full"
        } ${estaColapsada ? "md:w-20" : "md:w-64"}`}
      >
        <div
          className={`hidden items-center py-6 md:flex ${
            estaColapsada ? "justify-center px-3" : "px-6"
          }`}
        >
          <CustomButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={alAlternarBarraLateral}
            aria-label={
              estaColapsada
                ? "Expandir menú lateral"
                : "Colapsar menú lateral"
            }
            aria-expanded={!estaColapsada}
            title={estaColapsada ? "Expandir menú" : "Colapsar menú"}
            className="text-gray-500 hover:text-brand-black"
          >
            {estaColapsada ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </CustomButton>
        </div>

        <nav
          aria-label="Secciones"
          className={`mt-6 flex-1 space-y-2 overflow-y-auto px-4 ${
            estaColapsada ? "md:px-3" : "md:px-4"
          }`}
        >
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={item.name}
              title={estaColapsada ? item.name : undefined}
              onClick={alCerrarBarraLateralMobile}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                  estaColapsada
                    ? "md:justify-center md:gap-0 md:px-3"
                    : "md:gap-3 md:px-4"
                } ${
                  isActive
                    ? estaColapsada
                      ? "bg-gray-100 text-brand-black ring-1 ring-gray-200"
                      : "border-r-4 border-brand-black bg-gray-100 font-semibold text-brand-black"
                    : "text-gray-500 hover:bg-gray-50 hover:text-brand-black"
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              <span
                className={`min-w-0 flex-1 truncate ${
                  estaColapsada ? "md:hidden" : ""
                }`}
                onMouseEnter={(evento) => {
                  evento.currentTarget.title =
                    evento.currentTarget.scrollWidth
                      > evento.currentTarget.clientWidth
                      ? item.name
                      : "";
                }}
              >
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>

        <div
          className={`mt-auto border-t border-gray-100 p-4 ${
            estaColapsada ? "md:p-3" : "md:p-4"
          }`}
        >
          <CustomButton
            type="button"
            variant="ghost"
            size="md"
            onClick={cerrarSesion}
            disabled={estaCerrandoSesion}
            aria-label="Cerrar sesión"
            title={estaColapsada ? "Cerrar sesión" : undefined}
            className={`w-full justify-start rounded-lg px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-brand-wine ${
              estaColapsada
                ? "md:mx-auto md:w-auto md:justify-center md:px-2"
                : ""
            }`}
          >
            <LogOut size={20} className="shrink-0" />
            <span className={estaColapsada ? "md:hidden" : ""}>
              Cerrar sesión
            </span>
          </CustomButton>
        </div>

        {estaCerrandoSesion ? (
          <PantallaCarga message="Cerrando sesión..." />
        ) : null}
      </aside>
    </>
  );
}