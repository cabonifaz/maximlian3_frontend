import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";

export const MAESTROS_CONFIGURACION_MIGRACION = {
  plantilla: TablaMaestraId.PLANTILLA_INFORME,
  idioma: TablaMaestraId.IDIOMA,
  formatoFecha: TablaMaestraId.FORMATO_FECHA_INFORME,
  estado: TablaMaestraId.ESTADO_INFORME,
} as const;

export const CANTIDAD_MAXIMA_ARCHIVOS_LOTE_MIGRACION = 100;
export const INTERVALO_ACTUALIZACION_LOTES_MIGRACION_MS = 5_000;
