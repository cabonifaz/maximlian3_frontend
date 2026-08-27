import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Search, X, Check, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSeleccionAutomaticaOpcionUnicaMultiple } from "@maximilian/hooks/useSeleccionAutomaticaOpcionUnica";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import { CustomLabel } from "./CustomLabel";

export interface MultiCustomSelectorBuscableProps {
  label: string;
  idMaster?: number;
  options?: EntradaTablaMaestra[] | undefined;
  value: number[];
  onChange: (val: number[]) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  hideLabel?: boolean;
  triggerIcon?: React.ElementType;
  autoSeleccionarOpcionUnica?: boolean;
  resumirSelecciones?: boolean;
  onBlur?: () => void;
  mostrarAccionSeleccionarTodos?: boolean;
}

export function MultiCustomSelectorBuscable({
  label,
  idMaster,
  options,
  value,
  onChange,
  error,
  placeholder = "Seleccione...",
  required = false,
  optional = false,
  disabled = false,
  hideLabel = false,
  triggerIcon: TriggerIcon = Search,
  autoSeleccionarOpcionUnica = false,
  resumirSelecciones = false,
  onBlur,
  mostrarAccionSeleccionarTodos = false,
}: MultiCustomSelectorBuscableProps) {
  const [terminoBusqueda, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const ALTURA_DROPDOWN = 260;
  const MARGEN_VENTANA = 16;

  const { data: fetchedOptions, isLoading } = useQuery({
    queryKey: ["masterTable", idMaster],
    queryFn: () => servicioTablaMaestra.list(idMaster!),
    enabled: idMaster !== undefined && (isOpen || autoSeleccionarOpcionUnica),
    staleTime: Infinity,
  });

  const resolvedOptions = idMaster ? fetchedOptions : options;

  const filteredOptions = useMemo(() => {
    if (!resolvedOptions) return [];
    const seen = new Set<number>();
    return resolvedOptions
      .filter((opt) => {
        if (opt.num1 == null || seen.has(opt.num1)) return false;
        seen.add(opt.num1);
        return opt.string1?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ?? false;
      })
      .sort((a, b) => {
        const seleccionadoA = value.includes(a.num1!);
        const seleccionadoB = value.includes(b.num1!);
        if (seleccionadoA !== seleccionadoB) return seleccionadoA ? -1 : 1;
        return (a.string1 || "").localeCompare(b.string1 || "");
      });
  }, [resolvedOptions, terminoBusqueda, value]);

  const selectedOptions = useMemo(() => {
    if (!resolvedOptions) return [];
    const seen = new Set<number>();
    return resolvedOptions.filter((opt) => {
      if (opt.num1 == null || seen.has(opt.num1) || !value.includes(opt.num1)) return false;
      seen.add(opt.num1);
      return true;
    });
  }, [resolvedOptions, value]);

  useSeleccionAutomaticaOpcionUnicaMultiple({
    activo: autoSeleccionarOpcionUnica,
    opciones: resolvedOptions,
    valores: value,
    onSeleccionar: onChange,
  });

  const actualizarPosicionDropdown = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const espacioInferior = window.innerHeight - rect.bottom - MARGEN_VENTANA;
    const maxHeight = Math.max(120, espacioInferior - 8);

    setDropdownStyle({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      maxHeight: Math.min(ALTURA_DROPDOWN, maxHeight),
    });
  }, [ALTURA_DROPDOWN, MARGEN_VENTANA]);

  useEffect(() => {
    if (!isOpen) return;

    const manejarDesplazamiento = () => actualizarPosicionDropdown();

    actualizarPosicionDropdown();
    window.addEventListener("scroll", manejarDesplazamiento, true);
    window.addEventListener("resize", manejarDesplazamiento);

    return () => {
      window.removeEventListener("scroll", manejarDesplazamiento, true);
      window.removeEventListener("resize", manejarDesplazamiento);
    };
  }, [isOpen, actualizarPosicionDropdown]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      actualizarPosicionDropdown();
    }
    if (isOpen) {
      setIsOpen(false);
      onBlur?.();
      return;
    }
    setIsOpen(true);
  };

  const handleSelect = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const handleRemove = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== id));
  };

  const mostrarResumen = resumirSelecciones && selectedOptions.length >= 2;
  const idsOpcionesFiltradas = filteredOptions.map((opcion) => opcion.num1).filter((id): id is number => id != null);
  const estanTodasSeleccionadas = idsOpcionesFiltradas.length > 0 && idsOpcionesFiltradas.every((id) => value.includes(id));

  return (
    <div className={`relative ${hideLabel ? "" : "space-y-2"}`}>
      {!hideLabel && <CustomLabel required={required} optional={optional}>{label}</CustomLabel>}
      <div
        ref={triggerRef}
        className={`w-full px-4 py-2 bg-brand-white border ${error ? "border-red-500" : "border-gray-200"} rounded-xl text-sm flex items-center justify-between gap-2 transition-all min-h-[42px] ${isOpen ? "relative z-[102]" : ""} ${disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : "cursor-pointer hover:border-brand-wine/30"}`}
        onClick={handleToggle}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedOptions.length > 0 ? (
            mostrarResumen ? (
              <span className="text-xs bg-brand-wine/10 text-brand-wine rounded-full px-2 py-0.5 flex items-center gap-1">
                {selectedOptions.length} seleccionados
              </span>
            ) : (
              selectedOptions.map((opt) => (
                <span
                  key={opt.num1}
                  className="text-xs bg-brand-wine/10 text-brand-wine rounded-full px-2 py-0.5 flex items-center gap-1"
                >
                  {opt.string1}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => handleRemove(e, opt.num1!)}
                      className="hover:text-brand-wine/70"
                    >
                      <X size={10} />
                    </button>
                  )}
                </span>
              ))
            )
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <TriggerIcon size={16} className="text-gray-400 shrink-0" />
      </div>

      {!disabled && isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => {
              setIsOpen(false);
              onBlur?.();
            }}
          />
          <div
            className="fixed bg-brand-white border border-gray-100 rounded-xl shadow-2xl z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={dropdownStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 border-b border-gray-50">
              <input
                type="text"
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-wine/10"
                placeholder="Buscar..."
                autoFocus
                value={terminoBusqueda}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-48 overflow-y-auto" style={{ maxHeight: dropdownStyle.maxHeight ? Number(dropdownStyle.maxHeight) - 56 : undefined }}>
              {isLoading ? (
                <div className="px-4 py-6 flex justify-center">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              ) : filteredOptions.length > 0 ? (
                <>
                  {mostrarAccionSeleccionarTodos && (
                    <div
                      className={`px-4 py-2 text-sm cursor-pointer border-b border-gray-100 transition-colors flex items-center gap-2 select-none ${estanTodasSeleccionadas ? "bg-brand-wine/10 text-brand-wine font-bold" : "text-brand-wine font-medium hover:bg-brand-wine/5"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (estanTodasSeleccionadas) {
                          onChange(value.filter((id) => !idsOpcionesFiltradas.includes(id)));
                          return;
                        }

                        onChange(Array.from(new Set([...value, ...idsOpcionesFiltradas])));
                      }}
                    >
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${estanTodasSeleccionadas ? "bg-brand-wine border-brand-wine" : "border-gray-300"}`}
                      >
                        {estanTodasSeleccionadas && <Check size={10} className="text-white" strokeWidth={3} />}
                      </span>
                      {estanTodasSeleccionadas ? "Deseleccionar todos" : "Seleccionar todos"}
                    </div>
                  )}
                  {filteredOptions.map((opt) => {
                  const selected = value.includes(opt.num1!);
                  return (
                    <div
                      key={opt.num1}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-brand-wine/5 transition-colors flex items-center gap-2 select-none ${selected ? "bg-brand-wine/10 text-brand-wine font-bold" : "text-gray-600"}`}
                      onClick={(e) => handleSelect(e, opt.num1!)}
                    >
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected ? "bg-brand-wine border-brand-wine" : "border-gray-300"}`}
                      >
                        {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                      </span>
                      {opt.string1}
                    </div>
                  );
                  })}
                </>
              ) : (
                <div className="px-4 py-3 text-xs text-gray-400 italic text-center">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
