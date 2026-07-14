import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PropsCustomPaginacionInvestigacion {
  paginaActual: number;
  totalRegistros: number;
  filasPorPagina?: number;
  onPaginaChange: (pagina: number) => void;
  etiquetaRegistros: string;
  contenidoCentro?: ReactNode;
}

export function CustomPaginacionInvestigacion({
  paginaActual,
  totalRegistros,
  filasPorPagina = 5,
  onPaginaChange,
  etiquetaRegistros,
  contenidoCentro,
}: PropsCustomPaginacionInvestigacion) {
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / filasPorPagina));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const mostrando = totalRegistros === 0
    ? 0
    : Math.min(filasPorPagina, totalRegistros - ((paginaSegura - 1) * filasPorPagina));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-3">
      <p className="text-xs font-medium text-slate-400">
        Mostrando {mostrando} de {totalRegistros} {etiquetaRegistros}
      </p>

      {contenidoCentro ? (
        <div className="text-xs font-semibold text-slate-500">{contenidoCentro}</div>
      ) : <div />}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onPaginaChange(Math.max(1, paginaSegura - 1))}
          disabled={paginaSegura === 1}
          className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-brand-black disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft size={14} />
          Anterior
        </button>
        <span className="text-xs font-medium text-slate-400">
          {paginaSegura}/{totalPaginas}
        </span>
        <button
          type="button"
          onClick={() => onPaginaChange(Math.min(totalPaginas, paginaSegura + 1))}
          disabled={paginaSegura === totalPaginas}
          className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-brand-black disabled:cursor-not-allowed disabled:opacity-30"
        >
          Siguiente
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
