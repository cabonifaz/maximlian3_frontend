import { CheckCheck, ListChecks, Search } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { FUNCIONALIDADES_HABILITADAS } from "@maximilian/shared/constants/funcionalidades.constants";
import type { useAccionesAprobacionMigraciones } from "@maximilian/hooks/useAccionesAprobacionMigraciones";

interface PropsCustomAccionesBandejaAprobacionMigraciones {
  acciones: ReturnType<typeof useAccionesAprobacionMigraciones>;
  terminoBusqueda: string;
  onTerminoBusquedaChange: (valor: string) => void;
}

export function CustomAccionesBandejaAprobacionMigraciones({
  acciones,
  terminoBusqueda,
  onTerminoBusquedaChange,
}: PropsCustomAccionesBandejaAprobacionMigraciones) {
  const { cantidadSeleccionados } = acciones;
  const aprobarTodosHabilitado = FUNCIONALIDADES_HABILITADAS.aprobarTodosMigraciones;

  return (
    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
      <label className="relative w-full sm:w-72">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          value={terminoBusqueda}
          onChange={(evento) => onTerminoBusquedaChange(evento.target.value)}
          placeholder="Buscar por investigado..."
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
        />
      </label>

      <CustomButton
        variant="wine"
        size="sm"
        disabled={cantidadSeleccionados === 0}
        onClick={() => acciones.abrirModal("aprobar-seleccionados")}
      >
        <ListChecks size={16} />
        Aprobar seleccionados
        {cantidadSeleccionados > 0 ? ` (${cantidadSeleccionados})` : ""}
      </CustomButton>

      {aprobarTodosHabilitado ? (
        <CustomButton
          variant="primary"
          size="sm"
          disabled={!acciones.puedeAprobarTodos}
          onClick={() => acciones.abrirModal("aprobar-todos")}
        >
          <CheckCheck size={16} />
          Aprobar todo
        </CustomButton>
      ) : null}
    </div>
  );
}
