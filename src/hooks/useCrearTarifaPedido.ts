import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { servicioCliente } from "@maximilian/services/cliente.service";
import type { DatosFormularioTarifa } from "@maximilian/schemas";
import type { TarifarioCortaEntry } from "@maximilian/shared/types/cliente.type";
import { obtenerClaveTarifarioCorta } from "@maximilian/shared/utils/tarifario.util";

interface ParametrosUseCrearTarifaPedido {
  idCliente: number | undefined;
  idPais: number | undefined;
  idTipoProducto: number | undefined;
  idTipoTramite: number | undefined;
  alCrearTarifa: (entrada: TarifarioCortaEntry) => void;
}

export function useCrearTarifaPedido({
  idCliente,
  idPais,
  idTipoProducto,
  idTipoTramite,
  alCrearTarifa,
}: ParametrosUseCrearTarifaPedido) {
  const queryClient = useQueryClient();
  const [estaAbierto, setEstaAbierto] = useState(false);

  const { data: cliente } = useQuery({
    queryKey: ["cliente", idCliente],
    queryFn: () => servicioCliente.getById(idCliente!),
    enabled: !!idCliente,
  });

  const puedeCrear = !!idCliente && !!idTipoProducto;

  const valoresIniciales = useMemo<Partial<DatosFormularioTarifa>>(
    () => ({
      producto: idTipoProducto,
      pais: idPais,
      moneda: cliente?.idMoneda,
      tramite: idTipoTramite,
    }),
    [cliente?.idMoneda, idTipoProducto, idPais, idTipoTramite],
  );

  const crearTarifaMutation = useMutation({
    mutationFn: servicioCliente.createTarifario,
    onSuccess: async ({ idTarifario }) => {
      await queryClient.invalidateQueries({ queryKey: ["tarifario"] });
      const tarifas = queryClient.getQueryData<TarifarioCortaEntry[]>(
        obtenerClaveTarifarioCorta({ idCliente, idTipoProducto, idTipoTramite, idPais }),
      );
      const tarifaCreada = tarifas?.find((tarifa) => tarifa.idTarifario === idTarifario);
      if (tarifaCreada) alCrearTarifa(tarifaCreada);
      setEstaAbierto(false);
    },
  });

  const abrir = () => {
    if (puedeCrear) setEstaAbierto(true);
  };

  const cerrar = () => {
    if (!crearTarifaMutation.isPending) setEstaAbierto(false);
  };

  const confirmar = (datos: DatosFormularioTarifa) => {
    if (!idCliente) return false;
    crearTarifaMutation.mutate({
      idCliente,
      idProducto: datos.producto,
      idTipoTramite: datos.tramite,
      idPais: datos.pais,
      idMoneda: datos.moneda,
      diasMax: datos.diasMax,
      diasMin: datos.diasMin,
      precio: datos.precio,
      penalidad: datos.penalidad,
    });
    return false;
  };

  return {
    abrir,
    cerrar,
    confirmar,
    estaAbierto,
    estaCreando: crearTarifaMutation.isPending,
    puedeCrear,
    valoresIniciales,
  };
}
