type DecisionCambiosPendientes = "guardar" | "descartar" | "cancelar";

interface EstadoSolicitudCambios {
  estaAbierta: boolean;
  estaGuardando: boolean;
}

const ESTADO_INICIAL: EstadoSolicitudCambios = { estaAbierta: false, estaGuardando: false };

let hayCambiosPendientes = false;
let descarteConfirmado = false;
let guardarCambios: (() => Promise<boolean>) | null = null;
let resolverDecision: ((decision: DecisionCambiosPendientes) => void) | null = null;
let estadoSolicitud = ESTADO_INICIAL;
const oyentes = new Set<() => void>();

function actualizarEstado(estado: EstadoSolicitudCambios) {
  estadoSolicitud = estado;
  oyentes.forEach((oyente) => oyente());
}

export function suscribirseSolicitudCambios(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

export function obtenerEstadoSolicitudCambios() {
  return estadoSolicitud;
}

export function registrarCambiosPendientes(valor: boolean) {
  hayCambiosPendientes = valor;
}

export function registrarGuardadoCambios(guardar: (() => Promise<boolean>) | null) {
  guardarCambios = guardar;
}

export function reiniciarProteccionCambios() {
  hayCambiosPendientes = false;
  descarteConfirmado = false;
}

export function estaDescarteCambiosConfirmado() {
  return descarteConfirmado;
}

export function responderSolicitudCambios(decision: DecisionCambiosPendientes) {
  resolverDecision?.(decision);
}

function solicitarDecision() {
  return new Promise<DecisionCambiosPendientes>((resolver) => {
    resolverDecision = resolver;
    actualizarEstado({ estaAbierta: true, estaGuardando: false });
  });
}

export async function confirmarSalidaConCambios() {
  if (!hayCambiosPendientes || descarteConfirmado) return true;
  if (estadoSolicitud.estaAbierta) return false;

  const decision = await solicitarDecision();
  resolverDecision = null;

  if (decision === "cancelar") {
    actualizarEstado(ESTADO_INICIAL);
    return false;
  }

  if (decision === "guardar") {
    actualizarEstado({ estaAbierta: true, estaGuardando: true });
    const seGuardo = guardarCambios ? await guardarCambios() : false;
    actualizarEstado(ESTADO_INICIAL);
    if (!seGuardo) return false;
  } else {
    actualizarEstado(ESTADO_INICIAL);
  }

  descarteConfirmado = true;
  return true;
}
