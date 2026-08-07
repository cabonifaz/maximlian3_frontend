import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@maximilian/components/common/shadcn/popover";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";

interface CustomSelectorMesProps {
  label?: string;
  value?: Date;
  onChange: (fecha: Date | undefined) => void;
  disabled?: boolean;
  required?: boolean;
  optional?: boolean;
  error?: string;
  placeholder?: string;
}

const NOMBRES_MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const TAMANO_CUADRICULA_ANIOS = 12;

export function CustomSelectorMes({
  label,
  value,
  onChange,
  disabled = false,
  required,
  optional,
  error,
  placeholder = "mes/aaaa",
}: CustomSelectorMesProps) {
  const [open, setOpen] = useState(false);
  const [vista, setVista] = useState<"meses" | "anios">("meses");
  const [anioVisible, setAnioVisible] = useState(
    value?.getFullYear() ?? new Date().getFullYear(),
  );

  const inicioCuadriculaAnios =
    anioVisible - (anioVisible % TAMANO_CUADRICULA_ANIOS);
  const aniosCuadricula = Array.from(
    { length: TAMANO_CUADRICULA_ANIOS },
    (_, indice) => inicioCuadriculaAnios + indice,
  );

  const seleccionarMes = (mesIndice: number) => {
    onChange(new Date(anioVisible, mesIndice, 1));
    setOpen(false);
  };

  const seleccionarAnio = (anio: number) => {
    setAnioVisible(anio);
    setVista("meses");
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <CustomLabel required={required} optional={optional}>
          {label}
        </CustomLabel>
      )}
      <Popover
        open={open}
        onOpenChange={(siguienteAbierto) => {
          if (disabled) return;
          if (siguienteAbierto) {
            setAnioVisible(value?.getFullYear() ?? new Date().getFullYear());
            setVista("meses");
          }
          setOpen(siguienteAbierto);
        }}
      >
        <PopoverTrigger
          disabled={disabled}
          className={`w-full flex items-center justify-between px-4 py-2.5 bg-brand-white border ${
            error ? "border-red-500" : "border-gray-200"
          } rounded-xl text-sm text-left focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all cursor-pointer hover:border-gray-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
        >
          {value ? (
            <span className="capitalize text-gray-900">
              {format(value, "MMMM yyyy", { locale: es })}
            </span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
          <CalendarIcon size={16} className="text-gray-400 shrink-0" />
        </PopoverTrigger>
        <PopoverContent align="start" side="top" className="w-64 p-3">
          <div className="flex items-center justify-between px-1 pb-2">
            <button
              type="button"
              onClick={() =>
                setAnioVisible((anio) =>
                  vista === "meses" ? anio - 1 : anio - TAMANO_CUADRICULA_ANIOS)}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-slate-100 hover:text-brand-black"
              aria-label={vista === "meses" ? "Año anterior" : "Años anteriores"}
            >
              <ChevronLeft size={16} />
            </button>
            {vista === "meses" ? (
              <button
                type="button"
                onClick={() => setVista("anios")}
                className="rounded-lg px-2 py-1 text-sm font-bold text-brand-black transition-colors hover:bg-slate-100"
              >
                {anioVisible}
              </button>
            ) : (
              <span className="text-sm font-bold text-brand-black">
                {inicioCuadriculaAnios} - {inicioCuadriculaAnios + TAMANO_CUADRICULA_ANIOS - 1}
              </span>
            )}
            <button
              type="button"
              onClick={() =>
                setAnioVisible((anio) =>
                  vista === "meses" ? anio + 1 : anio + TAMANO_CUADRICULA_ANIOS)}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-slate-100 hover:text-brand-black"
              aria-label={vista === "meses" ? "Año siguiente" : "Años siguientes"}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {vista === "meses" ? (
            <div className="grid grid-cols-3 gap-1.5">
              {NOMBRES_MESES.map((nombreMes, indice) => {
                const seleccionado =
                  value?.getFullYear() === anioVisible && value.getMonth() === indice;

                return (
                  <button
                    key={nombreMes}
                    type="button"
                    onClick={() => seleccionarMes(indice)}
                    className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                      seleccionado
                        ? "bg-brand-wine text-brand-white"
                        : "text-slate-700 hover:bg-brand-wine/10"
                    }`}
                  >
                    {nombreMes}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {aniosCuadricula.map((anio) => {
                const seleccionado = anio === anioVisible;

                return (
                  <button
                    key={anio}
                    type="button"
                    onClick={() => seleccionarAnio(anio)}
                    className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                      seleccionado
                        ? "bg-brand-wine text-brand-white"
                        : "text-slate-700 hover:bg-brand-wine/10"
                    }`}
                  >
                    {anio}
                  </button>
                );
              })}
            </div>
          )}

          {vista === "meses" ? (
            <div className="mt-2 border-t border-gray-100 pt-2">
              <button
                type="button"
                onClick={() => {
                  const ahora = new Date();
                  setAnioVisible(ahora.getFullYear());
                  onChange(new Date(ahora.getFullYear(), ahora.getMonth(), 1));
                  setOpen(false);
                }}
                className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-brand-wine transition-colors hover:bg-brand-wine/10"
              >
                Este mes
              </button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
