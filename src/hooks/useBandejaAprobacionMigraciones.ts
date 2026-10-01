import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccionesAprobacionMigraciones } from "@maximilian/hooks/useAccionesAprobacionMigraciones";
import { useFiltroRangoFechas } from "@maximilian/hooks/useFiltroRangoFechas";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioInformeAprobacion } from "@maximilian/services/informe-aprobacion.service";
import { CLAVE_CONSULTA_INFORMES_PENDIENTES_APROBACION } from "@maximilian/shared/constants/pages/Coordinador/aprobacion-migraciones.constants";
import type { ParametrosListaInformesPendientesAprobacion } from "@maximilian/shared/types/informe-aprobacion.type";
import { convertirDiaLocalAUtcIso } from "@maximilian/shared/utils/fecha.util";

export function useBandejaAprobacionMigraciones() {
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroPaises, setFiltroPaises] = useState<number[]>([]);
  const [filtroPlantillas, setFiltroPlantillas] = useState<number[]>([]);
  const [filtroIdiomas, setFiltroIdiomas] = useState<number[]>([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const terminoBusquedaConRetardo = useRetardo(terminoBusqueda);
  const [idsSeleccionados, setIdsSeleccionados] = useState<Set<number>>(new Set());
  const reiniciarPagina = () => setPaginaActual(1);
  const rangoFechas = useFiltroRangoFechas({ onCambio: reiniciarPagina });

  const parametros: ParametrosListaInformesPendientesAprobacion = {
    idPais: filtroPaises[0],
    idPlantilla: filtroPlantillas[0],
    idIdioma: filtroIdiomas[0],
    busqueda: terminoBusquedaConRetardo || undefined,
    fchInicio: rangoFechas.fechasInvalidas ? undefined : convertirDiaLocalAUtcIso(rangoFechas.fechaInicioFiltro, "inicio"),
    fchFin: rangoFechas.fechasInvalidas ? undefined : convertirDiaLocalAUtcIso(rangoFechas.fechaFinFiltro, "fin"),
    numPag: paginaActual,
  };

  const tieneFiltrosActivos = [
    parametros.idPais,
    parametros.idPlantilla,
    parametros.idIdioma,
    parametros.busqueda,
    parametros.fchInicio,
    parametros.fchFin,
  ].some((valor) => valor !== undefined);

  const consulta = useQuery({
    queryKey: [CLAVE_CONSULTA_INFORMES_PENDIENTES_APROBACION, parametros],
    queryFn: ({ signal }) => servicioInformeAprobacion.listarPendientes(parametros, signal),
    retry: false,
  });

  const acciones = useAccionesAprobacionMigraciones({
    parametros,
    totalRegistros: consulta.data?.totalRegistros ?? 0,
    registrosSeleccionados: (consulta.data?.lstInformes ?? [])
      .filter((registro) => idsSeleccionados.has(registro.idInforme)),
    onAccionCompletada: () => setIdsSeleccionados(new Set()),
  });

  const cambiarTerminoBusqueda = (valor: string) => {
    setTerminoBusqueda(valor);
    setIdsSeleccionados(new Set());
    reiniciarPagina();
  };

  return {
    ...consulta,
    acciones,
    cambiarTerminoBusqueda,
    filtroIdiomas,
    filtroPaises,
    filtroPlantillas,
    idsSeleccionados,
    paginaActual,
    rangoFechas,
    reiniciarPagina,
    setFiltroIdiomas,
    setFiltroPaises,
    setFiltroPlantillas,
    setIdsSeleccionados,
    setPaginaActual,
    terminoBusqueda,
    tieneFiltrosActivos,
  };
}
