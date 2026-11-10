import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { esquemaNuevoComplemento, type DatosFormularioNuevoComplemento } from "@maximilian/schemas";
import { servicioFlujoInforme } from "@maximilian/services/flujo-informe.service";
import { esErrorRespuestaApi } from "@maximilian/shared/types/api.type";
import type { InformeRepositorio } from "@maximilian/shared/types/flujo-informe.type";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { convertirClientesDestinoAOpciones } from "@maximilian/shared/utils/flujo-informe.util";

interface ParametrosUseModalNuevoComplemento {
  informeReferencia: InformeRepositorio;
  onCerrar: () => void;
  onCreado: () => void | Promise<void>;
}

export function useModalNuevoComplemento({ informeReferencia, onCerrar, onCreado }: ParametrosUseModalNuevoComplemento) {
  const [habilitarClientes, setHabilitarClientes] = useState(false);
  const formulario = useForm<DatosFormularioNuevoComplemento>({
    resolver: zodResolver(esquemaNuevoComplemento),
    mode: "onTouched",
    defaultValues: { idClienteDestino: 0, idIdioma: 0, observacion: "" },
  });

  const consultaRepositorioCompania = useQuery({
    queryKey: ["flujo-repositorio", "compania", informeReferencia.idCompania],
    queryFn: () => servicioFlujoInforme.listarRepositorio({ busqueda: informeReferencia.investigado, numPag: 1 }),
  });
  const ultimaVersion = consultaRepositorioCompania.data?.lstInforme.find(
    (informe) => informe.idCompania === informeReferencia.idCompania && informe.esUltimaVersion,
  ) ?? (informeReferencia.esUltimaVersion ? informeReferencia : undefined);

  const consultaClientes = useQuery({
    queryKey: ["flujo-clientes-destino"],
    queryFn: () => servicioFlujoInforme.listarClientesDestino(),
    enabled: habilitarClientes,
    staleTime: Infinity,
  });
  const opcionesCliente = consultaClientes.data ? convertirClientesDestinoAOpciones(consultaClientes.data) : undefined;

  const { data: opcionesIdioma } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.IDIOMA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.IDIOMA),
    staleTime: Infinity,
  });

  const crearMutation = useMutation({
    mutationFn: (datos: DatosFormularioNuevoComplemento) => {
      const idioma = opcionesIdioma?.find((opcion) => opcion.num1 === datos.idIdioma);
      return servicioFlujoInforme.crearComplemento(
        {
          idCompania: informeReferencia.idCompania,
          idClienteDestino: datos.idClienteDestino,
          idIdioma: datos.idIdioma,
          observacion: datos.observacion || undefined,
        },
        idioma?.string1 || idioma?.descripcion || "-",
      );
    },
    onSuccess: async () => {
      formulario.reset();
      await onCreado();
      onCerrar();
    },
  });

  const cerrar = () => {
    if (crearMutation.isPending) return;
    formulario.reset();
    onCerrar();
  };

  return {
    cerrar,
    consultaClientes,
    control: formulario.control,
    crearMutation,
    enviar: formulario.handleSubmit((datos) => crearMutation.mutate(datos)),
    errores: formulario.formState.errors,
    habilitarClientes: () => setHabilitarClientes(true),
    mensajeErrorNegocio: servicioFlujoInforme.usaDatosSimulados && esErrorRespuestaApi(crearMutation.error)
      ? crearMutation.error.respuesta.mensaje
      : undefined,
    opcionesCliente,
    opcionesIdioma,
    registrarObservacion: formulario.register("observacion"),
    ultimaVersion,
    estaCargandoUltimaVersion: consultaRepositorioCompania.isLoading,
  };
}
