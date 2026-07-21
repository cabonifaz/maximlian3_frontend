import { useCallback, useEffect, useState, useMemo, useRef, type ReactNode } from "react";
import { Search, Loader2, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSeleccionAutomaticaOpcionUnica } from "@maximilian/hooks/useSeleccionAutomaticaOpcionUnica";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import { CustomLabel } from "./CustomLabel";

export interface CustomSelectorBuscableProps {
  label?: ReactNode;
  idMaster?: number;
  options?: EntradaTablaMaestra[] | undefined;
  value: string | number | undefined;
  onChange: (val: number) => void;
  onClear?: () => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  mostrarTextoOpcionalEnLabel?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onOpen?: () => void;
  onBlur?: () => void;
  alCambiarBusqueda?: (terminoBusqueda: string) => void;
  onAddNew?: (terminoBusqueda: string) => void;
  displayValue?: string;
  autoSeleccionarOpcionUnica?: boolean;
  dropdownZIndexClassName?: string;
  overlayZIndexClassName?: string;
  etiquetaOpcionVacia?: string;
  ordenarOpciones?: boolean;
  obtenerEtiquetaOpcion?: (opcion: EntradaTablaMaestra) => string;
  renderizarOpcion?: (opcion: EntradaTablaMaestra) => ReactNode;
  renderizarValorSeleccionado?: (opcion: EntradaTablaMaestra) => ReactNode;
  renderizarVistaPreviaAltaNueva?: (terminoBusqueda: string) => ReactNode;
  puedeAgregarNuevo?: (terminoBusqueda: string) => boolean;
}

