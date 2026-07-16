import { AlertTriangle } from "lucide-react";

interface PropsCustomIndicadorCambioExtraccion {
  visible: boolean;
  onClick: () => void;
}

export function CustomIndicadorCambioExtraccion({
  visible,
  onClick,
}: PropsCustomIndicadorCambioExtraccion) {
  if (!visible) return null;

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        onMouseDown={(evento) => {
          evento.preventDefault();
          evento.stopPropagation();
        }}
        onClick={(evento) => {
          evento.preventDefault();
          evento.stopPropagation();
          onClick();
        }}
        className="inline-flex items-center text-amber-500 transition-colors hover:text-amber-600"
      >
        <AlertTriangle size={16} />
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-52 -translate-x-1/2 rounded-lg bg-brand-black px-3 py-2 text-center text-xs font-medium text-white shadow-lg group-hover:block">
        Hay un posible cambio por la extraccion del documento
      </span>
    </span>
  );
}
