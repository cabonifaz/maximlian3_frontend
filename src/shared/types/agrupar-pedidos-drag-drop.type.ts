import type { GrupoRecomendado, PedidoConGrupo } from "@maximilian/shared/types/facturacion.type";

export interface LineaFacturaBorrador {
  id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  descuento: number;
  idsPedido: number[];
  seleccionada: boolean;
}

export interface FiltrosAgruparPedidos {
  fechaInicio: Date | undefined;
  fechaFin: Date | undefined;
  idTipoTramite: number | undefined;
  idsPais: number[];
  idMoneda: number | undefined;
  idVigencia: number | undefined;
  busqueda: string;
}

export type CargaArrastrePedido = {
  idPedido: number;
};

export type { GrupoRecomendado, PedidoConGrupo };
