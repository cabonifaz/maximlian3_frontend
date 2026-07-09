import { type CSSProperties, useState } from "react";
import { Filter } from "lucide-react";
import { CustomSelectorBuscable } from "./CustomSelectorBuscable";
import { MultiCustomSelectorBuscable } from "./CustomSelectorBuscableMultiple";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

interface PropsCustomEncabezadoFiltroTabla {
  titulo: string;
  opciones?: EntradaTablaMaestra[];
  valores: number[];
  onChange: (valores: number[]) => void;
  onFiltroCambiado?: () => void;
  placeholder?: string;
  multiple?: boolean;
}

export function CustomEncabezadoFiltroTabla({
  titulo,
  opciones,
  valores,
  onChange,
  onFiltroCambiado,
  placeholder = "Seleccione",
  multiple = true,
}: PropsCustomEncabezadoFiltroTabla) {
  const [estaAbierto, setEstaAbierto] = useState(false);
  const [estiloMenu, setEstiloMenu] = useState<CSSProperties>({});
  const tieneFiltro = valores.length > 0;

  const actualizarSeleccion = (ids: number[]) => {
    onChange(ids);
    onFiltroCambiado?.();
  };

  const actualizarSeleccionUnica = (id: number) => {
    actualizarSeleccion([id]);
  };

  const limpiarSeleccionUnica = () => {
    actualizarSeleccion([]);
  };

  return (
    <div className="relative normal-case">
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {titulo}
        </span>
        <button
          type="button"
          aria-label={`Filtrar por ${titulo}`}
          title={`Filtrar por ${titulo}`}
          className={`relative flex h-8 w-8 items-center justify-center rounded-lg border transition ${
            estaAbierto || tieneFiltro
              ? "border-brand-wine/30 bg-brand-wine/10 text-brand-wine"
              : "border-gray-200 bg-white text-gray-400 hover:border-brand-wine/30 hover:text-brand-wine"
          }`}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setEstiloMenu({
              top: rect.bottom + 8,
              left: Math.min(rect.left, window.innerWidth - 280),
            });
            setEstaAbierto((valorActual) => !valorActual);
          }}
        >
          <Filter size={15} />
          {tieneFiltro ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-wine px-1 text-[10px] font-bold text-white">
              {valores.length}
            </span>
          ) : null}
        </button>
      </div>

      {estaAbierto ? (
        <>
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setEstaAbierto(false)}
          />
          <div
            className="fixed z-[91] w-64 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-2xl shadow-slate-950/15"
            style={estiloMenu}
            onClick={(event) => event.stopPropagation()}
          >
            {multiple ? (
              <MultiCustomSelectorBuscable
                label={titulo}
                triggerIcon={Filter}
                options={opciones}
                value={valores}
                onChange={actualizarSeleccion}
                resumirSelecciones
                placeholder={placeholder}
              />
            ) : (
              <CustomSelectorBuscable
                label={titulo}
                options={opciones}
                value={valores[0]}
                onChange={actualizarSeleccionUnica}
                onClear={limpiarSeleccionUnica}
                optional
                mostrarTextoOpcionalEnLabel={false}
                etiquetaOpcionVacia="Todos"
                placeholder={placeholder}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
