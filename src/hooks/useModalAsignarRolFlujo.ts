import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { esquemaAsignarRolFlujo, type DatosFormularioAsignarRolFlujo } from "@maximilian/schemas";
import { servicioFlujoInforme } from "@maximilian/services/flujo-informe.service";
import { esErrorRespuestaApi, type ErrorRespuestaApi } from "@maximilian/shared/types/api.type";
import type {
  FilaFlujoAsignacion,
  ResultadoAsignacionMasivaFlujo,
  RolFlujoAsignacion,
} from "@maximilian/shared/types/flujo-informe.type";
import { normalizarTextoBusqueda } from "@maximilian/shared/utils/texto.util";

interface ParametrosUseModalAsignarRolFlujo {
  pedidos: FilaFlujoAsignacion[];
  rol: RolFlujoAsignacion;
  onCerrar: () => void;
  onAsignado: (idsNoAsignados: number[]) => void | Promise<void>;
}

function obtenerIdsNoAsignados(error: ErrorRespuestaApi) {
  const resultado = error.respuesta.result as ResultadoAsignacionMasivaFlujo | null;
  return resultado?.lstNoAsignado?.map((pedido) => pedido.idPedido) ?? [];
}

export function useModalAsignarRolFlujo({ pedidos, rol, onCerrar, onAsignado }: ParametrosUseModalAsignarRolFlujo) {
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const esMasiva = pedidos.length > 1;
  const pedidoUnico = esMasiva ? null : pedidos[0];
  const idUsuarioActual = pedidoUnico
    ? (rol === "analista" ? pedidoUnico.idUsuarioAnalista : pedidoUnico.idUsuarioTraductor)
    : null;
  const formulario = useForm<DatosFormularioAsignarRolFlujo>({
    resolver: zodResolver(esquemaAsignarRolFlujo),
    mode: "onTouched",
    defaultValues: { idUsuarioAsignado: idUsuarioActual ?? 0 },
  });
  const idUsuarioSeleccionado = useWatch({ control: formulario.control, name: "idUsuarioAsignado" });

  const idiomas = useMemo(
    () => Array.from(new Set(pedidos.map((pedido) => pedido.idIdioma))).sort((a, b) => a - b),
    [pedidos],
  );

  const consultaCandidatos = useQuery({
    queryKey: ["flujo-candidatos", rol, idiomas],
    queryFn: () => servicioFlujoInforme.listarCandidatos(rol, idiomas),
  });

  const candidatosFiltrados = useMemo(() => {
    const termino = normalizarTextoBusqueda(terminoBusqueda);
    const candidatos = consultaCandidatos.data ?? [];
    if (!termino) return candidatos;
    return candidatos.filter((candidato) => normalizarTextoBusqueda(candidato.nombre).includes(termino));
  }, [consultaCandidatos.data, terminoBusqueda]);

  const finalizar = async (idsNoAsignados: number[]) => {
    formulario.reset();
    await onAsignado(idsNoAsignados);
    onCerrar();
  };

  const asignarMutation = useMutation({
    mutationFn: async ({ idUsuarioAsignado }: DatosFormularioAsignarRolFlujo) => {
      if (pedidoUnico) {
        await servicioFlujoInforme.asignarRol({ idPedido: pedidoUnico.idPedido, rol, idUsuarioAsignado });
        return [];
      }
      const resultado = await servicioFlujoInforme.asignarRolMasivo({
        idsPedido: pedidos.map((pedido) => pedido.idPedido),
        rol,
        idUsuarioAsignado,
      });
      return resultado.lstNoAsignado.map((pedido) => pedido.idPedido);
    },
    onSuccess: finalizar,
    onError: async (error) => {
      // Asignación parcial: se cierra el modal y quedan seleccionados solo los pedidos que no se asignaron.
      if (!esMasiva || !esErrorRespuestaApi(error)) return;
      const idsNoAsignados = obtenerIdsNoAsignados(error);
      if (idsNoAsignados.length > 0 && idsNoAsignados.length < pedidos.length) await finalizar(idsNoAsignados);
    },
  });

  const cerrar = () => {
    if (asignarMutation.isPending) return;
    formulario.reset();
    onCerrar();
  };

  // Con backend real el interceptor ya muestra el mensaje; los datos simulados no pasan por el interceptor.
  const mensajeErrorNegocio = servicioFlujoInforme.usaDatosSimulados && esErrorRespuestaApi(asignarMutation.error)
    ? asignarMutation.error.respuesta.mensaje
    : undefined;

  return {
    asignarMutation,
    candidatosFiltrados,
    cerrar,
    consultaCandidatos,
    enviar: formulario.handleSubmit((datos) => asignarMutation.mutate(datos)),
    errorSeleccion: formulario.formState.errors.idUsuarioAsignado?.message,
    esMasiva,
    esReasignacion: idUsuarioActual !== null,
    idUsuarioSeleccionado,
    mensajeErrorNegocio,
    seleccionarCandidato: (idUsuario: number) =>
      formulario.setValue("idUsuarioAsignado", idUsuario, { shouldValidate: true }),
    setTerminoBusqueda,
    terminoBusqueda,
  };
}
