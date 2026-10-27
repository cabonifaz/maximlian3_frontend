import { Info } from "lucide-react";

interface CustomTooltipInformativoProps {
  mensaje: string;
}

export function CustomTooltipInformativo({ mensaje }: CustomTooltipInformativoProps) {
  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        aria-label={mensaje}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:bg-slate-100 focus-visible:text-slate-600 focus-visible:outline-none"
      >
        <Info className="h-4 w-4" />
      </button>
      <div
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-72 rounded-lg bg-brand-black px-3 py-2 text-xs font-medium text-brand-white shadow-lg group-focus-within:block group-hover:block"
      >
        {mensaje}
      </div>
    </div>
  );
}
