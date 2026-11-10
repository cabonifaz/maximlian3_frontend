import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { esquemaAsignarRolFlujo, type DatosFormularioAsignarRolFlujo } from "@maximilian/schemas";
import { servicioFlujoInforme } from "@maximilian/services/flujo-informe.service";
import { esErrorRespuestaApi } from "@maximilian/shared/types/api.type";
import type { FilaFlujoAsignacion, RolFlujoAsignacion } from "@maximilian/shared/types/flujo-informe.type";
import { normalizarTextoBusqueda } from "@maximilian/shared/utils/texto.util";

interface ParametrosUseModalAsignarRolFlujo {
  pedido: FilaFlujoAsignacion;
  rol: RolFlujoAsignacion;
  onCerrar: () => void;
  onAsignado: () => void | Promise<void>;
}

export function useModalAsignarRolFlujo({ pedido, rol, onCerrar, onAsignado }: ParametrosUseModalAsignarRolFlujo) {
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const idUsuarioActual = rol === "analista" ? pedido.idUsuarioAnalista : pedido.idUsuarioTraductor;
  const formulario = useForm<DatosFormularioAsignarRolFlujo>({
    resolver: zodResolver(esquemaAsignarRolFlujo),
    mode: "onTouched",
    defaultValues: { idUsuarioAsignado: idUsuarioActual ?? 0 },
  });
  const idUsuarioSeleccionado = useWatch({ control: formulario.control, name: "idUsuarioAsignado" });

  const consultaCandidatos = useQuery({
    queryKey: ["flujo-candidatos", rol, pedido.idIdioma],
    queryFn: () => servicioFlujoInforme.listarCandidatos(rol, pedido.idIdioma),
  });

  const candidatosFiltrados = useMemo(() => {
    const termino = normalizarTextoBusqueda(terminoBusqueda);
    const candidatos = consultaCandidatos.data ?? [];
    if (!termino) return candidatos;
    return candidatos.filter((candidato) => normalizarTextoBusqueda(candidato.nombre).includes(termino));
  }, [consultaCandidatos.data, terminoBusqueda]);

  const asignarMutation = useMutation({
    mutationFn: (datos: DatosFormularioAsignarRolFlujo) =>
      servicioFlujoInforme.asignarRol({ idPedido: pedido.idPedido, rol, idUsuarioAsignado: datos.idUsuarioAsignado }),
    onSuccess: async () => {
      formulario.reset();
      await onAsignado();
      onCerrar();
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
    esReasignacion: idUsuarioActual !== null,
    idUsuarioSeleccionado,
    mensajeErrorNegocio,
    seleccionarCandidato: (idUsuario: number) =>
      formulario.setValue("idUsuarioAsignado", idUsuario, { shouldValidate: true }),
    setTerminoBusqueda,
    terminoBusqueda,
  };
}
