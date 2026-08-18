import type { CSSProperties, MouseEvent } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { CustomButton } from '@maximilian/components/common/CustomButton';
import { CustomMenuAccionesFactura } from '@maximilian/components/coordinador/CustomMenuAccionesFactura';
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
  submenuOperacionesActivo: boolean;
  submenuEstadoActivo: boolean;
  estiloMenu: CSSProperties;
  onAlternarMenu: (
    evento: MouseEvent<HTMLButtonElement>,
    factura: EntradaListaFactura,
  ) => void;
  onCerrarMenu: () => void;
  onGenerarUrl: (factura: EntradaListaFactura) => void;
  onVer: (factura: EntradaListaFactura) => void;
  onAnular: (factura: EntradaListaFactura) => void;
  onAnularManualmente: (factura: EntradaListaFactura) => void;
  onCrearNotaCreditoDebito: (factura: EntradaListaFactura) => void;
  onEditar: (factura: EntradaListaFactura) => void;
  onEliminarBorrador: (factura: EntradaListaFactura) => void;
  onAbrirSubmenuDescarga: (factura: EntradaListaFactura) => void;
  onCerrarSubmenuDescarga: () => void;
  onAbrirSubmenuOperaciones: (factura: EntradaListaFactura) => void;
  onCerrarSubmenuOperaciones: () => void;
  onAbrirSubmenuEstado: (factura: EntradaListaFactura) => void;
  onCerrarSubmenuEstado: () => void;
  onDescargar: (
    factura: EntradaListaFactura,
    formato: FormatoDescargaFactura,
  ) => void;
  onVerErrores: (factura: EntradaListaFactura) => void;
}

export function CustomFilaListadoFactura({
  factura,
  menuActivo,
  submenuDescargaActivo,
  submenuOperacionesActivo,
  submenuEstadoActivo,
  estiloMenu,
  onAlternarMenu,
  onCerrarMenu,
  onGenerarUrl,
  onVer,
  onAnular,
  onAnularManualmente,
  onCrearNotaCreditoDebito,
  onEditar,
  onEliminarBorrador,
  onAbrirSubmenuDescarga,
  onCerrarSubmenuDescarga,
  onAbrirSubmenuOperaciones,
  onCerrarSubmenuOperaciones,
  onAbrirSubmenuEstado,
  onCerrarSubmenuEstado,
  onDescargar,
  onVerErrores,
}: PropsCustomFilaListadoFactura) {
  return (
    <>
      <td className='px-6 py-4 text-sm font-bold text-brand-black'>
        {factura.numeroFactura}
      </td>
      <td className='px-6 py-4'>
        <span className='block whitespace-normal break-words text-sm text-slate-600'>
          {factura.tipoDocumentoTexto}
        </span>
        {factura.documentoAfectado ? (
          <span className='block text-xs text-slate-400'>
            Ref: {factura.documentoAfectado}
          </span>
        ) : null}
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
        <button
          type='button'
          onClick={() => onVerErrores(factura)}
          className='inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold transition-transform hover:scale-105 cursor-pointer'
          style={{
            color: factura.colorLetra,
            backgroundColor: factura.colorFondo,
          }}
          title='Ver errores del último envío'
        >
          {factura.estado}
        </button>
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
            <CustomMenuAccionesFactura
              factura={factura}
              estiloMenu={estiloMenu}
              submenuDescargaActivo={submenuDescargaActivo}
              submenuOperacionesActivo={submenuOperacionesActivo}
              submenuEstadoActivo={submenuEstadoActivo}
              onGenerarUrl={onGenerarUrl}
              onVer={onVer}
              onEditar={onEditar}
              onEliminarBorrador={onEliminarBorrador}
              onAnular={onAnular}
              onAnularManualmente={onAnularManualmente}
              onCrearNotaCreditoDebito={onCrearNotaCreditoDebito}
              onAbrirSubmenuDescarga={onAbrirSubmenuDescarga}
              onCerrarSubmenuDescarga={onCerrarSubmenuDescarga}
              onAbrirSubmenuOperaciones={onAbrirSubmenuOperaciones}
              onCerrarSubmenuOperaciones={onCerrarSubmenuOperaciones}
              onAbrirSubmenuEstado={onAbrirSubmenuEstado}
              onCerrarSubmenuEstado={onCerrarSubmenuEstado}
              onDescargar={onDescargar}
            />
          </>
        ) : null}
      </td>
    </>
  );
}
