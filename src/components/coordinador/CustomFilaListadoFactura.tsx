import type { CSSProperties, MouseEvent } from 'react';
import {
  Ban,
  ChevronRight,
  Download,
  Eye,
  FileCode2,
  FileText,
  Link,
  MoreHorizontal,
} from 'lucide-react';
import { CustomButton } from '@maximilian/components/common/CustomButton';
import { CLASES_ESTADO_LISTADO_FACTURA } from '@maximilian/shared/constants/components/coordinador/facturacion.constants';
import type {
  EntradaListaFactura,
  FormatoDescargaFactura,
} from '@maximilian/shared/types/facturacion.type';
import { formatearFechaIsoADdMmYyyy } from '@maximilian/shared/utils/fecha.util';
import { formatearImporteFactura } from '@maximilian/shared/utils/facturacion.util';

interface PropsCustomFilaListadoFactura {
  factura: EntradaListaFactura;
  menuActivo: boolean;
  submenuDescargaActivo: boolean;
  estiloMenu: CSSProperties;
  onAlternarMenu: (
    evento: MouseEvent<HTMLButtonElement>,
    factura: EntradaListaFactura,
  ) => void;
  onCerrarMenu: () => void;
  onGenerarUrl: (factura: EntradaListaFactura) => void;
  onVer: (factura: EntradaListaFactura) => void;
  onAnular: (factura: EntradaListaFactura) => void;
  onAlternarDescarga: (factura: EntradaListaFactura) => void;
  onDescargar: (
    factura: EntradaListaFactura,
    formato: FormatoDescargaFactura,
  ) => void;
}

export function CustomFilaListadoFactura({
  factura,
  menuActivo,
  submenuDescargaActivo,
  estiloMenu,
  onAlternarMenu,
  onCerrarMenu,
  onGenerarUrl,
  onVer,
  onAnular,
  onAlternarDescarga,
  onDescargar,
}: PropsCustomFilaListadoFactura) {
  return (
    <>
      <td className='px-6 py-4 text-sm font-bold text-brand-black'>
        {factura.numeroFactura}
      </td>
      <td className='px-6 py-4'>
        <span
          className='block truncate text-sm text-slate-600'
          title={factura.cliente}
        >
          {factura.cliente}
        </span>
      </td>
      <td className='px-6 py-4 text-center text-sm text-slate-600'>
        {formatearFechaIsoADdMmYyyy(factura.fechaEmision)}
      </td>
      <td className='px-6 py-4 text-center text-sm text-slate-600'>
        {factura.formaPago}
      </td>
      <td className='px-6 py-4 text-right text-sm font-semibold text-brand-black'>
        {formatearImporteFactura(
          factura.totalImporte,
          factura.moneda,
        )}
      </td>
      <td className='px-6 py-4 text-center'>
        <span
          className={
            'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ' +
            (CLASES_ESTADO_LISTADO_FACTURA[factura.estado] ??
              'bg-slate-100 text-slate-600')
          }
        >
          {factura.estado}
        </span>
      </td>
      <td className='px-6 py-4 text-right'>
        <CustomButton
          variant='ghost'
          size='icon'
          onClick={(evento) => onAlternarMenu(evento, factura)}
          aria-label={'Acciones de ' + factura.numeroFactura}
        >
          <MoreHorizontal size={18} />
        </CustomButton>

        {menuActivo ? (
          <>
            <div
              className='fixed inset-0 z-10'
              onClick={onCerrarMenu}
            />
            <div
              className='fixed z-20 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-xl'
              style={estiloMenu}
            >
              <CustomButton
                variant='ghost'
                size='sm'
                className='w-full justify-start px-3 text-slate-700'
                onClick={() => onGenerarUrl(factura)}
              >
                <Link size={14} />
                Generar URL
              </CustomButton>
              <CustomButton
                variant='ghost'
                size='sm'
                className='w-full justify-start px-3 text-slate-700'
                onClick={() => onVer(factura)}
              >
                <Eye size={14} />
                Ver
              </CustomButton>
              <CustomButton
                variant='ghost'
                size='sm'
                className='w-full justify-start px-3 text-red-600'
                onClick={() => onAnular(factura)}
                disabled={factura.estado === 'Anulada'}
              >
                <Ban size={14} />
                Anular
              </CustomButton>
              <div className='relative'>
                <CustomButton
                  variant='ghost'
                  size='sm'
                  className='w-full justify-start px-3 text-slate-700'
                  onClick={() => onAlternarDescarga(factura)}
                >
                  <Download size={14} />
                  <span className='flex-1 text-left'>Descargar</span>
                  <ChevronRight size={14} />
                </CustomButton>
                {submenuDescargaActivo ? (
                  <div className='absolute left-full top-0 ml-1 w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-xl'>
                    <CustomButton
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start px-3 text-slate-700'
                      onClick={() => onDescargar(factura, 'pdf')}
                    >
                      <FileText size={14} />
                      PDF
                    </CustomButton>
                    <CustomButton
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start px-3 text-slate-700'
                      onClick={() => onDescargar(factura, 'xml')}
                    >
                      <FileCode2 size={14} />
                      XML
                    </CustomButton>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </td>
    </>
  );
}