export function CustomSelectorBuscable({
  label,
  idMaster,
  options,
  value,
  onChange,
  error,
  placeholder = "Seleccione...",
  required = false,
  optional = false,
  mostrarTextoOpcionalEnLabel = true,
  disabled = false,
  loading = false,
  onOpen,
  onBlur,
  alCambiarBusqueda,
  onAddNew,
  displayValue,
  autoSeleccionarOpcionUnica = false,
  dropdownZIndexClassName = "z-[101]",
  overlayZIndexClassName = "z-[100]",
  etiquetaOpcionVacia = "Seleccione",
  ordenarOpciones = true,
  obtenerEtiquetaOpcion,
  renderizarOpcion,
  renderizarValorSeleccionado,
  renderizarVistaPreviaAltaNueva,
  puedeAgregarNuevo,
  onClear,
}: CustomSelectorBuscableProps) {
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const ALTURA_DROPDOWN = 260;
  const MARGEN_VENTANA = 16;

  const { data: fetchedOptions, isLoading: isMasterLoading } = useQuery({
    queryKey: ["masterTable", idMaster],
    queryFn: () => servicioTablaMaestra.list(idMaster!),
    enabled: idMaster !== undefined && (isOpen || autoSeleccionarOpcionUnica),
    staleTime: Infinity,
  });

  const showLoading = isMasterLoading || loading;
  const resolvedOptions = idMaster ? fetchedOptions : options;

  const filteredOptions = useMemo(() => {
    if (!resolvedOptions) return [];
    const terminoNormalizado = terminoBusqueda.toLowerCase();
    const opcionesFiltradas = resolvedOptions.filter((opt) =>
        (opt.string1?.toLowerCase().includes(terminoNormalizado) ?? false)
        || (opt.string2?.toLowerCase().includes(terminoNormalizado) ?? false)
        || (obtenerEtiquetaOpcion?.(opt).toLowerCase().includes(terminoNormalizado) ?? false),
      );

    if (!ordenarOpciones) return opcionesFiltradas;

    return [...opcionesFiltradas].sort((a, b) =>
      (obtenerEtiquetaOpcion?.(a) || a.string1 || "").localeCompare(obtenerEtiquetaOpcion?.(b) || b.string1 || ""),
    );
  }, [obtenerEtiquetaOpcion, ordenarOpciones, resolvedOptions, terminoBusqueda]);

  const selectedOption = resolvedOptions?.find((opt) => opt.num1 === value);
  const displayText = selectedOption
    ? (obtenerEtiquetaOpcion?.(selectedOption) || selectedOption.string1)
    : (typeof displayValue === "string" ? displayValue.trim() : displayValue);
  const valorSeleccionadoRenderizado = selectedOption ? renderizarValorSeleccionado?.(selectedOption) : undefined;
  const mostrarPlaceholder = !displayText;

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

  useSeleccionAutomaticaOpcionUnica({
    activo: autoSeleccionarOpcionUnica,
    opciones: resolvedOptions,
    valor: typeof value === "number" ? value : undefined,
    onSeleccionar: onChange,
  });

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
    if (!isOpen) {
      onOpen?.();
      actualizarPosicionDropdown();
      setIsOpen(true);
      return;
    }
    setIsOpen(false);
    onBlur?.();
  };

  const cambiarTerminoBusqueda = (termino: string) => {
    setTerminoBusqueda(termino);
    alCambiarBusqueda?.(termino);
  };

  return (
    <div className="relative space-y-2">
      {label != null && <CustomLabel required={required} optional={optional && mostrarTextoOpcionalEnLabel}>{label}</CustomLabel>}
      <div
        ref={triggerRef}
        className={`w-full px-4 py-2.5 bg-brand-white border ${error ? "border-red-500" : "border-gray-200"} rounded-xl text-sm flex items-center justify-between transition-all ${disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : "cursor-pointer hover:border-brand-wine/30"}`}
        onClick={handleToggle}
      >
        <span
          className={`min-w-0 ${valorSeleccionadoRenderizado ? "whitespace-normal break-words leading-snug" : "truncate"} ${mostrarPlaceholder ? "text-gray-400" : "text-brand-black"}`}
          title={displayText || placeholder}
        >
          {mostrarPlaceholder ? placeholder : (valorSeleccionadoRenderizado ?? displayText)}
        </span>
        <Search size={16} className="text-gray-400 shrink-0 ml-2" />
      </div>

      {!disabled && isOpen && (
        <>
          <div
            className={`fixed inset-0 ${overlayZIndexClassName}`}
            onClick={() => {
              setIsOpen(false);
              onBlur?.();
            }}
          />
          <div
            className={`fixed bg-brand-white border border-gray-100 rounded-xl shadow-2xl ${dropdownZIndexClassName} overflow-hidden animate-in fade-in zoom-in-95 duration-100`}
            style={dropdownStyle}
          >
            <div className="p-2 border-b border-gray-50">
              <input
                type="text"
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-wine/10"
                placeholder="Buscar..."
                autoFocus
                value={terminoBusqueda}
                onChange={(e) => cambiarTerminoBusqueda(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-48 overflow-y-auto" style={{ maxHeight: dropdownStyle.maxHeight ? Number(dropdownStyle.maxHeight) - 56 : undefined }}>
              {showLoading ? (
                <div className="px-4 py-6 flex justify-center">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {optional && (
                    <div
                      className={`px-4 py-2 text-sm transition-colors ${onClear ? "cursor-pointer hover:bg-brand-wine/5" : "cursor-not-allowed opacity-60"} ${value == null ? "bg-brand-wine/10 text-brand-wine font-bold" : "text-gray-600"}`}
                      onClick={() => {
                        if (!onClear) return;
                        onClear?.();
                        setIsOpen(false);
                        cambiarTerminoBusqueda("");
                      }}
                    >
                      {etiquetaOpcionVacia}
                    </div>
                  )}
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((opt) => (
                      <div
                        key={opt.num1}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-brand-wine/5 transition-colors ${value === opt.num1 ? "bg-brand-wine/10 text-brand-wine font-bold" : "text-gray-600"}`}
                        onClick={() => {
                          onChange(opt.num1!);
                          setIsOpen(false);
                          cambiarTerminoBusqueda("");
                        }}
                      >
                        {renderizarOpcion?.(opt) ?? obtenerEtiquetaOpcion?.(opt) ?? opt.string1}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-gray-400 italic text-center">
                      No se encontraron resultados
                    </div>
                  )}
                </>
              )}
            </div>
            {onAddNew && (
              <div
                className={`border-t border-gray-100 px-4 py-2.5 text-sm transition-colors font-medium ${terminoBusqueda.trim() && (puedeAgregarNuevo?.(terminoBusqueda.trim()) ?? true) ? "cursor-pointer hover:bg-brand-wine/5 text-brand-wine" : "cursor-not-allowed text-gray-300"}`}
                onClick={(e) => {
                  const terminoLimpio = terminoBusqueda.trim();
                  if (!terminoLimpio || !(puedeAgregarNuevo?.(terminoLimpio) ?? true)) return;
                  e.stopPropagation();
                  onAddNew(terminoLimpio);
                  setIsOpen(false);
                  cambiarTerminoBusqueda("");
                }}
              >
                {renderizarVistaPreviaAltaNueva?.(terminoBusqueda.trim())}
                <div className="flex items-center gap-2">
                  <Plus size={14} />
                  Agregar nuevo tipo
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
