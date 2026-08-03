import {
  Check,
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";
import { useEncabezado } from "@maximilian/hooks/useEncabezado";

interface PropsEncabezado {
  role?: string;
  estaColapsada: boolean;
  alAlternarBarraLateral: () => void;
}

export function Encabezado({
  role: rolInicial,
  estaColapsada,
  alAlternarBarraLateral,
}: PropsEncabezado) {
  const {
    cambiarRol,
    cerrarSesion,
    estaAbiertoMenuRol,
    estaCambiandoRol,
    estaCerrandoSesion,
    inicialesUsuario,
    nombreUsuario,
    rolesDisponibles,
    rolSeleccionado,
    setEstaAbiertoMenuRol,
  } = useEncabezado(rolInicial);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-6 border-b border-gray-100 bg-brand-white px-8">
        <CustomButton
          type="button"
          variant="ghost"
          size="icon"
          onClick={alAlternarBarraLateral}
          aria-label={estaColapsada ? "Expandir menú lateral" : "Colapsar menú lateral"}
          aria-expanded={!estaColapsada}
          title={estaColapsada ? "Expandir menú" : "Colapsar menú"}
          className="shrink-0 text-gray-500 hover:text-brand-black"
        >
          {estaColapsada ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </CustomButton>

        <div className="flex items-center gap-4 border-l pl-6 border-gray-100 h-10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-brand-black leading-tight truncate max-w-[150px]">
              {nombreUsuario}
            </p>
            <p className="text-[10px] text-gray-500 capitalize">
              {rolSeleccionado.toLowerCase()}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setEstaAbiertoMenuRol(!estaAbiertoMenuRol)}
              className="flex items-center gap-2 bg-gray-50 p-1.5 pr-3 rounded-full border border-gray-100 cursor-pointer hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-full bg-brand-wine flex items-center justify-center text-brand-white font-bold text-xs shrink-0">
                {inicialesUsuario}
              </div>
              <span className="text-sm font-medium text-gray-700 capitalize hidden md:block">
                {rolSeleccionado.toLowerCase()}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${estaAbiertoMenuRol ? "rotate-180" : ""}`}
              />
            </button>

            {estaAbiertoMenuRol && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setEstaAbiertoMenuRol(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-brand-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Cambiar rol
                    </p>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {rolesDisponibles.map((rol) => (
                      <button
                        key={rol.idRol}
                        onClick={() => cambiarRol(rol.rol)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <span
                          className={`capitalize ${rolSeleccionado === rol.rol ? "font-bold text-brand-wine" : ""}`}
                        >
                          {rol.rol.toLowerCase()}
                        </span>
                        {rolSeleccionado === rol.rol && (
                          <Check size={16} className="text-brand-wine" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-50 mt-2 pt-2">
                    <button
                      onClick={cerrarSesion}
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

      {estaCambiandoRol && <PantallaCarga message="Cambiando de rol..." />}
      {estaCerrandoSesion && <PantallaCarga message="Cerrando sesión..." />}
    </>
  );
}
