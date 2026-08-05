import { useState, type ReactNode, type CSSProperties } from 'react';
import { Filter } from 'lucide-react';

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
  const [estaAbierto, setEstaAbierto] = useState(false);
  const [estiloMenu, setEstiloMenu] = useState<CSSProperties>({});

  return (
    <div className='relative normal-case'>
      <div className='flex items-center justify-center gap-2'>
        <span className='text-xs font-semibold uppercase tracking-wider text-gray-400'>
          {titulo}
        </span>
        <button
          type='button'
          aria-label={'Filtrar por ' + titulo}
          title={'Filtrar por ' + titulo}
          className={
            'relative flex h-8 w-8 items-center justify-center rounded-lg border transition ' +
            (estaAbierto || activo
              ? 'border-brand-wine/30 bg-brand-wine/10 text-brand-wine'
              : 'border-gray-200 bg-white text-gray-400 hover:border-brand-wine/30 hover:text-brand-wine')
          }
          onClick={(evento) => {
            const rectangulo =
              evento.currentTarget.getBoundingClientRect();
            setEstiloMenu({
              top: rectangulo.bottom + 8,
              left: Math.min(rectangulo.left, window.innerWidth - 300),
            });
            setEstaAbierto((valorActual) => !valorActual);
          }}
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
            onClick={() => setEstaAbierto(false)}
          />
          <div
            className={
              'fixed z-[91] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xl shadow-slate-950/15 ' +
              anchoClassName
            }
            style={estiloMenu}
            onClick={(evento) => evento.stopPropagation()}
          >
            {children}
          </div>
        </>
      ) : null}
    </div>
  );
}
