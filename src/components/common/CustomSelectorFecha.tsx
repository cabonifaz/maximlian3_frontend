import { useState } from "react";
import { format, type Locale } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@maximilian/components/common/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@maximilian/components/common/shadcn/popover";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";

interface CustomSelectorFechaProps {
  label?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  required?: boolean;
  optional?: boolean;
  error?: string;
  placeholder?: string;
  formatoVisual?: string;
  localeVisual?: Locale;
}

export function CustomSelectorFecha({
  label,
  value,
  onChange,
  disabled = false,
  required,
  optional,
  error,
  placeholder = "dd/mm/aaaa",
  formatoVisual = "dd/MM/yyyy",
  localeVisual = es,
}: CustomSelectorFechaProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (date === undefined) return;
    onChange(date);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <CustomLabel required={required} optional={optional}>
          {label}
        </CustomLabel>
      )}
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger
          disabled={disabled}
          className={`w-full flex items-center justify-between px-4 py-2.5 bg-brand-white border ${
            error ? "border-red-500" : "border-gray-200"
          } rounded-xl text-sm text-left focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all cursor-pointer hover:border-gray-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
        >
          {value ? (
            <span className="text-gray-900">{formatearFechaVisual(value, formatoVisual, localeVisual)}</span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
          <CalendarIcon size={16} className="text-gray-400 shrink-0" />
        </PopoverTrigger>
        <PopoverContent align="start" side="top" className="w-auto p-0">
          {/* Override --primary so selected days use brand-wine */}
          <div style={{ "--primary": "#722f37", "--primary-foreground": "#ffffff" } as React.CSSProperties}>
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleSelect}
              locale={localeVisual}
              captionLayout="dropdown"
            />
            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={() => handleSelect(new Date())}
                className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-brand-wine transition-colors hover:bg-brand-wine/10"
              >
                Hoy
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function formatearFechaVisual(fecha: Date, formatoVisual: string, localeVisual: Locale) {
  try {
    return format(fecha, formatoVisual || "dd/MM/yyyy", { locale: localeVisual });
  } catch {
    return format(fecha, "dd/MM/yyyy");
  }
}
