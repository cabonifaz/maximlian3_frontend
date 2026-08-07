import { useState } from 'react';
import { Check, Copy, Link, X } from 'lucide-react';
import { CustomButton } from '@maximilian/components/common/CustomButton';
import { CustomLabel } from '@maximilian/components/common/CustomLabel';
import type { EntradaListaFactura } from '@maximilian/shared/types/facturacion.type';

interface PropsCustomModalEnlaceFactura {
  abierto: boolean;
  factura: EntradaListaFactura | null;
  enlace: string;
  cargando: boolean;
  onCerrar: () => void;
}

export function CustomModalEnlaceFactura({
  abierto,
  factura,
  enlace,
  cargando,
  onCerrar,
}: PropsCustomModalEnlaceFactura) {
  const [estaCopiado, setEstaCopiado] = useState(false);
  const [errorCopia, setErrorCopia] = useState(false);

  if (!abierto || !factura) return null;

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(enlace);
      setEstaCopiado(true);
      setErrorCopia(false);
    } catch {
      setErrorCopia(true);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm'
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div className='w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl'>
        <div className='flex items-start justify-between border-b border-slate-100 px-6 py-5'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-brand-wine/10 text-brand-wine'>
              <Link size={20} />
            </div>
            <div>
              <h2 className='text-lg font-bold text-brand-black'>
                Enlace de la factura
              </h2>
              <p className='mt-0.5 text-xs text-slate-500'>
                {factura.numeroFactura}
              </p>
            </div>
          </div>
          <CustomButton
            variant='ghost'
            size='icon'
            onClick={onCerrar}
            aria-label='Cerrar enlace de factura'
          >
            <X size={18} />
          </CustomButton>
        </div>

        <div className='space-y-3 px-6 py-6'>
          <CustomLabel htmlFor='enlace-factura'>
            Enlace para compartir
          </CustomLabel>
          <div className='flex gap-2'>
            <input
              id='enlace-factura'
              type='text'
              readOnly
              value={cargando ? '' : enlace}
              placeholder={cargando ? 'Generando enlace...' : ''}
              className='min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none'
            />
            <CustomButton
              variant='wine'
              size='md'
              onClick={copiarEnlace}
              disabled={cargando || !enlace}
            >
              {estaCopiado ? <Check size={16} /> : <Copy size={16} />}
              {estaCopiado ? 'Copiado' : 'Copiar'}
            </CustomButton>
          </div>
          <p className='text-xs text-slate-400'>
            Comparte este enlace para consultar la factura.
          </p>
          {errorCopia ? (
            <p className='text-xs font-medium text-red-600'>
              No se pudo copiar el enlace. Puedes seleccionarlo manualmente.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
