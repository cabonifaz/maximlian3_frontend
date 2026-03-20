import { useState, useMemo, useRef } from "react";
import { Search, X, Check } from "lucide-react";
import type { MasterTableEntry } from "@maximilian/shared/types/master-table.type";
import { CustomLabel } from "./CustomLabel";

export interface MultiSearchableSelectProps {
  label: string;
  options: MasterTableEntry[] | undefined;
  value: number[];
  onChange: (val: number[]) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
}

export function MultiSearchableSelect({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = "Seleccione...",
  required = false,
  optional = false,
  disabled = false,
}: MultiSearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!options) return [];
    const seen = new Set<number>();
    return options
      .filter((opt) => {
        if (opt.num1 == null || seen.has(opt.num1)) return false;
        seen.add(opt.num1);
        return opt.string1?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      })
      .sort((a, b) => (a.string1 || "").localeCompare(b.string1 || ""));
  }, [options, searchTerm]);

  const selectedOptions = useMemo(() => {
    if (!options) return [];
    const seen = new Set<number>();
    return options.filter((opt) => {
      if (opt.num1 == null || seen.has(opt.num1) || !value.includes(opt.num1)) return false;
      seen.add(opt.num1);
      return true;
    });
  }, [options, value]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsOpen((prev) => !prev);
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

  return (
    <div className="relative space-y-2">
      <CustomLabel required={required} optional={optional}>{label}</CustomLabel>
      <div
        ref={triggerRef}
        className={`w-full px-4 py-2 bg-brand-white border ${error ? "border-red-500" : "border-gray-200"} rounded-xl text-sm flex items-center justify-between gap-2 transition-all min-h-[42px] ${isOpen ? "relative z-[102]" : ""} ${disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : "cursor-pointer hover:border-brand-wine/30"}`}
        onClick={handleToggle}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedOptions.length > 0 ? (
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
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <Search size={16} className="text-gray-400 shrink-0" />
      </div>

      {!disabled && isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
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
                })
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
