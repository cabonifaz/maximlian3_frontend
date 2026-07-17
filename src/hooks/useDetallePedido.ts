import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicioCliente } from "@maximilian/services/cliente.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import { pedidoService } from "@maximilian/services/pedido.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import type { TarifarioCortaEntry } from "@maximilian/shared/types/cliente.type";

interface ParametrosUseDetallePedido {
  isOpen: boolean;
  pedidoId: number | null;
}

export function useDetallePedido({ isOpen, pedidoId }: ParametrosUseDetallePedido) {
  const [tabActiva, setTabActiva] = useState("cliente-tarifa");

  const { data: pedido, isLoading, isError, refetch } = useQuery({
    queryKey: ["pedido", "detalle", pedidoId],
    queryFn: () => pedidoService.getById(pedidoId!),
    enabled: !!pedidoId && isOpen,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes", "listaCorta"],
    queryFn: () => servicioCliente.listaCorta(),
    enabled: isOpen,
  });

  const { data: allTarifas } = useQuery({
    queryKey: ["tarifario", "listaCorta", "detalle", { idCliente: pedido?.idCliente }],
    queryFn: () => servicioCliente.listTarifarioCorta({ idCliente: pedido!.idCliente }),
    enabled: !!pedido?.idCliente && isOpen,
  });

  const { data: paises } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: idiomas } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.IDIOMA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.IDIOMA),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: clasesInforme } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.CLASE_INFORME],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.CLASE_INFORME),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: tiposTramite } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_TRAMITE],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_TRAMITE),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: plantillasInforme } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PLANTILLA_INFORME],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PLANTILLA_INFORME),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: tiposPersona } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_PERSONA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_PERSONA),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: empresasAtencion } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.EMPRESA_ATENCION],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.EMPRESA_ATENCION),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const { data: tiposPlazoCredito } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_PLAZO_CREDITO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_PLAZO_CREDITO),
    staleTime: Infinity,
    enabled: isOpen,
  });

  const tarifarioSeleccionado = useMemo<TarifarioCortaEntry | undefined>(
    () => allTarifas?.find((item) => item.idTarifario === pedido?.idTarifario),
    [allTarifas, pedido?.idTarifario],
  );

  const estaCargandoTodo = isLoading || (!!pedido && allTarifas === undefined);

  const cerrarDetalle = (onClose: () => void) => {
    setTabActiva("cliente-tarifa");
    onClose();
  };

  return {
    allTarifas,
    cerrarDetalle,
    clientes,
    clasesInforme,
    empresasAtencion,
    estaCargandoTodo,
    idiomas,
    isError,
    isLoading,
    paises,
    pedido,
    plantillasInforme,
    refetch,
    setTabActiva,
    tabActiva,
    tarifarioSeleccionado,
    tiposPersona,
    tiposPlazoCredito,
    tiposTramite,
  };
}
