import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useListadoPaginado } from "@maximilian/hooks/useListadoPaginado";
import { servicioFlujoInforme } from "@maximilian/services/flujo-informe.service";
import type { TabInformesTraductor } from "@maximilian/shared/constants/pages/Traductor/informes-traductor.constants";
import type { InformeRepositorio, TipoInformeRepositorio } from "@maximilian/shared/types/flujo-informe.type";

export function useInformesTraductor() {
  const queryClient = useQueryClient();
  const {
    terminoBusqueda,
    paginaActual,
    busquedaConRetardo,
    cambiarBusqueda,
    cambiarPagina,
    reiniciarPagina,
  } = useListadoPaginado();
  const [tabActiva, setTabActiva] = useState<TabInformesTraductor>("repositorio");
  const [tipoFiltro, setTipoFiltro] = useState<TipoInformeRepositorio | undefined>(undefined);
  const [informeBaseComplemento, setInformeBaseComplemento] = useState<InformeRepositorio | null>(null);

  const consultaRepositorio = useQuery({
    queryKey: ["flujo-repositorio", paginaActual, busquedaConRetardo, tipoFiltro],
    queryFn: () =>
      servicioFlujoInforme.listarRepositorio({
        busqueda: busquedaConRetardo || undefined,
        tipo: tipoFiltro,
        numPag: paginaActual,
      }),
    enabled: tabActiva === "repositorio",
    placeholderData: keepPreviousData,
  });

  const consultaMisComplementos = useQuery({
    queryKey: ["flujo-complementos", "propios", paginaActual, busquedaConRetardo],
    queryFn: () =>
      servicioFlujoInforme.listarComplementos({
        busqueda: busquedaConRetardo || undefined,
        soloPropios: true,
        numPag: paginaActual,
      }),
    enabled: tabActiva === "mis-complementos",
  });

  const enviarAprobacionMutation = useMutation({
    mutationFn: (idComplemento: number) => servicioFlujoInforme.enviarAprobacionComplemento(idComplemento),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flujo-complementos"] }),
  });

  const totalPaginas = tabActiva === "repositorio"
    ? consultaRepositorio.data?.totalPaginas ?? 1
    : consultaMisComplementos.data?.totalPaginas ?? 1;

  return {
    abrirNuevoComplemento: setInformeBaseComplemento,
    cambiarBusqueda,
    cambiarPaginaInformes: (pagina: number) => cambiarPagina(pagina, totalPaginas),
    cambiarTab: (tab: TabInformesTraductor) => {
      setTabActiva(tab);
      reiniciarPagina();
    },
    cambiarTipoFiltro: (tipo: TipoInformeRepositorio | undefined) => {
      setTipoFiltro(tipo);
      reiniciarPagina();
    },
    cerrarNuevoComplemento: () => setInformeBaseComplemento(null),
    complementoCreado: async () => {
      await queryClient.invalidateQueries({ queryKey: ["flujo-complementos"] });
      setTabActiva("mis-complementos");
      reiniciarPagina();
    },
    consultaMisComplementos,
    consultaRepositorio,
    enviarAprobacionMutation,
    informeBaseComplemento,
    paginaActual,
    tabActiva,
    terminoBusqueda,
    tipoFiltro,
    usaDatosSimulados: servicioFlujoInforme.usaDatosSimulados,
  };
}
