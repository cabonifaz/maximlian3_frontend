import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { servicioCompaniaNoticia } from "@maximilian/services/compania-noticia.service";
import type { CompaniaNoticiaTraduccion } from "@maximilian/shared/types/compania-noticia.type";

interface TraduccionSeleccionada {
  idCompaniaNoticia: number;
  idIdioma: number;
  traduccion: CompaniaNoticiaTraduccion;
}

export function useTraduccionNoticia(idCompaniaNoticia: number) {
  const [seleccion, setSeleccion] = useState<TraduccionSeleccionada | null>(null);

  const traducirMutation = useMutation({
    mutationFn: (idIdiomaDestino: number) =>
      servicioCompaniaNoticia.traducir({ idCompaniaNoticia, idIdiomaDestino }),
    onSuccess: (traduccion, idIdioma) => {
      setSeleccion({ idCompaniaNoticia, idIdioma, traduccion });
    },
  });

  const seleccionVigente =
    seleccion?.idCompaniaNoticia === idCompaniaNoticia ? seleccion : null;

  return {
    traduccion: seleccionVigente?.traduccion ?? null,
    idIdiomaSeleccionado: seleccionVigente?.idIdioma ?? null,
    estaTraduciendo: traducirMutation.isPending,
    traducir: (idIdiomaDestino: number) => traducirMutation.mutate(idIdiomaDestino),
    verOriginal: () => setSeleccion(null),
  };
}
