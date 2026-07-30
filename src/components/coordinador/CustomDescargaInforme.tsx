import { FORMATOS } from "@maximilian/shared/constants/components/coordinador/custom-descarga-informe.constants";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { FormatoDescargaInforme } from "@maximilian/shared/types/informe.type";

interface PropsCustomDescargaInforme {
  deshabilitado?: boolean;
  puedeDescargarXml?: boolean;
  onDescargar: (formato: FormatoDescargaInforme) => void;
}

export function CustomDescargaInforme({
  deshabilitado = false,
  puedeDescargarXml = false,
  onDescargar,
}: PropsCustomDescargaInforme) {
  const [estaAbierto, setEstaAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cerrarMenu = (evento: MouseEvent) => {
      if (!contenedorRef.current?.contains(evento.target as Node)) setEstaAbierto(false);
    };
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setEstaAbierto(false);
    };

    document.addEventListener("mousedown", cerrarMenu);
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("mousedown", cerrarMenu);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, []);

  return (
    <div ref={contenedorRef} className="relative">
      <CustomButton
        size="sm"
        disabled={deshabilitado}
        aria-label="Descargar informe"
        aria-haspopup="menu"
        aria-expanded={estaAbierto}
        title="Descargar informe"
        onClick={() => setEstaAbierto((valorActual) => !valorActual)}
      >
        <Download size={14} />
        <ChevronDown size={14} />
      </CustomButton>

      {estaAbierto ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Descargar como
          </p>
          {FORMATOS.filter((formato) => formato.valor !== ".xml" || puedeDescargarXml).map((formato) => (
            <CustomButton
              key={formato.valor}
              variant="ghost"
              size="sm"
              role="menuitem"
              className="w-full justify-start rounded-lg px-3 py-2 text-slate-700"
              onClick={() => {
                setEstaAbierto(false);
                onDescargar(formato.valor);
              }}
            >
              {formato.etiqueta}
            </CustomButton>
          ))}
        </div>
      ) : null}
    </div>
  );
}
