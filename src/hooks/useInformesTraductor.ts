import { useState } from "react";
import { useNavigate } from "react-router";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useListadoPaginado } from "@maximilian/hooks/useListadoPaginado";
import { servicioFlujoInforme } from "@maximilian/services/flujo-informe.service";
import type { TabInformesTraductor } from "@maximilian/shared/constants/pages/Traductor/informes-traductor.constants";
import {
  ACCION_EDITOR_COMPLEMENTO,
  RUTA_EDITOR_TRADUCTOR,
} from "@maximilian/shared/constants/components/common/estado-complemento.constants";
import type { Complemento, InformeRepositorio, TipoInformeRepositorio } from "@maximilian/shared/types/flujo-informe.type";
import type { DatosPedidoNavegacionInvestigacion } from "@maximilian/shared/types/investigacion.type";

export function useInformesTraductor() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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

  // Igual que la bandeja del traductor: el informe base del complemento es el "original" que precarga el editor.
  const abrirComplemento = (complemento: Complemento) => {
    const { modo } = ACCION_EDITOR_COMPLEMENTO[complemento.estado];
    const parametros = new URLSearchParams({ modo, carga: String(Date.now()) });

    if (complemento.idInforme) parametros.set("idInforme", String(complemento.idInforme));
    if (complemento.idInformeBase) parametros.set("idInformeOriginal", String(complemento.idInformeBase));
    if (complemento.estado === "rechazado") parametros.set("estado", "rechazado");

    queryClient.removeQueries({ queryKey: ["informe-obtener-traductor", complemento.idComplemento] });
    queryClient.removeQueries({ queryKey: ["informe-obtener-original-traductor", complemento.idInformeBase] });

    const datosPedidoInvestigacion: DatosPedidoNavegacionInvestigacion = {
      idPedido: complemento.idComplemento,
      idInformeOriginal: complemento.idInformeBase,
      idPlantilla: complemento.idPlantilla ?? undefined,
      codigoPedido: complemento.codigo ?? undefined,
      investigado: complemento.investigado,
      pais: complemento.pais,
      tipoTramite: "Complemento",
    };

    navigate(`${RUTA_EDITOR_TRADUCTOR}/${complemento.idComplemento}?${parametros.toString()}`, {
      state: { datosPedidoInvestigacion },
    });
  };

  const totalPaginas = tabActiva === "repositorio"
    ? consultaRepositorio.data?.totalPaginas ?? 1
    : consultaMisComplementos.data?.totalPaginas ?? 1;

  return {
    abrirComplemento,
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
