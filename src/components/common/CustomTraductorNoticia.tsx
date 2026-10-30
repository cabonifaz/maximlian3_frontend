import { Languages, Loader2 } from "lucide-react";
import { IDIOMAS_TRADUCCION_NOTICIA } from "@maximilian/shared/constants/components/common/custom-traductor-noticia.constants";

interface PropsCustomTraductorNoticia {
  idIdiomaSeleccionado: number | null;
  estaTraduciendo: boolean;
  onTraducir: (idIdiomaDestino: number) => void;
  onVerOriginal: () => void;
}

export function CustomTraductorNoticia({
  idIdiomaSeleccionado,
  estaTraduciendo,
  onTraducir,
  onVerOriginal,
}: PropsCustomTraductorNoticia) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
      {estaTraduciendo ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Languages size={14} />
      )}
      <span className="uppercase tracking-wide">Traducir a</span>
      {IDIOMAS_TRADUCCION_NOTICIA.map((idioma) => (
        <button
          key={idioma.id}
          type="button"
          disabled={estaTraduciendo}
          onClick={() => onTraducir(idioma.id)}
          className={`rounded-md px-2.5 py-1 transition disabled:cursor-not-allowed disabled:opacity-50 ${
            idIdiomaSeleccionado === idioma.id
              ? "bg-brand-wine text-white"
              : "bg-slate-50 text-slate-600 ring-1 ring-slate-100 hover:bg-slate-100"
          }`}
        >
          {idioma.etiqueta}
        </button>
      ))}
      {idIdiomaSeleccionado !== null ? (
        <button
          type="button"
          disabled={estaTraduciendo}
          onClick={onVerOriginal}
          className="px-1 text-slate-500 underline-offset-2 hover:underline disabled:opacity-50"
        >
          Ver original
        </button>
      ) : null}
    </div>
  );
}
