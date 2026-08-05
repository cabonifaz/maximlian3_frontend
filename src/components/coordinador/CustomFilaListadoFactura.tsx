import type { CSSProperties, MouseEvent } from 'react';
import {
  Ban,
  ChevronRight,
  Download,
  Eye,
  FileCode2,
  FileEdit,
  FileText,
  Link,
  MoreHorizontal,
} from 'lucide-react';
import { CustomButton } from '@maximilian/components/common/CustomButton';
import { ESTADO_CODIGO_FACTURA_ACEPTADA } from '@maximilian/shared/constants/components/coordinador/facturacion.constants';
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
  submenuPdfActivo: boolean;
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
  onAlternarSubmenuPdf: (factura: EntradaListaFactura) => void;
  onDescargar: (
    factura: EntradaListaFactura,
    formato: FormatoDescargaFactura,
  ) => void;
  onAgregarCamposPdf: (factura: EntradaListaFactura) => void;
}

export function CustomFilaListadoFactura({
  factura,
  menuActivo,
  submenuDescargaActivo,
  submenuPdfActivo,
  estiloMenu,
  onAlternarMenu,
  onCerrarMenu,
  onGenerarUrl,
  onVer,
  onAnular,
  onAlternarDescarga,
  onAlternarSubmenuPdf,
  onDescargar,
  onAgregarCamposPdf,
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
        {factura.monedaIcono} {formatearImporteFactura(factura.totalImporte)}
      </td>
      <td className='px-6 py-4 text-center'>
        <span
          className='inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold'
          style={{
            color: factura.colorLetra,
            backgroundColor: factura.colorFondo,
          }}
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
                disabled={
                  factura.estado !== ESTADO_CODIGO_FACTURA_ACEPTADA
                }
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
                  <ChevronRight size={14} className='rotate-180' />
                </CustomButton>
                {submenuDescargaActivo ? (
                  <div className='absolute right-full top-0 mr-1 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-xl'>
                    <div className='relative'>
                      <CustomButton
                        variant='ghost'
                        size='sm'
                        className='w-full justify-start px-3 text-slate-700'
                        onClick={() => onAlternarSubmenuPdf(factura)}
                      >
                        <FileText size={14} />
                        <span className='flex-1 text-left'>PDF</span>
                        <ChevronRight size={14} className='rotate-180' />
                      </CustomButton>
                      {submenuPdfActivo ? (
                        <div className='absolute right-full top-0 mr-1 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-xl'>
                          <CustomButton
                            variant='ghost'
                            size='sm'
                            className='w-full justify-start px-3 text-slate-700'
                            onClick={() => onDescargar(factura, 'pdf')}
                          >
                            <Download size={14} />
                            Descargar
                          </CustomButton>
                          <CustomButton
                            variant='ghost'
                            size='sm'
                            className='w-full justify-start px-3 text-slate-700'
                            onClick={() => onAgregarCamposPdf(factura)}
                          >
                            <FileEdit size={14} />
                            Añadir campos
                          </CustomButton>
                        </div>
                      ) : null}
                    </div>
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
