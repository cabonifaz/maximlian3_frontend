import { Languages, Loader2 } from "lucide-react";
import { IDIOMAS_TRADUCCION_NOTICIA } from "@maximilian/shared/constants/components/common/custom-traductor-noticia.constants";
import { CustomButton } from "./CustomButton";

interface PropsCustomTraductorNoticia {
  idIdiomaOriginal: number;
  idIdiomaSeleccionado: number | null;
  estaTraduciendo: boolean;
  estaGuardando: boolean;
  onTraducir: (idIdiomaDestino: number) => void;
  onVerOriginal: () => void;
  onGuardarTraduccion: () => void;
}

export function CustomTraductorNoticia({
  idIdiomaOriginal,
  idIdiomaSeleccionado,
  estaTraduciendo,
  estaGuardando,
  onTraducir,
  onVerOriginal,
  onGuardarTraduccion,
}: PropsCustomTraductorNoticia) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
      {estaTraduciendo ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Languages size={14} />
      )}
      <span className="uppercase tracking-wide">Traducir a</span>
      {IDIOMAS_TRADUCCION_NOTICIA.filter((idioma) => idioma.id !== idIdiomaOriginal).map(
        (idioma) => (
          <button
            key={idioma.id}
            type="button"
            disabled={estaTraduciendo || estaGuardando}
            onClick={() => onTraducir(idioma.id)}
            className={`rounded-md px-2.5 py-1 transition disabled:cursor-not-allowed disabled:opacity-50 ${
              idIdiomaSeleccionado === idioma.id
                ? "bg-brand-wine text-white"
                : "bg-slate-50 text-slate-600 ring-1 ring-slate-100 hover:bg-slate-100"
            }`}
          >
            {idioma.etiqueta}
          </button>
        ),
      )}
      {idIdiomaSeleccionado !== null ? (
        <>
          <button
            type="button"
            disabled={estaTraduciendo || estaGuardando}
            onClick={onVerOriginal}
            className="px-1 text-slate-500 underline-offset-2 hover:underline disabled:opacity-50"
          >
            Ver original
          </button>
          <CustomButton
            type="button"
            size="sm"
            disabled={estaTraduciendo}
            loading={estaGuardando}
            loadingText="Guardando..."
            onClick={onGuardarTraduccion}
          >
            Guardar traducción
          </CustomButton>
        </>
      ) : null}
    </div>
  );
}
