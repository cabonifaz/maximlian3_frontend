interface FiltrosTarifarioCorta {
  idCliente: number | undefined;
  idTipoProducto: number | undefined;
  idTipoTramite: number | undefined;
  idPais: number | undefined;
}

export function obtenerClaveTarifarioCorta({
  idCliente,
  idTipoProducto,
  idTipoTramite,
  idPais,
}: FiltrosTarifarioCorta) {
  return [
    "tarifario",
    "listaCorta",
    { idCliente, idTipoProducto, idTipoTramite, idPais },
  ] as const;
}
