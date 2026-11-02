import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { servicioCompaniaNoticia } from "@maximilian/services/compania-noticia.service";
import type { CompaniaNoticiaTraduccion } from "@maximilian/shared/types/compania-noticia.type";

interface TraduccionSeleccionada {
  idNoticia: number;
  idIdiomaOrigen: number;
  idIdioma: number;
  traduccion: CompaniaNoticiaTraduccion;
}

export function useTraduccionNoticia(idNoticia: number, idIdiomaOrigen: number) {
  const [seleccion, setSeleccion] = useState<TraduccionSeleccionada | null>(null);

  const traducirMutation = useMutation({
    mutationFn: (idIdiomaDestino: number) =>
      servicioCompaniaNoticia.traducir({ idNoticia, idIdiomaOrigen, idIdiomaDestino }),
    onSuccess: (traduccion, idIdioma) => {
      setSeleccion({ idNoticia, idIdiomaOrigen, idIdioma, traduccion });
    },
  });

  const seleccionVigente =
    seleccion?.idNoticia === idNoticia && seleccion.idIdiomaOrigen === idIdiomaOrigen
      ? seleccion
      : null;

  return {
    traduccion: seleccionVigente?.traduccion ?? null,
    idIdiomaSeleccionado: seleccionVigente?.idIdioma ?? null,
    estaTraduciendo: traducirMutation.isPending,
    traducir: (idIdiomaDestino: number) => traducirMutation.mutate(idIdiomaDestino),
    verOriginal: () => setSeleccion(null),
  };
}
