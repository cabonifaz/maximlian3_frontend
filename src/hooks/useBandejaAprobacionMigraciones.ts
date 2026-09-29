import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFiltroRangoFechas } from "@maximilian/hooks/useFiltroRangoFechas";
import { servicioInformeAprobacion } from "@maximilian/services/informe-aprobacion.service";
import { CLAVE_CONSULTA_INFORMES_PENDIENTES_APROBACION } from "@maximilian/shared/constants/pages/Coordinador/aprobacion-migraciones.constants";
import type { ParametrosListaInformesPendientesAprobacion } from "@maximilian/shared/types/informe-aprobacion.type";
import { convertirDiaLocalAUtcIso } from "@maximilian/shared/utils/fecha.util";

export function useBandejaAprobacionMigraciones() {
  const queryClient = useQueryClient();
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroPaises, setFiltroPaises] = useState<number[]>([]);
  const [filtroPlantillas, setFiltroPlantillas] = useState<number[]>([]);
  const [filtroIdiomas, setFiltroIdiomas] = useState<number[]>([]);
  const [idsSeleccionados, setIdsSeleccionados] = useState<Set<number>>(new Set());
  const [estaAbiertoModalAprobacion, setEstaAbiertoModalAprobacion] = useState(false);
  const reiniciarPagina = () => setPaginaActual(1);
  const rangoFechas = useFiltroRangoFechas({ onCambio: reiniciarPagina });

  const parametros: ParametrosListaInformesPendientesAprobacion = {
    idPais: filtroPaises[0],
    idPlantilla: filtroPlantillas[0],
    idIdioma: filtroIdiomas[0],
    fchInicio: rangoFechas.fechasInvalidas ? undefined : convertirDiaLocalAUtcIso(rangoFechas.fechaInicioFiltro, "inicio"),
    fchFin: rangoFechas.fechasInvalidas ? undefined : convertirDiaLocalAUtcIso(rangoFechas.fechaFinFiltro, "fin"),
    numPag: paginaActual,
  };

  const consulta = useQuery({
    queryKey: [CLAVE_CONSULTA_INFORMES_PENDIENTES_APROBACION, parametros],
    queryFn: ({ signal }) => servicioInformeAprobacion.listarPendientes(parametros, signal),
    retry: false,
  });

  const idsVisiblesSeleccionados = (consulta.data?.lstInformes ?? [])
    .map((registro) => registro.idInforme)
    .filter((id) => idsSeleccionados.has(id));

  const mutacionAprobar = useMutation({
    mutationFn: (idInformes: number[]) => servicioInformeAprobacion.aprobar({ idInformes }),
    onSuccess: async () => {
      setIdsSeleccionados(new Set());
      setEstaAbiertoModalAprobacion(false);
      await queryClient.invalidateQueries({ queryKey: [CLAVE_CONSULTA_INFORMES_PENDIENTES_APROBACION] });
    },
  });

  const cerrarModalAprobacion = () => {
    if (mutacionAprobar.isPending) return;
    setEstaAbiertoModalAprobacion(false);
  };

  return {
    ...consulta,
    aprobarSeleccionados: () => mutacionAprobar.mutate(idsVisiblesSeleccionados),
    cantidadSeleccionados: idsVisiblesSeleccionados.length,
    cerrarModalAprobacion,
    estaAbiertoModalAprobacion,
    estaAprobando: mutacionAprobar.isPending,
    filtroIdiomas,
    filtroPaises,
    filtroPlantillas,
    idsSeleccionados,
    paginaActual,
    rangoFechas,
    reiniciarPagina,
    setEstaAbiertoModalAprobacion,
    setFiltroIdiomas,
    setFiltroPaises,
    setFiltroPlantillas,
    setIdsSeleccionados,
    setPaginaActual,
  };
}
