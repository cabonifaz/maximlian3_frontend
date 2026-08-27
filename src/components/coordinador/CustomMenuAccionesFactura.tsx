import type { CSSProperties, ReactNode } from 'react';
import {
  Ban,
  ChevronRight,
  Download,
  Eye,
  FileCode2,
  FilePlus2,
  FileText,
  Link,
  Pencil,
  RefreshCw,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { CustomButton } from '@maximilian/components/common/CustomButton';
import {
  ESTADO_CODIGO_DOCUMENTO_PENDIENTE_ENVIO,
  ESTADO_CODIGO_FACTURA_ACEPTADA,
  ESTADO_CODIGO_FACTURA_ACEPTADA_CON_OBSERVACIONES,
} from '@maximilian/shared/constants/components/coordinador/facturacion.constants';
import type {
  EntradaListaFactura,
  FormatoDescargaFactura,
} from '@maximilian/shared/types/facturacion.type';

interface PropsCustomMenuAccionesFactura {
  factura: EntradaListaFactura;
  estiloMenu: CSSProperties;
  submenuDescargaActivo: boolean;
  submenuOperacionesActivo: boolean;
  submenuEstadoActivo: boolean;
  onGenerarUrl: (factura: EntradaListaFactura) => void;
  onVer: (factura: EntradaListaFactura) => void;
  onEditar: (factura: EntradaListaFactura) => void;
  onEliminarBorrador: (factura: EntradaListaFactura) => void;
  onAnular: (factura: EntradaListaFactura) => void;
  onAnularManualmente: (factura: EntradaListaFactura) => void;
  onCrearNotaCreditoDebito: (factura: EntradaListaFactura) => void;
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
}

interface PropsItemMenuAccion {
  icono: ReactNode;
  etiqueta: string;
  colorTexto: 'slate-700' | 'red-600';
  activo?: boolean;
  onClick: () => void;
  conFlecha?: boolean;
}

function ItemMenuAccion({
  icono,
  etiqueta,
  colorTexto,
  activo = false,
  onClick,
  conFlecha = false,
}: PropsItemMenuAccion) {
  const claseColorTexto =
    colorTexto === 'red-600' ? 'text-red-600' : 'text-slate-700';

  return (
    <CustomButton
      variant='ghost'
      size='sm'
      className={`w-full px-3 ${activo ? 'bg-gray-100' : ''}`}
      style={{ borderRadius: '0.5rem' }}
      onClick={onClick}
    >
      <span className={`flex w-full items-center gap-2 ${claseColorTexto}`}>
        {icono}
        <span className='flex-1 text-left'>{etiqueta}</span>
        {conFlecha ? <ChevronRight size={14} className='shrink-0' /> : null}
      </span>
    </CustomButton>
  );
}

export function CustomMenuAccionesFactura({
  factura,
  estiloMenu,
  submenuDescargaActivo,
  submenuOperacionesActivo,
  submenuEstadoActivo,
  onGenerarUrl,
  onVer,
  onEditar,
  onEliminarBorrador,
  onAnular,
  onAnularManualmente,
  onCrearNotaCreditoDebito,
  onAbrirSubmenuDescarga,
  onCerrarSubmenuDescarga,
  onAbrirSubmenuOperaciones,
  onCerrarSubmenuOperaciones,
  onAbrirSubmenuEstado,
  onCerrarSubmenuEstado,
  onDescargar,
}: PropsCustomMenuAccionesFactura) {
  const esBorrador = factura.estado === ESTADO_CODIGO_DOCUMENTO_PENDIENTE_ENVIO;
  const esAceptada = factura.estado === ESTADO_CODIGO_FACTURA_ACEPTADA;
  const mostrarGenerarUrl = !esBorrador;
  const mostrarGestionBorrador = esBorrador;
  const mostrarOperacionesSunat = esAceptada;
  const mostrarModificarEstado =
    esAceptada
    || factura.estado === ESTADO_CODIGO_FACTURA_ACEPTADA_CON_OBSERVACIONES;
  const iconoClase = 'shrink-0';

  return (
    <div
      className='fixed z-20 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-xl'
      style={estiloMenu}
    >
      <ItemMenuAccion
        icono={<Eye size={14} className={iconoClase} />}
        etiqueta='Ver'
        colorTexto='slate-700'
        onClick={() => onVer(factura)}
      />

      {mostrarGestionBorrador ? (
        <>
          <div className='my-1 h-px bg-slate-100' />
          <ItemMenuAccion
            icono={<Pencil size={14} className={iconoClase} />}
            etiqueta='Editar'
            colorTexto='slate-700'
            onClick={() => onEditar(factura)}
          />
          <ItemMenuAccion
            icono={<Trash2 size={14} className={iconoClase} />}
            etiqueta='Eliminar borrador'
            colorTexto='red-600'
            onClick={() => onEliminarBorrador(factura)}
          />
        </>
      ) : null}

      <div className='my-1 h-px bg-slate-100' />
      <div
        className='relative'
        onMouseEnter={() => onAbrirSubmenuDescarga(factura)}
        onMouseLeave={onCerrarSubmenuDescarga}
      >
        <ItemMenuAccion
          icono={<Download size={14} className={iconoClase} />}
          etiqueta='Descargar'
          colorTexto='slate-700'
          activo={submenuDescargaActivo}
          conFlecha
          onClick={() => onAbrirSubmenuDescarga(factura)}
        />
        {submenuDescargaActivo ? (
          <div className='absolute right-full top-0 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-xl'>
            <ItemMenuAccion
              icono={<FileText size={14} className={iconoClase} />}
              etiqueta='PDF'
              colorTexto='slate-700'
              onClick={() => onDescargar(factura, 'pdf')}
            />
            <ItemMenuAccion
              icono={<FileCode2 size={14} className={iconoClase} />}
              etiqueta='XML'
              colorTexto='slate-700'
              onClick={() => onDescargar(factura, 'xml')}
            />
          </div>
        ) : null}
      </div>

      {mostrarGenerarUrl ? (
        <>
          <div className='my-1 h-px bg-slate-100' />
          <ItemMenuAccion
            icono={<Link size={14} className={iconoClase} />}
            etiqueta='Generar URL'
            colorTexto='slate-700'
            onClick={() => onGenerarUrl(factura)}
          />
        </>
      ) : null}

      {mostrarOperacionesSunat ? (
        <>
          <div className='my-1 h-px bg-slate-100' />
          <div
            className='relative'
            onMouseEnter={() => onAbrirSubmenuOperaciones(factura)}
            onMouseLeave={onCerrarSubmenuOperaciones}
          >
            <ItemMenuAccion
              icono={<Ban size={14} className={iconoClase} />}
              etiqueta='Operaciones de SUNAT'
              colorTexto='slate-700'
              activo={submenuOperacionesActivo}
              conFlecha
              onClick={() => onAbrirSubmenuOperaciones(factura)}
            />
            {submenuOperacionesActivo ? (
              <div className='absolute right-full top-0 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-xl'>
                {factura.documentoAfectado === null ? (
                  <ItemMenuAccion
                    icono={<FilePlus2 size={14} className={iconoClase} />}
                    etiqueta='Crear Nota de Crédito/Débito'
                    colorTexto='slate-700'
                    onClick={() => onCrearNotaCreditoDebito(factura)}
                  />
                ) : null}
                <ItemMenuAccion
                  icono={<Ban size={14} className={iconoClase} />}
                  etiqueta='Anular Comprobante'
                  colorTexto='red-600'
                  onClick={() => onAnular(factura)}
                />
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {mostrarModificarEstado ? (
        <>
          <div className='my-1 h-px bg-slate-100' />
          <div
            className='relative'
            onMouseEnter={() => onAbrirSubmenuEstado(factura)}
            onMouseLeave={onCerrarSubmenuEstado}
          >
            <ItemMenuAccion
              icono={<RefreshCw size={14} className={iconoClase} />}
              etiqueta='Modificar Estado'
              colorTexto='slate-700'
              activo={submenuEstadoActivo}
              conFlecha
              onClick={() => onAbrirSubmenuEstado(factura)}
            />
            {submenuEstadoActivo ? (
              <div className='absolute right-full top-0 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-xl'>
                <ItemMenuAccion
                  icono={<ShieldAlert size={14} className={iconoClase} />}
                  etiqueta='Marcar como Anulado'
                  colorTexto='red-600'
                  onClick={() => onAnularManualmente(factura)}
                />
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
