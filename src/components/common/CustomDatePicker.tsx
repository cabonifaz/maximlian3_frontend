import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@maximilian/components/common/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@maximilian/components/common/shadcn/popover";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";

interface CustomDatePickerProps {
  label?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  required?: boolean;
  optional?: boolean;
  error?: string;
  placeholder?: string;
}

export function CustomDatePicker({
  label,
  value,
  onChange,
  required,
  optional,
  error,
  placeholder = "dd/mm/aaaa",
}: CustomDatePickerProps) {
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={`w-full flex items-center justify-between px-4 py-2.5 bg-brand-white border ${
            error ? "border-red-500" : "border-gray-200"
          } rounded-xl text-sm text-left focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all cursor-pointer hover:border-gray-300`}
        >
          {value ? (
            <span className="text-gray-900">{format(value, "dd/MM/yyyy")}</span>
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
              locale={es}
              captionLayout="dropdown"
            />
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
