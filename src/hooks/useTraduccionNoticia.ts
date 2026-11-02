import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  const versiones = versionesQuery.data ?? [];
  const idsIdiomasGuardados = versiones.map((version) => version.idIdioma);
  const versionGuardada =
    idIdiomaDestino !== null
      ? versiones.find((version) => version.idIdioma === idIdiomaDestino)
      : undefined;

  const traduccionQuery = useQuery({
    queryKey: ["companiaNoticiaTraduccion", idNoticia, idIdiomaOrigen, idIdiomaDestino],
    queryFn: () =>
      servicioCompaniaNoticia.traducir({
        idNoticia,
        idIdiomaOrigen,
        idIdiomaDestino: idIdiomaDestino as number,
      }),
    enabled: idIdiomaDestino !== null && !versionesQuery.isPending && !versionGuardada,
    staleTime: Infinity,
    retry: false,
  });

  const traduccion = versionGuardada
    ? { titulo: versionGuardada.titulo, descripcion: versionGuardada.descripcion }
    : idIdiomaDestino !== null
      ? traduccionQuery.data ?? null
      : null;

  const guardarTraduccionMutation = useMutation({
    mutationFn: () => {
      if (!noticia || idIdiomaDestino === null || !traduccion || versionGuardada) {
        throw new Error("No hay una traducción para guardar.");
      }

      return servicioCompaniaNoticia.crear({
        idNoticia: noticia.idNoticia,
        idIdioma: idIdiomaDestino,
        idCompania: noticia.idCompania,
        titulo: traduccion.titulo,
        descripcion: traduccion.descripcion,
        fechaNoticia: new Date(
          `${convertirFechaApiATextoFecha(noticia.fechaNoticia)}T00:00:00`,
        ).toISOString(),
        categoria: noticia.categoria,
        archivos: [],
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["companiaNoticia"] });
    },
  });

  return {
    traduccion,
    idIdiomaSeleccionado: traduccionQuery.isError ? null : idIdiomaDestino,
    idsIdiomasGuardados,
    traduccionGuardada: Boolean(versionGuardada),
    estaTraduciendo: versionesQuery.isFetching || traduccionQuery.isFetching,
    estaGuardando: guardarTraduccionMutation.isPending,
    traducir: (idIdioma: number) =>
      setSeleccion({ idNoticia, idIdiomaOrigen, idIdioma }),
    verOriginal: () => setSeleccion(null),
    guardarTraduccion: () => guardarTraduccionMutation.mutate(),
  };
}
