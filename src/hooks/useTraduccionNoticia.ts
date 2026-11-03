import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { servicioCompaniaNoticia } from "@maximilian/services/compania-noticia.service";
import { convertirFechaApiATextoFecha } from "@maximilian/shared/utils/fecha-noticia.util";
import type { CompaniaNoticiaListaItem } from "@maximilian/shared/types/compania-noticia.type";

interface TraduccionSeleccionada {
  idNoticia: number;
  idIdiomaOrigen: number;
  idIdioma: number;
}

export function useTraduccionNoticia(noticia: CompaniaNoticiaListaItem | null) {
  const queryClient = useQueryClient();
  const idNoticia = noticia?.idNoticia ?? 0;
  const idIdiomaOrigen = noticia?.idIdioma ?? 0;
  const [seleccion, setSeleccion] = useState<TraduccionSeleccionada | null>(null);

  const idIdiomaDestino =
    seleccion?.idNoticia === idNoticia && seleccion.idIdiomaOrigen === idIdiomaOrigen
      ? seleccion.idIdioma
      : null;

  const versionesQuery = useQuery({
    queryKey: ["companiaNoticia", "versiones", idNoticia],
    queryFn: () => servicioCompaniaNoticia.listarVersiones({ idNoticia }),
    enabled: idNoticia > 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const versionGuardada =
    idIdiomaDestino !== null
      ? versionesQuery.data?.find((version) => version.idIdioma === idIdiomaDestino)
      : undefined;

  const traduccionQuery = useQuery({
    queryKey: ["companiaNoticiaTraduccion", idNoticia, idIdiomaOrigen, idIdiomaDestino],
    queryFn: async () => {
      const traduccion = await servicioCompaniaNoticia.traducir({
        idNoticia,
        idIdiomaOrigen,
        idIdiomaDestino: idIdiomaDestino as number,
      });

      if (noticia) {
        try {
          await servicioCompaniaNoticia.crear({
            idNoticia: noticia.idNoticia,
            idIdioma: idIdiomaDestino as number,
            idCompania: noticia.idCompania,
            titulo: traduccion.titulo,
            descripcion: traduccion.descripcion,
            fechaNoticia: new Date(
              `${convertirFechaApiATextoFecha(noticia.fechaNoticia)}T00:00:00`,
            ).toISOString(),
            categoria: noticia.categoria,
            archivos: [],
          });
          await queryClient.invalidateQueries({ queryKey: ["companiaNoticia"] });
        } catch {
          // El interceptor ya notifica el error; la traducción se muestra igualmente.
        }
      }

      return traduccion;
    },
    enabled: idIdiomaDestino !== null && !versionesQuery.isPending && !versionGuardada,
    staleTime: Infinity,
    retry: false,
  });

  const traduccion = versionGuardada
    ? { titulo: versionGuardada.titulo, descripcion: versionGuardada.descripcion }
    : idIdiomaDestino !== null
      ? traduccionQuery.data ?? null
      : null;

  const idIdiomaActivo =
    traduccionQuery.isError || idIdiomaDestino === null ? idIdiomaOrigen : idIdiomaDestino;
  const versionActiva =
    versionesQuery.data?.find((version) => version.idIdioma === idIdiomaActivo) ?? null;

  return {
    traduccion,
    versionActiva,
    idIdiomaActivo,
    estaTraduciendo: versionesQuery.isFetching || traduccionQuery.isFetching,
    seleccionar: (idIdioma: number) =>
      setSeleccion(
        idIdioma === idIdiomaOrigen ? null : { idNoticia, idIdiomaOrigen, idIdioma },
      ),
  };
}
