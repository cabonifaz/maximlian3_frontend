import { FileText, X } from 'lucide-react';
import { CustomButton } from '@maximilian/components/common/CustomButton';
import type { EntradaListaFactura } from '@maximilian/shared/types/facturacion.type';
import { formatearFechaIsoADdMmYyyy } from '@maximilian/shared/utils/fecha.util';
import { formatearImporteFactura } from '@maximilian/shared/utils/facturacion.util';

interface PropsCustomModalDetalleFacturaMock {
  abierto: boolean;
  factura: EntradaListaFactura | null;
  onCerrar: () => void;
}

export function CustomModalDetalleFacturaMock({
  abierto,
  factura,
  onCerrar,
}: PropsCustomModalDetalleFacturaMock) {
  if (!abierto || !factura) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm'
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div className='w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl'>
        <div className='flex items-start justify-between border-b border-slate-100 px-6 py-5'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-brand-wine/10 text-brand-wine'>
              <FileText size={20} />
            </div>
            <div>
              <h2 className='text-lg font-bold text-brand-black'>
                Detalle de la factura
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
            aria-label='Cerrar detalle de factura'
          >
            <X size={18} />
          </CustomButton>
        </div>

        <div className='grid gap-4 px-6 py-6 sm:grid-cols-2'>
          <CustomCampoDetalleFactura
            etiqueta='Cliente'
            valor={factura.cliente}
          />
          <CustomCampoDetalleFactura
            etiqueta='Fecha de emisión'
            valor={formatearFechaIsoADdMmYyyy(factura.fechaEmision)}
          />
          <CustomCampoDetalleFactura
            etiqueta='Forma de pago'
            valor={factura.formaPago}
          />
          <CustomCampoDetalleFactura
            etiqueta='Estado'
            valor={factura.estado}
          />
          <CustomCampoDetalleFactura
            etiqueta='Importe total'
            valor={formatearImporteFactura(
              factura.totalImporte,
              factura.moneda,
            )}
          />
        </div>

        <div className='flex justify-end border-t border-slate-100 px-6 py-5'>
          <CustomButton variant='secondary' size='compact' onClick={onCerrar}>
            Cerrar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

function CustomCampoDetalleFactura({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className='rounded-xl bg-slate-50 px-4 py-3'>
      <p className='text-[11px] font-semibold uppercase tracking-wider text-slate-400'>
        {etiqueta}
      </p>
      <p className='mt-1 text-sm font-semibold text-brand-black'>
        {valor}
      </p>
    </div>
  );
}
