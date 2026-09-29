import type { ReactNode } from 'react';
import { Filter } from 'lucide-react';
import { usePanelFiltroFlotante } from '@maximilian/hooks/usePanelFiltroFlotante';

interface PropsCustomEncabezadoFiltroFactura {
  titulo: string;
  activo: boolean;
  children: ReactNode;
  anchoClassName?: string;
}

export function CustomEncabezadoFiltroFactura({
  titulo,
  activo,
  children,
  anchoClassName = 'w-64',
}: PropsCustomEncabezadoFiltroFactura) {
  const {
    alternarPanel,
    cerrarPanel,
    estaAbierto,
    refDisparador,
    refPanel,
  } = usePanelFiltroFlotante();

  return (
    <div className='relative normal-case'>
      <div className='flex items-center justify-center gap-2'>
        <span className='text-xs font-semibold uppercase tracking-wider text-gray-400'>
          {titulo}
        </span>
        <button
          ref={refDisparador}
          type='button'
          aria-label={'Filtrar por ' + titulo}
          title={'Filtrar por ' + titulo}
          className={
            'relative flex h-8 w-8 items-center justify-center rounded-lg border transition ' +
            (estaAbierto || activo
              ? 'border-brand-wine/30 bg-brand-wine/10 text-brand-wine'
              : 'border-gray-200 bg-white text-gray-400 hover:border-brand-wine/30 hover:text-brand-wine')
          }
          onClick={alternarPanel}
        >
          <Filter size={15} />
          {activo ? (
            <span className='absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-brand-wine' />
          ) : null}
        </button>
      </div>

      {estaAbierto ? (
        <>
          <div
            className='fixed inset-0 z-[90]'
            onClick={cerrarPanel}
          />
          <div
            ref={refPanel}
            className={
              'fixed z-[91] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xl shadow-slate-950/15 ' +
              anchoClassName
            }
            onClick={(evento) => evento.stopPropagation()}
          >
            {children}
          </div>
        </>
      ) : null}
    </div>
  );
}
