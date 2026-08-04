import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { FilaFormularioParametro } from "@maximilian/shared/types/configuracion-parametros.type";
import {
  TablaMaestraId,
  type EntradaTablaMaestra,
  type TablaMaestraCrearRequest,
  type TablaMaestraEditarRequest,
  type TablaMaestraEliminarRequest,
} from "@maximilian/shared/types/tabla-maestra.type";
import {
  crearValoresFormularioParametro,
  obtenerClaveRegistroParametro,
  obtenerColumnasVisiblesParametro,
  obtenerConfiguracionCamposParametro,
  obtenerPaginasParametros,
} from "@maximilian/shared/utils/configuracion-parametros.util";
import {
  crearPayloadEdicionParametro,
  crearPayloadParametro,
  validarFormularioParametro,
} from "@maximilian/shared/utils/configuracion-parametros-payload.util";

export function useConfiguracionParametros() {
  const clienteConsultas = useQueryClient();
  const [idMaestroSeleccionado, setIdMaestroSeleccionado] = useState<number>(
    TablaMaestraId.MONEDA,
  );
  const [filtro, setFiltro] = useState("");
  const filtroConRetardo = useRetardo(filtro);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filaFormulario, setFilaFormulario] =
    useState<FilaFormularioParametro | null>(null);
  const [mensajeValidacion, setMensajeValidacion] = useState("");
  const [parametroAEliminar, setParametroAEliminar] =
    useState<EntradaTablaMaestra | null>(null);

  const {
    data: respuestaParametros,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "parametros-administrador",
      idMaestroSeleccionado,
      filtroConRetardo,
      paginaActual,
    ],
    queryFn: () =>
      servicioTablaMaestra.listarParametros({
        idMaestro: idMaestroSeleccionado,
        busqueda: filtroConRetardo,
        numPag: paginaActual,
      }),
  });

  const parametros = respuestaParametros?.listaTablaMaestra;

  const configuracionCampos = obtenerConfiguracionCamposParametro(
    idMaestroSeleccionado,
  );

  const { data: opcionesReferencia } = useQuery({
    queryKey: ["masterTable", configuracionCampos.idMaestroReferencia],
    queryFn: () =>
      servicioTablaMaestra.list(configuracionCampos.idMaestroReferencia!),
    enabled: Boolean(configuracionCampos.idMaestroReferencia),
    staleTime: Infinity,
  });

  const mutacionCrear = useMutation({
    mutationFn: (payload: TablaMaestraCrearRequest) =>
      servicioTablaMaestra.crear(payload),
    onSuccess: () => {
      clienteConsultas.invalidateQueries({
        queryKey: ["parametros-administrador", idMaestroSeleccionado],
      });
      setFilaFormulario(null);
      setMensajeValidacion("");
      setPaginaActual(1);
    },
  });

  const mutacionEditar = useMutation({
    mutationFn: (payload: TablaMaestraEditarRequest) =>
      servicioTablaMaestra.editar(payload),
    onSuccess: () => {
      clienteConsultas.invalidateQueries({
        queryKey: ["parametros-administrador", idMaestroSeleccionado],
      });
      setFilaFormulario(null);
      setMensajeValidacion("");
    },
  });

  const mutacionEliminar = useMutation({
    mutationFn: (payload: TablaMaestraEliminarRequest) =>
      servicioTablaMaestra.eliminar(payload),
    onSuccess: () => {
      clienteConsultas.invalidateQueries({
        queryKey: ["parametros-administrador", idMaestroSeleccionado],
      });
      clienteConsultas.invalidateQueries({
        queryKey: ["masterTable", idMaestroSeleccionado],
      });
      setParametroAEliminar(null);
      setFilaFormulario(null);
      setPaginaActual((pagina) =>
        registrosPagina.length === 1 && pagina > 1 ? pagina - 1 : pagina,
      );
    },
  });

  const totalPaginas = respuestaParametros?.totalPaginas ?? 1;
  const totalRegistros = respuestaParametros?.totalRegistros ?? 0;
  const registrosPagina = parametros ?? [];
  const estaGuardando =
    mutacionCrear.isPending
    || mutacionEditar.isPending
    || mutacionEliminar.isPending;
  const columnasVisibles = obtenerColumnasVisiblesParametro(
    parametros,
    configuracionCampos,
  );
  const totalColumnas =
    3 + Object.values(columnasVisibles).filter(Boolean).length;
  const anchoMinimoTabla = Math.max(760, totalColumnas * 150);

  const cambiarParametroSeleccionado = (idMaestro: number) => {
    setIdMaestroSeleccionado(idMaestro);
    setFiltro("");
    setPaginaActual(1);
    setFilaFormulario(null);
    setMensajeValidacion("");
  };

  const cambiarFiltro = (valor: string) => {
    setFiltro(valor);
    setPaginaActual(1);
  };

  const iniciarCreacion = () => {
    setFilaFormulario({
      modo: "crear",
      valores: crearValoresFormularioParametro(),
    });
    setMensajeValidacion("");
    setPaginaActual(1);
  };

  const iniciarEdicion = (parametro: EntradaTablaMaestra) => {
    setFilaFormulario({
      modo: "editar",
      claveRegistro: obtenerClaveRegistroParametro(parametro),
      idTablaMaestra: parametro.idTablaMaestra ?? undefined,
      valores: crearValoresFormularioParametro(parametro),
    });
    setMensajeValidacion("");
  };

  const cancelarFormulario = () => {
    setFilaFormulario(null);
    setMensajeValidacion("");
  };

  const solicitarEliminarParametro = (parametro: EntradaTablaMaestra) => {
    if (parametro.idTablaMaestra === null) return;
    setParametroAEliminar(parametro);
  };

  const cancelarEliminacionParametro = () => {
    if (mutacionEliminar.isPending) return;
    setParametroAEliminar(null);
  };

  const confirmarEliminacionParametro = () => {
    if (parametroAEliminar?.idTablaMaestra == null) return;
    mutacionEliminar.mutate({
      idTablaMaestra: parametroAEliminar.idTablaMaestra,
    });
  };

  const cambiarValoresFormulario = (valores: FilaFormularioParametro["valores"]) => {
    if (!filaFormulario) return;
    setFilaFormulario({ ...filaFormulario, valores });
  };

  const guardarFormulario = () => {
    if (!filaFormulario) return;

    const mensaje = validarFormularioParametro(
      filaFormulario.valores,
      configuracionCampos,
    );

    if (mensaje) {
      setMensajeValidacion(mensaje);
      return;
    }

    const parametroActual = parametros?.find(
      (parametro) =>
        obtenerClaveRegistroParametro(parametro) ===
        filaFormulario.claveRegistro,
    );

    if (filaFormulario.modo === "crear") {
      mutacionCrear.mutate(
        crearPayloadParametro(
          idMaestroSeleccionado,
          filaFormulario.valores,
          parametros ?? [],
        ),
      );
      return;
    }

    if (!parametroActual) return;

    mutacionEditar.mutate(
      crearPayloadEdicionParametro(
        idMaestroSeleccionado,
        filaFormulario.valores,
        parametroActual,
      ),
    );
  };

  const cambiarPagina = (pagina: number) => {
    if (pagina < 1 || pagina > totalPaginas) return;
    setPaginaActual(pagina);
  };

  const paginas = useMemo(
    () => obtenerPaginasParametros(paginaActual, totalPaginas),
    [paginaActual, totalPaginas],
  );

  return {
    idMaestroSeleccionado,
    filtro,
    paginaActual,
    filaFormulario,
    mensajeValidacion,
    parametroAEliminar,
    parametros,
    registrosPagina,
    opcionesReferencia,
    configuracionCampos,
    columnasVisibles,
    totalColumnas,
    anchoMinimoTabla,
    totalPaginas,
    totalRegistros,
    paginas,
    estaGuardando,
    estaEliminando: mutacionEliminar.isPending,
    isLoading,
    isError,
    mostrarFilaCreacion: filaFormulario?.modo === "crear",
    cambiarParametroSeleccionado,
    cambiarFiltro,
    iniciarCreacion,
    iniciarEdicion,
    cancelarFormulario,
    solicitarEliminarParametro,
    cancelarEliminacionParametro,
    confirmarEliminacionParametro,
    cambiarValoresFormulario,
    guardarFormulario,
    cambiarPagina,
    refetch,
  };
}

export type ModeloConfiguracionParametros = ReturnType<typeof useConfiguracionParametros>;
