import { CustomFiltroRangoFechas } from '@maximilian/components/common/CustomFiltroRangoFechas';
import { CustomSelectorBuscable } from '@maximilian/components/common/CustomSelectorBuscable';
import { CustomEncabezadoFiltroFactura } from '@maximilian/components/coordinador/CustomEncabezadoFiltroFactura';

interface PropsCustomFiltroColumnaFactura {
  titulo: string;
  idMaster?: number;
  valorId?: number;
  onCambiarId?: (valor: number | undefined) => void;
  fechaDesde?: Date;
  fechaHasta?: Date;
  fechasInvalidas?: boolean;
  onCambiarFechaDesde?: (valor: Date | undefined) => void;
  onCambiarFechaHasta?: (valor: Date | undefined) => void;
}

export function CustomFiltroColumnaFactura({
  titulo,
  idMaster,
  valorId,
  onCambiarId,
  fechaDesde,
  fechaHasta,
  fechasInvalidas = false,
  onCambiarFechaDesde,
  onCambiarFechaHasta,
}: PropsCustomFiltroColumnaFactura) {
  const esPeriodo = Boolean(
    onCambiarFechaDesde && onCambiarFechaHasta,
  );

  if (esPeriodo) {
    return (
      <CustomEncabezadoFiltroFactura
        titulo={titulo}
        activo={Boolean(fechaDesde || fechaHasta)}
        anchoClassName='w-[26rem]'
      >
        <CustomFiltroRangoFechas
          fechaInicio={fechaDesde}
          fechaFin={fechaHasta}
          fechasInvalidas={fechasInvalidas}
          onFechaInicioChange={(fecha) => onCambiarFechaDesde?.(fecha)}
          onFechaFinChange={(fecha) => onCambiarFechaHasta?.(fecha)}
          onLimpiarFechaInicio={() => onCambiarFechaDesde?.(undefined)}
          onLimpiarFechaFin={() => onCambiarFechaHasta?.(undefined)}
        />
      </CustomEncabezadoFiltroFactura>
    );
  }

  return (
    <CustomEncabezadoFiltroFactura
      titulo={titulo}
      activo={valorId !== undefined}
    >
      <CustomSelectorBuscable
        label={titulo}
        idMaster={idMaster}
        value={valorId}
        onChange={(idSeleccionado) => onCambiarId?.(idSeleccionado)}
        onClear={() => onCambiarId?.(undefined)}
        optional
        mostrarTextoOpcionalEnLabel={false}
        etiquetaOpcionVacia="Todos"
      />
    </CustomEncabezadoFiltroFactura>
  );
}
