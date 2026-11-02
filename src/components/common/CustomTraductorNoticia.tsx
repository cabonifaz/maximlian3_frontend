import { Languages, Loader2 } from "lucide-react";
import { IDIOMAS_TRADUCCION_NOTICIA } from "@maximilian/shared/constants/components/common/custom-traductor-noticia.constants";

interface PropsCustomTraductorNoticia {
  idIdiomaActivo: number;
  estaTraduciendo: boolean;
  onSeleccionar: (idIdioma: number) => void;
}

export function CustomTraductorNoticia({
  idIdiomaActivo,
  estaTraduciendo,
  onSeleccionar,
}: PropsCustomTraductorNoticia) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
      {estaTraduciendo ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Languages size={14} />
      )}
      {IDIOMAS_TRADUCCION_NOTICIA.map((idioma) => (
        <button
          key={idioma.id}
          type="button"
          disabled={estaTraduciendo}
          onClick={() => onSeleccionar(idioma.id)}
          className={`rounded-md px-2.5 py-1 transition disabled:cursor-not-allowed disabled:opacity-50 ${
            idIdiomaActivo === idioma.id
              ? "bg-brand-wine text-white"
              : "bg-slate-50 text-slate-600 ring-1 ring-slate-100 hover:bg-slate-100"
          }`}
        >
          {idioma.etiqueta}
        </button>
      ))}
    </div>
  );
}
