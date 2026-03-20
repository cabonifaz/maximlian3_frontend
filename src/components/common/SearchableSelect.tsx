import { useState, useMemo, useRef } from "react";
import { Search } from "lucide-react";
import type { MasterTableEntry } from "@maximilian/shared/types/master-table.type";
import { CustomLabel } from "./CustomLabel";

export interface SearchableSelectProps {
  label: string;
  options: MasterTableEntry[] | undefined;
  value: string | number | undefined;
  onChange: (val: number) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
}

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = "Seleccione...",
  required = false,
  optional = false,
  disabled = false,
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!options) return [];
    return options
      .filter((opt) =>
        opt.string1?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => (a.string1 || "").localeCompare(b.string1 || ""));
  }, [options, searchTerm]);

  const selectedOption = options?.find((opt) => opt.num1 === value);

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
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative space-y-2">
      <CustomLabel required={required} optional={optional}>{label}</CustomLabel>
      <div
        ref={triggerRef}
        className={`w-full px-4 py-2.5 bg-brand-white border ${error ? "border-red-500" : "border-gray-200"} rounded-xl text-sm flex items-center justify-between transition-all ${disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : "cursor-pointer hover:border-brand-wine/30"}`}
        onClick={handleToggle}
      >
        <span className={selectedOption ? "text-brand-black" : "text-gray-400"}>
          {selectedOption ? selectedOption.string1 : placeholder}
        </span>
        <Search size={16} className="text-gray-400" />
      </div>

      {!disabled && isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
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
              {filteredOptions.length > 0 ? (
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
          </div>
        </>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
