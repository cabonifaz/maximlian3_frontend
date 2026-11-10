import maximilianService from "./maximilian-service";
import { servicioAsignacion } from "./asignacion.service";
import { ENDPOINTS_FLUJO_INFORME } from "@maximilian/shared/constants/endpoints/flujo-informe.endpoint";
import { FUNCIONALIDADES_HABILITADAS } from "@maximilian/shared/constants/funcionalidades.constants";
import {
  ETAPAS_CON_TRADUCTOR_ASIGNABLE,
  MENSAJE_ANALISTA_NO_FINALIZADO,
  ORDEN_PRIORIDAD_PEDIDO,
} from "@maximilian/shared/constants/services/flujo-informe.service.constants";
import {
  ANALISTAS_SIMULADOS,
  CLIENTES_DESTINO_SIMULADOS,
  COMPLEMENTOS_SIMULADOS,
  ID_TRADUCTOR_SESION_SIMULADO,
  INFORMES_REPOSITORIO_SIMULADOS,
  NOMBRE_TRADUCTOR_SESION_SIMULADO,
  PEDIDOS_FLUJO_SIMULADOS,
  RETARDO_RESPUESTA_SIMULADA_MS,
  TAMANO_PAGINA_FLUJO_SIMULADO,
  TRADUCTORES_SIMULADOS,
} from "@maximilian/shared/constants/services/flujo-informe-simulado.constants";
import { ErrorRespuestaApi, MessageType, type ApiResponse } from "@maximilian/shared/types/api.type";
import type {
  AsignarRolFlujoRequest,
  CandidatoFlujoAsignacion,
  Complemento,
  ConteoTabsFlujoAsignacion,
  CrearComplementoRequest,
  FilaFlujoAsignacion,
  FiltroComplementos,
  FiltroFlujoAsignacion,
  FiltroRepositorioInformes,
  ListaClientesDestino,
  ListaComplementos,
  ListaFlujoAsignacion,
  ListaRepositorioInformes,
  OpcionClienteDestino,
  RolFlujoAsignacion,
} from "@maximilian/shared/types/flujo-informe.type";
import { normalizarTextoBusqueda } from "@maximilian/shared/utils/texto.util";

const usarDatosSimulados = FUNCIONALIDADES_HABILITADAS.datosSimuladosFlujoInforme;

const almacenSimulado = {
  pedidos: structuredClone(PEDIDOS_FLUJO_SIMULADOS),
  repositorio: structuredClone(INFORMES_REPOSITORIO_SIMULADOS),
  complementos: structuredClone(COMPLEMENTOS_SIMULADOS),
};

function esperarRespuestaSimulada<T>(valor: T): Promise<T> {
  return new Promise((resolver) => {
    setTimeout(() => resolver(structuredClone(valor)), RETARDO_RESPUESTA_SIMULADA_MS);
  });
}

function rechazarRegla(mensaje: string): never {
  throw new ErrorRespuestaApi({ idTipoMensaje: MessageType.BUSINESS_RULE_VIOLATION, mensaje, result: null });
}

function extraerResultado<T>(respuesta: ApiResponse<T>): T {
  if (respuesta.idTipoMensaje !== MessageType.SUCCESS) {
    throw new ErrorRespuestaApi(respuesta);
  }
  return respuesta.result;
}

function paginar<T>(lista: T[], numPag: number) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / TAMANO_PAGINA_FLUJO_SIMULADO));
  const inicio = (numPag - 1) * TAMANO_PAGINA_FLUJO_SIMULADO;
  return {
    pagina: lista.slice(inicio, inicio + TAMANO_PAGINA_FLUJO_SIMULADO),
    totalRegistros: lista.length,
    totalPaginas,
  };
}

function coincideBusqueda(busqueda: string | undefined, ...valores: (string | null)[]) {
  const termino = normalizarTextoBusqueda(busqueda ?? "");
  if (!termino) return true;
  return valores.some((valor) => normalizarTextoBusqueda(valor ?? "").includes(termino));
}

function compararPorPrioridadYVencimiento(a: FilaFlujoAsignacion, b: FilaFlujoAsignacion) {
  const diferenciaPrioridad = ORDEN_PRIORIDAD_PEDIDO[a.prioridad] - ORDEN_PRIORIDAD_PEDIDO[b.prioridad];
  if (diferenciaPrioridad !== 0) return diferenciaPrioridad;
  return new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime();
}

function contarTabsSimulados(): ConteoTabsFlujoAsignacion {
  const contarEtapa = (etapa: FilaFlujoAsignacion["etapa"]) =>
    almacenSimulado.pedidos.filter((pedido) => pedido.etapa === etapa).length;

  return {
    "sin-asignar": contarEtapa("sin-asignar"),
    "en-analisis": contarEtapa("en-analisis"),
    "listo-traduccion": contarEtapa("listo-traduccion"),
    "en-traduccion": contarEtapa("en-traduccion"),
    "por-revisar": contarEtapa("por-revisar"),
    finalizado: contarEtapa("finalizado"),
    complementos: almacenSimulado.complementos.filter((complemento) => complemento.estado !== "aprobado").length,
  };
}

