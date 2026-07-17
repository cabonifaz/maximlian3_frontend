import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicioCliente } from "@maximilian/services/cliente.service";
import type { TarifarioCortaEntry } from "@maximilian/shared/types/cliente.type";

interface ParametrosUseTablaTarifarioCorta {
  idCliente: number | undefined;
  idPais: number | undefined;
  idTarifarioSeleccionado: number | undefined;
  idTipoProducto: number | undefined;
  idTipoTramite: number | undefined;
  onTarifarioSelect: (entry: TarifarioCortaEntry | undefined) => void;
  soloLectura: boolean;
}

export function useTablaTarifarioCorta({
  idCliente,
  idPais,
  idTarifarioSeleccionado,
  idTipoProducto,
  idTipoTramite,
  onTarifarioSelect,
  soloLectura,
}: ParametrosUseTablaTarifarioCorta) {
  const { data, isLoading } = useQuery({
    queryKey: [
      "tarifario",
      "listaCorta",
      { idCliente, idTipoProducto, idTipoTramite, idPais },
    ],
    queryFn: () =>
      servicioCliente.listTarifarioCorta({
        idCliente: idCliente!,
        IdTipoProducto: idTipoProducto,
        IdTipoTramite: idTipoTramite,
        IdPais: idPais,
      }),
    enabled: !!idCliente,
  });

  const onTarifarioSelectRef = useRef(onTarifarioSelect);
  onTarifarioSelectRef.current = onTarifarioSelect;

  const seleccionInicialSincronizada = useRef(false);

  useEffect(() => {
    seleccionInicialSincronizada.current = false;
  }, [idCliente]);

  useEffect(() => {
    if (data == null) return;

    if (!seleccionInicialSincronizada.current) {
      seleccionInicialSincronizada.current = true;
      if (idTarifarioSeleccionado != null) {
        const entrada =
          data.find(
            (tarifario) => tarifario.idTarifario === idTarifarioSeleccionado,
          ) ?? undefined;
        onTarifarioSelectRef.current(entrada);
      }
      return;
    }

    if (
      idTarifarioSeleccionado != null &&
      !data.some((tarifario) => tarifario.idTarifario === idTarifarioSeleccionado)
    ) {
      onTarifarioSelectRef.current(undefined);
    }
  }, [data, idTarifarioSeleccionado]);

  const alternarTarifario = (entrada: TarifarioCortaEntry) => {
    if (soloLectura) return;
    onTarifarioSelect(
      idTarifarioSeleccionado === entrada.idTarifario ? undefined : entrada,
    );
  };

  return {
    alternarTarifario,
    entries: data ?? [],
    isLoading,
  };
}
