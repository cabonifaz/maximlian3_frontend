import { AlertCircle, Plus, Search } from "lucide-react";
import { CustomTablaParametros } from "@maximilian/components/administrador/CustomTablaParametros";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { useConfiguracionParametros } from "@maximilian/hooks/useConfiguracionParametros";
import { opcionesParametros } from "@maximilian/shared/constants/pages/Administrador/configuracion-parametros.constants";

export default function ConfiguracionParametros() {
  const modelo = useConfiguracionParametros();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">
            Mantenimiento de parametros
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configura y gestiona los valores maestros del sistema.
          </p>
        </div>
        <CustomButton
          type="button"
          variant="primary"
          size="sm"
          onClick={modelo.iniciarCreacion}
          disabled={modelo.estaGuardando}
          className="h-10 rounded-lg px-4 text-[11px] uppercase tracking-wide"
        >
          <Plus size={14} />
          <span>Agregar parametro</span>
        </CustomButton>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-sm">
            <CustomSelectorBuscable
              label="Seleccionar parametro"
              options={opcionesParametros}
              value={modelo.idMaestroSeleccionado}
              onChange={modelo.cambiarParametroSeleccionado}
              placeholder="Seleccione parametro"
              obtenerEtiquetaOpcion={(opcion) => opcion.string1 ?? ""}
            />
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
              size={16}
            />
            <input
              type="text"
              value={modelo.filtro}
              onChange={(event) => modelo.cambiarFiltro(event.target.value)}
              placeholder="Buscar en la tabla..."
              className="h-10 w-full rounded-lg border border-transparent bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>

        {modelo.mensajeValidacion && (
          <div className="mx-6 mb-2 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            <AlertCircle size={16} />
            <span>{modelo.mensajeValidacion}</span>
          </div>
        )}

        <CustomTablaParametros modelo={modelo} />
      </section>
    </div>
  );
}
