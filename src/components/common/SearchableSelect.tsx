import { useState, useMemo, useRef, type ReactNode } from "react";
import { Search, Loader2, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSeleccionAutomaticaOpcionUnica } from "@maximilian/hooks/useSeleccionAutomaticaOpcionUnica";
import type { MasterTableEntry } from "@maximilian/shared/types/master-table.type";
import { masterTableService } from "@maximilian/services/masterTable.service";
import { CustomLabel } from "./CustomLabel";

export interface SearchableSelectProps {
  label?: ReactNode;
  idMaster?: number;
  options?: MasterTableEntry[] | undefined;
  value: string | number | undefined;
  onChange: (val: number) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onOpen?: () => void;
  onBlur?: () => void;
  onAddNew?: (searchTerm: string) => void;
  displayValue?: string;
  autoSeleccionarOpcionUnica?: boolean;
}

export function SearchableSelect({
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
  loading = false,
  onOpen,
  onBlur,
  onAddNew,
  displayValue,
  autoSeleccionarOpcionUnica = false,
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);

  const { data: fetchedOptions, isLoading: isMasterLoading } = useQuery({
    queryKey: ["masterTable", idMaster],
    queryFn: () => masterTableService.list(idMaster!),
    enabled: idMaster !== undefined && (isOpen || autoSeleccionarOpcionUnica),
    staleTime: Infinity,
  });

  const showLoading = isMasterLoading || loading;
  const resolvedOptions = idMaster ? fetchedOptions : options;

  const filteredOptions = useMemo(() => {
    if (!resolvedOptions) return [];
    return resolvedOptions
      .filter((opt) =>
        opt.string1?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => (a.string1 || "").localeCompare(b.string1 || ""));
  }, [resolvedOptions, searchTerm]);

  const selectedOption = resolvedOptions?.find((opt) => opt.num1 === value);

  useSeleccionAutomaticaOpcionUnica({
    activo: autoSeleccionarOpcionUnica,
    opciones: resolvedOptions,
    valor: typeof value === "number" ? value : undefined,
    onSeleccionar: onChange,
  });

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      onOpen?.();
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownStyle({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
      setIsOpen(true);
      return;
    }
    setIsOpen(false);
    onBlur?.();
  };

  return (
    <div className="relative space-y-2">
      {label != null && <CustomLabel required={required} optional={optional}>{label}</CustomLabel>}
      <div
        ref={triggerRef}
        className={`w-full px-4 py-2.5 bg-brand-white border ${error ? "border-red-500" : "border-gray-200"} rounded-xl text-sm flex items-center justify-between transition-all ${disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : "cursor-pointer hover:border-brand-wine/30"}`}
        onClick={handleToggle}
      >
        <span
          className={`truncate min-w-0 ${selectedOption || displayValue ? "text-brand-black" : "text-gray-400"}`}
          title={selectedOption?.string1 ?? displayValue ?? undefined}
        >
          {selectedOption ? selectedOption.string1 : (displayValue ?? placeholder)}
        </span>
        <Search size={16} className="text-gray-400 shrink-0 ml-2" />
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
          >
            <div className="p-2 border-b border-gray-50">
              <input
                type="text"
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-wine/10"
                placeholder="Buscar..."
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {showLoading ? (
                <div className="px-4 py-6 flex justify-center">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              ) : filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.num1}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-brand-wine/5 transition-colors ${value === opt.num1 ? "bg-brand-wine/10 text-brand-wine font-bold" : "text-gray-600"}`}
                    onClick={() => {
                      onChange(opt.num1!);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    {opt.string1}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-gray-400 italic text-center">
                  No se encontraron resultados
                </div>
              )}
            </div>
            {onAddNew && (
              <div
                className={`border-t border-gray-100 px-4 py-2.5 flex items-center gap-2 text-sm transition-colors font-medium ${searchTerm.trim() ? "cursor-pointer hover:bg-brand-wine/5 text-brand-wine" : "cursor-not-allowed text-gray-300"}`}
                onClick={(e) => {
                  if (!searchTerm.trim()) return;
                  e.stopPropagation();
                  onAddNew(searchTerm.trim());
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              >
                <Plus size={14} />
                Agregar nuevo tipo
              </div>
            )}
          </div>
        </>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