function obtenerPedidoSimulado(idPedido: number) {
  const pedido = almacenSimulado.pedidos.find((item) => item.idPedido === idPedido);
  if (!pedido) rechazarRegla("El pedido no existe.");
  return pedido;
}

function obtenerCandidatosSimulados(rol: RolFlujoAsignacion) {
  return rol === "analista" ? ANALISTAS_SIMULADOS : TRADUCTORES_SIMULADOS;
}

function asignarRolSimulado({ idPedido, rol, idUsuarioAsignado }: AsignarRolFlujoRequest) {
  const pedido = obtenerPedidoSimulado(idPedido);
  const candidato = obtenerCandidatosSimulados(rol).find((item) => item.idUsuario === idUsuarioAsignado);
  if (!candidato) rechazarRegla("El usuario seleccionado no existe.");

  if (rol === "analista") {
    if (pedido.etapa !== "sin-asignar" && pedido.etapa !== "en-analisis") {
      rechazarRegla("El analista ya finalizó su informe; no se puede reasignar.");
    }
    pedido.idUsuarioAnalista = candidato.idUsuario;
    pedido.analista = candidato.nombre;
    pedido.idInformeAnalista ??= 7000 + (pedido.idPedido % 1000);
    pedido.etapa = "en-analisis";
    return;
  }

  if (!ETAPAS_CON_TRADUCTOR_ASIGNABLE.includes(pedido.etapa)) {
    rechazarRegla(MENSAJE_ANALISTA_NO_FINALIZADO);
  }
  pedido.idUsuarioTraductor = candidato.idUsuario;
  pedido.traductor = candidato.nombre;
  pedido.idInformeTraductor ??= 8000 + (pedido.idPedido % 1000);
  if (pedido.etapa === "listo-traduccion") pedido.etapa = "en-traduccion";
}

