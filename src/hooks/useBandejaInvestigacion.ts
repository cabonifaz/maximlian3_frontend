import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioAsignacion } from "@maximilian/services/asignacion.service";
import type { AssignmentOrderEntry } from "@maximilian/shared/types/asignacion.type";
import type {
  AccionBandejaAnalista,
  RegistroBandejaAnalista,
  TarjetaResumenAnalista,
} from "@maximilian/shared/types/investigacion.type";

type TipoBandejaInvestigacion = "analista" | "traductor";

interface ParametrosUseBandejaInvestigacion {
  tipo: TipoBandejaInvestigacion;
}

function obtenerModoPorAccion(accion: AccionBandejaAnalista) {
  if (accion === "iniciar") return "iniciar";
  if (accion === "continuar") return "continuar";
  return "detalle";
}

function obtenerCargaNavegacion() {
  return String(Date.now());
}

function normalizarEstadoDesdeAsignacion(
  registro: AssignmentOrderEntry,
): RegistroBandejaAnalista["estado"] {
  if (registro.idEstado === 5) return "pendiente-aprobacion";
  if (registro.idEstado === 4) return "aprobado";
  if (registro.idEstado === 3) return "en-proceso";
  if (registro.idEstado === 2) return "rechazado";
  if (registro.idEstado === 1) return "asignado";

  const estado = (registro.estado ?? "").trim().toLowerCase();
  if (estado.includes("pend")) return "pendiente-aprobacion";
  if (estado.includes("rechaz")) return "rechazado";
  if (estado.includes("aprob")) return "aprobado";
  if (estado.includes("asign")) return "asignado";
  if (
    estado.includes("proceso") ||
    estado.includes("curso") ||
    (registro.idInforme ?? 0) > 0
  ) {
    return "en-proceso";
  }
  return "asignado";
}

function obtenerAccionDesdeAsignacion(
  registro: AssignmentOrderEntry,
): AccionBandejaAnalista {
  const estado = normalizarEstadoDesdeAsignacion(registro);
  if (estado === "asignado") return "iniciar";
  if (estado === "en-proceso" || estado === "rechazado") return "continuar";
  return "detalle";
}

export function useBandejaInvestigacion({ tipo }: ParametrosUseBandejaInvestigacion) {
  const navigate = useNavigate();
  const clienteConsulta = useQueryClient();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const terminoBusquedaConRetardo = useRetardo(terminoBusqueda);
  const esTraductor = tipo === "traductor";

  const {
    data: respuestaAsignaciones,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      esTraductor ? "asignaciones-bandeja-traductor" : "asignaciones-bandeja-analista",
      paginaActual,
      terminoBusquedaConRetardo,
    ],
    queryFn: () =>
      servicioAsignacion.bandeja({
        numPag: paginaActual,
        busqueda: terminoBusquedaConRetardo.trim() || undefined,
      }),
    enabled: terminoBusqueda.trim() === terminoBusquedaConRetardo,
    retry: false,
  });

  const registrosFiltrados = useMemo<RegistroBandejaAnalista[]>(
    () =>
      (respuestaAsignaciones?.lstPedido ?? []).map((registro) => ({
        idInforme: registro.idInforme ?? 0,
        idInformeOriginal: registro.idInformeOriginal ?? null,
        idPedido: registro.idPedido,
        idPlantilla: registro.idPlantilla,
        codigoPedido: registro.codigoPedido,
        codigo: registro.codigoPedido || String(registro.idPedido),
        investigado: registro.investigado,
        pais: registro.pais || "-",
        fecha: registro.fechaAsignacion || "-",
        tipo: registro.tipoTramite || "-",
        estado: normalizarEstadoDesdeAsignacion(registro),
        estadoTexto: registro.estado || "-",
        estadoColorLetra: registro.estadoColorLetra,
        estadoColorFondo: registro.estadoColorFondo,
        accion: obtenerAccionDesdeAsignacion(registro),
      })),
    [respuestaAsignaciones?.lstPedido],
  );

  const tarjetasResumen = useMemo<TarjetaResumenAnalista[]>(() => {
    const resumen = respuestaAsignaciones?.resumen;

    return [
      {
        id: "asignados",
        titulo: "Asignados",
        valor:
          resumen?.total ??
          registrosFiltrados.filter((registro) => registro.estado === "asignado").length,
        colorIcono: "text-slate-500",
      },
      {
        id: "en-proceso",
        titulo: "En Proceso",
        valor:
          resumen?.enProceso ??
          registrosFiltrados.filter((registro) => registro.estado === "en-proceso").length,
        colorIcono: "text-blue-500",
      },
      {
        id: "aprobado",
        titulo: "Aprobado",
        valor:
          resumen?.aprobadas ??
          registrosFiltrados.filter((registro) => registro.estado === "aprobado").length,
        colorIcono: "text-green-500",
      },
      {
        id: "rechazado",
        titulo: "Rechazado",
        valor:
          resumen?.rechazadas ??
          registrosFiltrados.filter((registro) => registro.estado === "rechazado").length,
        colorIcono: "text-red-500",
      },
    ];
  }, [registrosFiltrados, respuestaAsignaciones?.resumen]);

  const irADetalle = (registro: RegistroBandejaAnalista) => {
    const modo = obtenerModoPorAccion(registro.accion);
    const parametros = new URLSearchParams({
      modo,
      carga: obtenerCargaNavegacion(),
    });

    clienteConsulta.removeQueries({
      queryKey: [esTraductor ? "informe-obtener-traductor" : "informe-obtener-analista", registro.idPedido],
    });

    if (registro.idInforme > 0) {
      parametros.set("idInforme", String(registro.idInforme));
    }
    if (esTraductor && registro.idInformeOriginal && registro.idInformeOriginal > 0) {
      parametros.set("idInformeOriginal", String(registro.idInformeOriginal));
      clienteConsulta.removeQueries({
        queryKey: ["informe-obtener-original-traductor", registro.idInformeOriginal],
      });
    }
    if (registro.estado === "rechazado") {
      parametros.set("estado", "rechazado");
    }

    navigate(
      `/${esTraductor ? "traductor/traduccion" : "analista/investigacion"}/${registro.idPedido}?${parametros.toString()}`,
      {
        state: {
          datosPedidoInvestigacion: {
            idPedido: registro.idPedido,
            idInformeOriginal: registro.idInformeOriginal,
            idPlantilla: registro.idPlantilla,
            codigoPedido: registro.codigoPedido,
            investigado: registro.investigado,
            pais: registro.pais,
            tipoTramite: registro.tipo,
          },
        },
      },
    );
  };

  return {
    terminoBusqueda,
    setTerminoBusqueda,
    paginaActual,
    setPaginaActual,
    respuestaAsignaciones,
    isLoading,
    isError,
    refetch,
    registrosFiltrados,
    tarjetasResumen,
    irADetalle,
  };
}
