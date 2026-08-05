import { CustomButton } from '@maximilian/components/common/CustomButton';
import { CustomLabel } from '@maximilian/components/common/CustomLabel';
import { CustomEncabezadoFiltroFactura } from '@maximilian/components/coordinador/CustomEncabezadoFiltroFactura';

interface OpcionFiltroFactura {
  valor: string;
  etiqueta: string;
}

interface PropsCustomFiltroColumnaFactura {
  titulo: string;
  valor?: string;
  opciones?: OpcionFiltroFactura[];
  onChange?: (valor: string) => void;
  fechaDesde?: string;
  fechaHasta?: string;
  onCambiarFechaDesde?: (valor: string) => void;
  onCambiarFechaHasta?: (valor: string) => void;
}

export function CustomFiltroColumnaFactura({
  titulo,
  valor = '',
  opciones,
  onChange,
  fechaDesde = '',
  fechaHasta = '',
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
        anchoClassName='w-72'
      >
        <div className='space-y-3'>
          <CustomLabel htmlFor='factura-fecha-desde'>
            Desde
          </CustomLabel>
          <input
            id='factura-fecha-desde'
            type='date'
            value={fechaDesde}
            max={fechaHasta || undefined}
            onChange={(evento) =>
              onCambiarFechaDesde?.(evento.target.value)
            }
            className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10'
          />
          <CustomLabel htmlFor='factura-fecha-hasta'>
            Hasta
          </CustomLabel>
          <input
            id='factura-fecha-hasta'
            type='date'
            value={fechaHasta}
            min={fechaDesde || undefined}
            onChange={(evento) =>
              onCambiarFechaHasta?.(evento.target.value)
            }
            className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10'
          />
          <CustomButton
            variant='secondary'
            size='sm'
            className='w-full'
            onClick={() => {
              onCambiarFechaDesde?.('');
              onCambiarFechaHasta?.('');
            }}
            disabled={!fechaDesde && !fechaHasta}
          >
            Limpiar periodo
          </CustomButton>
        </div>
      </CustomEncabezadoFiltroFactura>
    );
  }

  const idCampo = 'filtro-factura-' + titulo
    .toLocaleLowerCase()
    .replaceAll(' ', '-');

  return (
    <CustomEncabezadoFiltroFactura
      titulo={titulo}
      activo={Boolean(valor)}
    >
      <CustomLabel htmlFor={idCampo}>{titulo}</CustomLabel>
      <select
        id={idCampo}
        value={valor}
        onChange={(evento) => onChange?.(evento.target.value)}
        className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-wine'
      >
        <option value=''>Todos</option>
        {opciones?.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </CustomEncabezadoFiltroFactura>
  );
}