export const servicioFlujoInforme = {
  usaDatosSimulados: usarDatosSimulados,

  listarPorEtapa: async (filtro: FiltroFlujoAsignacion): Promise<ListaFlujoAsignacion> => {
    if (!usarDatosSimulados) {
      const { data } = await maximilianService.get<ApiResponse<ListaFlujoAsignacion>>(
        ENDPOINTS_FLUJO_INFORME.listarPorEtapa,
        { params: { etapa: filtro.etapa, busqueda: filtro.busqueda, numPag: filtro.numPag } },
      );
      return extraerResultado(data);
    }

    const filtrados = almacenSimulado.pedidos
      .filter((pedido) => pedido.etapa === filtro.etapa)
      .filter((pedido) =>
        coincideBusqueda(filtro.busqueda, pedido.cliente, pedido.investigado, pedido.analista, pedido.traductor))
      .sort(compararPorPrioridadYVencimiento);
    const { pagina, totalRegistros, totalPaginas } = paginar(filtrados, filtro.numPag);

    return esperarRespuestaSimulada({
      lstPedido: pagina,
      totalRegistros,
      totalPaginas,
      conteos: contarTabsSimulados(),
    });
  },

  listarCandidatos: async (rol: RolFlujoAsignacion, idIdioma?: number): Promise<CandidatoFlujoAsignacion[]> => {
    if (!usarDatosSimulados) {
      const candidatos = await servicioAsignacion.listCandidates({
        role: rol === "analista" ? "analyst" : "translator",
        idiomasPedido: idIdioma ? [idIdioma] : [],
      });
      return candidatos.map(({ idUsuario, nombre, cantidadAsignaciones }) => ({ idUsuario, nombre, cantidadAsignaciones }));
    }

    return esperarRespuestaSimulada(obtenerCandidatosSimulados(rol));
  },

  asignarRol: async (solicitud: AsignarRolFlujoRequest): Promise<void> => {
    if (!usarDatosSimulados) {
      const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_FLUJO_INFORME.asignarRol, solicitud);
      extraerResultado(data);
      return;
    }

    asignarRolSimulado(solicitud);
    await esperarRespuestaSimulada(null);
  },

  simularFinalizacionAnalista: async (idPedido: number): Promise<void> => {
    const pedido = obtenerPedidoSimulado(idPedido);
    pedido.etapa = "listo-traduccion";
    pedido.fechaFinAnalisis = new Date().toISOString();
    await esperarRespuestaSimulada(null);
  },

  simularEnvioTraductor: async (idPedido: number): Promise<void> => {
    const pedido = obtenerPedidoSimulado(idPedido);
    pedido.etapa = "por-revisar";
    pedido.rechazado = false;
    await esperarRespuestaSimulada(null);
  },

  simularRechazoCoordinador: async (idPedido: number): Promise<void> => {
    const pedido = obtenerPedidoSimulado(idPedido);
    pedido.etapa = "en-traduccion";
    pedido.rechazado = true;
    await esperarRespuestaSimulada(null);
  },

  listarRepositorio: async (filtro: FiltroRepositorioInformes): Promise<ListaRepositorioInformes> => {
    if (!usarDatosSimulados) {
      const { data } = await maximilianService.get<ApiResponse<ListaRepositorioInformes>>(
        ENDPOINTS_FLUJO_INFORME.listarRepositorio,
        { params: filtro },
      );
      return extraerResultado(data);
    }

    const filtrados = almacenSimulado.repositorio
      .filter((informe) => !filtro.tipo || informe.tipo === filtro.tipo)
      .filter((informe) => coincideBusqueda(filtro.busqueda, informe.investigado, informe.cliente, informe.pais))
      .sort((a, b) => new Date(b.fechaAprobacion).getTime() - new Date(a.fechaAprobacion).getTime());
    const { pagina, totalRegistros, totalPaginas } = paginar(filtrados, filtro.numPag);

    return esperarRespuestaSimulada({ lstInforme: pagina, totalRegistros, totalPaginas });
  },

  listarComplementos: async (filtro: FiltroComplementos): Promise<ListaComplementos> => {
    if (!usarDatosSimulados) {
      const { data } = await maximilianService.get<ApiResponse<ListaComplementos>>(
        ENDPOINTS_FLUJO_INFORME.listarComplementos,
        { params: filtro },
      );
      return extraerResultado(data);
    }

    const filtrados = almacenSimulado.complementos
      .filter((complemento) => !filtro.soloPropios || complemento.idUsuarioTraductor === ID_TRADUCTOR_SESION_SIMULADO)
      .filter((complemento) =>
        coincideBusqueda(filtro.busqueda, complemento.investigado, complemento.clienteDestino, complemento.traductor))
      .sort((a, b) => new Date(b.fechaModificacion).getTime() - new Date(a.fechaModificacion).getTime());
    const { pagina, totalRegistros, totalPaginas } = paginar(filtrados, filtro.numPag);

    return esperarRespuestaSimulada({ lstComplemento: pagina, totalRegistros, totalPaginas });
  },

  crearComplemento: async (solicitud: CrearComplementoRequest, idioma: string): Promise<void> => {
    if (!usarDatosSimulados) {
      const { data } = await maximilianService.post<ApiResponse<unknown>>(ENDPOINTS_FLUJO_INFORME.crearComplemento, solicitud);
      extraerResultado(data);
      return;
    }

    const base = almacenSimulado.repositorio.find(
      (informe) => informe.idCompania === solicitud.idCompania && informe.esUltimaVersion,
    );
    const cliente = CLIENTES_DESTINO_SIMULADOS.find((item) => item.idCliente === solicitud.idClienteDestino);
    if (!base || !cliente) rechazarRegla("No se encontró la última versión del informe o el cliente destino.");

    const ahora = new Date().toISOString();
    const nuevo: Complemento = {
      idComplemento: Math.max(...almacenSimulado.complementos.map((item) => item.idComplemento)) + 1,
      idCompania: base.idCompania,
      investigado: base.investigado,
      pais: base.pais,
      idInformeBase: base.idInforme,
      tipoInformeBase: base.tipo,
      clienteBase: base.cliente,
      idClienteDestino: cliente.idCliente,
      clienteDestino: cliente.nombre,
      idioma,
      idUsuarioTraductor: ID_TRADUCTOR_SESION_SIMULADO,
      traductor: NOMBRE_TRADUCTOR_SESION_SIMULADO,
      estado: "borrador",
      fechaCreacion: ahora,
      fechaModificacion: ahora,
      idInforme: null,
      codigo: null,
      idPlantilla: null,
    };
    almacenSimulado.complementos.push(nuevo);
    await esperarRespuestaSimulada(null);
  },

  enviarAprobacionComplemento: async (idComplemento: number): Promise<void> => {
    if (!usarDatosSimulados) {
      const { data } = await maximilianService.post<ApiResponse<unknown>>(
        ENDPOINTS_FLUJO_INFORME.enviarAprobacionComplemento,
        { idComplemento },
      );
      extraerResultado(data);
      return;
    }

    const complemento = almacenSimulado.complementos.find((item) => item.idComplemento === idComplemento);
    if (!complemento) rechazarRegla("El complemento no existe.");
    complemento.estado = "pendiente-aprobacion";
    complemento.fechaModificacion = new Date().toISOString();
    await esperarRespuestaSimulada(null);
  },

  listarClientesDestino: async (): Promise<OpcionClienteDestino[]> => {
    if (!usarDatosSimulados) {
      const { data } = await maximilianService.get<ApiResponse<ListaClientesDestino>>(
        ENDPOINTS_FLUJO_INFORME.listarClientesDestino,
      );
      return extraerResultado(data).lstCliente;
    }

    return esperarRespuestaSimulada(CLIENTES_DESTINO_SIMULADOS);
  },
};
