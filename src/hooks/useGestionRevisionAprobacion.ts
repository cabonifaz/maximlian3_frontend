import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { informeService } from "@maximilian/services/informe.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { InformeListEntry } from "@maximilian/shared/types/informe.type";
import type { TarjetaResumenAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { normalizarOpcionesFiltroRevision } from "@maximilian/shared/utils/gestion-revision-aprobacion.util";

export function useGestionRevisionAprobacion() {
  const navigate = useNavigate();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroPlantillas, setFiltroPlantillas] = useState<number[]>([]);
  const [filtroEstados, setFiltroEstados] = useState<number[]>([]);
  const [filtroTipos, setFiltroTipos] = useState<number[]>([]);
  const terminoBusquedaConRetardo = useRetardo(terminoBusqueda);
  const idPlantillaFiltro = filtroPlantillas.join(",") || undefined;
  const idEstadoFiltro = filtroEstados.join(",") || undefined;
  const idTipoTramiteFiltro = filtroTipos.join(",") || undefined;

  const {
    data: respuestaInformes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "informes-bandeja-coordinador-revision",
      "con-plantilla",
      paginaActual,
      terminoBusquedaConRetardo,
      idPlantillaFiltro,
      idEstadoFiltro,
      idTipoTramiteFiltro,
    ],
    queryFn: ({ signal }) =>
      informeService.list({
        numPag: paginaActual,
        busqueda: terminoBusquedaConRetardo.trim() || undefined,
        idPlantilla: idPlantillaFiltro,
        idEstado: idEstadoFiltro,
        idTipoTramite: idTipoTramiteFiltro,
      }, signal),
    enabled: terminoBusqueda.trim() === terminoBusquedaConRetardo,
    retry: false,
    refetchOnMount: "always",
  });

  const registros = useMemo<InformeListEntry[]>(
    () => respuestaInformes?.lstInforme ?? [],
    [respuestaInformes?.lstInforme],
  );

  const { data: opcionesPlantillaInforme } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PLANTILLA_INFORME],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PLANTILLA_INFORME),
    staleTime: Infinity,
  });

  const { data: opcionesTipoTramite } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_TRAMITE],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_TRAMITE),
    staleTime: Infinity,
  });

  const { data: opcionesEstadoInforme } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ESTADO_INFORME],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ESTADO_INFORME),
    staleTime: Infinity,
  });

  const opcionesPlantillaFiltro = useMemo(
    () => normalizarOpcionesFiltroRevision(opcionesPlantillaInforme),
    [opcionesPlantillaInforme],
  );
  const opcionesTipoFiltro = useMemo(
    () => normalizarOpcionesFiltroRevision(opcionesTipoTramite, "string2"),
    [opcionesTipoTramite],
  );
  const opcionesEstadoFiltro = useMemo(
    () => normalizarOpcionesFiltroRevision(opcionesEstadoInforme),
    [opcionesEstadoInforme],
  );

  const resumenTarjetas = useMemo<TarjetaResumenAnalista[]>(() => {
    return [
      {
        id: "pendiente",
        titulo: "Pendiente Aprobación",
        valor: respuestaInformes?.pendienteAprobacion ?? 0,
        colorIcono: "text-orange-500",
      },
      {
        id: "aprobado",
        titulo: "Aprobado",
        valor: respuestaInformes?.aprobado ?? 0,
        colorIcono: "text-emerald-500",
      },
      {
        id: "rechazado",
        titulo: "Rechazado",
        valor: respuestaInformes?.rechazado ?? 0,
        colorIcono: "text-rose-500",
      },
      {
        id: "vigente",
        titulo: "Vigentes",
        valor: respuestaInformes?.vigente ?? 0,
        colorIcono: "text-slate-600",
      },
      {
        id: "vencido",
        titulo: "Vencidos",
        valor: respuestaInformes?.vencido ?? 0,
        colorIcono: "text-red-400",
      },
    ];
  }, [respuestaInformes]);

  const abrirRevision = (registro: InformeListEntry) => {
    const parametros = new URLSearchParams();
    parametros.set("idInforme", String(registro.idInforme));
    if (registro.idIdioma != null) {
      parametros.set("idIdioma", String(registro.idIdioma));
    }
    if (registro.idInformeOriginal != null && registro.idInformeOriginal > 0) {
      parametros.set("idInformeOriginal", String(registro.idInformeOriginal));
    }
    navigate(
      `/coordinador/revision/${registro.idPedido}?${parametros.toString()}`,
    );
  };

  const reiniciarPagina = () => {
    setPaginaActual(1);
  };

  return {
    abrirRevision,
    filtroEstados,
    filtroPlantillas,
    filtroTipos,
    isError,
    isLoading,
    opcionesEstadoFiltro,
    opcionesPlantillaFiltro,
    opcionesTipoFiltro,
    paginaActual,
    refetch,
    registros,
    reiniciarPagina,
    respuestaInformes,
    resumenTarjetas,
    setFiltroEstados,
    setFiltroPlantillas,
    setFiltroTipos,
    setPaginaActual,
    setTerminoBusqueda,
    terminoBusqueda,
  };
}
